import { useState, useRef } from 'react';
import { Camera, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProfileFormData } from '../types';
import { useProfile } from '../hooks/useProfile';

export function MyProfileView() {
  const { t } = useTranslation();
  const { currentUser, updateProfile, isLoading } = useProfile();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    address: currentUser.address || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: t('profile.fileTooLarge') });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: t('profile.invalidFileType') });
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords if provided
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: t('profile.passwordMismatch') });
        return;
      }
      if ((formData.newPassword?.length || 0) < 6) {
        setMessage({ type: 'error', text: t('profile.passwordTooShort') });
        return;
      }
    }

    const result = await updateProfile(formData, avatarFile || undefined);
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });

    // Clear password fields and avatar on success
    if (result.success) {
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const displayAvatar = avatarPreview || currentUser.avatar;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{t('profile.myProfile')}</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">{t('profile.managePersonalInfo')}</p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Avatar Section */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-3 sm:mb-4">{t('profile.profilePhoto')}</h3>
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:space-x-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-muted">
                {displayAvatar ? (
                  <img 
                    src={displayAvatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-semibold">
                    {currentUser.firstName[0]}{currentUser.lastName?.[0] || ''}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground mb-1 sm:mb-2">{t('profile.uploadNewPhoto')}</p>
              <p className="text-xs text-muted-foreground">{t('profile.maxFileSize')}</p>
              {avatarFile && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ {avatarFile.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-3 sm:mb-4">{t('profile.personalInfo')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('profile.firstName')}
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-colors bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('profile.lastName')}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-colors bg-background text-foreground"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                {t('profile.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm sm:text-base border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-colors bg-background text-foreground"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                {t('profile.address')}
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 text-sm sm:text-base border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-colors resize-none bg-background text-foreground"
                placeholder={t('profile.enterAddress')}
              />
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-2 sm:mb-4">{t('profile.changePassword')}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{t('profile.leaveEmptyPassword')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('profile.newPassword')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-colors bg-background text-foreground"
                  placeholder={t('profile.enterNewPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('profile.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-colors bg-background text-foreground"
                  placeholder={t('profile.confirmNewPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-primary text-primary-foreground text-sm sm:text-base rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? t('profile.saving') : t('profile.saveChanges')}
          </button>
        </div>
      </form>
    </div>
  );
}
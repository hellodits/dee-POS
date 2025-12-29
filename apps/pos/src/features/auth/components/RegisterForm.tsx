import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { auth } from '@/lib/api'

export function RegisterForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok!')
      return
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }
    
    setIsLoading(true)
    
    try {
      await auth.register({
        username: formData.name.toLowerCase().replace(/\s+/g, '_'),
        email: formData.email,
        password: formData.password
      })
      
      // Redirect to dashboard after successful registration
      navigate('/')
    } catch (err: any) {
      console.error('Register failed:', err)
      setError(err.response?.data?.error || 'Registrasi gagal. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-background px-4 py-6 sm:px-6 sm:py-8 md:px-16 md:py-10">
      <div className="w-full max-w-[340px] sm:max-w-[400px] md:max-w-none md:w-full lg:max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-5 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">DEEPOS</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Point of Sale System</p>
        </div>

        {/* Register Container - Card on mobile/desktop, borderless on tablet */}
        <div className="bg-card md:bg-transparent border border-border md:border-0 shadow-lg md:shadow-none rounded-lg md:rounded-none">
          {/* Header */}
          <div className="text-center px-4 sm:px-5 md:px-0 pt-4 sm:pt-5 md:pt-0 pb-2 sm:pb-3 md:pb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
              Buat Akun
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
              Masukkan informasi untuk membuat akun baru
            </p>
          </div>
          
          {/* Form Content */}
          <div className="px-4 sm:px-5 md:px-0 pb-4 sm:pb-5 md:pb-0">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 md:space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-2.5 sm:p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm md:text-base text-foreground">
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="h-9 sm:h-10 md:h-12 text-sm md:text-base bg-background border-border text-foreground placeholder:text-muted-foreground transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm md:text-base text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-9 sm:h-10 md:h-12 text-sm md:text-base bg-background border-border text-foreground placeholder:text-muted-foreground transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm md:text-base text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Buat password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-9 sm:h-10 md:h-12 text-sm md:text-base bg-background border-border text-foreground placeholder:text-muted-foreground pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm md:text-base text-foreground">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-9 sm:h-10 md:h-12 text-sm md:text-base bg-background border-border text-foreground placeholder:text-muted-foreground pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full h-9 sm:h-10 md:h-12 text-sm md:text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Membuat Akun...
                  </div>
                ) : (
                  'Buat Akun'
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-5 md:mt-8">
          <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link to="/auth/login" className="text-primary hover:text-primary/80 underline transition-colors">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    console.log('Forgot password request for:', email)
    
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-background px-4 py-6 sm:px-6 sm:py-8 md:px-16 md:py-10">
        <div className="w-full max-w-[340px] sm:max-w-[400px] md:max-w-none md:w-full lg:max-w-[440px]">
          {/* Logo */}
          <div className="text-center mb-5 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">DEEPOS</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Point of Sale System</p>
          </div>

          {/* Success Container */}
          <div className="bg-card md:bg-transparent border border-border md:border-0 shadow-lg md:shadow-none rounded-lg md:rounded-none">
            <div className="text-center px-4 sm:px-5 md:px-0 pt-4 sm:pt-5 md:pt-0 pb-2 sm:pb-3 md:pb-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                Cek Email Anda
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
                Kami telah mengirim instruksi reset password ke email Anda
              </p>
            </div>
            
            <div className="text-center space-y-3 sm:space-y-4 md:space-y-5 px-4 sm:px-5 md:px-0 pb-4 sm:pb-5 md:pb-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
                Jika tidak menemukan email di inbox, silakan cek folder spam.
              </p>

              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                  }}
                  variant="outline"
                  className="w-full h-9 sm:h-10 md:h-12 text-sm md:text-base transition-all duration-300"
                >
                  Coba Email Lain
                </Button>
                
                <Link to="/auth/login" className="block">
                  <Button variant="ghost" className="w-full h-9 sm:h-10 md:h-12 text-sm md:text-base transition-all duration-300">
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-background px-4 py-6 sm:px-6 sm:py-8 md:px-16 md:py-10">
      <div className="w-full max-w-[340px] sm:max-w-[400px] md:max-w-none md:w-full lg:max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-5 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">DEEPOS</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Point of Sale System</p>
        </div>

        {/* Forgot Password Container */}
        <div className="bg-card md:bg-transparent border border-border md:border-0 shadow-lg md:shadow-none rounded-lg md:rounded-none">
          <div className="text-center px-4 sm:px-5 md:px-0 pt-4 sm:pt-5 md:pt-0 pb-2 sm:pb-3 md:pb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
              Lupa Password?
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
              Masukkan email Anda untuk reset password
            </p>
          </div>
          
          <div className="px-4 sm:px-5 md:px-0 pb-4 sm:pb-5 md:pb-0">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 md:space-y-5">
              {/* Email Field */}
              <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm md:text-base text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9 sm:h-10 md:h-12 text-sm md:text-base bg-background border-border text-foreground placeholder:text-muted-foreground transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-9 sm:h-10 md:h-12 text-sm md:text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Mengirim...
                  </div>
                ) : (
                  'Kirim Instruksi Reset'
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-4 sm:mt-5 md:mt-8">
          <Link
            to="/auth/login"
            className="inline-flex items-center text-[11px] sm:text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Icon } from '@iconify/react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // --- STATE ---
  // View states: 'form' | 'success' | 'expired'
  const [view, setView] = useState<'form' | 'success' | 'expired'>('form')
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check for mock 'expired' query param on load
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setView('expired')
    }
  }, [searchParams])

  // --- HANDLERS ---
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
        alert("Passwords do not match!")
        return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    
    // Switch to Success View
    setView('success')
  }

  // --- RENDER HELPERS ---
  
  // 1. FORM VIEW 
  const renderFormView = () => (
    <div className="w-full max-w-[650px] mx-auto px-6 py-12 md:px-12 lg:px-16">
        <div className="mb-10 text-center">
            <h1 className="text-[#1d395e] text-[34px] font-semibold mb-4">Set new password</h1>
            <p className="text-black text-base max-w-xs mx-auto">
                Your new password must be different to previously used passwords.
            </p>
        </div>

        <form onSubmit={handleResetSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
                <label className="text-black text-xl font-medium block">New Password</label>
                <div className="relative">
                    <input 
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create a new password" 
                        className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] shadow-sm border-2 border-[#d8dde1] focus:border-[#1e3a5f] focus:outline-none transition-colors placeholder-[#666666] text-base font-medium pr-12"
                        required
                        minLength={8}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7ca6bf] hover:text-[#1e3a5f] transition-colors"
                    >
                        <Icon icon={showNewPassword ? "mdi:eye-off" : "mdi:eye"} width="24" height="24" />
                    </button>
                </div>
                <p className="text-[#666666] text-sm">Must be at least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
                <label className="text-black text-xl font-medium block">Confirm Password</label>
                <div className="relative">
                    <input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password" 
                        className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] shadow-sm border-2 border-[#d8dde1] focus:border-[#1e3a5f] focus:outline-none transition-colors placeholder-[#666666] text-base font-medium pr-12"
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7ca6bf] hover:text-[#1e3a5f] transition-colors"
                    >
                        <Icon icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"} width="24" height="24" />
                    </button>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-[50px] bg-[#b93b53] hover:bg-[#a02f45] text-white rounded-[5px] text-base font-semibold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
            >
                {isLoading ? (
                        <Icon icon="mdi:loading" className="animate-spin text-xl" />
                ) : (
                    "Reset Password"
                )}
            </button>

            {/* Back to Login */}
            <div className="text-center pt-4">
                <Link 
                    href="/login" 
                    className="inline-flex items-center gap-2 text-black text-base font-normal hover:text-[#1e3a5f] transition-colors group"
                >
                    <Icon icon="mdi:arrow-left" className="text-xl group-hover:-translate-x-1 transition-transform" />
                    Back to log in
                </Link>
            </div>
        </form>
    </div>
  )

  // 2. EXPIRED VIEW 
  const renderExpiredView = () => (
    <div className="w-full max-w-[650px] mx-auto px-6 py-12 text-center">
        {/* Icon Circle */}
        <div className="mx-auto w-[126px] h-[130px] bg-[#7ca6bf]/30 rounded-[60px] flex items-center justify-center mb-8 relative">
            <div className="absolute w-20 h-20 bg-[#7ca6bf]/20 rounded-full blur-xl"></div>
            <div className="bg-[#1e3a5f] p-3 rounded-full relative z-10">
                 <Icon icon="mdi:clock-remove-outline" className="text-white text-[40px]" />
            </div>
        </div>

        <h1 className="text-[#1d395e] text-[34px] font-semibold mb-4">Link Expired</h1>
        <p className="text-black text-base max-w-xs mx-auto mb-10">
            The password reset link is invalid or has expired. Please request a new one.
        </p>

        <button 
            onClick={() => router.push('/login')}
            className="w-full h-[50px] bg-[#b93b53] hover:bg-[#a02f45] text-white rounded-[5px] text-base font-semibold transition-all shadow-md active:scale-[0.99]"
        >
            Back to login
        </button>
    </div>
  )

  // 3. SUCCESS VIEW 
  const renderSuccessView = () => (
    <div className="w-full max-w-[650px] mx-auto px-6 py-12 text-center">
        {/* Icon Circle */}
        <div className="mx-auto w-[126px] h-[130px] bg-[#7ca6bf]/30 rounded-[60px] flex items-center justify-center mb-8 relative">
            <div className="absolute w-20 h-20 bg-[#7ca6bf]/20 rounded-full blur-xl"></div>
            <div className="bg-[#1e3a5f] p-3 rounded-full relative z-10">
                 <Icon icon="mdi:check-bold" className="text-white text-[40px]" />
            </div>
        </div>

        <h1 className="text-[#1d395e] text-[34px] font-semibold mb-4">Your Password has been<br/>successfully reset</h1>
        <p className="text-black text-base max-w-xs mx-auto mb-10">
            You can now log in with your new password.
        </p>

        <button 
            onClick={() => router.push('/login')}
            className="w-full h-[50px] bg-[#b93b53] hover:bg-[#a02f45] text-white rounded-[5px] text-base font-semibold transition-all shadow-md active:scale-[0.99] mb-8"
        >
            Login now
        </button>

         {/* Back to Login Link */}
         <div className="text-center">
            <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-black text-base font-normal hover:text-[#1e3a5f] transition-colors group"
            >
                <Icon icon="mdi:arrow-left" className="text-xl group-hover:-translate-x-1 transition-transform" />
                Back to log in
            </Link>
        </div>
    </div>
  )


  return (
    /* FIXED OVERLAY WRAPPER */
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto font-['Inter']">
      
      {/* Flex Container */}
      <div className="flex min-h-full">

        {/* --- CONTENT --- */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white">
            
            {view === 'form' && renderFormView()}
            {view === 'expired' && renderExpiredView()}
            {view === 'success' && renderSuccessView()}

        </div>

        {/* --- RIGHT SIDE: DECORATIVE (Sticky) --- */}
        <div className="hidden lg:block w-1/2 relative bg-[#1e3a5f] min-h-screen sticky top-0 h-screen">
            {/* Background Image */}
            <img 
            src="/auth-bg.png" 
            alt="Office Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-100"
            /> 

            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-bl from-[#7ca5bf]/50 to-[#1e3a5f]/90 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e3a5f]" />
            
        </div>

      </div>
    </div>
  )
}


export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Redirect to the "Check Email" page
    router.push('/forgot-password/sent')
    setIsLoading(false)
  }

  return (
    /* FIXED OVERLAY WRAPPER */
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto font-['Inter']">
      
      {/* Flex Container */}
      <div className="flex min-h-full">

        {/* --- FORM --- */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white">
            <div className="w-full max-w-[650px] mx-auto px-6 py-12 md:px-12 lg:px-16">
                
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-[#1d395e] text-[34px] font-semibold mb-4">Forgot Password</h1>
                    <p className="text-black text-base max-w-xs mx-auto">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleResetRequest} className="space-y-8">
                    
                    <div className="space-y-2">
                        <label className="text-black text-xl font-medium block">Email</label>
                        <input 
                            type="email" 
                            placeholder="Enter your email address" 
                            className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] shadow-sm border-2 border-[#d8dde1] focus:border-[#1e3a5f] focus:outline-none transition-colors placeholder-[#666666] text-base font-medium"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-[50px] bg-[#b93b53] hover:bg-[#a02f45] text-white rounded-[5px] text-base font-semibold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                             <Icon icon="mdi:loading" className="animate-spin text-xl" />
                        ) : (
                            "Reset Password"
                        )}
                    </button>

                    {/* Back to Login Link */}
                    <div className="text-center pt-2">
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
        </div>

        {/* --- DECORATIVE --- */}
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
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'

export default function LoginPage() {
  const router = useRouter()
  
  // --- STATE ---
  // Toggle between 'email' and 'employee-id' login methods
  const [loginMethod, setLoginMethod] = useState<'email' | 'employee-id'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // --- HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Redirect mock
    alert("Login successful! Redirecting to dashboard...")
    router.push('/karyawan/dashboard')
    setIsLoading(false)
  }

  const handleGoogleSignIn = () => {
    console.log("Google Sign In Clicked")
  }

  return (
    /* FIXED OVERLAY WRAPPER */
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto font-['Inter']">
      
      {/* Flex Container to split the screen */}
      <div className="flex min-h-full">

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
            
            {/* Text Overlay */}
            <div className="relative z-10 flex flex-col justify-center h-full px-12 text-center select-none">
                <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">Welcome to HRIS</h2>
                <p className="text-gray-200 text-lg drop-shadow-sm">Streamline your workforce management with our comprehensive solution.</p>
            </div>
        </div>

        {/* --- FORM --- */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white">
            <div className="w-full max-w-[650px] mx-auto px-6 py-12 md:px-12 lg:px-16">
                
                {/* --- HEADER SECTION --- */}
                <div className="mb-8">
                    {/* Logo & Try for Free Link Row */}
                    <div className="flex justify-between items-center mb-8">
                        {/* Logo */}
                        <img 
                            src="/logo-alt.png" 
                            alt="HRIS Logo" 
                            className="h-[50px] w-auto object-contain" 
                            onError={(e) => e.currentTarget.style.display = 'none'} 
                        />
                        
                        {/* Try For Free Link */}
                        <Link href="/register" className="text-[#1e3a5f] text-sm font-semibold underline hover:text-[#142841] whitespace-nowrap">
                            Try For Free!
                        </Link>
                    </div>

                    {/* Title & Description */}
                    <div>
                        <h1 className="text-[#1d395e] text-3xl font-semibold mb-2">
                            {loginMethod === 'email' ? 'Sign In' : 'Sign In with ID Employee'}
                        </h1>
                        <p className="text-black text-base">Welcome Back!</p>
                    </div>
                </div>

                {/* --- FORM --- */}
                <form onSubmit={handleLogin} className="space-y-6">
                    
                    {/* CONDITIONAL INPUTS */}
                    {loginMethod === 'email' ? (
                        /* --- EMAIL LOGIN INPUTS --- */
                        <div className="space-y-2">
                            <label className="text-black text-xl font-medium block">Email</label>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] shadow-sm border-2 border-[#d8dde1] focus:border-[#1e3a5f] focus:outline-none transition-colors placeholder-[#666666] text-base font-medium"
                                required
                            />
                        </div>
                    ) : (
                        /* --- EMPLOYEE ID LOGIN INPUTS --- */
                        <>
                            <div className="space-y-2">
                                <label className="text-black text-xl font-medium block">Company Username</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter company username" 
                                    className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] shadow-sm border-2 border-[#d8dde1] focus:border-[#1e3a5f] focus:outline-none transition-colors placeholder-[#666666] text-base font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-black text-xl font-medium block">ID Employee</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your employee ID" 
                                    className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] shadow-sm border-2 border-[#d8dde1] focus:border-[#1e3a5f] focus:outline-none transition-colors placeholder-[#666666] text-base font-medium"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Password (Shared) */}
                    <div className="space-y-2">
                        <label className="text-black text-xl font-medium block">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password" 
                                className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] shadow-sm border-2 border-[#d8dde1] focus:border-[#1e3a5f] focus:outline-none transition-colors placeholder-[#666666] text-base font-medium pr-12"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7ca6bf] hover:text-[#1e3a5f] transition-colors"
                            >
                                <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} width="24" height="24" />
                            </button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password Row */}
                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="remember" 
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#80a8c0] bg-white checked:border-[#1e3a5f] checked:bg-[#1e3a5f] transition-all"
                                />
                                <Icon icon="mdi:check" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-sm" />
                            </div>
                            <label htmlFor="remember" className="text-black text-base font-normal cursor-pointer select-none">
                                Remember Me
                            </label>
                        </div>
                        
                        <Link href="/forgot-password" className="text-[#7ca6bf] text-base font-normal hover:text-[#1e3a5f] hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Primary Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-[50px] bg-[#b93b53] hover:bg-[#a02f45] text-white rounded-[5px] text-base font-semibold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                             <Icon icon="mdi:loading" className="animate-spin text-xl" />
                        ) : (
                            "Sign In"
                        )}
                    </button>

                    {/* --- METHOD SWITCHING & GOOGLE --- */}
                    <div className="space-y-4 pt-2">
                        {loginMethod === 'email' ? (
                            /* Email Mode: Show Google & Switch to ID */
                            <>
                                <button 
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    className="w-full h-[50px] bg-white border border-black hover:bg-gray-50 text-black rounded-[5px] text-base font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99]"
                                >
                                    <Icon icon="flat-color-icons:google" width="24" height="24" />
                                    Sign In with Google
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={() => setLoginMethod('employee-id')}
                                    className="w-full h-[50px] bg-white border border-black hover:bg-gray-50 text-black rounded-[5px] text-base font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99]"
                                >
                                    Sign In with ID Employee
                                </button>
                            </>
                        ) : (
                            /* ID Mode: Show "Different Method" (Switch back to Email) */
                            <button 
                                type="button"
                                onClick={() => setLoginMethod('email')}
                                className="w-full h-[50px] bg-white border border-black hover:bg-gray-50 text-black rounded-[5px] text-base font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99]"
                            >
                                Use a different sign in method
                            </button>
                        )}
                    </div>

                    {/* Footer Link */}
                    <div className="relative flex items-center py-2">
                         <div className="flex-grow border-t border-[#d8dde1]"></div>
                    </div>

                    <div className="text-center pb-8">
                        <span className="text-black text-base font-normal">Don't have an account? </span>
                        <Link href="/register" className="text-[#1e3a5f] text-base font-normal hover:underline">
                            Sign up here.
                        </Link>
                    </div>

                </form>
            </div>
        </div>
      </div>
    </div>
  )
}
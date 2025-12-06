'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'

export default function RegisterPage() {
  const router = useRouter()
  
  // --- STATE ---
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // --- HANDLERS ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Redirect to localhost:3000 (The Root Page)
    alert("Registration successful! Redirecting to Home...")
    router.push('/') 
    setIsLoading(false)
  }

  // Google Button Handler (Mock)
  const handleGoogleSignUp = () => {
    // Just simulating a button click action
    console.log("Google Sign Up Clicked")
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
                    {/* Logo & Login Link Row */}
                    <div className="flex justify-between items-center mb-8">
                        {/* Logo */}
                        <img 
                            src="/logo-alt.png" 
                            alt="HRIS Logo" 
                            className="h-[50px] w-auto object-contain" 
                            onError={(e) => e.currentTarget.style.display = 'none'} 
                        />
                        
                        {/* Login Link */}
                        <Link href="/login" className="text-[#1e3a5f] text-sm font-semibold underline hover:text-[#142841] whitespace-nowrap">
                            Login Here!
                        </Link>
                    </div>

                    {/* Title & Description */}
                    <div>
                        <h1 className="text-[#1d395e] text-3xl font-semibold mb-2">Sign Up</h1>
                        <p className="text-black text-base">Create your account and streamline your employee management.</p>
                    </div>
                </div>

                {/* --- FORM --- */}
                <form onSubmit={handleRegister} className="space-y-6">
                    
                    {/* Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-black text-xl font-medium block">First Name</label>
                            <input 
                                type="text" 
                                placeholder="Enter the first name" 
                                className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] shadow-sm border-2 border-[#d8dde1] focus:border-[#1e3a5f] focus:outline-none transition-colors placeholder-[#666666] text-base font-medium"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-black text-xl font-medium block">Last Name</label>
                            <input 
                                type="text" 
                                placeholder="Enter the last name" 
                                className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] shadow-sm border-2 border-[#d8dde1] focus:border-[#1e3a5f] focus:outline-none transition-colors placeholder-[#666666] text-base font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-black text-xl font-medium block">Email</label>
                        <input 
                            type="email" 
                            placeholder="Enter your email address" 
                            className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] shadow-sm border-2 border-[#d8dde1] focus:border-[#1e3a5f] focus:outline-none transition-colors placeholder-[#666666] text-base font-medium"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-black text-xl font-medium block">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password" 
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

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-black text-xl font-medium block">Confirm Password</label>
                        <div className="relative">
                            <input 
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password" 
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

                    {/* Terms Checkbox */}
                    <div className="flex items-center gap-3 pt-2">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#80a8c0] bg-white checked:border-[#1e3a5f] checked:bg-[#1e3a5f] transition-all"
                                required
                            />
                                <Icon icon="mdi:check" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-sm" />
                        </div>
                        <label htmlFor="terms" className="text-black text-base font-normal cursor-pointer select-none">
                            I Agree with the term of use of HRIS
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-[50px] bg-[#b93b53] hover:bg-[#a02f45] text-white rounded-[5px] text-base font-semibold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                                <Icon icon="mdi:loading" className="animate-spin text-xl" />
                        ) : (
                            "Sign Up"
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-[#d8dde1]"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or</span>
                        <div className="flex-grow border-t border-[#d8dde1]"></div>
                    </div>

                    {/* Google Auth */}
                    <button 
                        type="button"
                        onClick={handleGoogleSignUp}
                        className="w-full h-[50px] bg-white border border-black hover:bg-gray-50 text-black rounded-[5px] text-base font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99]"
                    >
                        <Icon icon="flat-color-icons:google" width="24" height="24" />
                        Sign Up with Google
                    </button>

                    {/* Footer Link */}
                    <div className="text-center pt-4 pb-8">
                        <span className="text-black text-base font-normal">Already have an account? </span>
                        <Link href="/login" className="text-[#1e3a5f] text-base font-normal hover:underline">
                            Sign in here.
                        </Link>
                    </div>

                </form>
            </div>
        </div>
      </div>
    </div>
  )
}
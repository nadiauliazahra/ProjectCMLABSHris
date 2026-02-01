'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckEmailPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto redirect to reset password page
    const timer = setTimeout(() => {
      router.push('/reset-password')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  const handleOpenEmail = () => {
    window.location.href = 'mailto:'
  }

  const handleResend = () => {
    alert('Resent email!')
  }

  return (
    /* FIXED OVERLAY WRAPPER */
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto font-['Inter']">
      
      {/* Flex Container */}
      <div className="flex min-h-full">

        {/* --- CONTENT --- */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white">
          <div className="w-full max-w-[650px] mx-auto px-6 py-12 md:px-12 lg:px-16 text-center">

            {/* Icon */}
            <div className="mx-auto w-[126px] h-[130px] bg-[#7ca6bf]/30 rounded-[60px] flex items-center justify-center mb-8 relative">
              <div className="absolute w-20 h-20 bg-[#7ca6bf]/20 rounded-full blur-xl"></div>
              <Icon
                icon="mdi:email-check"
                className="text-[#1e3a5f] text-[70px] relative z-10"
              />
            </div>

            {/* Header */}
            <h1 className="text-[#1d395e] text-[34px] font-semibold mb-4">
              Check your email
            </h1>

            <p className="text-black text-base max-w-xs mx-auto mb-10">
              We have sent a password recovery link to your email.
              <span className="block text-sm text-gray-500 mt-2">
                Redirecting in 3 seconds…
              </span>
            </p>

            {/* Open Email */}
            <button
              onClick={handleOpenEmail}
              className="w-full h-[50px] bg-[#b93b53] hover:bg-[#a02f45] text-white rounded-[5px] text-base font-semibold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 mb-8"
            >
              Open Email
            </button>

            {/* Resend */}
            <div className="text-center text-base mb-8">
              <span className="text-black">Don’t receive the email? </span>
              <button
                onClick={handleResend}
                className="text-[#1e3a5f] underline hover:text-[#142841] font-normal"
              >
                Click here to resend.
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-2 mb-8">
              <div className="flex-grow border-t border-[#d8dde1]"></div>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-black text-base font-normal hover:text-[#1e3a5f] transition-colors group"
              >
                <Icon
                  icon="mdi:arrow-left"
                  className="text-xl group-hover:-translate-x-1 transition-transform"
                />
                Back to log in
              </Link>
            </div>

          </div>
        </div>

        {/* --- DECORATIVE --- */}
        <div className="hidden lg:block w-1/2 relative bg-[#1e3a5f] min-h-screen sticky top-0 h-screen">
          <img
            src="/auth-bg.png"
            alt="Office Background"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-bl from-[#7ca5bf]/50 to-[#1e3a5f]/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e3a5f]" />
        </div>

      </div>
    </div>
  )
}

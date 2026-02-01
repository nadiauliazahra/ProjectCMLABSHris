'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { API_URL } from '../../../utils/config'

export default function RegisterPage() {
  const router = useRouter()

  // --- FORM STATE ---
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // --- UI STATE ---
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // --- HANDLERS ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        email,
        password,
        role: 'admin_company'
      }

      await axios.post(`${API_URL}/auth/register`, payload)

      alert('Registration successful! Please sign in.')
      router.push('/login')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    console.log('Google Sign Up Clicked')
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto font-['Inter']">
      <div className="flex min-h-full">

        {/* --- LEFT DECORATIVE --- */}
        <div className="hidden lg:block w-1/2 relative bg-[#1e3a5f] min-h-screen sticky top-0 h-screen">
          <img
            src="/auth-bg.png"
            alt="Office Background"
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-bl from-[#7ca5bf]/50 to-[#1e3a5f]/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e3a5f]" />

          <div className="relative z-10 flex flex-col justify-center h-full px-12 text-center select-none">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">
              Welcome to HRIS
            </h2>
            <p className="text-gray-200 text-lg drop-shadow-sm">
              Streamline your workforce management with our comprehensive solution.
            </p>
          </div>
        </div>

        {/* --- FORM --- */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white">
          <div className="w-full max-w-[650px] mx-auto px-6 py-12 md:px-12 lg:px-16">

            {/* HEADER */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-8">
                <img
                  src="/logo-alt.png"
                  alt="HRIS Logo"
                  className="h-[50px] w-auto object-contain"
                />
                <Link
                  href="/login"
                  className="text-[#1e3a5f] text-sm font-semibold underline hover:text-[#142841]"
                >
                  Login Here!
                </Link>
              </div>

              <h1 className="text-[#1d395e] text-3xl font-semibold mb-2">
                Sign Up
              </h1>
              <p className="text-black text-base">
                Create your account and streamline your employee management.
              </p>
            </div>

            {/* ERROR */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">

              {/* NAME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-black text-xl font-medium">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] border-2 border-[#d8dde1]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-black text-xl font-medium">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] border-2 border-[#d8dde1]"
                  />
                </div>
              </div>

              {/* COMPANY */}
              <div className="space-y-2">
                <label className="text-black text-xl font-medium">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] border-2 border-[#d8dde1]"
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-black text-xl font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] border-2 border-[#d8dde1]"
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <label className="text-black text-xl font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] border-2 border-[#d8dde1] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7ca6bf]"
                  >
                    <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} width="24" />
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-2">
                <label className="text-black text-xl font-medium">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] border-2 border-[#d8dde1] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7ca6bf]"
                  >
                    <Icon icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'} width="24" />
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[50px] bg-[#b93b53] text-white rounded-[5px] font-semibold"
              >
                {isLoading ? 'Creating account…' : 'Sign Up'}
              </button>

              {/* DIVIDER */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-[#d8dde1]"></div>
                <span className="mx-4 text-gray-400 text-sm">Or</span>
                <div className="flex-grow border-t border-[#d8dde1]"></div>
              </div>

              {/* GOOGLE */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full h-[50px] bg-white border border-black rounded-[5px] text-black font-semibold flex items-center justify-center gap-2"
              >
                <Icon icon="flat-color-icons:google" width="24" />
                Sign Up with Google
              </button>

              {/* FOOTER */}
              <div className="text-center pt-4 pb-8">
                <span className="text-black">Already have an account? </span>
                <Link href="/login" className="text-[#1e3a5f] hover:underline">
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

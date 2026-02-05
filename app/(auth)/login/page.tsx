'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { API_URL } from '../../../utils/config'

export default function LoginPage() {
  const router = useRouter()

  // --- STATE ---
  const [loginMethod, setLoginMethod] = useState<'email' | 'employee-id'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // INPUT STATES
  const [email, setEmail] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // --- HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    try {
      const payload =
        loginMethod === 'email'
          ? { email, password }
          : { employee_id: employeeId, password }

      const response = await axios.post(`${API_URL}/auth/login`, payload)

      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      if (user.role === 'admin_company' || user.role === 'admin_system') {
        router.push('/dashboard')
      } else {
        router.push('/karyawan/dashboard')
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
        'Login failed. Please check your credentials.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    console.log('Google Sign In Clicked')
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto font-['Inter']">
      <div className="flex min-h-full">

        {/* --- LEFT / DECORATIVE --- */}
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

        {/* --- RIGHT / FORM --- */}
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
                  href="/register"
                  className="text-[#1e3a5f] text-sm font-semibold underline hover:text-[#142841]"
                >
                  Try For Free!
                </Link>
              </div>

              <h1 className="text-[#1d395e] text-3xl font-semibold mb-2">
                {loginMethod === 'email'
                  ? 'Sign In'
                  : 'Sign In with ID Employee'}
              </h1>
              <p className="text-black text-base">Welcome Back!</p>
            </div>

            {/* ERROR MESSAGE */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">

              {/* EMAIL / EMPLOYEE ID */}
              {loginMethod === 'email' ? (
                <div className="space-y-2">
                  <label className="text-black text-xl font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] border-2 border-[#d8dde1]"
                    placeholder="Enter your email"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-black text-xl font-medium">ID Employee</label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      required
                      className="w-full h-[50px] px-4 bg-white text-black rounded-[5px] border-2 border-[#d8dde1]"
                      placeholder="Enter your employee ID"
                    />
                  </div>
                </>
              )}

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
                    placeholder="Enter your password"
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

              {/* REMEMBER & FORGOT */}
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

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[50px] bg-[#b93b53] text-white rounded-[5px] font-semibold"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>

              {/* GOOGLE */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full h-[50px] bg-white border border-black rounded-[5px] text-black font-semibold flex items-center justify-center gap-2"
              >
                <Icon icon="flat-color-icons:google" width="24" />
                Sign In with Google
              </button>

              {/* SWITCH METHOD */}
              {loginMethod === 'email' ? (
                <button
                  type="button"
                  onClick={() => setLoginMethod('employee-id')}
                  className="w-full h-[50px] bg-white border border-black hover:bg-gray-50 text-black rounded-[5px] text-base font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99]"
                >
                  Sign In with ID Employee
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className="w-full h-[50px] bg-white border border-black hover:bg-gray-50 text-black rounded-[5px] text-base font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99]"
                >
                  Use a different sign in method
                </button>
              )}

              {/* FOOTER */}
              <div className="text-center pt-4">
                <span className="text-black">Don't have an account? </span>
                <Link href="/register" className="text-[#1e3a5f] hover:underline">
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

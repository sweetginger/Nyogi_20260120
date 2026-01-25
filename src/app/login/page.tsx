'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // 이미 로그인된 경우 대시보드로 이동
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  // URL에서 에러 메시지 확인
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'OAuthAccountNotLinked':
          setError('이 이메일은 다른 로그인 방식으로 이미 등록되어 있습니다.')
          break
        case 'CredentialsSignin':
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
          break
        default:
          setError('로그인 중 오류가 발생했습니다.')
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.')
      return
    }

    if (password.length < 1) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        // NextAuth 에러 메시지 처리
        setError(result.error)
      } else if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setIsGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      setError('Google 로그인 중 오류가 발생했습니다.')
      setIsGoogleLoading(false)
    }
  }

  // 로딩 중이면 로딩 화면 표시
  if (status === 'loading') {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="animate-pulse text-surface-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="font-display font-bold text-2xl text-surface-900 dark:text-white">
              Nyogi
            </span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="card p-8 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              다시 만나서 반가워요!
            </h1>
            <p className="text-surface-600 dark:text-surface-400">
              로그인하고 글로벌 미팅을 시작하세요
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Google Login */}
          <Button
            variant="secondary"
            className="w-full mb-6"
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
            disabled={isLoading}
            leftIcon={
              !isGoogleLoading && (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )
            }
          >
            Google로 계속하기
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200 dark:border-surface-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-surface-900 text-surface-500">
                또는 이메일로 로그인
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              disabled={isLoading || isGoogleLoading}
              autoComplete="email"
              required
            />

            <Input
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              disabled={isLoading || isGoogleLoading}
              autoComplete="current-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-surface-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                />
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  로그인 상태 유지
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isGoogleLoading}
            >
              로그인
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
            아직 계정이 없으신가요?{' '}
            <Link
              href="/signup"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium hover:underline"
            >
              무료로 시작하기
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-surface-500">
          로그인하면{' '}
          <Link href="/terms" className="hover:underline">이용약관</Link>
          {' '}및{' '}
          <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
          에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}

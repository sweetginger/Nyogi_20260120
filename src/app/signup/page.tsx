'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Mail, Lock, User, Eye, EyeOff, Check, AlertCircle, Gift } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const router = useRouter()
  const { status } = useSession()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // 이미 로그인된 경우 대시보드로 이동
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const passwordRequirements = [
    { label: '8자 이상', met: password.length >= 8 },
    { label: '영문 포함', met: /[a-zA-Z]/.test(password) },
    { label: '숫자 포함', met: /[0-9]/.test(password) },
  ]

  const isPasswordValid = passwordRequirements.every((req) => req.met)
  const isPasswordMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 이름 검증
    if (!name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.')
      return
    }

    // 비밀번호 검증
    if (!isPasswordValid) {
      setError('비밀번호 요구사항을 충족해주세요.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (!agreeTerms) {
      setError('이용약관 및 개인정보처리방침에 동의해주세요.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '회원가입 중 오류가 발생했습니다.')
        return
      }

      // 자동 로그인
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        // 회원가입은 성공했지만 자동 로그인 실패 시
        router.push('/login?message=signup_success')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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

        {/* Signup Card */}
        <div className="card p-8 animate-slide-up">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              무료로 시작하기
            </h1>
            <p className="text-surface-600 dark:text-surface-400">
              1시간 무료 미팅으로 Nyogi를 경험하세요
            </p>
          </div>

          {/* Free Trial Banner */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-white text-sm">
                  🎉 회원가입 시 1시간 무료!
                </p>
                <p className="text-xs text-surface-600 dark:text-surface-400">
                  신용카드 없이 바로 시작하세요
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Google Signup */}
          <Button
            variant="secondary"
            className="w-full mb-6"
            onClick={handleGoogleSignup}
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
                또는 이메일로 가입
              </span>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이름"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              leftIcon={<User className="w-5 h-5" />}
              disabled={isLoading || isGoogleLoading}
              autoComplete="name"
              required
            />

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

            <div>
              <Input
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                disabled={isLoading || isGoogleLoading}
                autoComplete="new-password"
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
              {password && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {passwordRequirements.map((req, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors ${
                        req.met
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-surface-100 text-surface-500 dark:bg-surface-800'
                      }`}
                    >
                      {req.met && <Check className="w-3 h-3" />}
                      {req.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Input
              label="비밀번호 확인"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              disabled={isLoading || isGoogleLoading}
              autoComplete="new-password"
              error={
                confirmPassword && password !== confirmPassword
                  ? '비밀번호가 일치하지 않습니다.'
                  : undefined
              }
              rightIcon={
                isPasswordMatch && (
                  <Check className="w-5 h-5 text-green-500" />
                )
              }
              required
            />

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                disabled={isLoading || isGoogleLoading}
                required
              />
              <label
                htmlFor="terms"
                className="text-sm text-surface-600 dark:text-surface-400 cursor-pointer"
              >
                <Link
                  href="/terms"
                  className="text-primary-600 hover:underline"
                  target="_blank"
                >
                  이용약관
                </Link>
                {' '}및{' '}
                <Link
                  href="/privacy"
                  className="text-primary-600 hover:underline"
                  target="_blank"
                >
                  개인정보처리방침
                </Link>
                에 동의합니다.
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isGoogleLoading || !isPasswordValid || !isPasswordMatch || !agreeTerms}
            >
              가입하기
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

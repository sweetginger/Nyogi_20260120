'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const passwordRequirements = [
    { label: '8자 이상', met: password.length >= 8 },
    { label: '영문 포함', met: /[a-zA-Z]/.test(password) },
    { label: '숫자 포함', met: /[0-9]/.test(password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError('비밀번호 요구사항을 충족해주세요.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '회원가입 중 오류가 발생했습니다.')
        return
      }

      // 자동 로그인
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        router.push('/login')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="font-display font-bold text-2xl text-surface-900 dark:text-white">
              Nyogi
            </span>
          </Link>
        </div>

        {/* Signup Card */}
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              무료로 시작하기
            </h1>
            <p className="text-surface-600 dark:text-surface-400">
              1시간 무료 미팅으로 Nyogi를 경험하세요
            </p>
          </div>

          {/* Google Signup */}
          <Button
            variant="secondary"
            className="w-full mb-6"
            onClick={handleGoogleSignup}
            leftIcon={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
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
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="이름"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              leftIcon={<User className="w-5 h-5" />}
              required
            />

            <Input
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
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
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-surface-600 transition-colors"
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
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
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
              error={confirmPassword && password !== confirmPassword ? '비밀번호가 일치하지 않습니다.' : undefined}
              required
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-surface-600 dark:text-surface-400">
                <Link href="/terms" className="text-primary-600 hover:underline">
                  이용약관
                </Link>
                {' '}및{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  개인정보처리방침
                </Link>
                에 동의합니다.
              </label>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              가입하기
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}


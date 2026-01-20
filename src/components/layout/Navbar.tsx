'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  Menu,
  X,
  Home,
  Video,
  Users,
  Settings,
  LogOut,
  Crown,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-surface-200/50 dark:border-surface-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-display font-bold text-xl text-surface-900 dark:text-white">
              Nyogi
            </span>
          </Link>

          {/* Desktop Navigation */}
          {session ? (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                대시보드
              </Link>
              <Link
                href="/meetings"
                className="flex items-center gap-2 text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors"
              >
                <Video className="w-4 h-4" />
                미팅
              </Link>
              <Link
                href="/workspaces"
                className="flex items-center gap-2 text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors"
              >
                <Users className="w-4 h-4" />
                워크스페이스
              </Link>
            </div>
          ) : null}

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium">
                    {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    {session.user?.name || session.user?.email}
                  </span>
                  <ChevronDown className="w-4 h-4 text-surface-400" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-900 rounded-xl shadow-lg border border-surface-200 dark:border-surface-800 py-2 animate-slide-down">
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-surface-600 hover:text-surface-900 hover:bg-surface-50 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      설정
                    </Link>
                    <Link
                      href="/pricing"
                      className="flex items-center gap-3 px-4 py-2.5 text-surface-600 hover:text-surface-900 hover:bg-surface-50 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Crown className="w-4 h-4" />
                      프리미엄
                    </Link>
                    <hr className="my-2 border-surface-200 dark:border-surface-800" />
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">로그인</Button>
                </Link>
                <Link href="/signup">
                  <Button>무료로 시작하기</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-surface-600" />
            ) : (
              <Menu className="w-6 h-6 text-surface-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-surface-200/50 dark:border-surface-800/50 animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  대시보드
                </Link>
                <Link
                  href="/meetings"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Video className="w-5 h-5" />
                  미팅
                </Link>
                <Link
                  href="/workspaces"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  워크스페이스
                </Link>
                <hr className="my-2 border-surface-200 dark:border-surface-800" />
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  로그아웃
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">무료로 시작하기</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}


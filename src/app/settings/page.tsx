'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Bell, Shield, Clock, Crown } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

interface UserData {
  id: string
  name: string | null
  email: string | null
  isPremium: boolean
  totalMeetingTime: number
  freeTimeRemaining: number
  createdAt: string
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('사용자 정보 로딩 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchUser()
    }
  }, [status])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`
    }
    return `${minutes}분`
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <div className="pt-24 px-4 flex items-center justify-center">
          <div className="animate-pulse text-surface-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-900 dark:text-white">
              설정
            </h1>
            <p className="text-surface-600 dark:text-surface-400 mt-1">
              계정 및 서비스 설정을 관리하세요
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-surface-500" />
                  <h2 className="font-semibold text-surface-900 dark:text-white">
                    프로필
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-medium">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">
                      {user?.name || '이름 없음'}
                    </p>
                    <p className="text-sm text-surface-500">{user?.email}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <Input
                    label="이름"
                    defaultValue={user?.name || ''}
                    placeholder="이름을 입력하세요"
                  />
                  <Input
                    label="이메일"
                    defaultValue={user?.email || ''}
                    disabled
                    helperText="이메일은 변경할 수 없습니다"
                  />
                </div>
                <div className="pt-4">
                  <Button>변경사항 저장</Button>
                </div>
              </CardBody>
            </Card>

            {/* Subscription */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-surface-500" />
                  <h2 className="font-semibold text-surface-900 dark:text-white">
                    구독
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">
                      {user?.isPremium ? '프리미엄' : '무료'}
                    </p>
                    <p className="text-sm text-surface-500">
                      {user?.isPremium
                        ? '무제한 미팅 시간을 이용 중입니다'
                        : '1시간 무료 체험 중'}
                    </p>
                  </div>
                  {user?.isPremium ? (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-medium rounded-full">
                      프리미엄
                    </span>
                  ) : (
                    <Button onClick={() => router.push('/pricing')}>
                      업그레이드
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <div>
                    <p className="text-sm text-surface-500 mb-1">총 미팅 시간</p>
                    <p className="font-medium text-surface-900 dark:text-white">
                      {formatTime(user?.totalMeetingTime || 0)}
                    </p>
                  </div>
                  {!user?.isPremium && (
                    <div>
                      <p className="text-sm text-surface-500 mb-1">남은 무료 시간</p>
                      <p className="font-medium text-surface-900 dark:text-white">
                        {formatTime(user?.freeTimeRemaining || 0)}
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-surface-500" />
                  <h2 className="font-semibold text-surface-900 dark:text-white">
                    알림
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">
                      이메일 알림
                    </p>
                    <p className="text-sm text-surface-500">
                      미팅 요약 및 공유 알림 받기
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-surface-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-surface-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">
                      마케팅 소식
                    </p>
                    <p className="text-sm text-surface-500">
                      새로운 기능 및 업데이트 소식 받기
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-surface-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-surface-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </CardBody>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-surface-500" />
                  <h2 className="font-semibold text-surface-900 dark:text-white">
                    보안
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">
                      비밀번호 변경
                    </p>
                    <p className="text-sm text-surface-500">
                      계정 보안을 위해 정기적으로 변경하세요
                    </p>
                  </div>
                  <Button variant="secondary">변경</Button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-700">
                  <div>
                    <p className="font-medium text-red-600">계정 삭제</p>
                    <p className="text-sm text-surface-500">
                      모든 데이터가 영구적으로 삭제됩니다
                    </p>
                  </div>
                  <Button variant="danger">삭제</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}


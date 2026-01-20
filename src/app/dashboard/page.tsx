'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Plus,
  Video,
  Clock,
  FileText,
  Users,
  TrendingUp,
  ArrowRight,
  Crown,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

interface Meeting {
  id: string
  title: string
  status: string
  meetingType: string
  languageA: string
  languageB: string
  createdAt: string
  duration: number
  _count: { transcripts: number }
}

interface UserData {
  id: string
  name: string
  email: string
  isPremium: boolean
  totalMeetingTime: number
  freeTimeRemaining: number
  _count: { meetings: number }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, meetingsRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/meetings'),
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user)
        }

        if (meetingsRes.ok) {
          const meetingsData = await meetingsRes.json()
          setMeetings(meetingsData.meetings)
        }
      } catch (error) {
        console.error('데이터 로딩 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchData()
    }
  }, [session])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`
    }
    return `${minutes}분`
  }

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}분`
  }

  const langNames: Record<string, string> = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-900 dark:text-white">
                안녕하세요, {user?.name || session?.user?.name || '사용자'}님 👋
              </h1>
              <p className="text-surface-600 dark:text-surface-400 mt-1">
                오늘도 글로벌 미팅을 성공적으로 진행하세요!
              </p>
            </div>
            <Link href="/meetings/new">
              <Button leftIcon={<Plus className="w-5 h-5" />}>새 미팅 만들기</Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Video className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-surface-900 dark:text-white">
                      {user?._count?.meetings || 0}
                    </p>
                    <p className="text-xs text-surface-500">총 미팅</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-surface-900 dark:text-white">
                      {formatDuration(user?.totalMeetingTime || 0)}
                    </p>
                    <p className="text-xs text-surface-500">총 미팅 시간</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-surface-900 dark:text-white">
                      {meetings.filter((m) => m.status === 'completed').length}
                    </p>
                    <p className="text-xs text-surface-500">완료된 미팅</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-surface-900 dark:text-white">
                      {user?.isPremium ? '무제한' : formatTimeRemaining(user?.freeTimeRemaining || 0)}
                    </p>
                    <p className="text-xs text-surface-500">
                      {user?.isPremium ? '프리미엄' : '남은 무료 시간'}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Premium Banner (if not premium) */}
          {!user?.isPremium && (
            <Card className="mb-8 overflow-hidden">
              <div className="animated-gradient p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        프리미엄으로 업그레이드
                      </h3>
                      <p className="text-white/80 text-sm">
                        무제한 미팅 시간과 고급 기능을 이용하세요
                      </p>
                    </div>
                  </div>
                  <Link href="/pricing">
                    <Button
                      variant="secondary"
                      className="bg-white text-primary-600 hover:bg-white/90"
                    >
                      업그레이드
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link href="/meetings/new?type=in-person">
              <Card hover className="h-full">
                <CardBody className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white">
                        대면 미팅
                      </h3>
                      <p className="text-sm text-surface-500">오프라인 미팅 시작</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link href="/meetings/new?type=zoom">
              <Card hover className="h-full">
                <CardBody className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white">
                        Zoom 미팅
                      </h3>
                      <p className="text-sm text-surface-500">Zoom 링크 연결</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link href="/meetings/new?type=google-meet">
              <Card hover className="h-full">
                <CardBody className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Video className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white">
                        Google Meet
                      </h3>
                      <p className="text-sm text-surface-500">Meet 링크 연결</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          </div>

          {/* Recent Meetings */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-white">
              최근 미팅
            </h2>
            <Link
              href="/meetings"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
            >
              전체 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {meetings.length === 0 ? (
            <Card>
              <CardBody className="p-12 text-center">
                <Video className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
                  아직 미팅이 없습니다
                </h3>
                <p className="text-surface-500 mb-6">
                  첫 번째 미팅을 만들고 실시간 통역을 경험해보세요!
                </p>
                <Link href="/meetings/new">
                  <Button leftIcon={<Plus className="w-5 h-5" />}>새 미팅 만들기</Button>
                </Link>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-3">
              {meetings.slice(0, 5).map((meeting) => (
                <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                  <Card hover>
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              meeting.status === 'completed'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : meeting.status === 'in-progress'
                                ? 'bg-red-100 dark:bg-red-900/30'
                                : 'bg-surface-100 dark:bg-surface-800'
                            }`}
                          >
                            <Video
                              className={`w-5 h-5 ${
                                meeting.status === 'completed'
                                  ? 'text-green-600 dark:text-green-400'
                                  : meeting.status === 'in-progress'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-surface-500'
                              }`}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-surface-900 dark:text-white">
                              {meeting.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-surface-500">
                              <span>
                                {format(new Date(meeting.createdAt), 'M월 d일 HH:mm', {
                                  locale: ko,
                                })}
                              </span>
                              <span>•</span>
                              <span>
                                {langNames[meeting.languageA]} ↔ {langNames[meeting.languageB]}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              meeting.status === 'completed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : meeting.status === 'in-progress'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
                            }`}
                          >
                            {meeting.status === 'completed'
                              ? '완료'
                              : meeting.status === 'in-progress'
                              ? '진행 중'
                              : '예정'}
                          </span>
                          <ArrowRight className="w-5 h-5 text-surface-400" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


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
  Search,
  Filter,
  Clock,
  ArrowRight,
  Users,
  Monitor,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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

export default function MeetingsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch('/api/meetings')
        if (res.ok) {
          const data = await res.json()
          setMeetings(data.meetings)
        }
      } catch (error) {
        console.error('미팅 로딩 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchMeetings()
    }
  }, [status])

  const langNames: Record<string, string> = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
  }

  const meetingTypeIcons: Record<string, React.ReactNode> = {
    'in-person': <Users className="w-5 h-5" />,
    zoom: <Video className="w-5 h-5" />,
    'google-meet': <Monitor className="w-5 h-5" />,
  }

  const meetingTypeNames: Record<string, string> = {
    'in-person': '대면',
    zoom: 'Zoom',
    'google-meet': 'Google Meet',
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`
    }
    return `${minutes}분`
  }

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
                미팅
              </h1>
              <p className="text-surface-600 dark:text-surface-400 mt-1">
                모든 미팅 기록을 확인하고 관리하세요
              </p>
            </div>
            <Link href="/meetings/new">
              <Button leftIcon={<Plus className="w-5 h-5" />}>새 미팅 만들기</Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="미팅 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="all">모든 상태</option>
                <option value="scheduled">예정</option>
                <option value="in-progress">진행 중</option>
                <option value="completed">완료</option>
              </select>
              <Button variant="secondary" leftIcon={<Filter className="w-5 h-5" />}>
                필터
              </Button>
            </div>
          </div>

          {/* Meetings List */}
          {filteredMeetings.length === 0 ? (
            <Card>
              <CardBody className="p-12 text-center">
                <Video className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
                  {searchQuery || statusFilter !== 'all'
                    ? '검색 결과가 없습니다'
                    : '아직 미팅이 없습니다'}
                </h3>
                <p className="text-surface-500 mb-6">
                  {searchQuery || statusFilter !== 'all'
                    ? '다른 검색어나 필터를 시도해보세요'
                    : '첫 번째 미팅을 만들고 실시간 통역을 경험해보세요!'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Link href="/meetings/new">
                    <Button leftIcon={<Plus className="w-5 h-5" />}>새 미팅 만들기</Button>
                  </Link>
                )}
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredMeetings.map((meeting) => (
                <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                  <Card hover>
                    <CardBody className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              meeting.status === 'completed'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : meeting.status === 'in-progress'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
                            }`}
                          >
                            {meetingTypeIcons[meeting.meetingType] || <Video className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="font-medium text-surface-900 dark:text-white">
                              {meeting.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-surface-500 mt-1">
                              <span>
                                {format(new Date(meeting.createdAt), 'yyyy년 M월 d일 HH:mm', {
                                  locale: ko,
                                })}
                              </span>
                              <span>•</span>
                              <span>{meetingTypeNames[meeting.meetingType]}</span>
                              <span>•</span>
                              <span>
                                {langNames[meeting.languageA]} ↔ {langNames[meeting.languageB]}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {meeting.duration > 0 && (
                            <div className="hidden sm:flex items-center gap-1.5 text-sm text-surface-500">
                              <Clock className="w-4 h-4" />
                              {formatDuration(meeting.duration)}
                            </div>
                          )}
                          <span
                            className={`text-xs px-3 py-1.5 rounded-full font-medium ${
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


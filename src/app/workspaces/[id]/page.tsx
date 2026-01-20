'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Plus,
  Users,
  Video,
  Settings,
  ArrowLeft,
  ArrowRight,
  UserPlus,
  Trash2,
  Clock,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'

interface WorkspaceMember {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface Meeting {
  id: string
  title: string
  status: string
  languageA: string
  languageB: string
  createdAt: string
  duration: number
  user: {
    id: string
    name: string | null
  }
}

interface Workspace {
  id: string
  name: string
  description: string | null
  ownerId: string
  owner: {
    id: string
    name: string | null
    email: string | null
  }
  members: WorkspaceMember[]
  meetings: Meeting[]
}

export default function WorkspaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  const langNames: Record<string, string> = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
  }

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspaces/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setWorkspace(data.workspace)
      } else if (res.status === 404 || res.status === 403) {
        router.push('/workspaces')
      }
    } catch (error) {
      console.error('워크스페이스 로딩 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (authStatus === 'authenticated') {
      fetchWorkspace()
    }
  }, [authStatus, fetchWorkspace, router])

  const inviteMember = async () => {
    if (!inviteEmail.trim()) {
      alert('이메일을 입력해주세요.')
      return
    }

    setIsInviting(true)
    try {
      const res = await fetch(`/api/workspaces/${params.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })

      if (res.ok) {
        fetchWorkspace()
        setShowInviteModal(false)
        setInviteEmail('')
      } else {
        const error = await res.json()
        alert(error.error)
      }
    } catch {
      alert('멤버 초대 중 오류가 발생했습니다.')
    } finally {
      setIsInviting(false)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('정말로 이 멤버를 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/workspaces/${params.id}/members?memberId=${memberId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchWorkspace()
      } else {
        const error = await res.json()
        alert(error.error)
      }
    } catch {
      alert('멤버 삭제 중 오류가 발생했습니다.')
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`
    }
    return `${minutes}분`
  }

  const isOwner = workspace?.ownerId === session?.user?.id
  const currentMember = workspace?.members.find((m) => m.user.id === session?.user?.id)
  const isAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin'

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <div className="pt-24 px-4 flex items-center justify-center">
          <div className="animate-pulse text-surface-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <div className="pt-24 px-4 flex items-center justify-center">
          <div className="text-surface-500">워크스페이스를 찾을 수 없습니다.</div>
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
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/workspaces')}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-surface-500" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-900 dark:text-white">
                  {workspace.name}
                </h1>
                {workspace.description && (
                  <p className="text-surface-600 dark:text-surface-400 mt-1">
                    {workspace.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  variant="secondary"
                  leftIcon={<UserPlus className="w-5 h-5" />}
                  onClick={() => setShowInviteModal(true)}
                >
                  멤버 초대
                </Button>
              )}
              {isOwner && (
                <Button variant="secondary" leftIcon={<Settings className="w-5 h-5" />}>
                  설정
                </Button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Meetings */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-surface-900 dark:text-white">
                      미팅 ({workspace.meetings.length})
                    </h2>
                    <Link href={`/meetings/new?workspaceId=${workspace.id}`}>
                      <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                        새 미팅
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  {workspace.meetings.length === 0 ? (
                    <div className="p-12 text-center">
                      <Video className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                      <p className="text-surface-500">아직 미팅이 없습니다</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-200 dark:divide-surface-700">
                      {workspace.meetings.map((meeting) => (
                        <Link
                          key={meeting.id}
                          href={`/meetings/${meeting.id}`}
                          className="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
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
                                    ? 'text-green-600'
                                    : meeting.status === 'in-progress'
                                    ? 'text-red-600'
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
                                  {format(new Date(meeting.createdAt), 'M월 d일', { locale: ko })}
                                </span>
                                <span>•</span>
                                <span>{meeting.user.name}</span>
                                <span>•</span>
                                <span>
                                  {langNames[meeting.languageA]} ↔ {langNames[meeting.languageB]}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {meeting.duration > 0 && (
                              <span className="flex items-center gap-1 text-sm text-surface-500">
                                <Clock className="w-4 h-4" />
                                {formatDuration(meeting.duration)}
                              </span>
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                meeting.status === 'completed'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : meeting.status === 'in-progress'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-surface-100 text-surface-600 dark:bg-surface-800'
                              }`}
                            >
                              {meeting.status === 'completed'
                                ? '완료'
                                : meeting.status === 'in-progress'
                                ? '진행 중'
                                : '예정'}
                            </span>
                            <ArrowRight className="w-4 h-4 text-surface-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Members */}
            <div>
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-surface-900 dark:text-white">
                    멤버 ({workspace.members.length})
                  </h2>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="divide-y divide-surface-200 dark:divide-surface-700">
                    {workspace.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium">
                            {member.user.name?.charAt(0) || member.user.email?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-surface-900 dark:text-white">
                              {member.user.name || member.user.email}
                            </p>
                            <p className="text-sm text-surface-500">
                              {member.role === 'owner'
                                ? '소유자'
                                : member.role === 'admin'
                                ? '관리자'
                                : '멤버'}
                            </p>
                          </div>
                        </div>
                        {isAdmin &&
                          member.role !== 'owner' &&
                          member.user.id !== session?.user?.id && (
                            <button
                              onClick={() => removeMember(member.id)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="멤버 초대"
      >
        <div className="space-y-4">
          <Input
            label="이메일 주소"
            type="email"
            placeholder="teammate@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <p className="text-sm text-surface-500">
            초대할 사용자는 Nyogi에 가입되어 있어야 합니다.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowInviteModal(false)}
            >
              취소
            </Button>
            <Button className="flex-1" onClick={inviteMember} isLoading={isInviting}>
              초대하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


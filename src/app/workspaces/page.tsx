'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Plus,
  Users,
  Video,
  Settings,
  ArrowRight,
  Building2,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
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

interface Workspace {
  id: string
  name: string
  description: string | null
  owner: {
    id: string
    name: string | null
    email: string | null
  }
  members: WorkspaceMember[]
  _count: {
    meetings: number
  }
  createdAt: string
}

export default function WorkspacesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch('/api/workspaces')
        if (res.ok) {
          const data = await res.json()
          setWorkspaces(data.workspaces)
        }
      } catch (error) {
        console.error('워크스페이스 로딩 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchWorkspaces()
    }
  }, [status])

  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      alert('워크스페이스 이름을 입력해주세요.')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkspaceName,
          description: newWorkspaceDescription,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setWorkspaces([data.workspace, ...workspaces])
        setShowCreateModal(false)
        setNewWorkspaceName('')
        setNewWorkspaceDescription('')
      } else {
        const error = await res.json()
        alert(error.error)
      }
    } catch {
      alert('워크스페이스 생성 중 오류가 발생했습니다.')
    } finally {
      setIsCreating(false)
    }
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
                워크스페이스
              </h1>
              <p className="text-surface-600 dark:text-surface-400 mt-1">
                팀과 함께 미팅을 관리하고 공유하세요
              </p>
            </div>
            <Button
              leftIcon={<Plus className="w-5 h-5" />}
              onClick={() => setShowCreateModal(true)}
            >
              워크스페이스 만들기
            </Button>
          </div>

          {/* Workspaces Grid */}
          {workspaces.length === 0 ? (
            <Card>
              <CardBody className="p-12 text-center">
                <Building2 className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
                  아직 워크스페이스가 없습니다
                </h3>
                <p className="text-surface-500 mb-6">
                  워크스페이스를 만들어 팀원들과 미팅을 공유하세요
                </p>
                <Button
                  leftIcon={<Plus className="w-5 h-5" />}
                  onClick={() => setShowCreateModal(true)}
                >
                  워크스페이스 만들기
                </Button>
              </CardBody>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <Link key={workspace.id} href={`/workspaces/${workspace.id}`}>
                  <Card hover className="h-full">
                    <CardBody className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        {workspace.owner.id === session?.user?.id && (
                          <span className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-1 rounded-full">
                            소유자
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-lg text-surface-900 dark:text-white mb-1">
                        {workspace.name}
                      </h3>
                      {workspace.description && (
                        <p className="text-sm text-surface-500 mb-4 line-clamp-2">
                          {workspace.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-700">
                        <div className="flex items-center gap-4 text-sm text-surface-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {workspace.members.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            {workspace._count.meetings}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-surface-400" />
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="새 워크스페이스"
      >
        <div className="space-y-4">
          <Input
            label="워크스페이스 이름"
            placeholder="예: 마케팅 팀"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              설명 (선택)
            </label>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="워크스페이스에 대한 설명을 입력하세요"
              value={newWorkspaceDescription}
              onChange={(e) => setNewWorkspaceDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCreateModal(false)}
            >
              취소
            </Button>
            <Button className="flex-1" onClick={createWorkspace} isLoading={isCreating}>
              만들기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


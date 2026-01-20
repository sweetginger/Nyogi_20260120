'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Play,
  Square,
  Mic,
  MicOff,
  Share2,
  Settings,
  FileText,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'

interface Speaker {
  id: string
  name: string
  language: string
  order: number
}

interface Transcript {
  id: string
  originalText: string
  translatedText: string
  originalLang: string
  translatedLang: string
  startTime: number
  speaker: Speaker | null
}

interface MeetingSummary {
  id: string
  summaryA: string
  decisionsA: string
  actionItemsA: string
  summaryB: string
  decisionsB: string
  actionItemsB: string
}

interface Meeting {
  id: string
  title: string
  description: string | null
  status: string
  meetingType: string
  meetingLink: string | null
  languageA: string
  languageB: string
  startedAt: string | null
  endedAt: string | null
  duration: number
  shareType: string
  shareLink: string
  speakers: Speaker[]
  transcripts: Transcript[]
  summary: MeetingSummary | null
}

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { status: authStatus } = useSession()

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const transcriptsEndRef = useRef<HTMLDivElement>(null)

  const langNames: Record<string, string> = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
  }

  const fetchMeeting = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetings/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setMeeting(data.meeting)
        setIsOwner(data.isOwner)
        setIsRecording(data.meeting.status === 'in-progress')
      } else if (res.status === 404) {
        router.push('/meetings')
      }
    } catch (error) {
      console.error('미팅 로딩 오류:', error)
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
      fetchMeeting()
    }
  }, [authStatus, fetchMeeting, router])

  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [meeting?.transcripts])

  const startMeeting = async () => {
    try {
      const res = await fetch(`/api/meetings/${params.id}/start`, {
        method: 'POST',
      })

      if (res.ok) {
        setIsRecording(true)
        setIsMicOn(true)
        fetchMeeting()
      } else {
        const error = await res.json()
        alert(error.error)
      }
    } catch {
      alert('미팅 시작 중 오류가 발생했습니다.')
    }
  }

  const endMeeting = async () => {
    try {
      const res = await fetch(`/api/meetings/${params.id}/end`, {
        method: 'POST',
      })

      if (res.ok) {
        setIsRecording(false)
        setIsMicOn(false)
        fetchMeeting()
      }
    } catch {
      alert('미팅 종료 중 오류가 발생했습니다.')
    }
  }

  const generateSummary = async () => {
    setIsGeneratingSummary(true)
    try {
      const res = await fetch(`/api/meetings/${params.id}/summary`, {
        method: 'POST',
      })

      if (res.ok) {
        fetchMeeting()
        setShowSummaryModal(true)
      } else {
        const error = await res.json()
        alert(error.error)
      }
    } catch {
      alert('요약 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const copyShareLink = () => {
    if (meeting?.shareLink) {
      navigator.clipboard.writeText(`${window.location.origin}/shared/${meeting.shareLink}`)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

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

  if (!meeting) {
    return (
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <div className="pt-24 px-4 flex items-center justify-center">
          <div className="text-surface-500">미팅을 찾을 수 없습니다.</div>
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
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/meetings')}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-surface-500" />
              </button>
              <div>
                <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
                  {meeting.title}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                  <span>
                    {langNames[meeting.languageA]} ↔ {langNames[meeting.languageB]}
                  </span>
                  <span>•</span>
                  <span>
                    {meeting.startedAt
                      ? format(new Date(meeting.startedAt), 'yyyy년 M월 d일 HH:mm', {
                          locale: ko,
                        })
                      : format(new Date(meeting.startedAt || Date.now()), 'yyyy년 M월 d일', {
                          locale: ko,
                        })}
                  </span>
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Share2 className="w-4 h-4" />}
                  onClick={() => setShowShareModal(true)}
                >
                  공유
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Settings className="w-4 h-4" />}
                  onClick={() => router.push(`/meetings/${meeting.id}/settings`)}
                >
                  설정
                </Button>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Control Panel */}
              {isOwner && meeting.status !== 'completed' && (
                <Card>
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {isRecording ? (
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-red-600 font-medium">녹음 중</span>
                          </div>
                        ) : (
                          <span className="text-surface-500">대기 중</span>
                        )}
                        {meeting.startedAt && (
                          <div className="flex items-center gap-1.5 text-surface-600">
                            <Clock className="w-4 h-4" />
                            <span className="font-mono">
                              {formatDuration(
                                isRecording
                                  ? Math.floor(
                                      (Date.now() - new Date(meeting.startedAt).getTime()) / 1000
                                    )
                                  : meeting.duration
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={isMicOn ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setIsMicOn(!isMicOn)}
                          disabled={!isRecording}
                        >
                          {isMicOn ? (
                            <Mic className="w-5 h-5" />
                          ) : (
                            <MicOff className="w-5 h-5" />
                          )}
                        </Button>

                        {!isRecording ? (
                          <Button onClick={startMeeting} leftIcon={<Play className="w-5 h-5" />}>
                            미팅 시작
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            onClick={endMeeting}
                            leftIcon={<Square className="w-5 h-5" />}
                          >
                            미팅 종료
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Speaker Selection */}
                    {isRecording && (
                      <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                        <p className="text-sm text-surface-500 mb-2">현재 발화자 선택:</p>
                        <div className="flex gap-2">
                          {meeting.speakers.map((speaker) => (
                            <button
                              key={speaker.id}
                              onClick={() => setCurrentSpeaker(speaker.id)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                currentSpeaker === speaker.id
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                              }`}
                            >
                              {speaker.name} ({langNames[speaker.language]})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}

              {/* Transcripts */}
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-surface-900 dark:text-white">
                    미팅 기록
                  </h2>
                </CardHeader>
                <CardBody className="p-6">
                  {meeting.transcripts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                      <p className="text-surface-500">
                        {meeting.status === 'scheduled'
                          ? '미팅을 시작하면 실시간 기록이 표시됩니다.'
                          : '기록된 내용이 없습니다.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {meeting.transcripts.map((transcript) => (
                        <div
                          key={transcript.id}
                          className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                transcript.speaker?.order === 1
                                  ? 'bg-blue-500'
                                  : 'bg-green-500'
                              }`}
                            >
                              {transcript.speaker?.name?.charAt(0) || '?'}
                            </span>
                            <span className="font-medium text-surface-900 dark:text-white">
                              {transcript.speaker?.name || '알 수 없음'}
                            </span>
                            <span
                              className={`lang-badge ${
                                transcript.originalLang === 'ko'
                                  ? 'lang-badge-ko'
                                  : 'lang-badge-en'
                              }`}
                            >
                              {transcript.originalLang.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-surface-900 dark:text-white mb-2">
                            {transcript.originalText}
                          </p>
                          <p className="text-surface-500 text-sm italic">
                            {transcript.translatedText}
                          </p>
                        </div>
                      ))}
                      <div ref={transcriptsEndRef} />
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Meeting Info */}
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-surface-900 dark:text-white">
                    미팅 정보
                  </h2>
                </CardHeader>
                <CardBody className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-surface-500 mb-1">상태</p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
                  </div>

                  {meeting.duration > 0 && (
                    <div>
                      <p className="text-sm text-surface-500 mb-1">미팅 시간</p>
                      <p className="font-medium text-surface-900 dark:text-white">
                        {formatDuration(meeting.duration)}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-surface-500 mb-1">화자</p>
                    <div className="space-y-2">
                      {meeting.speakers.map((speaker) => (
                        <div
                          key={speaker.id}
                          className="flex items-center gap-2 text-surface-900 dark:text-white"
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                              speaker.order === 1 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                          >
                            {speaker.order}
                          </span>
                          <span>{speaker.name}</span>
                          <span className="text-surface-500 text-sm">
                            ({langNames[speaker.language]})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* AI Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-surface-900 dark:text-white">
                      AI 요약
                    </h2>
                    {meeting.summary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSummaryModal(true)}
                      >
                        자세히 보기
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardBody className="p-6">
                  {meeting.summary ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-surface-500 mb-1">핵심 요약</p>
                        <p className="text-surface-900 dark:text-white text-sm line-clamp-3">
                          {meeting.summary.summaryA}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowSummaryModal(true)}
                      >
                        전체 요약 보기
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="w-10 h-10 text-surface-300 mx-auto mb-3" />
                      <p className="text-surface-500 text-sm mb-4">
                        {meeting.status === 'completed'
                          ? 'AI 요약을 생성하세요'
                          : '미팅 종료 후 요약을 생성할 수 있습니다'}
                      </p>
                      {meeting.status === 'completed' && isOwner && (
                        <Button
                          size="sm"
                          onClick={generateSummary}
                          isLoading={isGeneratingSummary}
                        >
                          요약 생성
                        </Button>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="미팅 공유">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-surface-500 mb-2">공유 링크</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${meeting.shareLink}`}
                className="input flex-1 text-sm"
              />
              <Button onClick={copyShareLink} variant="secondary">
                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-surface-500 mb-2">공유 권한</p>
            <select
              value={meeting.shareType}
              onChange={async (e) => {
                const res = await fetch(`/api/meetings/${meeting.id}/share`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ shareType: e.target.value }),
                })
                if (res.ok) {
                  fetchMeeting()
                }
              }}
              className="input"
            >
              <option value="private">비공개 (본인만)</option>
              <option value="public">공개 (링크가 있으면 누구나)</option>
              <option value="whitelist">지정 이메일만</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Summary Modal */}
      <Modal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title="AI 요약"
        size="lg"
      >
        {meeting.summary ? (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Language A Summary */}
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-white mb-4">
                  {langNames[meeting.languageA]}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-surface-500 mb-2">핵심 논의</p>
                    <p className="text-surface-700 dark:text-surface-300 text-sm whitespace-pre-line">
                      {meeting.summary.summaryA}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-500 mb-2">결정 사항</p>
                    <p className="text-surface-700 dark:text-surface-300 text-sm whitespace-pre-line">
                      {meeting.summary.decisionsA}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-500 mb-2">액션 아이템</p>
                    <p className="text-surface-700 dark:text-surface-300 text-sm whitespace-pre-line">
                      {meeting.summary.actionItemsA}
                    </p>
                  </div>
                </div>
              </div>

              {/* Language B Summary */}
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-white mb-4">
                  {langNames[meeting.languageB]}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-surface-500 mb-2">Summary</p>
                    <p className="text-surface-700 dark:text-surface-300 text-sm whitespace-pre-line">
                      {meeting.summary.summaryB}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-500 mb-2">Decisions</p>
                    <p className="text-surface-700 dark:text-surface-300 text-sm whitespace-pre-line">
                      {meeting.summary.decisionsB}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-500 mb-2">Action Items</p>
                    <p className="text-surface-700 dark:text-surface-300 text-sm whitespace-pre-line">
                      {meeting.summary.actionItemsB}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-surface-500">요약을 생성하고 있습니다...</p>
          </div>
        )}
      </Modal>
    </div>
  )
}


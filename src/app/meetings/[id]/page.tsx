'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Square,
  Mic,
  MicOff,
  Share2,
  FileText,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  LayoutGrid,
  List,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { LiveTranscript, SplitTranscriptView } from '@/components/meeting/LiveTranscript'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { translateText, getLanguageName, getLanguageFlag } from '@/lib/translate'

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

interface TranscriptEntry {
  id: string
  speakerId: string
  speakerName: string
  speakerLanguage: string
  originalText: string
  translatedText: string
  translatedLanguage?: string
  timestamp: number
  isFinal: boolean
}

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { status: authStatus } = useSession()

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'split'>('list')
  const [showTranslation, setShowTranslation] = useState(true)

  // 실시간 자막 상태
  const [liveTranscripts, setLiveTranscripts] = useState<TranscriptEntry[]>([])
  const [interimTranscript, setInterimTranscript] = useState<{
    speakerId: string
    speakerName: string
    speakerLanguage: string
    originalText: string
    translatedText: string
  } | null>(null)

  const meetingStartTime = useRef<number>(0)
  const transcriptIdCounter = useRef(0)
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking')

  // 현재 화자와 미팅 정보를 ref로 저장 (콜백에서 최신 값 참조)
  const currentSpeakerRef = useRef(currentSpeaker)
  const meetingRef = useRef(meeting)
  
  useEffect(() => {
    currentSpeakerRef.current = currentSpeaker
  }, [currentSpeaker])
  
  useEffect(() => {
    meetingRef.current = meeting
  }, [meeting])

  // 음성 인식 훅
  const {
    isListening,
    isSupported,
    interimTranscript: speechInterim,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    language: currentSpeaker?.language || 'ko',
    continuous: true,
    interimResults: true,
    onResult: async (result) => {
      const speaker = currentSpeakerRef.current
      const mtg = meetingRef.current
      
      console.log('[Meeting] onResult called:', result, 'speaker:', speaker?.name)
      
      if (!speaker || !mtg) {
        console.log('[Meeting] No speaker or meeting, skipping')
        return
      }

      if (result.isFinal && result.transcript.trim()) {
        const targetLang = speaker.language === mtg.languageA 
          ? mtg.languageB 
          : mtg.languageA

        console.log('[Meeting] Processing final transcript:', result.transcript)

        // 번역 수행
        const translated = await translateText(
          result.transcript,
          speaker.language,
          targetLang
        )

        const newEntry: TranscriptEntry = {
          id: `transcript-${transcriptIdCounter.current++}`,
          speakerId: speaker.id,
          speakerName: speaker.name,
          speakerLanguage: speaker.language,
          originalText: result.transcript,
          translatedText: translated.translatedText,
          translatedLanguage: targetLang,
          timestamp: Date.now(),
          isFinal: true,
        }

        console.log('[Meeting] Adding transcript:', newEntry)
        setLiveTranscripts((prev) => [...prev, newEntry])
        setInterimTranscript(null)

        // 서버에 저장
        saveTranscript(newEntry)
      }
    },
    onError: (error) => {
      console.error('Speech recognition error:', error)
    },
  })

  // 중간 결과 번역 및 표시
  useEffect(() => {
    if (speechInterim && currentSpeaker && meeting) {
      const updateInterim = async () => {
        const targetLang = currentSpeaker.language === meeting.languageA 
          ? meeting.languageB 
          : meeting.languageA

        const translated = await translateText(
          speechInterim,
          currentSpeaker.language,
          targetLang
        )

        setInterimTranscript({
          speakerId: currentSpeaker.id,
          speakerName: currentSpeaker.name,
          speakerLanguage: currentSpeaker.language,
          originalText: speechInterim,
          translatedText: translated.translatedText,
        })
      }

      updateInterim()
    } else {
      setInterimTranscript(null)
    }
  }, [speechInterim, currentSpeaker, meeting])

  const fetchMeeting = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetings/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setMeeting(data.meeting)
        setIsOwner(data.isOwner)
        setIsRecording(data.meeting.status === 'in-progress')
        
        // 기본 화자 설정
        if (data.meeting.speakers.length > 0 && !currentSpeaker) {
          setCurrentSpeaker(data.meeting.speakers[0])
        }

        // 기존 트랜스크립트 변환
        // startTime은 미팅 시작부터의 경과 시간(ms)이므로, 미팅 시작 시간을 더해 절대 시간으로 변환
        const meetingStartedAt = data.meeting.startedAt 
          ? new Date(data.meeting.startedAt).getTime() 
          : Date.now()
        
        const existingTranscripts: TranscriptEntry[] = data.meeting.transcripts.map(
          (t: Transcript) => ({
            id: t.id,
            speakerId: t.speaker?.id || '',
            speakerName: t.speaker?.name || '알 수 없음',
            speakerLanguage: t.originalLang,
            originalText: t.originalText,
            translatedText: t.translatedText,
            translatedLanguage: t.translatedLang,
            timestamp: meetingStartedAt + t.startTime, // 절대 시간으로 변환
            isFinal: true,
          })
        )
        setLiveTranscripts(existingTranscripts)
      } else if (res.status === 404) {
        router.push('/meetings')
      }
    } catch (error) {
      console.error('미팅 로딩 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }, [params.id, router, currentSpeaker])

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (authStatus === 'authenticated') {
      fetchMeeting()
    }
  }, [authStatus, fetchMeeting, router])

  // 마이크 권한 확인
  const checkMicPermission = useCallback(async () => {
    try {
      // navigator.permissions API 사용 (지원되는 경우)
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setMicPermission(result.state as 'granted' | 'denied' | 'prompt')
        
        // 권한 상태 변경 감지
        result.onchange = () => {
          setMicPermission(result.state as 'granted' | 'denied' | 'prompt')
        }
      } else {
        setMicPermission('prompt')
      }
    } catch {
      // permissions API가 지원되지 않으면 prompt 상태로 가정
      setMicPermission('prompt')
    }
  }, [])

  // 마이크 권한 요청
  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // 권한 획득 후 스트림 정리
      stream.getTracks().forEach(track => track.stop())
      setMicPermission('granted')
      return true
    } catch (error) {
      console.error('마이크 권한 요청 실패:', error)
      setMicPermission('denied')
      return false
    }
  }, [])

  // 컴포넌트 마운트 시 마이크 권한 확인
  useEffect(() => {
    checkMicPermission()
  }, [checkMicPermission])

  // 트랜스크립트 서버 저장
  const saveTranscript = async (entry: TranscriptEntry) => {
    try {
      await fetch(`/api/meetings/${params.id}/transcripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speakerId: entry.speakerId,
          originalText: entry.originalText,
          translatedText: entry.translatedText, // 번역된 텍스트 추가
          originalLang: entry.speakerLanguage,
          translatedLang: entry.translatedLanguage, // 번역 언어 추가
          startTime: entry.timestamp - meetingStartTime.current,
          endTime: entry.timestamp - meetingStartTime.current + 1000,
        }),
      })
    } catch (error) {
      console.error('트랜스크립트 저장 오류:', error)
    }
  }

  const startMeeting = async () => {
    if (!isSupported) {
      alert('이 브라우저에서는 음성 인식이 지원되지 않습니다. Chrome 브라우저를 사용해주세요.')
      return
    }

    // 마이크 권한 확인 및 요청
    if (micPermission !== 'granted') {
      const granted = await requestMicPermission()
      if (!granted) {
        alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
        return
      }
    }

    try {
      const res = await fetch(`/api/meetings/${params.id}/start`, {
        method: 'POST',
      })

      if (res.ok) {
        setIsRecording(true)
        meetingStartTime.current = Date.now()
        startListening()
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
    stopListening()
    
    try {
      const res = await fetch(`/api/meetings/${params.id}/end`, {
        method: 'POST',
      })

      if (res.ok) {
        setIsRecording(false)
        resetTranscript()
        fetchMeeting()
      }
    } catch {
      alert('미팅 종료 중 오류가 발생했습니다.')
    }
  }

  // 마이크 일시정지/재개 (미팅 중에만)
  const pauseMic = () => {
    stopListening()
  }

  const resumeMic = () => {
    startListening()
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

  // 실시간 타이머
  const [elapsedTime, setElapsedTime] = useState(0)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRecording && meeting?.startedAt) {
      interval = setInterval(() => {
        setElapsedTime(
          Math.floor((Date.now() - new Date(meeting.startedAt!).getTime()) / 1000)
        )
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording, meeting?.startedAt])

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

      <main className="pt-20 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/meetings')}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-surface-500" />
              </button>
              <div>
                <h1 className="text-xl font-display font-bold text-surface-900 dark:text-white">
                  {meeting.title}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                  <span>
                    {getLanguageFlag(meeting.languageA)} {getLanguageName(meeting.languageA)} ↔{' '}
                    {getLanguageFlag(meeting.languageB)} {getLanguageName(meeting.languageB)}
                  </span>
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranslation(!showTranslation)}
                  leftIcon={showTranslation ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                >
                  {showTranslation ? '번역 표시' : '번역 숨김'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'list' ? 'split' : 'list')}
                  leftIcon={viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                >
                  {viewMode === 'list' ? '분할 뷰' : '리스트 뷰'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Share2 className="w-4 h-4" />}
                  onClick={() => setShowShareModal(true)}
                >
                  공유
                </Button>
              </div>
            )}
          </div>

          {/* 마이크 권한 안내 */}
          {isOwner && micPermission === 'denied' && meeting.status !== 'completed' && (
            <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <MicOff className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">마이크 권한이 필요합니다</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    음성 인식을 사용하려면 브라우저에서 마이크 권한을 허용해주세요.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={requestMicPermission}
                      leftIcon={<Mic className="w-4 h-4" />}
                    >
                      마이크 권한 허용
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.location.reload()}
                    >
                      페이지 새로고침
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Control Panel */}
          {isOwner && (
            <Card className="mb-4">
              <CardBody className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* 상태 및 타이머 */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      {isRecording ? (
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                          <span className="text-red-600 font-medium">녹음 중</span>
                        </div>
                      ) : meeting.status === 'completed' ? (
                        <span className="text-green-600 font-medium">완료됨</span>
                      ) : (
                        <span className="text-surface-500">대기 중</span>
                      )}
                    </div>

                    {(isRecording || meeting.status === 'completed') && (
                      <div className="flex items-center gap-2 text-surface-600 font-mono text-lg">
                        <Clock className="w-5 h-5" />
                        <span>
                          {formatDuration(isRecording ? elapsedTime : meeting.duration)}
                        </span>
                      </div>
                    )}

                    {isListening && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Mic className="w-4 h-4 animate-pulse" />
                        <span className="text-sm">마이크 활성</span>
                      </div>
                    )}

                    {isRecording && !isListening && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <MicOff className="w-4 h-4" />
                        <span className="text-sm">마이크 일시정지</span>
                      </div>
                    )}
                  </div>

                  {/* 화자 선택 */}
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-surface-500 mr-2">화자:</span>
                      {meeting.speakers.map((speaker) => (
                        <button
                          key={speaker.id}
                          onClick={() => setCurrentSpeaker(speaker)}
                          className={`
                            px-4 py-2 rounded-xl text-sm font-medium transition-all
                            ${currentSpeaker?.id === speaker.id
                              ? speaker.language === meeting.languageA
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                : 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                              : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200'
                            }
                          `}
                        >
                          {getLanguageFlag(speaker.language)} {speaker.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 컨트롤 버튼 */}
                  <div className="flex items-center gap-2">
                    {meeting.status !== 'completed' && (
                      !isRecording ? (
                        <Button
                          onClick={startMeeting}
                          leftIcon={<Mic className="w-5 h-5" />}
                          className="shadow-lg bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600"
                        >
                          미팅 시작
                        </Button>
                      ) : (
                        <>
                          {/* 마이크 일시정지/재개 버튼 */}
                          {isListening ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={pauseMic}
                              leftIcon={<MicOff className="w-5 h-5" />}
                            >
                              일시정지
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={resumeMic}
                              leftIcon={<Mic className="w-5 h-5" />}
                            >
                              재개
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            onClick={endMeeting}
                            leftIcon={<Square className="w-5 h-5" />}
                          >
                            미팅 종료
                          </Button>
                        </>
                      )
                    )}

                    {meeting.status === 'completed' && !meeting.summary && (
                      <Button
                        onClick={generateSummary}
                        isLoading={isGeneratingSummary}
                        leftIcon={<FileText className="w-5 h-5" />}
                      >
                        AI 요약 생성
                      </Button>
                    )}

                    {meeting.summary && (
                      <Button
                        variant="secondary"
                        onClick={() => setShowSummaryModal(true)}
                        leftIcon={<FileText className="w-5 h-5" />}
                      >
                        요약 보기
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* 실시간 자막 영역 */}
          <Card className="h-[calc(100vh-280px)] min-h-[400px]">
            <CardBody className="p-0 h-full">
              {viewMode === 'list' ? (
                <LiveTranscript
                  transcripts={liveTranscripts}
                  interimTranscript={interimTranscript}
                  languageA={meeting.languageA}
                  languageB={meeting.languageB}
                  showTranslation={showTranslation}
                />
              ) : (
                <div className="h-full p-4">
                  <SplitTranscriptView
                    transcripts={liveTranscripts}
                    interimTranscript={interimTranscript}
                    languageA={meeting.languageA}
                    languageB={meeting.languageB}
                    speakerA={meeting.speakers[0] || { id: '', name: '화자 1' }}
                    speakerB={meeting.speakers[1] || { id: '', name: '화자 2' }}
                  />
                </div>
              )}
            </CardBody>
          </Card>
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
        size="xl"
      >
        {meeting.summary ? (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Language A Summary */}
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  {getLanguageFlag(meeting.languageA)} {getLanguageName(meeting.languageA)}
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
                <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  {getLanguageFlag(meeting.languageB)} {getLanguageName(meeting.languageB)}
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

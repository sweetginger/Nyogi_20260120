'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Users,
  Video,
  Monitor,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Sparkles,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody } from '@/components/ui/Card'

const LANGUAGES = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'ar', label: 'العربية' },
]

interface Context {
  term: string
  meaning: string
}

export default function NewMeetingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [meetingType, setMeetingType] = useState<string>(
    searchParams.get('type') || 'in-person'
  )
  const [meetingLink, setMeetingLink] = useState('')
  const [languageA, setLanguageA] = useState('ko')
  const [languageB, setLanguageB] = useState('en')
  const [contexts, setContexts] = useState<Context[]>([])
  const [newTerm, setNewTerm] = useState('')
  const [newMeaning, setNewMeaning] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const meetingTypes = [
    {
      id: 'in-person',
      name: '대면 미팅',
      description: '오프라인에서 직접 만나 진행',
      icon: Users,
      color: 'blue',
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Zoom 미팅 링크 연결',
      icon: Video,
      color: 'blue',
    },
    {
      id: 'google-meet',
      name: 'Google Meet',
      description: 'Google Meet 링크 연결',
      icon: Monitor,
      color: 'green',
    },
  ]

  const addContext = () => {
    if (newTerm.trim()) {
      setContexts([...contexts, { term: newTerm.trim(), meaning: newMeaning.trim() }])
      setNewTerm('')
      setNewMeaning('')
    }
  }

  const removeContext = (index: number) => {
    setContexts(contexts.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('미팅 제목을 입력해주세요.')
      return
    }

    if (meetingType !== 'in-person' && !meetingLink.trim()) {
      alert('미팅 링크를 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          meetingType,
          meetingLink: meetingType !== 'in-person' ? meetingLink : null,
          languageA,
          languageB,
          contexts,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/meetings/${data.meeting.id}`)
      } else {
        const error = await res.json()
        alert(error.error || '미팅 생성에 실패했습니다.')
      }
    } catch {
      alert('미팅 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
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
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
                단계 {step} / 3
              </span>
              <span className="text-sm text-surface-500">
                {step === 1 ? '미팅 타입' : step === 2 ? '언어 설정' : '추가 설정'}
              </span>
            </div>
            <div className="h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Meeting Type */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-900 dark:text-white mb-2">
                  미팅 타입을 선택하세요
                </h1>
                <p className="text-surface-600 dark:text-surface-400">
                  어떤 방식으로 미팅을 진행하시나요?
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {meetingTypes.map((type) => (
                  <Card
                    key={type.id}
                    hover
                    onClick={() => setMeetingType(type.id)}
                    className={`cursor-pointer transition-all ${
                      meetingType === type.id
                        ? 'ring-2 ring-primary-500 border-primary-500'
                        : ''
                    }`}
                  >
                    <CardBody className="p-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            type.color === 'blue'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          }`}
                        >
                          <type.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-surface-900 dark:text-white">
                            {type.name}
                          </h3>
                          <p className="text-sm text-surface-500">{type.description}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            meetingType === type.id
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-surface-300 dark:border-surface-600'
                          }`}
                        >
                          {meetingType === type.id && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {meetingType !== 'in-person' && (
                <div className="mb-8 animate-fade-in">
                  <Input
                    label={`${meetingType === 'zoom' ? 'Zoom' : 'Google Meet'} 링크`}
                    placeholder={
                      meetingType === 'zoom'
                        ? 'https://zoom.us/j/...'
                        : 'https://meet.google.com/...'
                    }
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                다음
              </Button>
            </div>
          )}

          {/* Step 2: Language Settings */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-900 dark:text-white mb-2">
                  언어를 설정하세요
                </h1>
                <p className="text-surface-600 dark:text-surface-400">
                  미팅에서 사용할 두 가지 언어를 선택하세요
                </p>
              </div>

              <Card className="mb-8">
                <CardBody className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="화자 A 언어"
                      options={LANGUAGES}
                      value={languageA}
                      onChange={(e) => setLanguageA(e.target.value)}
                    />
                    <Select
                      label="화자 B 언어"
                      options={LANGUAGES}
                      value={languageB}
                      onChange={(e) => setLanguageB(e.target.value)}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-600 dark:text-surface-400">번역 방향</span>
                      <span className="font-medium text-surface-900 dark:text-white">
                        {LANGUAGES.find((l) => l.value === languageA)?.label} ↔{' '}
                        {LANGUAGES.find((l) => l.value === languageB)?.label}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                >
                  이전
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  다음
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Settings */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-900 dark:text-white mb-2">
                  미팅 정보를 입력하세요
                </h1>
                <p className="text-surface-600 dark:text-surface-400">
                  미팅 제목과 전문 용어를 등록하세요 (선택)
                </p>
              </div>

              <Card className="mb-6">
                <CardBody className="p-6 space-y-4">
                  <Input
                    label="미팅 제목"
                    placeholder="예: 파트너십 논의 미팅"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                      미팅 설명 (선택)
                    </label>
                    <textarea
                      className="input min-h-[100px] resize-none"
                      placeholder="미팅에 대한 간단한 설명을 입력하세요"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Context Terms */}
              <Card className="mb-8">
                <CardBody className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-accent-500" />
                    <h3 className="font-semibold text-surface-900 dark:text-white">
                      전문 용어 등록
                    </h3>
                  </div>
                  <p className="text-sm text-surface-500 mb-4">
                    자주 사용되는 전문 용어를 등록하면 번역 정확도가 높아집니다.
                  </p>

                  {contexts.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {contexts.map((ctx, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800"
                        >
                          <div>
                            <span className="font-medium text-surface-900 dark:text-white">
                              {ctx.term}
                            </span>
                            {ctx.meaning && (
                              <span className="text-surface-500 ml-2">- {ctx.meaning}</span>
                            )}
                          </div>
                          <button
                            onClick={() => removeContext(i)}
                            className="p-1 hover:bg-surface-200 dark:hover:bg-surface-700 rounded"
                          >
                            <X className="w-4 h-4 text-surface-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      placeholder="용어 (예: API)"
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="설명 (선택)"
                      value={newMeaning}
                      onChange={(e) => setNewMeaning(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="secondary" onClick={addContext}>
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setStep(2)}
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                >
                  이전
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  rightIcon={<Sparkles className="w-5 h-5" />}
                >
                  미팅 생성
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


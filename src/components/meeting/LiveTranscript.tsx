'use client'

import { useEffect, useRef } from 'react'
import { getLanguageFlag, getLanguageName } from '@/lib/translate'

interface TranscriptEntry {
  id: string
  speakerId: string
  speakerName: string
  speakerLanguage: string
  originalText: string
  translatedText: string
  translatedLanguage?: string // 번역 대상 언어
  timestamp: number
  isFinal: boolean
}

interface LiveTranscriptProps {
  transcripts: TranscriptEntry[]
  interimTranscript?: {
    speakerId: string
    speakerName: string
    speakerLanguage: string
    originalText: string
    translatedText: string
  } | null
  languageA: string
  languageB: string
  showTranslation?: boolean
}

export function LiveTranscript({
  transcripts,
  interimTranscript,
  languageA,
  languageB,
  showTranslation = true,
}: LiveTranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 자동 스크롤
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [transcripts, interimTranscript])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getSpeakerColor = (speakerLanguage: string) => {
    return speakerLanguage === languageA ? 'blue' : 'green'
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto space-y-4 p-4 scroll-smooth"
    >
      {transcripts.length === 0 && !interimTranscript && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
            <span className="text-3xl">🎤</span>
          </div>
          <p className="text-surface-500 text-lg mb-2">음성 대기 중...</p>
          <p className="text-surface-400 text-sm">
            마이크에 대고 말씀해주세요
          </p>
        </div>
      )}

      {transcripts.map((entry) => (
        <TranscriptBubble
          key={entry.id}
          entry={entry}
          showTranslation={showTranslation}
          formatTime={formatTime}
          getSpeakerColor={getSpeakerColor}
          languageA={languageA}
          languageB={languageB}
        />
      ))}

      {/* 현재 인식 중인 텍스트 (interim) */}
      {interimTranscript && interimTranscript.originalText && (
        <div className="animate-pulse">
          <TranscriptBubble
            entry={{
              id: 'interim',
              ...interimTranscript,
              timestamp: Date.now(),
              isFinal: false,
            }}
            showTranslation={showTranslation}
            formatTime={formatTime}
            getSpeakerColor={getSpeakerColor}
            languageA={languageA}
            languageB={languageB}
            isInterim
          />
        </div>
      )}
    </div>
  )
}

interface TranscriptBubbleProps {
  entry: TranscriptEntry
  showTranslation: boolean
  formatTime: (timestamp: number) => string
  getSpeakerColor: (speakerLanguage: string) => 'blue' | 'green'
  languageA: string
  languageB: string
  isInterim?: boolean
}

function TranscriptBubble({
  entry,
  showTranslation,
  formatTime,
  getSpeakerColor,
  languageA,
  languageB,
  isInterim = false,
}: TranscriptBubbleProps) {
  const color = getSpeakerColor(entry.speakerLanguage)
  
  // 번역 대상 언어 계산
  const translatedLanguage = entry.translatedLanguage || 
    (entry.speakerLanguage === languageA ? languageB : languageA)
  
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      avatar: 'bg-blue-500',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      avatar: 'bg-green-500',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    },
  }

  const classes = colorClasses[color]

  return (
    <div
      className={`
        rounded-2xl border p-4 transition-all duration-200
        ${classes.bg} ${classes.border}
        ${isInterim ? 'opacity-70' : ''}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${classes.avatar} flex items-center justify-center text-white font-semibold text-sm`}
          >
            {entry.speakerName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-surface-900 dark:text-white">
              {entry.speakerName}
            </p>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${classes.badge}`}>
              {getLanguageFlag(entry.speakerLanguage)}
              <span>{getLanguageName(entry.speakerLanguage)}</span>
            </span>
          </div>
        </div>
        <span className="text-xs text-surface-400">
          {formatTime(entry.timestamp)}
        </span>
      </div>

      {/* 원문 */}
      <div className="mb-2">
        <p className="text-lg text-surface-900 dark:text-white leading-relaxed">
          {entry.originalText}
          {isInterim && (
            <span className="inline-block w-1 h-5 bg-primary-500 ml-1 animate-pulse" />
          )}
        </p>
      </div>

      {/* 번역문 */}
      {showTranslation && entry.translatedText && (
        <div className="pt-3 border-t border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-surface-400">
              {getLanguageFlag(translatedLanguage)} {getLanguageName(translatedLanguage)}
            </span>
          </div>
          <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
            {entry.translatedText}
          </p>
        </div>
      )}
    </div>
  )
}

// 큰 화면용 분할 뷰
interface SplitTranscriptViewProps {
  transcripts: TranscriptEntry[]
  interimTranscript?: {
    speakerId: string
    speakerName: string
    speakerLanguage: string
    originalText: string
    translatedText: string
  } | null
  languageA: string
  languageB: string
  speakerA: { id: string; name: string }
  speakerB: { id: string; name: string }
}

export function SplitTranscriptView({
  transcripts,
  interimTranscript,
  languageA,
  languageB,
  speakerA,
  speakerB,
}: SplitTranscriptViewProps) {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  // 자동 스크롤
  useEffect(() => {
    if (leftRef.current) {
      leftRef.current.scrollTop = leftRef.current.scrollHeight
    }
    if (rightRef.current) {
      rightRef.current.scrollTop = rightRef.current.scrollHeight
    }
  }, [transcripts, interimTranscript])

  const speakerATranscripts = transcripts.filter(
    (t) => t.speakerId === speakerA.id
  )
  const speakerBTranscripts = transcripts.filter(
    (t) => t.speakerId === speakerB.id
  )

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* 화자 A */}
      <div className="flex flex-col rounded-2xl border border-blue-200 dark:border-blue-800 overflow-hidden">
        <div className="bg-blue-500 text-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold">
            {speakerA.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{speakerA.name}</p>
            <p className="text-xs text-blue-100">
              {getLanguageFlag(languageA)} {getLanguageName(languageA)}
            </p>
          </div>
        </div>
        <div ref={leftRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-blue-50/50 dark:bg-blue-900/10">
          {speakerATranscripts.map((t) => (
            <div key={t.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-400">{formatTime(t.timestamp)}</span>
              </div>
              <p className="text-surface-900 dark:text-white">{t.originalText}</p>
              <p className="text-sm text-surface-500">{t.translatedText}</p>
            </div>
          ))}
          {interimTranscript?.speakerId === speakerA.id && (
            <div className="space-y-1 opacity-70 animate-pulse">
              <p className="text-surface-900 dark:text-white">
                {interimTranscript.originalText}
                <span className="inline-block w-1 h-4 bg-blue-500 ml-1" />
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 화자 B */}
      <div className="flex flex-col rounded-2xl border border-green-200 dark:border-green-800 overflow-hidden">
        <div className="bg-green-500 text-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold">
            {speakerB.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{speakerB.name}</p>
            <p className="text-xs text-green-100">
              {getLanguageFlag(languageB)} {getLanguageName(languageB)}
            </p>
          </div>
        </div>
        <div ref={rightRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-green-50/50 dark:bg-green-900/10">
          {speakerBTranscripts.map((t) => (
            <div key={t.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-400">{formatTime(t.timestamp)}</span>
              </div>
              <p className="text-surface-900 dark:text-white">{t.originalText}</p>
              <p className="text-sm text-surface-500">{t.translatedText}</p>
            </div>
          ))}
          {interimTranscript?.speakerId === speakerB.id && (
            <div className="space-y-1 opacity-70 animate-pulse">
              <p className="text-surface-900 dark:text-white">
                {interimTranscript.originalText}
                <span className="inline-block w-1 h-4 bg-green-500 ml-1" />
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


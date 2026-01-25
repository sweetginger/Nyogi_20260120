'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface SpeechRecognitionResult {
  transcript: string
  isFinal: boolean
  confidence: number
}

interface UseSpeechRecognitionOptions {
  language: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: string) => void
  onEnd?: () => void
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  isSupported: boolean
  transcript: string
  interimTranscript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

// Web Speech API 타입 정의
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

// 재시작 설정
const RESTART_DELAY_MS = 300 // 재시작 기본 딜레이
const MAX_RESTART_DELAY_MS = 5000 // 최대 딜레이 (백오프)
const MAX_CONSECUTIVE_ERRORS = 5 // 연속 에러 최대 횟수
const RECOGNITION_REFRESH_INTERVAL = 60000 // 1분마다 recognition 객체 갱신

export function useSpeechRecognition({
  language,
  continuous = true,
  interimResults = true,
  onResult,
  onError,
  onEnd,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const shouldBeListeningRef = useRef(false)
  const isRestartingRef = useRef(false)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const consecutiveErrorsRef = useRef(0)
  const lastSuccessTimeRef = useRef(Date.now())
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 콜백 함수들을 ref로 저장
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  const onEndRef = useRef(onEnd)
  const languageRef = useRef(language)
  
  useEffect(() => { onResultRef.current = onResult }, [onResult])
  useEffect(() => { onErrorRef.current = onError }, [onError])
  useEffect(() => { onEndRef.current = onEnd }, [onEnd])
  useEffect(() => { languageRef.current = language }, [language])

  // SpeechRecognition 인스턴스 생성
  const createRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    
    if (!SpeechRecognitionAPI) return null

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.maxAlternatives = 1
    recognition.lang = getLanguageCode(languageRef.current)

    recognition.onstart = () => {
      console.log('[Speech] ✅ Started')
      setIsListening(true)
      isRestartingRef.current = false
      consecutiveErrorsRef.current = 0
    }

    recognition.onaudiostart = () => {
      console.log('[Speech] 🎤 Audio started')
    }

    recognition.onspeechstart = () => {
      console.log('[Speech] 🗣️ Speech detected')
      lastSuccessTimeRef.current = Date.now()
    }

    recognition.onend = () => {
      console.log('[Speech] ⏹️ Ended, shouldListen:', shouldBeListeningRef.current)
      setIsListening(false)
      onEndRef.current?.()
      
      // 사용자가 듣기를 원하고, 재시작 중이 아니면 재시작
      if (shouldBeListeningRef.current && !isRestartingRef.current) {
        scheduleRestart()
      }
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript

        if (result.isFinal) {
          finalTranscript += text
          console.log('[Speech] 📝 Final:', text.substring(0, 50) + (text.length > 50 ? '...' : ''))
          
          // 성공 시 에러 카운터 리셋
          consecutiveErrorsRef.current = 0
          lastSuccessTimeRef.current = Date.now()
          
          onResultRef.current?.({
            transcript: text,
            isFinal: true,
            confidence: result[0].confidence,
          })
        } else {
          interim += text
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript)
        setInterimTranscript('')
      } else {
        setInterimTranscript(interim)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('[Speech] ⚠️ Error:', event.error)
      
      // 복구 가능한 에러 처리
      if (event.error === 'no-speech') {
        // 음성 없음 - 정상적인 상황, 재시작
        if (shouldBeListeningRef.current) {
          scheduleRestart(500)
        }
        return
      }

      if (event.error === 'aborted') {
        // 수동 중단 - 무시
        return
      }

      if (event.error === 'network') {
        // 네트워크 에러 - 잠시 후 재시작
        consecutiveErrorsRef.current++
        if (shouldBeListeningRef.current && consecutiveErrorsRef.current < MAX_CONSECUTIVE_ERRORS) {
          const delay = Math.min(
            RESTART_DELAY_MS * Math.pow(2, consecutiveErrorsRef.current),
            MAX_RESTART_DELAY_MS
          )
          console.log(`[Speech] 🔄 Network error, retrying in ${delay}ms...`)
          scheduleRestart(delay)
        }
        return
      }

      if (event.error === 'audio-capture') {
        // 오디오 캡처 실패 - 마이크 문제
        consecutiveErrorsRef.current++
        if (shouldBeListeningRef.current && consecutiveErrorsRef.current < MAX_CONSECUTIVE_ERRORS) {
          scheduleRestart(1000)
        } else {
          onErrorRef.current?.('마이크 연결을 확인해주세요.')
          shouldBeListeningRef.current = false
        }
        return
      }

      // 기타 에러
      const errorMessage = getErrorMessage(event.error)
      onErrorRef.current?.(errorMessage)
      setIsListening(false)
      shouldBeListeningRef.current = false
    }

    return recognition
  }, [continuous, interimResults])

  // 재시작 스케줄링
  const scheduleRestart = useCallback((delay: number = RESTART_DELAY_MS) => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
    }

    if (!shouldBeListeningRef.current) return

    isRestartingRef.current = true
    console.log(`[Speech] 🔄 Scheduling restart in ${delay}ms...`)

    restartTimeoutRef.current = setTimeout(() => {
      if (!shouldBeListeningRef.current) {
        isRestartingRef.current = false
        return
      }

      const recognition = recognitionRef.current
      if (recognition) {
        try {
          recognition.lang = getLanguageCode(languageRef.current)
          recognition.start()
        } catch (e) {
          console.warn('[Speech] Restart failed:', e)
          // 인스턴스 문제일 수 있으므로 새로 생성
          refreshRecognition()
        }
      } else {
        refreshRecognition()
      }
    }, delay)
  }, [])

  // Recognition 인스턴스 갱신
  const refreshRecognition = useCallback(() => {
    console.log('[Speech] 🔃 Refreshing recognition instance...')
    
    // 기존 인스턴스 정리
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // 무시
      }
    }

    // 새 인스턴스 생성
    recognitionRef.current = createRecognition()
    
    if (recognitionRef.current && shouldBeListeningRef.current) {
      setTimeout(() => {
        try {
          recognitionRef.current?.start()
        } catch (e) {
          console.error('[Speech] Failed to start after refresh:', e)
        }
      }, 100)
    }
  }, [createRecognition])

  // 브라우저 지원 확인 및 초기화
  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    
    setIsSupported(!!SpeechRecognitionAPI)

    if (SpeechRecognitionAPI) {
      recognitionRef.current = createRecognition()
    }

    return () => {
      shouldBeListeningRef.current = false
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // 무시
        }
      }
    }
  }, [createRecognition])

  // 주기적 인스턴스 갱신 (장시간 사용 시 안정성)
  useEffect(() => {
    if (shouldBeListeningRef.current) {
      refreshIntervalRef.current = setInterval(() => {
        const timeSinceLastSuccess = Date.now() - lastSuccessTimeRef.current
        
        // 마지막 성공 후 30초 이상 지났으면 갱신
        if (timeSinceLastSuccess > 30000) {
          console.log('[Speech] ♻️ Periodic refresh due to inactivity')
          refreshRecognition()
        }
      }, RECOGNITION_REFRESH_INTERVAL)
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [refreshRecognition])

  // 언어 변경 시 재시작
  useEffect(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.lang = getLanguageCode(language)
      // 언어 변경을 적용하기 위해 재시작
      try {
        recognitionRef.current.stop()
      } catch {
        // 무시
      }
      // onend에서 자동 재시작됨
    }
  }, [language, isListening])

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.('음성 인식이 지원되지 않는 브라우저입니다.')
      return
    }

    console.log('[Speech] ▶️ Start requested')
    shouldBeListeningRef.current = true
    consecutiveErrorsRef.current = 0
    lastSuccessTimeRef.current = Date.now()

    // 인스턴스가 없으면 생성
    if (!recognitionRef.current) {
      recognitionRef.current = createRecognition()
    }

    const recognition = recognitionRef.current
    if (!recognition) {
      onError?.('음성 인식을 초기화할 수 없습니다.')
      return
    }

    recognition.lang = getLanguageCode(language)
    
    try {
      recognition.start()
    } catch (e) {
      console.warn('[Speech] Start error, recreating:', e)
      // 인스턴스 문제일 수 있으므로 새로 생성
      refreshRecognition()
    }
  }, [isSupported, language, onError, createRecognition, refreshRecognition])

  const stopListening = useCallback(() => {
    console.log('[Speech] ⏸️ Stop requested')
    shouldBeListeningRef.current = false
    isRestartingRef.current = false
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    setInterimTranscript('')
    
    const recognition = recognitionRef.current
    if (recognition) {
      try {
        recognition.stop()
      } catch {
        // 이미 중지된 경우 무시
      }
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  }
}

// 언어 코드 변환
function getLanguageCode(lang: string): string {
  const languageMap: Record<string, string> = {
    ko: 'ko-KR',
    en: 'en-US',
    ja: 'ja-JP',
    zh: 'zh-CN',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    pt: 'pt-BR',
    ru: 'ru-RU',
    ar: 'ar-SA',
  }
  return languageMap[lang] || lang
}

// 에러 메시지 변환
function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'not-allowed': '마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.',
    'no-speech': '음성이 감지되지 않았습니다.',
    'audio-capture': '마이크를 찾을 수 없습니다.',
    'network': '네트워크 오류가 발생했습니다.',
    'aborted': '음성 인식이 중단되었습니다.',
    'language-not-supported': '지원되지 않는 언어입니다.',
    'service-not-allowed': '음성 인식 서비스를 사용할 수 없습니다.',
  }
  return errorMessages[error] || `음성 인식 오류: ${error}`
}

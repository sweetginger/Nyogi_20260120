// 번역 유틸리티
// 서버 API를 통해 OpenAI 번역 수행

interface TranslateResult {
  translatedText: string
  sourceLang: string
  targetLang: string
  mode?: 'openai' | 'mock'
}

// 메인 번역 함수 (서버 API 호출)
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslateResult> {
  // 같은 언어면 그대로 반환
  if (sourceLang === targetLang) {
    return { translatedText: text, sourceLang, targetLang }
  }

  // 빈 텍스트 처리
  if (!text.trim()) {
    return { translatedText: '', sourceLang, targetLang }
  }

  try {
    // 서버 API를 통해 번역 (OpenAI API 키는 서버에서 안전하게 사용)
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLang, targetLang }),
    })

    if (!response.ok) {
      throw new Error('Translation API failed')
    }

    const result = await response.json()
    
    console.log(`[Translate] ${sourceLang} → ${targetLang} (${result.mode}): "${text.substring(0, 20)}..." → "${result.translatedText.substring(0, 20)}..."`)

    return {
      translatedText: result.translatedText,
      sourceLang,
      targetLang,
      mode: result.mode,
    }
  } catch (error) {
    console.error('[Translate] API error, using fallback:', error)
    // API 호출 실패 시 클라이언트 측 Mock 번역
    return mockTranslate(text, sourceLang, targetLang)
  }
}

// 클라이언트 측 Mock 번역 함수 (API 실패 시 폴백)
function mockTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): TranslateResult {
  const mockTranslations = getMockTranslations()
  
  // 정확한 매칭 확인
  const key = `${text.trim().toLowerCase()}|${sourceLang}|${targetLang}`
  if (mockTranslations[key]) {
    return {
      translatedText: mockTranslations[key],
      sourceLang,
      targetLang,
      mode: 'mock',
    }
  }

  // 번역이 없으면 시뮬레이션
  const simulatedTranslation = simulateTranslation(text, sourceLang, targetLang)
  
  return {
    translatedText: simulatedTranslation,
    sourceLang,
    targetLang,
    mode: 'mock',
  }
}

// 번역 시뮬레이션 (개발용 - 실제 API 연동 전까지 사용)
function simulateTranslation(text: string, sourceLang: string, targetLang: string): string {
  // 간단한 규칙 기반 시뮬레이션
  // 실제로는 번역 API를 사용해야 함
  
  const prefix = getLanguageFlag(targetLang)
  const langName = getLanguageName(targetLang)
  
  // 한국어 → 영어 시뮬레이션
  if (sourceLang === 'ko' && targetLang === 'en') {
    return `${prefix} [Translation] ${convertKoreanToEnglishStyle(text)}`
  }
  
  // 영어 → 한국어 시뮬레이션
  if (sourceLang === 'en' && targetLang === 'ko') {
    return `${prefix} [번역] ${text}`
  }
  
  // 기타 언어
  return `${prefix} [${langName}] ${text}`
}

// 한국어를 영어 스타일로 변환 (시뮬레이션)
function convertKoreanToEnglishStyle(text: string): string {
  // 일부 단어 변환 (시뮬레이션용)
  const simpleReplacements: Record<string, string> = {
    '안녕': 'Hello',
    '네': 'Yes',
    '아니': 'No',
    '감사': 'Thank',
    '좋': 'Good',
    '나쁘': 'Bad',
    '미팅': 'meeting',
    '회의': 'meeting',
    '질문': 'question',
    '답변': 'answer',
    '프로젝트': 'project',
    '일정': 'schedule',
    '진행': 'progress',
    '완료': 'complete',
    '시작': 'start',
    '종료': 'end',
    '오늘': 'today',
    '내일': 'tomorrow',
    '어제': 'yesterday',
  }
  
  let result = text
  for (const [ko, en] of Object.entries(simpleReplacements)) {
    result = result.replace(new RegExp(ko, 'g'), en)
  }
  
  return result
}

// 실시간 번역을 위한 디바운스된 번역
let translateTimeout: NodeJS.Timeout | null = null

export function translateTextDebounced(
  text: string,
  sourceLang: string,
  targetLang: string,
  callback: (result: TranslateResult) => void,
  delay: number = 300
): void {
  if (translateTimeout) {
    clearTimeout(translateTimeout)
  }

  translateTimeout = setTimeout(async () => {
    const result = await translateText(text, sourceLang, targetLang)
    callback(result)
  }, delay)
}

// 언어 이름 가져오기
export function getLanguageName(lang: string): string {
  const names: Record<string, string> = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    pt: 'Português',
    ru: 'Русский',
    ar: 'العربية',
  }
  return names[lang] || lang.toUpperCase()
}

// 언어 코드로 국기 이모지 가져오기
export function getLanguageFlag(lang: string): string {
  const flags: Record<string, string> = {
    ko: '🇰🇷',
    en: '🇺🇸',
    ja: '🇯🇵',
    zh: '🇨🇳',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    pt: '🇧🇷',
    ru: '🇷🇺',
    ar: '🇸🇦',
  }
  return flags[lang] || '🌐'
}

// Mock 번역 데이터
function getMockTranslations(): Record<string, string> {
  return {
    // 한국어 → 영어
    '안녕하세요|ko|en': 'Hello',
    '반갑습니다|ko|en': 'Nice to meet you',
    '감사합니다|ko|en': 'Thank you',
    '네|ko|en': 'Yes',
    '아니요|ko|en': 'No',
    '좋습니다|ko|en': 'Good',
    '알겠습니다|ko|en': 'I understand',
    '미팅을 시작하겠습니다|ko|en': "Let's start the meeting",
    '오늘 안건은|ko|en': "Today's agenda is",
    '질문 있으신가요|ko|en': 'Do you have any questions?',
    '다음 주에 다시 이야기합시다|ko|en': "Let's talk again next week",
    
    // 영어 → 한국어
    'hello|en|ko': '안녕하세요',
    'nice to meet you|en|ko': '반갑습니다',
    'thank you|en|ko': '감사합니다',
    'yes|en|ko': '네',
    'no|en|ko': '아니요',
    'good|en|ko': '좋습니다',
    'i understand|en|ko': '알겠습니다',
    "let's start the meeting|en|ko": '미팅을 시작하겠습니다',
    "today's agenda is|en|ko": '오늘 안건은',
    'do you have any questions|en|ko': '질문 있으신가요?',
    "let's talk again next week|en|ko": '다음 주에 다시 이야기합시다',
    
    // 한국어 → 일본어
    '안녕하세요|ko|ja': 'こんにちは',
    '감사합니다|ko|ja': 'ありがとうございます',
    
    // 일본어 → 한국어
    'こんにちは|ja|ko': '안녕하세요',
    'ありがとうございます|ja|ko': '감사합니다',
  }
}

// 실제 번역 API 호출 (구현 예시)
// async function callTranslationAPI(
//   text: string,
//   sourceLang: string,
//   targetLang: string
// ): Promise<TranslateResult> {
//   const response = await fetch('/api/translate', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ text, sourceLang, targetLang }),
//   })
//   
//   if (!response.ok) {
//     throw new Error('Translation failed')
//   }
//   
//   return response.json()
// }


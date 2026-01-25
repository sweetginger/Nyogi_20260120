import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 언어 이름 매핑
const languageNames: Record<string, string> = {
  ko: '한국어 (Korean)',
  en: 'English',
  ja: '日本語 (Japanese)',
  zh: '中文 (Chinese)',
  es: 'Español (Spanish)',
  fr: 'Français (French)',
  de: 'Deutsch (German)',
  pt: 'Português (Portuguese)',
  ru: 'Русский (Russian)',
  ar: 'العربية (Arabic)',
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { text, sourceLang, targetLang } = await request.json()

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 같은 언어면 그대로 반환
    if (sourceLang === targetLang) {
      return NextResponse.json({
        translatedText: text,
        sourceLang,
        targetLang,
      })
    }

    const apiKey = process.env.OPENAI_API_KEY

    // OpenAI API 키가 없거나 기본값이면 Mock 번역
    if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
      console.log('[Translate API] No valid API key, using mock translation')
      return NextResponse.json({
        translatedText: mockTranslate(text, sourceLang, targetLang),
        sourceLang,
        targetLang,
        mode: 'mock',
      })
    }

    // OpenAI API 호출
    const sourceLanguageName = languageNames[sourceLang] || sourceLang
    const targetLanguageName = languageNames[targetLang] || targetLang

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text from ${sourceLanguageName} to ${targetLanguageName}. 
Only respond with the translated text, nothing else. 
Maintain the original tone and context.
If the text contains proper nouns or technical terms, keep them as appropriate for the target language.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[Translate API] OpenAI error:', error)
      
      // API 오류 시 Mock 번역으로 폴백
      return NextResponse.json({
        translatedText: mockTranslate(text, sourceLang, targetLang),
        sourceLang,
        targetLang,
        mode: 'mock',
        error: error.error?.message,
      })
    }

    const data = await response.json()
    const translatedText = data.choices[0]?.message?.content?.trim() || text

    console.log(`[Translate API] ${sourceLang} → ${targetLang}: "${text.substring(0, 30)}..." → "${translatedText.substring(0, 30)}..."`)

    return NextResponse.json({
      translatedText,
      sourceLang,
      targetLang,
      mode: 'openai',
    })
  } catch (error) {
    console.error('[Translate API] Error:', error)
    return NextResponse.json(
      { error: '번역 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// Mock 번역 함수
function mockTranslate(text: string, sourceLang: string, targetLang: string): string {
  const mockTranslations: Record<string, string> = {
    // 한국어 → 영어
    '안녕하세요|ko|en': 'Hello',
    '반갑습니다|ko|en': 'Nice to meet you',
    '감사합니다|ko|en': 'Thank you',
    '네|ko|en': 'Yes',
    '아니요|ko|en': 'No',
    '좋습니다|ko|en': 'Good',
    '알겠습니다|ko|en': 'I understand',
    
    // 영어 → 한국어
    'hello|en|ko': '안녕하세요',
    'thank you|en|ko': '감사합니다',
    'yes|en|ko': '네',
    'no|en|ko': '아니요',
  }

  // 정확한 매칭
  const key = `${text.trim().toLowerCase()}|${sourceLang}|${targetLang}`
  if (mockTranslations[key]) {
    return mockTranslations[key]
  }

  // 시뮬레이션 번역
  const flags: Record<string, string> = {
    ko: '🇰🇷',
    en: '🇺🇸',
    ja: '🇯🇵',
    zh: '🇨🇳',
  }
  
  const flag = flags[targetLang] || '🌐'
  const langName = languageNames[targetLang]?.split(' ')[0] || targetLang
  
  return `${flag} [${langName}] ${text}`
}


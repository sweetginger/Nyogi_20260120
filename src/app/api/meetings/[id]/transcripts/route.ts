import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 트랜스크립트 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: { contexts: true },
    })

    if (!meeting) {
      return NextResponse.json({ error: '미팅을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (meeting.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      speakerId, 
      originalText, 
      originalLang, 
      translatedText: clientTranslatedText, // 클라이언트에서 번역한 텍스트
      translatedLang: clientTranslatedLang,  // 클라이언트에서 지정한 번역 언어
      startTime, 
      endTime 
    } = body

    // 번역 언어 결정 (클라이언트가 보낸 값 우선, 없으면 자동 계산)
    const translatedLang = clientTranslatedLang || 
      (originalLang === meeting.languageA ? meeting.languageB : meeting.languageA)
    
    // 번역 텍스트 결정 (클라이언트가 보낸 값 우선, 없으면 서버에서 번역)
    let translatedText = clientTranslatedText
    if (!translatedText) {
      // 클라이언트에서 번역을 보내지 않은 경우 서버에서 번역
      translatedText = await translateText(originalText, originalLang, translatedLang, meeting.contexts)
    }

    const transcript = await prisma.transcript.create({
      data: {
        meetingId: id,
        speakerId,
        originalText,
        translatedText,
        originalLang,
        translatedLang,
        startTime,
        endTime,
      },
      include: { speaker: true },
    })

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('트랜스크립트 추가 오류:', error)
    return NextResponse.json(
      { error: '트랜스크립트 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 간단한 번역 함수 (실제로는 외부 API 연동 필요)
async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  contexts: { term: string; meaning: string | null }[]
): Promise<string> {
  // 컨텍스트에 있는 전문 용어 처리
  let processedText = text
  for (const ctx of contexts) {
    if (processedText.includes(ctx.term) && ctx.meaning) {
      // 전문 용어가 있으면 표시
      processedText = processedText.replace(
        new RegExp(ctx.term, 'g'),
        `${ctx.term}(${ctx.meaning})`
      )
    }
  }

  // 실제 번역 API 연동 시 여기에 구현
  // 예: Google Translate, DeepL, OpenAI 등
  
  // Mock 번역 (데모용)
  const mockTranslations: Record<string, Record<string, string>> = {
    '안녕하세요': { en: 'Hello', ja: 'こんにちは' },
    '감사합니다': { en: 'Thank you', ja: 'ありがとうございます' },
    '미팅을 시작하겠습니다': { en: "Let's start the meeting", ja: '会議を始めましょう' },
  }

  // Mock: 실제로는 번역 API 호출
  if (mockTranslations[text]?.[targetLang]) {
    return mockTranslations[text][targetLang]
  }

  // 번역이 없으면 원문 + 언어 표시
  return `[${targetLang.toUpperCase()}] ${processedText}`
}


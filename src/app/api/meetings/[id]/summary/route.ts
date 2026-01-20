import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// AI 요약 생성
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
      include: {
        transcripts: {
          include: { speaker: true },
          orderBy: { startTime: 'asc' },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: '미팅을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (meeting.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    if (meeting.transcripts.length === 0) {
      return NextResponse.json(
        { error: '요약할 미팅 내용이 없습니다.' },
        { status: 400 }
      )
    }

    // 트랜스크립트를 텍스트로 변환
    const transcriptText = meeting.transcripts
      .map((t) => `${t.speaker?.name || '알 수 없음'}: ${t.originalText}`)
      .join('\n')

    // AI 요약 생성 (실제로는 OpenAI API 등 사용)
    const summaryData = await generateSummary(
      transcriptText,
      meeting.languageA,
      meeting.languageB
    )

    // 기존 요약 삭제 후 새로 생성
    await prisma.meetingSummary.deleteMany({
      where: { meetingId: id },
    })

    const summary = await prisma.meetingSummary.create({
      data: {
        meetingId: id,
        ...summaryData,
      },
    })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('AI 요약 생성 오류:', error)
    return NextResponse.json(
      { error: 'AI 요약 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// AI 요약 생성 함수 (실제로는 OpenAI API 연동 필요)
async function generateSummary(
  transcriptText: string,
  languageA: string,
  languageB: string
) {
  // 실제 구현 시 OpenAI API 사용
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  // const response = await openai.chat.completions.create(...)

  // Mock 요약 (데모용)
  const langNames: Record<string, string> = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
  }

  const hasContent = transcriptText.length > 0

  return {
    // 언어 A 요약
    summaryA: hasContent
      ? `[${langNames[languageA] || languageA} 요약]\n\n이 미팅에서는 주요 안건에 대해 논의했습니다. 참가자들은 적극적으로 의견을 교환했으며, 구체적인 실행 계획을 수립했습니다.`
      : '미팅 내용이 없습니다.',
    decisionsA: hasContent
      ? '• 프로젝트 일정 확정\n• 역할 분담 완료\n• 다음 미팅 일정 합의'
      : '결정 사항 없음',
    actionItemsA: hasContent
      ? '• 화자 1: 기획서 작성 (D+3)\n• 화자 2: 리소스 검토 (D+5)\n• 전체: 다음 주 월요일 팔로업 미팅'
      : '액션 아이템 없음',

    // 언어 B 요약
    summaryB: hasContent
      ? `[${langNames[languageB] || languageB} Summary]\n\nThis meeting covered key agenda items. Participants actively exchanged opinions and established concrete action plans.`
      : 'No meeting content.',
    decisionsB: hasContent
      ? '• Project schedule confirmed\n• Role assignments completed\n• Next meeting date agreed'
      : 'No decisions',
    actionItemsB: hasContent
      ? '• Speaker 1: Draft proposal (D+3)\n• Speaker 2: Resource review (D+5)\n• All: Follow-up meeting next Monday'
      : 'No action items',
  }
}


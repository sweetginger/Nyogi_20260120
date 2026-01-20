import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 미팅 시작
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
    })

    if (!meeting) {
      return NextResponse.json({ error: '미팅을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (meeting.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    // 사용자의 남은 무료 시간 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 무료 시간이 없고 프리미엄이 아닌 경우
    if (user.freeTimeRemaining <= 0 && !user.isPremium) {
      return NextResponse.json(
        { error: '무료 이용 시간이 모두 소진되었습니다. 프리미엄으로 업그레이드해주세요.' },
        { status: 402 }
      )
    }

    // 미팅 상태 업데이트
    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        status: 'in-progress',
        startedAt: new Date(),
      },
    })

    return NextResponse.json({ meeting: updatedMeeting })
  } catch (error) {
    console.error('미팅 시작 오류:', error)
    return NextResponse.json(
      { error: '미팅 시작 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 미팅 종료
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

    const endedAt = new Date()
    const startedAt = meeting.startedAt || new Date()
    const duration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)

    // 미팅 상태 업데이트
    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        status: 'completed',
        endedAt,
        duration,
      },
    })

    // 사용자의 미팅 시간 업데이트
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user && !user.isPremium) {
      const newFreeTime = Math.max(0, user.freeTimeRemaining - duration)
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          freeTimeRemaining: newFreeTime,
          totalMeetingTime: user.totalMeetingTime + duration,
        },
      })
    } else if (user) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalMeetingTime: user.totalMeetingTime + duration,
        },
      })
    }

    return NextResponse.json({ meeting: updatedMeeting })
  } catch (error) {
    console.error('미팅 종료 오류:', error)
    return NextResponse.json(
      { error: '미팅 종료 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


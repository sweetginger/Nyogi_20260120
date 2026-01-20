import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 미팅 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        speakers: true,
        contexts: true,
        transcripts: {
          include: { speaker: true },
          orderBy: { startTime: 'asc' },
        },
        summary: true,
        shares: true,
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: '미팅을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 접근 권한 확인
    const isOwner = session?.user?.id === meeting.userId
    const isPublic = meeting.shareType === 'public'
    const isWhitelisted =
      meeting.shareType === 'whitelist' &&
      session?.user?.email &&
      meeting.shares.some((share) => share.email === session.user.email)

    if (!isOwner && !isPublic && !isWhitelisted) {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    return NextResponse.json({ meeting, isOwner })
  } catch (error) {
    console.error('미팅 조회 오류:', error)
    return NextResponse.json(
      { error: '미팅을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 미팅 수정
export async function PATCH(
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
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, shareType, speakers } = body

    // 미팅 정보 업데이트
    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(shareType && { shareType }),
      },
      include: {
        speakers: true,
        contexts: true,
      },
    })

    // 화자 이름 업데이트
    if (speakers && Array.isArray(speakers)) {
      for (const speaker of speakers) {
        if (speaker.id && speaker.name) {
          await prisma.speaker.update({
            where: { id: speaker.id },
            data: { name: speaker.name },
          })
        }
      }
    }

    return NextResponse.json({ meeting: updatedMeeting })
  } catch (error) {
    console.error('미팅 수정 오류:', error)
    return NextResponse.json(
      { error: '미팅 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 미팅 삭제
export async function DELETE(
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
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 })
    }

    await prisma.meeting.delete({
      where: { id },
    })

    return NextResponse.json({ message: '미팅이 삭제되었습니다.' })
  } catch (error) {
    console.error('미팅 삭제 오류:', error)
    return NextResponse.json(
      { error: '미팅 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 공유 설정 조회
export async function GET(
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
      include: { shares: true },
    })

    if (!meeting) {
      return NextResponse.json({ error: '미팅을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (meeting.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    return NextResponse.json({
      shareType: meeting.shareType,
      shareLink: meeting.shareLink,
      shares: meeting.shares,
    })
  } catch (error) {
    console.error('공유 설정 조회 오류:', error)
    return NextResponse.json(
      { error: '공유 설정을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 공유 설정 업데이트
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
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { shareType } = body

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: { shareType },
    })

    return NextResponse.json({
      shareType: updatedMeeting.shareType,
      shareLink: updatedMeeting.shareLink,
    })
  } catch (error) {
    console.error('공유 설정 업데이트 오류:', error)
    return NextResponse.json(
      { error: '공유 설정 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 화이트리스트 이메일 추가
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

    const body = await request.json()
    const { email, canEdit } = body

    if (!email) {
      return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 })
    }

    // 이미 등록된 이메일인지 확인
    const existingShare = await prisma.meetingShare.findUnique({
      where: {
        meetingId_email: {
          meetingId: id,
          email,
        },
      },
    })

    if (existingShare) {
      return NextResponse.json(
        { error: '이미 공유된 이메일입니다.' },
        { status: 400 }
      )
    }

    // 해당 이메일의 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    })

    const share = await prisma.meetingShare.create({
      data: {
        meetingId: id,
        email,
        userId: user?.id,
        canEdit: canEdit || false,
      },
    })

    return NextResponse.json({ share })
  } catch (error) {
    console.error('공유 추가 오류:', error)
    return NextResponse.json(
      { error: '공유 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 화이트리스트 이메일 삭제
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
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')

    if (!shareId) {
      return NextResponse.json({ error: '삭제할 공유를 선택해주세요.' }, { status: 400 })
    }

    await prisma.meetingShare.delete({
      where: { id: shareId },
    })

    return NextResponse.json({ message: '공유가 삭제되었습니다.' })
  } catch (error) {
    console.error('공유 삭제 오류:', error)
    return NextResponse.json(
      { error: '공유 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


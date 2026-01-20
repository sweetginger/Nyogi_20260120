import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 멤버 초대
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

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: { members: true },
    })

    if (!workspace) {
      return NextResponse.json({ error: '워크스페이스를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 관리자 이상만 초대 가능
    const currentMember = workspace.members.find((m) => m.userId === session.user.id)
    if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
      return NextResponse.json({ error: '초대 권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { email, role = 'member' } = body

    if (!email) {
      return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 })
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: '해당 이메일로 등록된 사용자가 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 멤버인지 확인
    const existingMember = workspace.members.find((m) => m.userId === user.id)
    if (existingMember) {
      return NextResponse.json(
        { error: '이미 워크스페이스 멤버입니다.' },
        { status: 400 }
      )
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: id,
        userId: user.id,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    return NextResponse.json({ member })
  } catch (error) {
    console.error('멤버 초대 오류:', error)
    return NextResponse.json(
      { error: '멤버 초대 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 멤버 삭제
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

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: '삭제할 멤버를 선택해주세요.' }, { status: 400 })
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: { members: true },
    })

    if (!workspace) {
      return NextResponse.json({ error: '워크스페이스를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 관리자 이상만 삭제 가능 (본인은 나가기 가능)
    const currentMember = workspace.members.find((m) => m.userId === session.user.id)
    const targetMember = workspace.members.find((m) => m.id === memberId)

    if (!targetMember) {
      return NextResponse.json({ error: '멤버를 찾을 수 없습니다.' }, { status: 404 })
    }

    const isSelf = targetMember.userId === session.user.id
    const isAdmin = currentMember && ['owner', 'admin'].includes(currentMember.role)

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 })
    }

    // 오너는 삭제 불가
    if (targetMember.role === 'owner') {
      return NextResponse.json(
        { error: '워크스페이스 소유자는 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    await prisma.workspaceMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ message: '멤버가 삭제되었습니다.' })
  } catch (error) {
    console.error('멤버 삭제 오류:', error)
    return NextResponse.json(
      { error: '멤버 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


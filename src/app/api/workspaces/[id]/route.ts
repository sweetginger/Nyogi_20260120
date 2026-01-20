import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 워크스페이스 상세 조회
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

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        meetings: {
          include: {
            user: {
              select: { id: true, name: true },
            },
            speakers: true,
            summary: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!workspace) {
      return NextResponse.json({ error: '워크스페이스를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 접근 권한 확인
    const isMember = workspace.members.some((m) => m.userId === session.user.id)
    if (!isMember) {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    return NextResponse.json({ workspace })
  } catch (error) {
    console.error('워크스페이스 조회 오류:', error)
    return NextResponse.json(
      { error: '워크스페이스를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 워크스페이스 수정
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

    const workspace = await prisma.workspace.findUnique({
      where: { id },
    })

    if (!workspace) {
      return NextResponse.json({ error: '워크스페이스를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description } = body

    const updatedWorkspace = await prisma.workspace.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    })

    return NextResponse.json({ workspace: updatedWorkspace })
  } catch (error) {
    console.error('워크스페이스 수정 오류:', error)
    return NextResponse.json(
      { error: '워크스페이스 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 워크스페이스 삭제
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

    const workspace = await prisma.workspace.findUnique({
      where: { id },
    })

    if (!workspace) {
      return NextResponse.json({ error: '워크스페이스를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 })
    }

    await prisma.workspace.delete({
      where: { id },
    })

    return NextResponse.json({ message: '워크스페이스가 삭제되었습니다.' })
  } catch (error) {
    console.error('워크스페이스 삭제 오류:', error)
    return NextResponse.json(
      { error: '워크스페이스 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


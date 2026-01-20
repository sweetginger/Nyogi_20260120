import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 워크스페이스 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
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
        _count: {
          select: { meetings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ workspaces })
  } catch (error) {
    console.error('워크스페이스 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '워크스페이스 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 워크스페이스 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: '워크스페이스 이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'owner',
          },
        },
      },
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
      },
    })

    return NextResponse.json({ workspace })
  } catch (error) {
    console.error('워크스페이스 생성 오류:', error)
    return NextResponse.json(
      { error: '워크스페이스 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


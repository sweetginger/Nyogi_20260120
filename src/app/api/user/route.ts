import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 현재 사용자 정보 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPremium: true,
        totalMeetingTime: true,
        freeTimeRemaining: true,
        createdAt: true,
        _count: {
          select: { meetings: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error)
    return NextResponse.json(
      { error: '사용자 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


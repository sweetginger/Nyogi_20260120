import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 프리미엄 업그레이드 (실제로는 결제 시스템 연동 필요)
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 실제 구현 시:
    // 1. Stripe/Toss Payments 등 결제 시스템 연동
    // 2. 결제 성공 후 isPremium 업데이트
    // 3. 구독 관리 로직 추가

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isPremium: true,
      },
    })

    return NextResponse.json({
      message: '프리미엄으로 업그레이드되었습니다.',
      user: {
        id: user.id,
        isPremium: user.isPremium,
      },
    })
  } catch (error) {
    console.error('업그레이드 오류:', error)
    return NextResponse.json(
      { error: '업그레이드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


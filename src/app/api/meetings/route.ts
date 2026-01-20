import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 미팅 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    const meetings = await prisma.meeting.findMany({
      where: workspaceId
        ? { workspaceId }
        : { userId: session.user.id },
      include: {
        speakers: true,
        summary: true,
        _count: {
          select: { transcripts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error('미팅 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '미팅 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 미팅 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      meetingType,
      meetingLink,
      languageA,
      languageB,
      workspaceId,
      contexts,
    } = body

    // 미팅 생성
    const meeting = await prisma.meeting.create({
      data: {
        title: title || '새 미팅',
        description,
        meetingType: meetingType || 'in-person',
        meetingLink,
        languageA: languageA || 'ko',
        languageB: languageB || 'en',
        userId: session.user.id,
        workspaceId,
        shareLink: uuidv4(),
        speakers: {
          create: [
            { name: '화자 1', language: languageA || 'ko', order: 1 },
            { name: '화자 2', language: languageB || 'en', order: 2 },
          ],
        },
        contexts: contexts?.length
          ? {
              create: contexts.map((ctx: { term: string; meaning?: string }) => ({
                term: ctx.term,
                meaning: ctx.meaning,
              })),
            }
          : undefined,
      },
      include: {
        speakers: true,
        contexts: true,
      },
    })

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error('미팅 생성 오류:', error)
    return NextResponse.json(
      { error: '미팅 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


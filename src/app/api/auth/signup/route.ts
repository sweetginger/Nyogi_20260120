import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// 이메일 형식 검증
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 비밀번호 유효성 검증
function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: '비밀번호는 8자 이상이어야 합니다.' }
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: '비밀번호에 영문자가 포함되어야 합니다.' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '비밀번호에 숫자가 포함되어야 합니다.' }
  }
  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호는 필수입니다.' },
        { status: 400 }
      )
    }

    // 이름 검증
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: '이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: '이름은 50자 이하로 입력해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const normalizedEmail = email.toLowerCase().trim()
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 유효성 검증
    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      // 이미 Google로 가입한 사용자인 경우
      if (!existingUser.password) {
        return NextResponse.json(
          { error: '이미 Google 계정으로 가입된 이메일입니다. Google로 로그인해주세요.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        freeTimeRemaining: 3600, // 1시간 무료 제공 (초 단위)
      },
    })

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('회원가입 오류:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

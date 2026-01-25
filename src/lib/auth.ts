import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true, // 같은 이메일로 여러 방식 로그인 허용
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.')
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(credentials.email)) {
          throw new Error('올바른 이메일 형식이 아닙니다.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user) {
          throw new Error('등록되지 않은 이메일입니다.')
        }

        // Google 로그인으로만 가입한 경우
        if (!user.password) {
          throw new Error('Google 계정으로 로그인해주세요.')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('비밀번호가 일치하지 않습니다.')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Google 로그인 시 기존 이메일 사용자와 연결
      if (account?.provider === 'google' && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        // 기존 사용자가 없으면 무료 시간 제공
        if (!existingUser) {
          // PrismaAdapter가 자동으로 사용자를 생성하므로
          // 생성된 후 무료 시간 업데이트
          setTimeout(async () => {
            try {
              await prisma.user.update({
                where: { email: user.email! },
                data: { freeTimeRemaining: 3600 },
              })
            } catch (e) {
              console.error('무료 시간 설정 오류:', e)
            }
          }, 1000)
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // 새 사용자 생성 시 무료 시간 설정
      if (user.email) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: { freeTimeRemaining: 3600 },
          })
        } catch (e) {
          console.error('무료 시간 설정 오류:', e)
        }
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

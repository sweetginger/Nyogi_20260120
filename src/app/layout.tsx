import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'Nyogi - AI 실시간 통역·기록 서비스',
  description: '다국어 사용자가 대면 또는 온라인 미팅에서 실시간으로 서로의 언어를 이해하고, 미팅 종료 후에는 이중 언어 요약 미팅록을 공유할 수 있는 AI 통역·기록 서비스',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}


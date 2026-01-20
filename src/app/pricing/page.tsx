'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Check, Crown, Zap, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    if (!session) {
      router.push('/signup')
      return
    }

    setIsUpgrading(true)
    try {
      const res = await fetch('/api/user/upgrade', {
        method: 'POST',
      })

      if (res.ok) {
        alert('프리미엄으로 업그레이드되었습니다!')
        router.push('/dashboard')
      } else {
        const error = await res.json()
        alert(error.error)
      }
    } catch {
      alert('업그레이드 중 오류가 발생했습니다.')
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              간단한 요금제
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-surface-900 dark:text-white mb-4">
              당신에게 맞는 플랜을 선택하세요
            </h1>
            <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
              무료로 시작하고, 필요할 때 언제든 업그레이드하세요.
              <br />
              모든 플랜에서 실시간 통역과 AI 요약을 이용할 수 있습니다.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative">
              <CardBody className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
                    무료
                  </h3>
                  <p className="text-surface-500">
                    Nyogi를 처음 시작하는 분들에게
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-surface-900 dark:text-white">
                    ₩0
                  </span>
                  <span className="text-surface-500 ml-2">/영구</span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      <strong>1시간</strong> 무료 미팅
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      실시간 음성 인식 및 번역
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      화자 구분 기능
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      AI 이중 언어 요약
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      미팅록 공유 (링크)
                    </span>
                  </li>
                </ul>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push(session ? '/dashboard' : '/signup')}
                >
                  {session ? '대시보드로 이동' : '무료로 시작하기'}
                </Button>
              </CardBody>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-2 border-primary-500">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-600 to-accent-600 text-white text-sm font-medium px-4 py-1.5 rounded-full">
                  가장 인기
                </span>
              </div>

              <CardBody className="p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
                      프리미엄
                    </h3>
                  </div>
                  <p className="text-surface-500">
                    글로벌 협업이 많은 팀에게
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-surface-900 dark:text-white">
                    ₩29,000
                  </span>
                  <span className="text-surface-500 ml-2">/월</span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      <strong>무제한</strong> 미팅 시간
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      실시간 음성 인식 및 번역
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      화자 구분 기능
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      AI 이중 언어 요약
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      미팅록 공유 및 권한 관리
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      <strong>무제한</strong> 워크스페이스
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      전문 용어 컨텍스트 등록
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      우선 고객 지원
                    </span>
                  </li>
                </ul>

                <Button className="w-full" onClick={handleUpgrade} isLoading={isUpgrading}>
                  {isUpgrading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    '프리미엄 시작하기'
                  )}
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white text-center mb-10">
              자주 묻는 질문
            </h2>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-2">
                  무료 플랜의 1시간은 어떻게 계산되나요?
                </h3>
                <p className="text-surface-600 dark:text-surface-400">
                  회원가입 후 누적 미팅 시간이 1시간이 될 때까지 무료로 이용할 수 있습니다.
                  1시간이 지나면 프리미엄으로 업그레이드해야 계속 이용할 수 있습니다.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-2">
                  환불이 가능한가요?
                </h3>
                <p className="text-surface-600 dark:text-surface-400">
                  네, 결제 후 7일 이내에 환불을 요청하시면 전액 환불해 드립니다.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-2">
                  팀 요금제가 있나요?
                </h3>
                <p className="text-surface-600 dark:text-surface-400">
                  현재 팀 요금제는 준비 중입니다. 워크스페이스 기능을 통해 팀원들과
                  미팅을 공유할 수 있으며, 각 팀원이 개별 프리미엄 구독을 하면 됩니다.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-2">
                  어떤 언어를 지원하나요?
                </h3>
                <p className="text-surface-600 dark:text-surface-400">
                  현재 한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 독일어,
                  포르투갈어, 러시아어, 아랍어를 지원합니다. 더 많은 언어가 추가될 예정입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


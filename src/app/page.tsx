import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import {
  Mic,
  Globe,
  FileText,
  Share2,
  Users,
  Zap,
  Check,
  ArrowRight,
  Video,
  Monitor,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4" />
            AI 기반 실시간 통역 서비스
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-surface-900 dark:text-white mb-6 animate-slide-up">
            언어의 장벽 없이
            <br />
            <span className="gradient-text">글로벌 미팅</span>을 시작하세요
          </h1>

          <p className="text-lg md:text-xl text-surface-600 dark:text-surface-400 max-w-3xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Nyogi는 대면·온라인 미팅에서 실시간 통역과 화자 구분 기반 자동 기록을 제공합니다.
            <br className="hidden md:block" />
            미팅 종료 후에는 이중 언어 AI 요약으로 완벽한 미팅록을 공유하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/signup">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                무료로 시작하기
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="secondary" size="lg">
                더 알아보기
              </Button>
            </Link>
          </div>

          <p className="text-sm text-surface-500 mt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            ✓ 신용카드 불필요 · ✓ 1시간 무료 제공 · ✓ 언제든 업그레이드
          </p>
        </div>

        {/* Hero Image/Demo */}
        <div className="max-w-5xl mx-auto mt-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-surface-200 dark:border-surface-800">
            <div className="bg-surface-900 p-4 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center text-surface-400 text-sm">
                Nyogi - 실시간 미팅
              </div>
            </div>
            <div className="bg-surface-800 p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Speaker A */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      A
                    </div>
                    <div>
                      <p className="text-white font-medium">화자 1</p>
                      <p className="text-surface-400 text-sm">한국어</p>
                    </div>
                    <span className="lang-badge lang-badge-ko ml-auto">KO</span>
                  </div>
                  <div className="bg-surface-700/50 rounded-xl p-4 space-y-3">
                    <p className="text-white">&quot;안녕하세요, 오늘 미팅을 시작하겠습니다.&quot;</p>
                    <p className="text-surface-400 text-sm italic">&quot;Hello, let&apos;s start today&apos;s meeting.&quot;</p>
                  </div>
                </div>

                {/* Speaker B */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                      B
                    </div>
                    <div>
                      <p className="text-white font-medium">화자 2</p>
                      <p className="text-surface-400 text-sm">English</p>
                    </div>
                    <span className="lang-badge lang-badge-en ml-auto">EN</span>
                  </div>
                  <div className="bg-surface-700/50 rounded-xl p-4 space-y-3">
                    <p className="text-white">&quot;Thank you for having me. I&apos;m excited to collaborate.&quot;</p>
                    <p className="text-surface-400 text-sm italic">&quot;초대해 주셔서 감사합니다. 협업이 기대됩니다.&quot;</p>
                  </div>
                </div>
              </div>

              {/* Live Indicator */}
              <div className="mt-6 flex items-center justify-center">
                <div className="live-indicator text-red-500 font-medium">
                  실시간 통역 중
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-900 dark:text-white mb-4">
              모든 미팅에 최적화된 기능
            </h2>
            <p className="text-lg text-surface-600 dark:text-surface-400">
              대면부터 온라인까지, Nyogi가 언어의 장벽을 허물어 드립니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-6">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
                실시간 음성 인식
              </h3>
              <p className="text-surface-600 dark:text-surface-400">
                화자 분리 기술로 발화자를 자동 구분하고, 실시간으로 텍스트로 변환합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mx-auto mb-6">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
                다국어 실시간 번역
              </h3>
              <p className="text-surface-600 dark:text-surface-400">
                두 언어를 동시에 기록하고 번역하여, 참가자 모두가 이해할 수 있습니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
                AI 이중 언어 요약
              </h3>
              <p className="text-surface-600 dark:text-surface-400">
                미팅 종료 후 핵심 논의, 결정 사항, 액션 아이템을 두 언어로 요약합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meeting Types Section */}
      <section className="py-20 px-4 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-900 dark:text-white mb-4">
              모든 미팅 환경 지원
            </h2>
            <p className="text-lg text-surface-600 dark:text-surface-400">
              대면 미팅부터 Zoom, Google Meet까지 다양한 환경에서 사용하세요.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* In-person */}
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">대면 미팅</h3>
                  <p className="text-sm text-surface-500">오프라인</p>
                </div>
              </div>
              <p className="text-surface-600 dark:text-surface-400 text-sm">
                기기 마이크를 통해 실시간 통역을 제공합니다. 모니터를 보며 상대 언어를 확인하세요.
              </p>
            </div>

            {/* Zoom */}
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">Zoom</h3>
                  <p className="text-sm text-surface-500">온라인</p>
                </div>
              </div>
              <p className="text-surface-600 dark:text-surface-400 text-sm">
                Zoom 링크를 입력하면 Nyogi 봇이 자동으로 참여하여 음성을 수집합니다.
              </p>
            </div>

            {/* Google Meet */}
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">Google Meet</h3>
                  <p className="text-sm text-surface-500">온라인</p>
                </div>
              </div>
              <p className="text-surface-600 dark:text-surface-400 text-sm">
                Google Meet 링크를 입력하면 Nyogi 봇이 자동으로 참여하여 음성을 수집합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sharing Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-900 dark:text-white mb-6">
                팀과 함께 미팅록을 공유하세요
              </h2>
              <p className="text-lg text-surface-600 dark:text-surface-400 mb-8">
                워크스페이스를 만들어 팀원들과 모든 미팅록을 공유하고, 
                세밀한 권한 설정으로 외부 파트너에게도 안전하게 공유할 수 있습니다.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">공개 링크</p>
                    <p className="text-sm text-surface-500">링크가 있으면 누구나 접근</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">비공개</p>
                    <p className="text-sm text-surface-500">본인만 접근 가능</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">이메일 화이트리스트</p>
                    <p className="text-sm text-surface-500">지정 이메일만 접근 가능</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Share2 className="w-6 h-6 text-primary-600" />
                  <h3 className="font-semibold text-surface-900 dark:text-white">공유 설정</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800 border-2 border-primary-500">
                    <p className="font-medium text-surface-900 dark:text-white">지정 이메일만 접근 가능</p>
                    <p className="text-sm text-surface-500">화이트리스트에 등록된 이메일만 열람</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800">
                    <div className="flex items-center justify-between">
                      <p className="text-surface-600 dark:text-surface-400">partner@company.com</p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">접근 허용</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800">
                    <div className="flex items-center justify-between">
                      <p className="text-surface-600 dark:text-surface-400">team@startup.io</p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">접근 허용</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-900 dark:text-white mb-4">
            심플한 요금제
          </h2>
          <p className="text-lg text-surface-600 dark:text-surface-400 mb-12">
            무료로 시작하고, 필요할 때 업그레이드하세요.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="card p-8">
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">무료</h3>
              <p className="text-4xl font-bold text-surface-900 dark:text-white mb-6">
                ₩0
                <span className="text-base font-normal text-surface-500">/영구</span>
              </p>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Check className="w-5 h-5 text-green-500" />
                  1시간 무료 미팅
                </li>
                <li className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Check className="w-5 h-5 text-green-500" />
                  실시간 통역
                </li>
                <li className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Check className="w-5 h-5 text-green-500" />
                  AI 요약
                </li>
                <li className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Check className="w-5 h-5 text-green-500" />
                  미팅록 공유
                </li>
              </ul>
              <Link href="/signup">
                <Button variant="secondary" className="w-full">
                  무료로 시작
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="card p-8 border-2 border-primary-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-sm px-4 py-1 rounded-full">
                인기
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">프리미엄</h3>
              <p className="text-4xl font-bold text-surface-900 dark:text-white mb-6">
                ₩29,000
                <span className="text-base font-normal text-surface-500">/월</span>
              </p>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Check className="w-5 h-5 text-green-500" />
                  <strong>무제한</strong> 미팅 시간
                </li>
                <li className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Check className="w-5 h-5 text-green-500" />
                  실시간 통역
                </li>
                <li className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Check className="w-5 h-5 text-green-500" />
                  AI 요약
                </li>
                <li className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Check className="w-5 h-5 text-green-500" />
                  미팅록 공유
                </li>
                <li className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Check className="w-5 h-5 text-green-500" />
                  워크스페이스 무제한
                </li>
                <li className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Check className="w-5 h-5 text-green-500" />
                  우선 지원
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full">프리미엄 시작</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-900 dark:text-white mb-6">
            지금 바로 글로벌 미팅을 시작하세요
          </h2>
          <p className="text-lg text-surface-600 dark:text-surface-400 mb-8">
            1시간 무료 체험으로 Nyogi의 강력한 기능을 경험해보세요.
          </p>
          <Link href="/signup">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-surface-200 dark:border-surface-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-display font-bold text-xl text-surface-900 dark:text-white">
                Nyogi
              </span>
            </div>
            <p className="text-surface-500 text-sm">
              © 2026 Nyogi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


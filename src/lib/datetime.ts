/**
 * 날짜/시간 유틸리티
 * 
 * DB 저장: UTC (Prisma/SQLite 기본값)
 * 화면 표시: 브라우저 로컬 타임존
 */

import { format, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

// 타임존 정보 가져오기
export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// UTC 날짜를 로컬 Date 객체로 변환
export function toLocalDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null
  return new Date(date)
}

// 날짜 포맷팅 (로컬 타임존 적용)
export function formatDate(
  date: Date | string | null | undefined,
  formatStr: string = 'yyyy-MM-dd'
): string {
  const localDate = toLocalDate(date)
  if (!localDate) return '-'
  return format(localDate, formatStr, { locale: ko })
}

// 시간 포맷팅 (로컬 타임존 적용)
export function formatTime(
  date: Date | string | null | undefined,
  formatStr: string = 'HH:mm'
): string {
  const localDate = toLocalDate(date)
  if (!localDate) return '-'
  return format(localDate, formatStr, { locale: ko })
}

// 날짜+시간 포맷팅 (로컬 타임존 적용)
export function formatDateTime(
  date: Date | string | null | undefined,
  formatStr: string = 'yyyy-MM-dd HH:mm'
): string {
  const localDate = toLocalDate(date)
  if (!localDate) return '-'
  return format(localDate, formatStr, { locale: ko })
}

// 상대 시간 표시 (예: "3분 전", "2시간 전")
export function formatRelativeTime(
  date: Date | string | null | undefined,
  options?: { addSuffix?: boolean }
): string {
  const localDate = toLocalDate(date)
  if (!localDate) return '-'
  return formatDistanceToNow(localDate, {
    locale: ko,
    addSuffix: options?.addSuffix ?? true,
  })
}

// 미팅 시간 표시용 포맷
export function formatMeetingDate(date: Date | string | null | undefined): string {
  const localDate = toLocalDate(date)
  if (!localDate) return '-'
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateOnly = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate())
  
  const diffDays = Math.floor((today.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return `오늘 ${format(localDate, 'HH:mm', { locale: ko })}`
  } else if (diffDays === 1) {
    return `어제 ${format(localDate, 'HH:mm', { locale: ko })}`
  } else if (diffDays === -1) {
    return `내일 ${format(localDate, 'HH:mm', { locale: ko })}`
  } else if (diffDays > 0 && diffDays < 7) {
    return format(localDate, 'EEEE HH:mm', { locale: ko })
  } else if (localDate.getFullYear() === now.getFullYear()) {
    return format(localDate, 'M월 d일 HH:mm', { locale: ko })
  } else {
    return format(localDate, 'yyyy년 M월 d일 HH:mm', { locale: ko })
  }
}

// 미팅 시간만 표시 (예: 오후 2:30)
export function formatMeetingTime(date: Date | string | null | undefined): string {
  const localDate = toLocalDate(date)
  if (!localDate) return '-'
  return format(localDate, 'a h:mm', { locale: ko })
}

// 타임스탬프를 로컬 시간 문자열로 변환
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return format(date, 'HH:mm:ss', { locale: ko })
}

// Duration 포맷팅 (초 -> "1시간 30분" 형태)
export function formatDurationText(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}초`
  }
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}시간 ${minutes}분`
    }
    return `${hours}시간`
  }
  
  if (secs > 0) {
    return `${minutes}분 ${secs}초`
  }
  return `${minutes}분`
}

// Duration 포맷팅 (초 -> "01:30:00" 형태)
export function formatDurationClock(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}


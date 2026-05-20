/* today_book/frontend/src/utils/date.ts */
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export const formatDate = (date: string | Date, fmt: string = 'yyyy-MM-dd') => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: zhCN })
}

export const formatMonth = (date: string | Date) => formatDate(date, 'yyyy年M月')

export const getWeekRange = (date: Date = new Date()) => ({
  start: format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  end: format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
})

export const getMonthRange = (date: Date = new Date()) => ({
  start: format(startOfMonth(date), 'yyyy-MM-dd'),
  end: format(endOfMonth(date), 'yyyy-MM-dd'),
})

export const getYearRange = (date: Date = new Date()) => ({
  start: format(startOfYear(date), 'yyyy-MM-dd'),
  end: format(endOfYear(date), 'yyyy-MM-dd'),
})

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd')

export { zhCN }

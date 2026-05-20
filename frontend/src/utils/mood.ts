/* today_book/frontend/src/utils/mood.ts */

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  neutral: '😐',
  excited: '🤩',
  tired: '😴',
}

export function moodEmoji(mood?: string | null): string {
  return MOOD_EMOJI[mood || ''] || '📝'
}

export const MOOD_OPTIONS = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'excited', label: '兴奋', emoji: '🤩' },
  { value: 'neutral', label: '一般', emoji: '😐' },
  { value: 'tired', label: '疲惫', emoji: '😴' },
  { value: 'sad', label: '难过', emoji: '😢' },
]

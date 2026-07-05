export function toApiDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function startOfToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function isSameDay(a: Date, b: Date): boolean {
  return toApiDate(a) === toApiDate(b)
}

export function isFutureDate(date: Date): boolean {
  return toApiDate(date) > toApiDate(startOfToday())
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

/** Merges a calendar date with the current local time for API datetime fields. */
export function toApiDateTime(date: Date): string {
  const now = new Date()
  const merged = new Date(date)
  merged.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0)
  const year = merged.getFullYear()
  const month = String(merged.getMonth() + 1).padStart(2, '0')
  const day = String(merged.getDate()).padStart(2, '0')
  const hours = String(merged.getHours()).padStart(2, '0')
  const minutes = String(merged.getMinutes()).padStart(2, '0')
  const seconds = String(merged.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

const MIN_AGE = 1
const MAX_AGE = 120

export function calculateAge(birthday: string): number {
  const birth = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

export function isValidBirthday(birthday: string): boolean {
  if (!birthday) return false

  const birth = new Date(birthday)
  if (Number.isNaN(birth.getTime())) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  birth.setHours(0, 0, 0, 0)

  if (birth >= today) return false

  const age = calculateAge(birthday)
  return age >= MIN_AGE && age <= MAX_AGE
}

export function birthdayValidationError(birthday: string): string | undefined {
  if (!birthday) return 'Birthday is required.'
  if (!isValidBirthday(birthday)) {
    return `Birthday must be in the past and correspond to an age between ${MIN_AGE} and ${MAX_AGE}.`
  }
  return undefined
}

export function maxBirthdayDate(): string {
  const today = new Date()
  today.setDate(today.getDate() - 1)
  return toDateInputValue(today)
}

export function minBirthdayDate(): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() - MAX_AGE)
  return toDateInputValue(date)
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

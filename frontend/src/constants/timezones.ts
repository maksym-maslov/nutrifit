const FALLBACK_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Kyiv',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
] as const

function readSupportedTimeZones(): string[] | null {
  try {
    const intl = Intl as typeof Intl & {
      supportedValuesOf?: (key: 'timeZone') => string[]
    }
    if (typeof intl.supportedValuesOf === 'function') {
      return intl.supportedValuesOf('timeZone')
    }
  } catch {
    return null
  }
  return null
}

const supported = readSupportedTimeZones()

export const TIMEZONE_OPTIONS: readonly string[] = Object.freeze(
  [...new Set([...(supported ?? FALLBACK_TIMEZONES), ...FALLBACK_TIMEZONES])].sort(),
)

export const DEFAULT_TIMEZONE = 'Europe/Kyiv'

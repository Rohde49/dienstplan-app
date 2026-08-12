const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidTimeOfDay(value: string): boolean {
  return TIME_OF_DAY_PATTERN.test(value)
}

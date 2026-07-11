export const reduceToSingleDigit = (value: number): number => {
  let result = Math.abs(Math.trunc(value));

  while (result > 9) {
    result = String(result)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return result;
};

export const parseBirthDate = (dateStr: string) => {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if ([year, month, day].some((part) => Number.isNaN(part))) {
    return null;
  }

  return { year, month, day };
};

// Mulank / Psychic Number: based on the day of birth.
export const calculateMulank = (dateStr: string): number => {
  const parsed = parseBirthDate(dateStr);
  if (!parsed) return 0;

  return reduceToSingleDigit(parsed.day);
};

// Bhagyank / Destiny Number: based on the day and year digits.
// This keeps the calculation consistent across the app and matches the
// intended result for dates such as 2026-07-28 => 2.
export const calculateDestinyNumber = (dateStr: string): number => {
  const parsed = parseBirthDate(dateStr);
  if (!parsed) return 0;

  const dayRoot = reduceToSingleDigit(parsed.day);
  const yearRoot = reduceToSingleDigit(parsed.year);

  return reduceToSingleDigit(dayRoot + yearRoot);
};

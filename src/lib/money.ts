export function formatMinorCurrency(
  value: number | string | null,
  currency: string | null,
  locale: string,
) {
  if (value === null || !currency) return null;

  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 0 || !/^[A-Z]{3}$/.test(currency)) {
    return null;
  }

  try {
    const reference = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    });
    const digits = reference.resolvedOptions().maximumFractionDigits ?? 2;
    const major = amount / 10 ** digits;

    if (currency === "TND") {
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: Number.isInteger(major) ? 0 : digits,
      }).format(major);
      return `${formatted} ${locale.toLowerCase().startsWith("ar") ? "د.ت" : "DT"}`;
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    }).format(major);
  } catch {
    return null;
  }
}

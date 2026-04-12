"use client";

import type { Ref } from "react";
import { useEffect, useMemo, useState } from "react";

import { COUNTRY_CODES } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import {
  DEFAULT_COUNTRY_CODE,
  formatPhoneNumber,
  parsePhoneNumber,
  sanitizePhoneDigits,
} from "@/lib/utils/phone";

type PhoneInputProps = {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  inputRef?: Ref<HTMLInputElement>;
};

export function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  className,
  inputRef,
}: PhoneInputProps) {
  const parsed = useMemo(() => parsePhoneNumber(value), [value]);
  const [countryCode, setCountryCode] = useState<string>(parsed.country.code);
  const [nationalNumber, setNationalNumber] = useState(parsed.nationalNumber);

  useEffect(() => {
    setCountryCode(parsed.country.code);
    setNationalNumber(parsed.nationalNumber);
  }, [parsed.country.code, parsed.nationalNumber]);

  const currentCountry =
    COUNTRY_CODES.find((country) => country.code === countryCode) ?? DEFAULT_COUNTRY_CODE;

  return (
    <div
      className={cn(
        "grid w-full overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm transition focus-within:ring-2 focus-within:ring-ring sm:grid-cols-[minmax(0,15rem)_1fr]",
        className,
      )}
    >
      <div className="relative min-w-0 border-b border-border bg-muted/40 sm:border-b-0 sm:border-r">
        <select
          aria-label="Select country code"
          className="h-11 w-full appearance-none bg-transparent px-3 pr-8 text-sm text-foreground focus:outline-none"
          id={`${id}-country`}
          value={countryCode}
          onBlur={onBlur}
          onChange={(event) => {
            const nextCode = event.target.value;
            setCountryCode(nextCode);
            onChange(formatPhoneNumber(nextCode, nationalNumber));
          }}
        >
          {COUNTRY_CODES.map((country) => (
            <option key={`${country.country}-${country.code}`} value={country.code}>
              {country.flag} {country.country} ({country.code})
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          v
        </span>
      </div>
      <input
        className="h-11 min-w-0 bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        id={id}
        inputMode="tel"
        placeholder={currentCountry.placeholder}
        ref={inputRef}
        value={nationalNumber}
        onBlur={onBlur}
        onChange={(event) => {
          const digits = sanitizePhoneDigits(event.target.value);
          setNationalNumber(digits);
          onChange(formatPhoneNumber(countryCode, digits));
        }}
      />
    </div>
  );
}

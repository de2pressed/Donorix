"use client";

import { useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDIAN_LANGUAGES } from "@/lib/constants";

export function LanguageSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const tAssistant = useTranslations("assistant");

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={tAssistant("languageLabel")}>
        <SelectValue placeholder={tAssistant("languageLabel")} />
      </SelectTrigger>
      <SelectContent>
        {INDIAN_LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

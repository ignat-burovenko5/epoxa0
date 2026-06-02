"use client";

import { useCallback, useRef, type InputHTMLAttributes } from "react";
import {
  caretAfterDigitIndex,
  countDigitsBefore,
  formatRuPhone,
  normalizeRuPhoneDigits,
} from "@/lib/phone";

type PhoneInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: string;
  onChange: (value: string) => void;
};

export default function PhoneInput({
  value,
  onChange,
  onFocus,
  onBlur,
  className = "",
  placeholder = "+7 (___) ___-__-__",
  ...rest
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const applyFormatted = useCallback(
    (raw: string, caret: number | null) => {
      const digitsBefore =
        caret === null ? null : countDigitsBefore(raw, caret);
      const formatted = formatRuPhone(raw);
      onChange(formatted);

      if (digitsBefore === null || !inputRef.current) return;

      const nextCaret = caretAfterDigitIndex(formatted, digitsBefore);
      requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(nextCaret, nextCaret);
      });
    },
    [onChange],
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (!normalizeRuPhoneDigits(value).length) {
        onChange("+7 ");
        requestAnimationFrame(() => {
          const el = inputRef.current;
          if (!el) return;
          const end = el.value.length;
          el.setSelectionRange(end, end);
        });
      } else if (value !== formatRuPhone(value)) {
        applyFormatted(value, null);
      }
      onFocus?.(e);
    },
    [value, onChange, onFocus, applyFormatted],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const digits = normalizeRuPhoneDigits(value);
      if (!digits.length || digits === "7") {
        onChange("");
      }
      onBlur?.(e);
    },
    [value, onChange, onBlur],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const el = e.target;
      applyFormatted(el.value, el.selectionStart ?? el.value.length);
    },
    [applyFormatted],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Backspace" || !inputRef.current) return;
      const el = inputRef.current;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? start;
      if (start !== end) return;

      const digits = normalizeRuPhoneDigits(value);
      if (digits.length <= 1 && start <= 3) {
        e.preventDefault();
        onChange("");
      }
    },
    [value, onChange],
  );

  return (
    <input
      {...rest}
      ref={inputRef}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      className={className}
      placeholder={placeholder}
      value={value}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}

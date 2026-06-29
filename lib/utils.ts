import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number, options?: { compact?: boolean }) {
  if (options?.compact && Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(2)}万`;
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(value: number, digits = 2) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatPlainPercent(value: number, digits = 2) {
  return `${value.toFixed(digits)}%`;
}

export function toneByValue(value: number) {
  if (value > 0) return "text-matrix-green";
  if (value < 0) return "text-matrix-red";
  return "text-matrix-muted";
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

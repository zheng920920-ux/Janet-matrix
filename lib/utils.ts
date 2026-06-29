import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number, options?: { compact?: boolean; signed?: boolean }) {
  const sign = options?.signed && value > 0 ? "+" : "";

  if (options?.compact && Math.abs(value) >= 10000) {
    return `${sign}${(value / 10000).toFixed(2)}万`;
  }

  return `${sign}${new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)}`;
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
  if (value > 0) return "text-matrix-red";
  if (value < 0) return "text-matrix-green";
  return "text-matrix-muted";
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

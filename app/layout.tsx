import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileShell } from "@/components/shell/mobile-shell";

export const metadata: Metadata = {
  title: "Janet Matrix | Personal Investment Ledger",
  description: "个人投资收益记录与持仓查看工具",
  applicationName: "Janet Matrix",
  appleWebApp: {
    capable: true,
    title: "Janet Matrix",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f7f8fa",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}

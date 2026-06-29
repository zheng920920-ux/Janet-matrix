import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileShell } from "@/components/shell/mobile-shell";

export const metadata: Metadata = {
  title: "AI Matrix | 个人投资管理",
  description: "移动端优先的个人投资 AI Matrix mock 系统",
  applicationName: "AI Matrix",
  appleWebApp: {
    capable: true,
    title: "AI Matrix",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f5f7f2",
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

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "다음 생 · NextLife",
  description:
    "지금까지의 경험에서 다음 도전에 가져갈 방법을 찾고, 작은 실험으로 확인하는 앱입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-(--color-bg) text-(--color-text)">
        <ScrollProgressBar />
        {children}
      </body>
    </html>
  );
}

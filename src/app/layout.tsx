import type { Metadata } from "next";
import { Geist, Noto_Sans_KR, Poppins, Geist_Mono } from "next/font/google";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import "./globals.css";

// Body text: Noto Sans KR carries both Hangul and Latin at every weight.
const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  preload: false,
});

// Display: a geometric Latin face for large titles and numerals; Hangul in
// the same heading falls back to Noto Sans KR.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// The landing hero title keeps its original Geist face and weight.
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
      className={`${notoSansKr.variable} ${poppins.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-(--color-bg) text-(--color-text)">
        <ScrollProgressBar />
        {children}
      </body>
    </html>
  );
}

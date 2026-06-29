import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "git-document-viewer",
  description: "GitHub 저장소의 Markdown/Obsidian 문서를 읽는 개인/팀용 뷰어",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}

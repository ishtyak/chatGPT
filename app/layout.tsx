import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Softkey AI",
  description: "AI-powered assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`min-h-full flex flex-col ${montserrat.variable} font-sans`} style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

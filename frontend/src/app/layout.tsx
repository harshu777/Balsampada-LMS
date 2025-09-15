import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tuition LMS - Online & Offline Learning Platform",
  description: "Comprehensive learning management system for students and teachers with multi-class, multi-subject functionality",
  keywords: "tuition, lms, learning, education, online classes, teachers, students",
  authors: [{ name: "Tuition LMS" }],
  openGraph: {
    title: "Tuition LMS - Online & Offline Learning Platform",
    description: "Comprehensive learning management system for students and teachers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}

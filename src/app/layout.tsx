import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import Link from "next/link"; // <-- 1. Import Link

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Sistem Absensi Karyawan",
  description: "Aplikasi fullstack untuk absensi karyawan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Toaster position="top-center" reverseOrder={false} />
        
        {/* 2. Tambahkan Header dan Navigasi */}
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between">
            <Link href="/" className="font-bold">Sistem Absensi</Link>
            <nav className="flex items-center space-x-4">
              <Link href="/departments" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Departemen
              </Link>
              <Link href="/employees" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Karyawan
              </Link>
             <Link href="/attendance" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Absensi
            </Link>
             <Link href="/attendance-log" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Log Absensi
          </Link>
           <Link href="/manual-entry" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
    Entri Manual
  </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
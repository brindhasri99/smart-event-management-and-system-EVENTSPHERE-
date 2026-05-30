import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "react-hot-toast"
import { Navbar } from "@/components/Navbar"
import { ThemeProvider } from "@/components/ThemeProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "EventSphere AI",
  description: "Smart event registration, waitlists, QR check-in, and capacity forecasting.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <ThemeProvider>
          <Navbar />
          {children}
          <Toaster position="top-right" toastOptions={{ style: { border: "1px solid #E2E8F0" } }} />
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/components/RoleContext";
import RoleSwitcher from "@/components/RoleSwitcher";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatBot from "@/components/AIChatBot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NAGRIK - Delhi Grievance & Response Interface Kendra",
  description: "AI-Powered Grievance Platform for the Chief Minister of Delhi. Built to ensure transparency, accountability and faster governance in municipal services.",
  keywords: ["NAGRIK", "Delhi Government", "Chief Minister Delhi", "Grievance Portal", "NIC Delhi", "Public Grievances"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <RoleProvider>
          <RoleSwitcher />
          <Navbar />
          <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
          <AIChatBot />
        </RoleProvider>
      </body>
    </html>
  );
}

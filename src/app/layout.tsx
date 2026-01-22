import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserRoleProvider } from "@/contexts/UserRoleContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ConfirmProvider } from "@/contexts/ConfirmContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hana Mindcare",
  description: "Professional counseling management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ConfirmProvider>
            <UserRoleProvider>
              <BrandingProvider>
                {children}
              </BrandingProvider>
            </UserRoleProvider>
          </ConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

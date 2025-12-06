import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { Inter } from 'next/font/google'
import { RecaptchaLogo } from "@/components/RecaptchaLogo";
import { ConfirmDialogProvider } from "@/context/dashboard/useConfirm";
import { LoadingProvider } from "@/context/dashboard/useLoading";

const fetchFont = Inter()
export const metadata: Metadata = {
  title: "Auth Platform",
  description: "Authentication and Authorization Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <head>
        <script
          src="https://www.google.com/recaptcha/api.js?render=6LeMqh0rAAAAAMrCHgQ8cBoqko2xNi8l4FzsEyy_"
          async
          defer
        ></script>
      </head>
      <body
        // className={`${interFont.variable} ${atkinsonFont.variable} ${manropeFont.variable} ${outfitFont.variable} ${plusJakartaSans.variable} ${recursiveFont.variable} antialiased text-zinc-600 font-family-display`}
        className={`${fetchFont.className} antialiased text-zinc-600 font-family-display`}
      >
        <Providers>
          <LoadingProvider>
            <ConfirmDialogProvider>
              {children}
            </ConfirmDialogProvider>
          </LoadingProvider>
        </Providers>
        <Toaster />
        {/* Custom reCAPTCHA logo with 30% opacity */}
        <RecaptchaLogo />
      </body>
    </html>
  );
}
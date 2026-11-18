import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from 'next/font/google';
import React from 'react';
import { Toaster } from 'sonner';
import { SiteShell } from '@/components/layout/SiteShell';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SalonBook — Salon Appointment Booking Platform',
  description:
    'Explore curated hair, skincare, and spa services, request conflict-free appointments online, and pay securely through Stripe once confirmed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#0B0F14] font-sans text-[#F4F6F8] antialiased">
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: '#121922',
                border: '1px solid rgba(244,246,248,0.18)',
                color: '#F4F6F8',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Cinzel, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import React from 'react';
import { Toaster } from 'sonner';
import { SiteShell } from '@/components/layout/SiteShell';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SalonBook — Maison Salon Appointment Booking',
  description:
    'Explore curated hair, skincare, and restorative spa services, request conflict-free appointments online, and pay securely through Stripe once confirmed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${hanken.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#F4EFE6] font-sans text-[#16261F] antialiased">
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
          <Toaster
            position="top-right"
            theme="light"
            toastOptions={{
              style: {
                background: '#FBF9F5',
                border: '1px solid #B5893D',
                color: '#16261F',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

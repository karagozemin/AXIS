import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'AXIS | The Center of Private Finance',
  description: 'Under-collateralized, privacy-preserving lending powered by Zero-Knowledge Proofs on Aleo. Access liquidity without exposing your financial history.',
  keywords: ['DeFi', 'Privacy', 'Zero-Knowledge', 'Lending', 'Aleo', 'ZK Proofs', 'Under-collateralized'],
  authors: [{ name: 'AXIS Team' }],
  openGraph: {
    title: 'AXIS | The Center of Private Finance',
    description: 'Under-collateralized, privacy-preserving lending powered by Zero-Knowledge Proofs.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AXIS | The Center of Private Finance',
    description: 'Under-collateralized, privacy-preserving lending powered by Zero-Knowledge Proofs.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        {/* Noise texture overlay for depth */}
        <div className="noise-overlay fixed inset-0 pointer-events-none z-50" />
        
        {/* Main content */}
        {children}
      </body>
    </html>
  );
}

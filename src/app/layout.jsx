'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-600 text-white p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Learn Lithuanian
            </Link>
            <div className="space-x-4">
              <Link href="/flashcards" className="hover:text-blue-200">
                Flashcards
              </Link>
              <Link href="/quiz" className="hover:text-blue-200">
                Quiz
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
} 
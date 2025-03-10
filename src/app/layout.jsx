'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-600 text-white p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link 
              href="/" 
              className="text-xl font-bold hover:text-blue-200 transition-colors relative group"
            >
              <span className="hidden sm:inline">Learn Lithuanian</span>
              <span className="sm:hidden">LLT</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-200 transition-all group-hover:w-full"></span>
            </Link>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="space-x-2 sm:space-x-4 flex items-center">
                <Link 
                  href="/flashcards" 
                  className={`relative px-3 py-1 rounded-md transition-all hover:bg-white/10 ${
                    pathname === '/flashcards' ? 'text-blue-200 font-medium' : ''
                  }`}
                >
                  <span>Flashcards</span>
                  {pathname === '/flashcards' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-200"></span>
                  )}
                </Link>
                <Link 
                  href="/quiz" 
                  className={`relative px-3 py-1 rounded-md transition-all hover:bg-white/10 ${
                    pathname === '/quiz' ? 'text-blue-200 font-medium' : ''
                  }`}
                >
                  <span>Quiz</span>
                  {pathname === '/quiz' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-200"></span>
                  )}
                </Link>
              </div>
              <a
                href="https://www.buymeacoffee.com/ivan.k"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg flex items-center justify-center transition-all hover:scale-105 hover:shadow-md"
                title="Buy me a coffee"
              >
                <span className="sm:hidden w-10 h-10 flex items-center justify-center text-xl">☕️</span>
                <span className="hidden sm:flex items-center space-x-2 px-3 py-1">
                  <span className="text-base">☕️</span>
                  <span>Support</span>
                </span>
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
} 
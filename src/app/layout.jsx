"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TopicProvider } from "@/contexts/TopicContext";
import { StoreProvider, useStore } from "@/contexts/StoreContext";
import LanguageSelector from "@/components/LanguageSelector";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const isDevelopment = process.env.NODE_ENV === "development";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <LanguageProvider>
            <TopicProvider>
              <div className="min-h-screen flex flex-col">
                <header className="bg-blue-600 text-white shadow-md">
                  <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14">
                      <div className="flex items-center">
                        <Link
                          href="/"
                          className="text-lg font-bold hover:text-blue-200 transition-colors relative group"
                        >
                          <span className="hidden md:inline">
                            Learn Lithuanian
                          </span>
                          <span className="md:hidden text-[12px] font-medium px-1.5 py-0.5 bg-white/10 rounded tracking-wider">
                            LLT
                          </span>
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-200 transition-all group-hover:w-full md:block hidden"></span>
                        </Link>
                      </div>
                      <Navigation />
                    </div>
                  </nav>
                </header>
                <main className="flex-grow">{children}</main>
              </div>
            </TopicProvider>
          </LanguageProvider>
        </StoreProvider>
        {!isDevelopment && <Analytics />}
      </body>
    </html>
  );
}

function Navigation() {
  const pathname = usePathname();
  const { user, loading } = useStore();

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <Link
          href="/flashcards"
          className={`relative px-2 py-1 rounded-md transition-all hover:bg-white/10 ${
            pathname === "/flashcards" ? "text-blue-200 font-medium" : ""
          }`}
        >
          <span className="text-xs">Cards</span>
          {pathname === "/flashcards" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-200"></span>
          )}
        </Link>
        <Link
          href="/quiz"
          className={`relative px-2 py-1 rounded-md transition-all hover:bg-white/10 ${
            pathname === "/quiz" ? "text-blue-200 font-medium" : ""
          }`}
        >
          <span className="text-xs">Quiz</span>
          {pathname === "/quiz" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-200"></span>
          )}
        </Link>
        <Link
          href="/typing"
          className={`relative px-2 py-1 rounded-md transition-all hover:bg-white/10 ${
            pathname === "/typing" ? "text-blue-200 font-medium" : ""
          }`}
        >
          <span className="text-xs whitespace-nowrap">Spell It!</span>
          {pathname === "/typing" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-200"></span>
          )}
        </Link>
        <Link
          href={user?.isPremium ? "/dialogue" : "#"}
          className={`relative px-2 py-1 rounded-md transition-all hover:bg-white/10 ${
            pathname === "/dialogue" ? "text-blue-200 font-medium" : ""
          } ${!user?.isPremium ? "cursor-not-allowed opacity-75" : ""}`}
          onClick={(e) => {
            if (!user?.isPremium) {
              e.preventDefault();
              // You can add a tooltip or modal here to explain premium features
            }
          }}
        >
          <span className="text-xs flex items-center gap-1">
            Chat
            <span
              className={`text-[8px] px-1 py-0.5 rounded-full font-medium ${
                loading
                  ? "bg-gray-400 text-white"
                  : user?.isPremium
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-500 text-white"
              }`}
            >
              {loading ? "..." : "PRO"}
            </span>
          </span>
          {pathname === "/dialogue" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-200"></span>
          )}
        </Link>
        <LanguageSelector />
        <a
          href="https://www.buymeacoffee.com/ivan.k"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-500 hover:bg-yellow-400 text-black rounded-md flex items-center justify-center transition-all hover:scale-105 hover:shadow-md"
          title="Buy me a coffee"
        >
          <span className="sm:hidden w-8 h-8 flex items-center justify-center text-lg">
            ☕️
          </span>
          <span className="hidden sm:flex items-center space-x-1.5 px-2 py-1">
            <span className="text-sm">☕️</span>
            <span className="text-xs">Support</span>
          </span>
        </a>
      </div>
    </div>
  );
}

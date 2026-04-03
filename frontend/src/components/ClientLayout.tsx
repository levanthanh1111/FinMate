'use client';

import { useState } from 'react';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import CurrencySelector from '@/components/CurrencySelector';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/investments', label: 'Investments' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/categories', label: 'Categories' },
  { href: '/reports', label: 'Reports' },
];

function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-sky-50 text-sky-700'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {label}
    </Link>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-sm">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex h-14 md:h-16 items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 tracking-tight">
                <span className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white text-sm font-semibold"></span>
                FinMate
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                  />
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <CurrencySelector />
                <button
                  type="button"
                  className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </header>

        <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </main>

        <footer className="mt-auto border-t border-slate-200 bg-white/80 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} FinMate — Personal Finance Tracker
          </div>
        </footer>
      </div>
    </CurrencyProvider>
  );
}

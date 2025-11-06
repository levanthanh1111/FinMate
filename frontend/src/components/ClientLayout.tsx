'use client';

import { CurrencyProvider } from '@/lib/CurrencyContext';
import CurrencySelector from '@/components/CurrencySelector';
import Link from 'next/link';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white text-gray-800 p-4 shadow-sm border-b border-gray-200">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              FinMate
            </Link>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:block">
                <ul className="flex space-x-6">
                  <li><Link href="/" className="hover:text-blue-200 transition-colors font-medium">Dashboard</Link></li>
                  <li><Link href="/expenses" className="hover:text-blue-200 transition-colors font-medium">Expenses</Link></li>
                  <li><Link href="/reports" className="hover:text-blue-200 transition-colors font-medium">Reports</Link></li>
                </ul>
              </nav>
              <CurrencySelector />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 md:px-6">
          {children}
        </main>
        <footer className="bg-gray-100 p-6 text-center text-gray-600 mt-8 border-t border-gray-200">
          <p>© {new Date().getFullYear()} FinMate - Personal Finance Tracker</p>
        </footer>
      </div>
    </CurrencyProvider>
  );
}
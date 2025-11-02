import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinMate - Personal Finance Tracker',
  description: 'Track your expenses and manage your finances with FinMate',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">FinMate</h1>
              <nav>
                <ul className="flex space-x-4">
                  <li><a href="/" className="hover:underline">Dashboard</a></li>
                  <li><a href="/expenses" className="hover:underline">Expenses</a></li>
                  <li><a href="/reports" className="hover:underline">Reports</a></li>
                </ul>
              </nav>
            </div>
          </header>
          <main className="container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-gray-100 p-4 text-center text-gray-600 mt-8">
            <p>© {new Date().getFullYear()} FinMate - Personal Finance Tracker</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
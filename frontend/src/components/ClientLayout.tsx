'use client';

import { useState } from 'react';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import CurrencySelector from '@/components/CurrencySelector';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const primaryNavItems = [
  { href: '/', label: 'Dashboard', icon: 'grid' },
  { href: '/expenses', label: 'Transactions', icon: 'receipt' },
  { href: '/reports', label: 'Reports', icon: 'chart' },
  { href: '/investments', label: 'Investments', icon: 'wallet' },
  { href: '/categories', label: 'Categories', icon: 'tag' },
];

const utilityNavItems = [
  { href: '/expenses/add', label: 'Add Transaction', icon: 'plus', primary: true },
  { href: '/categories', label: 'Manage Labels', icon: 'settings' },
];

function Icon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  const common = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24',
  };

  switch (type) {
    case 'grid':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 5.5h6v6h-6zm9 0h6v6h-6zm-9 9h6v6h-6zm9 0h6v6h-6z" />
        </svg>
      );
    case 'receipt':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 3.75h10a1 1 0 011 1v15.5l-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5V4.75a1 1 0 011-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 8.25h8M8 12h8M8 15.75h5" />
        </svg>
      );
    case 'wallet':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7.75A1.75 1.75 0 015.75 6h10.5A1.75 1.75 0 0118 7.75v8.5A1.75 1.75 0 0116.25 18H5.75A1.75 1.75 0 014 16.25z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12h4.5v3.25A1.75 1.75 0 0117.75 17H15z" />
          <circle cx="16.8" cy="13.55" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.75 19.25h14.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7.25 16V9.5M12 16V6.5M16.75 16v-4.75" />
        </svg>
      );
    case 'tag':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 4.75H6.75A1.75 1.75 0 005 6.5v4.25a1.75 1.75 0 00.51 1.24l6.75 6.75a1.75 1.75 0 002.48 0l3-3a1.75 1.75 0 000-2.48l-6.75-6.75A1.75 1.75 0 0011 4.75z" />
          <circle cx="8.25" cy="8.25" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5.5v13M5.5 12h13" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.5 3.75h3l.57 2.01a6.78 6.78 0 011.52.88l1.96-.84 1.5 2.6-1.39 1.59c.08.4.13.81.13 1.24 0 .43-.05.84-.13 1.24l1.39 1.59-1.5 2.6-1.96-.84c-.47.35-.98.65-1.52.88l-.57 2.01h-3l-.57-2.01a6.78 6.78 0 01-1.52-.88l-1.96.84-1.5-2.6 1.39-1.59A6.4 6.4 0 016.25 12c0-.43.05-.84.13-1.24L4.99 9.17l1.5-2.6 1.96.84c.47-.35.98-.65 1.52-.88z" />
          <circle cx="12" cy="12" r="2.2" />
        </svg>
      );
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="5.2" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 15l4 4" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.5 18.25h5M7.5 16.25h9c-.74-.8-1.25-2.25-1.25-4V10.5a3.25 3.25 0 10-6.5 0v1.75c0 1.75-.51 3.2-1.25 4z" />
        </svg>
      );
    case 'panel':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.75 5.5h5.5v13h-5.5zm9 0h5.5v6.25h-5.5zm0 9h5.5v4h-5.5z" />
        </svg>
      );
    default:
      return null;
  }
}

function DesktopNavLink({ href, label, icon, isActive }: { href: string; label: string; icon: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-3 rounded-[1.2rem] px-4 py-3 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-white text-slate-900 shadow-[0_10px_25px_rgba(25,28,29,0.06)]'
          : 'text-slate-500 hover:bg-white/70 hover:text-slate-900',
      ].join(' ')}
    >
      <span className={isActive ? 'text-blue-700' : 'text-slate-400'}>
        <Icon type={icon} className="h-5 w-5" />
      </span>
      <span>{label}</span>
    </Link>
  );
}

function UtilityLink({ href, label, icon, primary = false }: { href: string; label: string; icon: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={[
        'flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200',
        primary
          ? 'bg-[linear-gradient(135deg,#0040A1_0%,#0056D2_100%)] text-white shadow-[0_14px_30px_rgba(0,86,210,0.24)] hover:scale-[1.01]'
          : 'bg-white/78 text-slate-700 hover:bg-white',
      ].join(' ')}
    >
      <Icon type={icon} className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-transparent text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-[1680px] gap-6 px-4 py-4 md:px-6 md:py-6">
          <aside className="editorial-panel sticky top-6 hidden h-[calc(100vh-3rem)] w-[290px] shrink-0 flex-col overflow-hidden !p-4 xl:flex">
            <div className="flex h-full flex-col">
              <div className="rounded-[1.7rem] bg-white/88 px-4 py-4">
                <Link href="/" className="flex items-center gap-3 text-slate-900">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-[linear-gradient(135deg,#0040A1_0%,#0056D2_100%)] text-sm font-semibold text-white shadow-md">
                    FM
                  </span>
                  <span>
                    <span className="block font-[family:var(--font-manrope)] text-xl font-semibold tracking-[-0.04em]">FinMate</span>
                    <span className="mt-1 block text-xs text-slate-400">Finance workspace</span>
                  </span>
                </Link>
              </div>

              <div className="mt-6">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Navigation</p>
                <nav className="mt-3 space-y-2">
                  {primaryNavItems.map((item) => (
                    <DesktopNavLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    />
                  ))}
                </nav>
              </div>

              <div className="mt-6 space-y-3">
                {utilityNavItems.map((item) => (
                  <UtilityLink key={item.href} href={item.href} label={item.label} icon={item.icon} primary={item.primary} />
                ))}
              </div>

              <div className="mt-auto space-y-3">
                <div className="rounded-[1.6rem] bg-white/84 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Workspace</p>
                  <p className="mt-3 font-[family:var(--font-manrope)] text-xl font-semibold tracking-[-0.04em] text-slate-900">Calm finance control</p>
                </div>

                <div className="rounded-[1.6rem] bg-slate-100/78 px-4 py-4 text-sm text-slate-500">
                  © {new Date().getFullYear()} FinMate
                </div>
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="editorial-panel relative z-[90] mb-6 !py-4 md:mb-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 xl:hidden">
                    <Link href="/" className="flex items-center gap-3 text-slate-900">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0040A1_0%,#0056D2_100%)] text-sm font-semibold text-white shadow-md">
                        FM
                      </span>
                      <span>
                        <span className="block font-[family:var(--font-manrope)] text-xl font-semibold tracking-[-0.04em]">FinMate</span>
                        <span className="eyebrow mt-1 block text-[10px] text-slate-400">Personal Finance Atelier</span>
                      </span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    className="rounded-full bg-white/80 p-2 text-slate-600 hover:bg-white xl:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {mobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </div>

                <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
                  <div className="flex w-full max-w-md items-center gap-3 rounded-full bg-slate-100/82 px-4 py-3 text-sm text-slate-500">
                    <Icon type="search" className="h-4 w-4 text-slate-400" />
                    <span className="clamp-1">Search transactions or reports</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button type="button" className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/84 text-slate-500 transition-colors hover:text-slate-900 md:inline-flex">
                    <Icon type="bell" className="h-5 w-5" />
                  </button>
                  <button type="button" className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/84 text-slate-500 transition-colors hover:text-slate-900 md:inline-flex">
                    <Icon type="panel" className="h-5 w-5" />
                  </button>
                  <CurrencySelector />
                </div>
              </div>

              {mobileMenuOpen && (
                <div className="mt-4 space-y-3 rounded-[1.5rem] bg-slate-100/80 p-3 xl:hidden">
                  {primaryNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={[
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                        pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                          ? 'bg-white text-slate-900'
                          : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
                      ].join(' ')}
                    >
                      <Icon type={item.icon} className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <div className="grid gap-3 pt-2 md:grid-cols-2">
                    {utilityNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={[
                          'flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200',
                          item.primary
                            ? 'bg-[linear-gradient(135deg,#0040A1_0%,#0056D2_100%)] text-white'
                            : 'bg-white/78 text-slate-700',
                        ].join(' ')}
                      >
                        <Icon type={item.icon} className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </header>

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </CurrencyProvider>
  );
}

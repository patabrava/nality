'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type AdminAccessPayload = {
  isAdmin: boolean;
  email: string | null;
};

type NavItem = {
  href: string;
  label: string;
  matches: (pathname: string) => boolean;
};

const baseItems: NavItem[] = [
  {
    href: '/dash',
    label: 'Übersicht',
    matches: (pathname) => pathname === '/dash',
  },
  {
    href: '/dash/chapters',
    label: 'Kapitel',
    matches: (pathname) => pathname.startsWith('/dash/chapters'),
  },
  {
    href: '/dash/biography',
    label: 'Biografie',
    matches: (pathname) => pathname.startsWith('/dash/biography') || pathname.startsWith('/chat'),
  },
  {
    href: '/dash/contact',
    label: 'Kontakt',
    matches: (pathname) => pathname.startsWith('/dash/contact'),
  },
];

const adminItem: NavItem = {
  href: '/admin',
  label: 'Verwaltung',
  matches: (pathname) => pathname.startsWith('/admin'),
};

async function fetchAdminAccess(signal: AbortSignal): Promise<AdminAccessPayload | null> {
  const response = await fetch('/api/admin/access', {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { data?: AdminAccessPayload };
  return payload.data ?? null;
}

function navLinkClass(isActive: boolean) {
  return isActive ? 'nav-link nav-link--active' : 'nav-link nav-link--inactive';
}

export function AppHeader() {
  const pathname = usePathname() ?? '';
  const [isAdmin, setIsAdmin] = useState(pathname.startsWith('/admin'));

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setIsAdmin(true);
      return;
    }

    const controller = new AbortController();
    void fetchAdminAccess(controller.signal)
      .then((payload) => {
        setIsAdmin(Boolean(payload?.isAdmin));
      })
      .catch(() => {
        setIsAdmin(false);
      });

    return () => controller.abort();
  }, [pathname]);

  const items = isAdmin ? [...baseItems, adminItem] : baseItems;

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__row">
          <Link href="/" className="app-header__brand">
            <span className="app-header__wordmark">
              NALITY
            </span>
            <span className="app-header__mark">®</span>
          </Link>

          <nav className="app-header__nav app-header__nav--desktop">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.matches(pathname) ? 'page' : undefined}
                className={navLinkClass(item.matches(pathname))}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="app-header__actions">
            {isAdmin ? (
                <span className="app-header__staff-badge">
                Teamzugang
              </span>
            ) : null}
            <Link
              href="/dash/profile"
              className="app-header__profile"
            >
              Profil
            </Link>
          </div>
        </div>

        <nav className="app-header__nav app-header__nav--mobile">
          {items.map((item) => (
            <Link
              key={`${item.href}-mobile`}
              href={item.href}
              aria-current={item.matches(pathname) ? 'page' : undefined}
              className={navLinkClass(item.matches(pathname))}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <style jsx global>{`
        .app-header {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(5, 5, 5, 0.92);
          backdrop-filter: blur(24px);
        }

        .app-header__inner {
          max-width: 80rem;
          margin: 0 auto;
          padding: 12px 16px;
        }

        .app-header__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .app-header__brand {
          display: inline-flex;
          align-items: baseline;
          gap: 4px;
          color: inherit;
          text-decoration: none;
        }

        .app-header__brand:hover .app-header__wordmark {
          color: #f0d38c;
        }

        .app-header__wordmark {
          font-family: var(--font-serif, "Playfair Display", serif);
          font-size: 1.5rem;
          letter-spacing: -0.02em;
          color: #ffffff;
          transition: color 0.2s ease;
        }

        .app-header__mark {
          font-size: 0.75rem;
          color: #d4af37;
        }

        .app-header__nav {
          gap: 8px;
        }

        .app-header__nav--desktop {
          display: none;
          align-items: center;
        }

        .app-header__nav--mobile {
          display: flex;
          overflow-x: auto;
          padding-top: 12px;
          padding-bottom: 4px;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }

        .nav-link--active {
          border-color: rgba(212, 175, 55, 0.5);
          background: rgba(212, 175, 55, 0.12);
          color: #f3d98a;
        }

        .nav-link--inactive {
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.68);
        }

        .nav-link--inactive:hover {
          border-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .app-header__actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .app-header__staff-badge {
          display: none;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.1);
          padding: 4px 12px;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #f0d38c;
        }

        .app-header__profile {
          display: inline-flex;
          align-items: center;
          height: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          padding: 0 16px;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: border-color 0.2s ease, color 0.2s ease;
        }

        .app-header__profile:hover {
          border-color: rgba(212, 175, 55, 0.3);
          color: #ffffff;
        }

        .app-header__brand:focus-visible,
        .nav-link:focus-visible,
        .app-header__profile:focus-visible {
          outline: 2px solid #d4af37;
          outline-offset: 2px;
        }

        @media (min-width: 768px) {
          .app-header__inner {
            padding-left: 24px;
            padding-right: 24px;
          }

          .app-header__nav--desktop {
            display: flex;
          }

          .app-header__nav--mobile {
            display: none;
          }
        }

        @media (min-width: 1024px) {
          .app-header__staff-badge {
            display: inline-flex;
          }
        }
      `}</style>
    </header>
  );
}

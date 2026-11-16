'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export interface NavbarProps {
  ideasCount?: number;
  duplicatesCount?: number;
  shortlistCount?: number;
  onOpenImport?: () => void;
  onResetData?: () => void;
  onClearData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  ideasCount = 0,
  duplicatesCount = 0,
  shortlistCount = 0,
  onOpenImport,
  onResetData,
  onClearData,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const navLinks = [
    { href: '/', label: 'Toutes les idees', count: ideasCount },
    { href: '/duplicates', label: 'Gestion des doublons', count: duplicatesCount, alert: duplicatesCount > 0 },
    { href: '/shortlist', label: 'Shortlist du Jury', count: shortlistCount, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et Identite */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
                H
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block leading-none">
                  HEXAVIA
                </span>
                <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                  Challenge Innovation
                </span>
              </div>
            </Link>

            {/* Navigation principale */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>{link.label}</span>
                    {typeof link.count === 'number' && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          link.alert
                            ? 'bg-orange-100 text-orange-700'
                            : link.highlight
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {link.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions utilisateur et outils */}
          <div className="flex items-center gap-2.5">
            {onOpenImport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenImport}
                leftIcon={
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                }
              >
                Importer CSV
              </Button>
            )}

            {onResetData && (
              <button
                type="button"
                onClick={onResetData}
                title="Recharger le jeu d idees Hexavia initial (40 idees)"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reinitialiser (40)</span>
              </button>
            )}

            {onClearData && (
              <button
                type="button"
                onClick={onClearData}
                title="Vider la liste pour tester l etat vide"
                className="hidden lg:inline-flex items-center px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                Vider
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              title="Se deconnecter de l application"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Deconnexion"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

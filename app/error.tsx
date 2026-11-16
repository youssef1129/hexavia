'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur applicative capturée :', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
      <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">Une erreur inattendue est survenue</h2>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed">
        {error.message || 'Une anomalie a interrompu le traitement. Veuillez reessayer.'}
      </p>
      <div className="flex gap-3">
        <Button variant="primary" onClick={() => reset()}>
          Reessayer
        </Button>
        <Link
          href="/"
          className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-3.5 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
        >
          Retour a l accueil
        </Link>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, ErrorMessage } from '@/components/ui';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Mot de passe incorrect.');
        return;
      }

      router.push(redirectPath);
      router.refresh();
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg mb-3">
          H
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">HEXAVIA</h1>
        <p className="mt-1 text-sm text-slate-400">
          Plateforme d arbitrage et d evaluation du Challenge Innovation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <ErrorMessage
                message={error}
                onDismiss={() => setError(null)}
              />
            )}

            <div>
              <Input
                label="Mot de passe d acces"
                type="password"
                required
                autoFocus
                placeholder="Entrez le mot de passe consultant..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Protection des donnees salariees Hexavia (RGPD)"
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Acceder a l espace de travail
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Espace securise reserve a Camille et au jury d evaluation Hexavia.
          </div>
        </div>
      </div>
    </div>
  );
}

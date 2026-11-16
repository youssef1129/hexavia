import { Spinner } from '@/components/ui';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-sm font-semibold text-slate-700">Chargement de l espace Hexavia...</p>
      <p className="text-xs text-slate-400 mt-1">Calcul des evaluations et synchronisation des idees.</p>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Idea, DuplicatePair, DuplicateStatus } from '@/types/idea';
import { Badge, Button, Card, CardHeader, CardBody, CardFooter } from '@/components/ui';
import { formatBudget } from '@/lib/budget-parser';

export interface DuplicateReviewProps {
  duplicatePairs: DuplicatePair[];
  ideas: Idea[];
  onUpdateStatus: (pairId: string, status: DuplicateStatus) => Promise<void>;
  onSelectIdea: (idea: Idea) => void;
}

export const DuplicateReview: React.FC<DuplicateReviewProps> = ({
  duplicatePairs,
  ideas,
  onUpdateStatus,
  onSelectIdea,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');
  const [loadingPairId, setLoadingPairId] = useState<string | null>(null);

  const ideaMap = new Map<string, Idea>();
  ideas.forEach((i) => ideaMap.set(i.id, i));

  const filteredPairs = duplicatePairs.filter((pair) => {
    if (filterStatus === 'all') return true;
    return pair.status === filterStatus;
  });

  const pendingCount = duplicatePairs.filter((p) => p.status === 'pending').length;
  const confirmedCount = duplicatePairs.filter((p) => p.status === 'confirmed').length;
  const rejectedCount = duplicatePairs.filter((p) => p.status === 'rejected').length;

  const handleStatusChange = async (pairId: string, status: DuplicateStatus) => {
    setLoadingPairId(pairId);
    try {
      await onUpdateStatus(pairId, status);
    } finally {
      setLoadingPairId(null);
    }
  };

  if (duplicatePairs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-8">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-900">Aucun doublon detecte</h3>
        <p className="text-xs text-slate-500 mt-1">
          Toutes les idees semblent distinctes selon les criteres d analyse de contenu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre de synthese et filtres */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Detection et arbitrage des doublons
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            L IA signale les similarites fortes. Validez ou ecartez chaque proposition : aucune suppression n est automatique.
          </p>
        </div>

        {/* Boutons d onglets de statut */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({duplicatePairs.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'pending'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A traiter ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('confirmed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'confirmed'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Confirmes ({confirmedCount})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'rejected'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ecartes ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Liste des paires de doublons */}
      <div className="space-y-5">
        {filteredPairs.map((pair) => {
          const ideaA = ideaMap.get(pair.ideaAId);
          const ideaB = ideaMap.get(pair.ideaBId);
          const isLoading = loadingPairId === pair.id;

          if (!ideaA || !ideaB) return null;

          const scoreA = ideaA.consultantEvaluation?.total ?? ideaA.aiEvaluation?.total ?? 0;
          const scoreB = ideaB.consultantEvaluation?.total ?? ideaB.aiEvaluation?.total ?? 0;

          return (
            <Card key={pair.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Badge variant={pair.type === 'exact' ? 'danger' : 'warning'}>
                    {pair.type === 'exact' ? 'Doublon exact (100 %)' : `Doublon proche (${Math.round(pair.confidence * 100)} %)`}
                  </Badge>
                  <span className="text-xs text-slate-600 font-medium">{pair.reason}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Statut :</span>
                  {pair.status === 'confirmed' && (
                    <Badge variant="success">Doublon confirme</Badge>
                  )}
                  {pair.status === 'rejected' && (
                    <Badge variant="neutral">Ecarte (idees distinctes)</Badge>
                  )}
                  {pair.status === 'pending' && (
                    <Badge variant="warning">En attente d arbitrage</Badge>
                  )}
                </div>
              </CardHeader>

              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  {/* Idee A */}
                  <div
                    onClick={() => onSelectIdea(ideaA)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-600">{ideaA.id}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                        Note : {scoreA}/20
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1.5">{ideaA.titre}</h4>
                    <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                      {ideaA.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>{ideaA.prenom} {ideaA.nom}</span>
                      <span>•</span>
                      <span>{ideaA.direction} ({ideaA.site})</span>
                      <span>•</span>
                      <span>{formatBudget(ideaA.budget)}</span>
                    </div>
                  </div>

                  {/* Idee B */}
                  <div
                    onClick={() => onSelectIdea(ideaB)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-600">{ideaB.id}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                        Note : {scoreB}/20
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1.5">{ideaB.titre}</h4>
                    <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                      {ideaB.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>{ideaB.prenom} {ideaB.nom}</span>
                      <span>•</span>
                      <span>{ideaB.direction} ({ideaB.site})</span>
                      <span>•</span>
                      <span>{formatBudget(ideaB.budget)}</span>
                    </div>
                  </div>
                </div>

                {pair.status === 'confirmed' && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>
                      Doublon valide par Camille : seule la meilleure idee ({scoreA >= scoreB ? ideaA.id : ideaB.id}) sera retenue dans la shortlist automatique pour le jury.
                    </span>
                  </div>
                )}
              </CardBody>

              <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Cliquez sur l une des fiches pour voir l evaluation complete.
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={pair.status === 'confirmed' ? 'primary' : 'outline'}
                    size="sm"
                    isLoading={isLoading}
                    onClick={() => handleStatusChange(pair.id, 'confirmed')}
                  >
                    Confirmer le doublon
                  </Button>
                  <Button
                    variant={pair.status === 'rejected' ? 'secondary' : 'outline'}
                    size="sm"
                    isLoading={isLoading}
                    onClick={() => handleStatusChange(pair.id, 'rejected')}
                  >
                    Rejeter (distinctes)
                  </Button>
                  {pair.status !== 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      isLoading={isLoading}
                      onClick={() => handleStatusChange(pair.id, 'pending')}
                    >
                      Remettre en attente
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

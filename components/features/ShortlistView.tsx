'use client';

import React, { useState } from 'react';
import { ShortlistItem, Idea } from '@/types/idea';
import { Badge, Button, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui';
import { formatBudget } from '@/lib/budget-parser';

export interface ShortlistViewProps {
  items: ShortlistItem[];
  stats: {
    totalIdeas: number;
    shortlistCount: number;
    averageScore: number;
    totalBudget: number;
    unbudgetedCount: number;
  };
  allIdeas: Idea[];
  onSelectIdea: (idea: Idea) => void;
  onToggleShortlist: (ideaId: string, action: 'add' | 'remove' | 'reset') => Promise<void>;
  onTargetCountChange: (count: number) => Promise<void>;
}

export const ShortlistView: React.FC<ShortlistViewProps> = ({
  items,
  stats,
  allIdeas,
  onSelectIdea,
  onToggleShortlist,
  onTargetCountChange,
}) => {
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const shortlistedIds = new Set(items.map((i) => i.idea.id));
  const availableToAdd = allIdeas.filter((i) => !shortlistedIds.has(i.id));

  const handleAction = async (ideaId: string, action: 'add' | 'remove') => {
    setLoadingId(ideaId);
    try {
      await onToggleShortlist(ideaId, action);
    } finally {
      setLoadingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* En-tete d impression dedie au format PDF / Client */}
      <div className="hidden print-only mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">HEXAVIA</h1>
            <p className="text-sm font-semibold text-slate-700">Challenge Innovation Collaborateurs</p>
            <p className="text-xs text-slate-500">Rapport de Synthese & Shortlist Recommandee pour le Jury</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-semibold">Consultant : Camille</p>
            <p>Date : {new Date().toLocaleDateString('fr-FR')}</p>
            <p>Selection : {stats.shortlistCount} projets retenus</p>
          </div>
        </div>
      </div>

      {/* Cartes de synthese KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Idees retenues
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.shortlistCount}</span>
            <span className="text-xs text-slate-400">sur {stats.totalIdeas}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Note moyenne
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-600">{stats.averageScore}</span>
            <span className="text-xs text-slate-400">/ 20</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Budget estime total
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              }).format(stats.totalBudget)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Incertitudes budget
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600">{stats.unbudgetedCount}</span>
            <span className="text-xs text-slate-400">a cadrer</span>
          </div>
        </div>
      </div>

      {/* Barre d actions d export (masquee a l impression) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Selection des finalistes pour le Jury
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Classement optimise sur la note globale, de-doublonne et personnalisable par Camille.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Reglage du seuil cible */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mr-2">
            <span>Taille cible :</span>
            <select
              value={stats.shortlistCount}
              onChange={(e) => onTargetCountChange(Number(e.target.value))}
              className="rounded-lg border border-slate-300 text-xs py-1 px-2 bg-white"
            >
              {[5, 6, 7, 8, 9, 10, 12].map((num) => (
                <option key={num} value={num}>
                  {num} idees
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddDrawer(!showAddDrawer)}
          >
            {showAddDrawer ? 'Masquer le vivier' : 'Ajouter manuellement une idee'}
          </Button>

          <a
            href="/api/export/csv?type=shortlist"
            download="hexavia_shortlist_jury.csv"
            className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-3.5 py-2 gap-2 bg-slate-800 text-white hover:bg-slate-900 active:bg-slate-950 focus:ring-slate-700 shadow-sm"
          >
            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Telecharger CSV</span>
          </a>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            }
          >
            Imprimer / PDF Client
          </Button>
        </div>
      </div>

      {/* Tableau de la shortlist */}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell className="w-12 text-center">Rang</TableHeaderCell>
            <TableHeaderCell>Projet / Titre</TableHeaderCell>
            <TableHeaderCell>Theme</TableHeaderCell>
            <TableHeaderCell>Porteur & Site</TableHeaderCell>
            <TableHeaderCell>Budget estime</TableHeaderCell>
            <TableHeaderCell className="text-center">Note / 20</TableHeaderCell>
            <TableHeaderCell className="no-print w-24 text-right">Actions</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const isLoading = loadingId === item.idea.id;
            return (
              <TableRow
                key={item.idea.id}
                onClick={() => onSelectIdea(item.idea)}
                highlighted={item.isManuallyAdded}
              >
                {/* Rang */}
                <TableCell className="text-center font-black text-slate-900">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-extrabold">
                    #{item.rank}
                  </span>
                </TableCell>

                {/* Titre */}
                <TableCell>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{item.idea.titre}</span>
                    {item.isManuallyAdded && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 no-print">
                        Ajout manuel
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {item.idea.description}
                  </p>
                </TableCell>

                {/* Theme */}
                <TableCell>
                  <Badge variant="theme" themeName={item.idea.theme} size="sm">
                    {item.idea.theme}
                  </Badge>
                </TableCell>

                {/* Porteur */}
                <TableCell>
                  <div className="text-xs font-semibold text-slate-800">
                    {item.idea.prenom} {item.idea.nom}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {item.idea.direction} • {item.idea.site}
                  </div>
                </TableCell>

                {/* Budget */}
                <TableCell>
                  <span className="text-xs font-semibold text-slate-900">
                    {formatBudget(item.idea.budget)}
                  </span>
                </TableCell>

                {/* Note */}
                <TableCell className="text-center">
                  <div className="inline-flex flex-col items-center">
                    <span className="text-base font-extrabold text-blue-600">
                      {item.effectiveScore}/20
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {item.scoreSource === 'consultant' ? 'Camille' : 'IA'}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="no-print text-right">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(item.idea.id, 'remove');
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Retirer
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Vivier des idees non retenues pour ajout manuel (tiroir masquable) */}
      {showAddDrawer && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 no-print space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Vivier des idees disponibles a l ajout
              </h3>
              <p className="text-xs text-slate-500">
                Vous pouvez repecher n importe quelle idee du challenge pour l integrer a la shortlist.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAddDrawer(false)}>
              Fermer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {availableToAdd.map((idea) => {
              const score = idea.consultantEvaluation?.total ?? idea.aiEvaluation?.total ?? 0;
              const isLoading = loadingId === idea.id;
              return (
                <div
                  key={idea.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600">{idea.id}</span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {idea.titre}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {idea.direction} • {formatBudget(idea.budget)} • Note : {score}/20
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={isLoading}
                    onClick={() => handleAction(idea.id, 'add')}
                  >
                    Ajouter
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mention de conformite pour le client Hexavia a l impression */}
      <div className="hidden print-only mt-8 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">
        Selection finale validee par le cabinet de conseil - Hexavia Challenge Innovation 2026.
      </div>
    </div>
  );
};

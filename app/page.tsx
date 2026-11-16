'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Idea, ScoreCriteria } from '@/types/idea';
import {
  Navbar,
  IdeaFilters,
  FilterState,
  IdeaTable,
  IdeaDetailModal,
  ImportModal,
} from '@/components/features';
import { EmptyState, Toast, Spinner } from '@/components/ui';

export default function HomePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [duplicateCount, setDuplicateCount] = useState<number>(0);
  const [shortlistCount, setShortlistCount] = useState<number>(0);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    direction: '',
    theme: '',
    site: '',
    scoreRange: '',
    sortBy: 'score',
    sortOrder: 'desc',
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/ideas');
      const data = await res.json();
      setIdeas(data.ideas || []);
      setDuplicateCount((data.duplicatePairs || []).length);
      const slItems = data.shortlist?.items || [];
      setShortlistCount(slItems.length);
      setShortlistedIds(new Set(slItems.map((item: { idea: { id: string } }) => item.idea.id)));
    } catch (err) {
      console.error('Erreur chargement idees :', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extraction dynamique des filtres uniques
  const directions = useMemo(() => {
    const set = new Set<string>();
    ideas.forEach((i) => i.direction && set.add(i.direction));
    return Array.from(set).sort();
  }, [ideas]);

  const themes = useMemo(() => {
    const set = new Set<string>();
    ideas.forEach((i) => i.theme && set.add(i.theme));
    return Array.from(set).sort();
  }, [ideas]);

  const sites = useMemo(() => {
    const set = new Set<string>();
    ideas.forEach((i) => i.site && set.add(i.site));
    return Array.from(set).sort();
  }, [ideas]);

  // Filtrage et ordonnancement
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      // 1. Recherche textuelle
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchTitle = idea.titre.toLowerCase().includes(query);
        const matchDesc = idea.description.toLowerCase().includes(query);
        const matchAuthor = `${idea.prenom} ${idea.nom}`.toLowerCase().includes(query);
        const matchId = idea.id.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchAuthor && !matchId) return false;
      }

      // 2. Direction
      if (filters.direction && idea.direction !== filters.direction) return false;

      // 3. Theme
      if (filters.theme && idea.theme !== filters.theme) return false;

      // 4. Site
      if (filters.site && idea.site !== filters.site) return false;

      // 5. Note
      const score = idea.consultantEvaluation?.total ?? idea.aiEvaluation?.total;
      if (filters.scoreRange && typeof score === 'number') {
        if (filters.scoreRange === 'top' && score < 16) return false;
        if (filters.scoreRange === 'good' && (score < 13 || score >= 16)) return false;
        if (filters.scoreRange === 'average' && (score < 10 || score >= 13)) return false;
        if (filters.scoreRange === 'low' && score >= 10) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'score') {
        const scoreA = a.consultantEvaluation?.total ?? a.aiEvaluation?.total ?? 0;
        const scoreB = b.consultantEvaluation?.total ?? b.aiEvaluation?.total ?? 0;
        return filters.sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      }
      if (filters.sortBy === 'budget') {
        const budgetA = a.budget.amount ?? (filters.sortOrder === 'asc' ? 999999999 : -1);
        const budgetB = b.budget.amount ?? (filters.sortOrder === 'asc' ? 999999999 : -1);
        return filters.sortOrder === 'asc' ? budgetA - budgetB : budgetB - budgetA;
      }
      if (filters.sortBy === 'date') {
        return filters.sortOrder === 'asc'
          ? a.dateDepot.localeCompare(b.dateDepot)
          : b.dateDepot.localeCompare(a.dateDepot);
      }
      return filters.sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    });
  }, [ideas, filters]);

  // Sauvegarde d'une note de consultant
  const handleSaveScore = async (ideaId: string, criteria: ScoreCriteria, notes: string) => {
    const res = await fetch(`/api/ideas/${ideaId}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criteria, notes }),
    });

    if (res.ok) {
      const data = await res.json();
      setIdeas((prev) => prev.map((i) => (i.id === ideaId ? data.idea : i)));
      if (selectedIdea?.id === ideaId) {
        setSelectedIdea(data.idea);
      }
      setToastMessage(`Note enregistree pour l idee ${ideaId} !`);
      fetchData(); // Rafraichir la shortlist
    }
  };

  // Bascule dans la shortlist
  const handleToggleShortlist = async (ideaId: string) => {
    const action = shortlistedIds.has(ideaId) ? 'remove' : 'add';
    const res = await fetch('/api/shortlist/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId, action }),
    });

    if (res.ok) {
      setToastMessage(
        action === 'add'
          ? `L idee ${ideaId} a ete ajoutee a la shortlist.`
          : `L idee ${ideaId} a ete retiree de la shortlist.`
      );
      fetchData();
    }
  };

  // Reinitialiser les donnees par defaut Hexavia
  const handleResetData = async () => {
    setIsLoading(true);
    await fetch('/api/ideas/reset', { method: 'POST' });
    await fetchData();
    setToastMessage('Le jeu complet des 40 idees Hexavia a ete reinitialise.');
  };

  // Vider les donnees
  const handleClearData = async () => {
    if (confirm('Etes-vous sur de vouloir vider toutes les idees pour tester l etat vide ?')) {
      setIsLoading(true);
      await fetch('/api/ideas/clear', { method: 'POST' });
      await fetchData();
      setToastMessage('La liste des idees a ete videe.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        ideasCount={ideas.length}
        duplicatesCount={duplicateCount}
        shortlistCount={shortlistCount}
        onOpenImport={() => setIsImportModalOpen(true)}
        onResetData={handleResetData}
        onClearData={handleClearData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : ideas.length === 0 ? (
          <EmptyState
            title="Aucune idee importee"
            message="Commencez par importer le fichier CSV des 40 idees collaborateurs d Hexavia pour activer l evaluation et la selection du jury."
            actionLabel="Charger les 40 idees Hexavia"
            onAction={handleResetData}
            secondaryActionLabel="Importer un autre fichier CSV"
            onSecondaryAction={() => setIsImportModalOpen(true)}
          />
        ) : (
          <div className="space-y-6">
            {/* Titre et resume */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Catalogue des idees collaborateurs
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Consultez les initiatives, appliquez des filtres par direction ou theme, et comparez l analyse IA avec vos notations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  <span className="font-bold text-slate-900">{ideas.length}</span> idees au challenge
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">
                  <span className="font-bold text-blue-600">{shortlistCount}</span> en shortlist
                </span>
              </div>
            </div>

            {/* Filtres et recherche */}
            <IdeaFilters
              filters={filters}
              onChange={setFilters}
              onReset={() =>
                setFilters({
                  search: '',
                  direction: '',
                  theme: '',
                  site: '',
                  scoreRange: '',
                  sortBy: 'score',
                  sortOrder: 'desc',
                })
              }
              directions={directions}
              themes={themes}
              sites={sites}
              totalCount={ideas.length}
              filteredCount={filteredIdeas.length}
            />

            {/* Tableau des idees */}
            <IdeaTable
              ideas={filteredIdeas}
              onSelectIdea={(idea) => setSelectedIdea(idea)}
              shortlistedIds={shortlistedIds}
            />
          </div>
        )}
      </main>

      {/* Modal de detail et de notation */}
      <IdeaDetailModal
        idea={selectedIdea}
        isOpen={Boolean(selectedIdea)}
        onClose={() => setSelectedIdea(null)}
        onSaveScore={handleSaveScore}
        isInShortlist={selectedIdea ? shortlistedIds.has(selectedIdea.id) : false}
        onToggleShortlist={handleToggleShortlist}
      />

      {/* Modal d import */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          fetchData();
          setToastMessage('Import CSV effectue avec succes !');
        }}
        onResetToDefault={handleResetData}
      />

      {/* Toast de notification */}
      <Toast
        isOpen={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

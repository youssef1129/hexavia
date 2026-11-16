'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Idea, DuplicatePair, DuplicateStatus, ScoreCriteria } from '@/types/idea';
import { Navbar, DuplicateReview, IdeaDetailModal, ImportModal } from '@/components/features';
import { Toast, Spinner } from '@/components/ui';

export default function DuplicatesPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [duplicatePairs, setDuplicatePairs] = useState<DuplicatePair[]>([]);
  const [shortlistCount, setShortlistCount] = useState<number>(0);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/ideas');
      const data = await res.json();
      setIdeas(data.ideas || []);
      setDuplicatePairs(data.duplicatePairs || []);
      const slItems = data.shortlist?.items || [];
      setShortlistCount(slItems.length);
      setShortlistedIds(new Set(slItems.map((item: { idea: { id: string } }) => item.idea.id)));
    } catch (err) {
      console.error('Erreur chargement doublons :', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (pairId: string, status: DuplicateStatus) => {
    const res = await fetch(`/api/duplicates/${pairId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setDuplicatePairs((prev) =>
        prev.map((p) => (p.id === pairId ? { ...p, status } : p))
      );
      setToastMessage(
        status === 'confirmed'
          ? 'Doublon confirme : de-doublonnage applique pour la shortlist.'
          : status === 'rejected'
          ? 'Doublon ecarte : idees considerees comme distinctes.'
          : 'Statut du doublon reinitialise.'
      );
      fetchData(); // Recalculer la shortlist
    }
  };

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
      fetchData();
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        ideasCount={ideas.length}
        duplicatesCount={duplicatePairs.length}
        shortlistCount={shortlistCount}
        onOpenImport={() => setIsImportModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <DuplicateReview
            duplicatePairs={duplicatePairs}
            ideas={ideas}
            onUpdateStatus={handleUpdateStatus}
            onSelectIdea={(idea) => setSelectedIdea(idea)}
          />
        )}
      </main>

      <IdeaDetailModal
        idea={selectedIdea}
        isOpen={Boolean(selectedIdea)}
        onClose={() => setSelectedIdea(null)}
        onSaveScore={handleSaveScore}
        isInShortlist={selectedIdea ? shortlistedIds.has(selectedIdea.id) : false}
        onToggleShortlist={handleToggleShortlist}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          fetchData();
          setToastMessage('Import CSV reussi !');
        }}
        onResetToDefault={async () => {
          await fetch('/api/ideas/reset', { method: 'POST' });
          await fetchData();
        }}
      />

      <Toast
        isOpen={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

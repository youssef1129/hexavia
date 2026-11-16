'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Idea, ShortlistItem, ScoreCriteria } from '@/types/idea';
import { Navbar, ShortlistView, IdeaDetailModal, ImportModal } from '@/components/features';
import { Toast, Spinner } from '@/components/ui';

export default function ShortlistPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [duplicateCount, setDuplicateCount] = useState<number>(0);
  const [shortlistItems, setShortlistItems] = useState<ShortlistItem[]>([]);
  const [shortlistStats, setShortlistStats] = useState({
    totalIdeas: 0,
    shortlistCount: 0,
    averageScore: 0,
    totalBudget: 0,
    unbudgetedCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/ideas');
      const data = await res.json();
      setIdeas(data.ideas || []);
      setDuplicateCount((data.duplicatePairs || []).length);
      if (data.shortlist) {
        setShortlistItems(data.shortlist.items || []);
        setShortlistStats(data.shortlist.stats || {
          totalIdeas: 0,
          shortlistCount: 0,
          averageScore: 0,
          totalBudget: 0,
          unbudgetedCount: 0,
        });
      }
    } catch (err) {
      console.error('Erreur chargement shortlist :', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleShortlist = async (ideaId: string, action: 'add' | 'remove' | 'reset') => {
    const res = await fetch('/api/shortlist/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId, action }),
    });

    if (res.ok) {
      const data = await res.json();
      setShortlistItems(data.shortlist.items);
      setShortlistStats(data.shortlist.stats);
      setToastMessage(
        action === 'add'
          ? `L idee ${ideaId} a ete ajoutee a la shortlist.`
          : `L idee ${ideaId} a ete retiree de la shortlist.`
      );
    }
  };

  const handleTargetCountChange = async (count: number) => {
    const res = await fetch('/api/shortlist/target', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    });

    if (res.ok) {
      const data = await res.json();
      setShortlistItems(data.shortlist.items);
      setShortlistStats(data.shortlist.stats);
      setToastMessage(`Taille cible ajustee a ${count} idees.`);
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

  const shortlistedIds = new Set(shortlistItems.map((i) => i.idea.id));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        ideasCount={ideas.length}
        duplicatesCount={duplicateCount}
        shortlistCount={shortlistItems.length}
        onOpenImport={() => setIsImportModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <ShortlistView
            items={shortlistItems}
            stats={shortlistStats}
            allIdeas={ideas}
            onSelectIdea={(idea) => setSelectedIdea(idea)}
            onToggleShortlist={handleToggleShortlist}
            onTargetCountChange={handleTargetCountChange}
          />
        )}
      </main>

      <IdeaDetailModal
        idea={selectedIdea}
        isOpen={Boolean(selectedIdea)}
        onClose={() => setSelectedIdea(null)}
        onSaveScore={handleSaveScore}
        isInShortlist={selectedIdea ? shortlistedIds.has(selectedIdea.id) : false}
        onToggleShortlist={(id) => handleToggleShortlist(id, shortlistedIds.has(id) ? 'remove' : 'add')}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          fetchData();
          setToastMessage('Import CSV effectue avec succes !');
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

'use client';

import React, { useState } from 'react';
import { Idea, ScoreCriteria } from '@/types/idea';
import { Dialog, Badge, Button, ScoreInput } from '@/components/ui';
import { formatBudget } from '@/lib/budget-parser';

export interface IdeaDetailModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveScore: (ideaId: string, criteria: ScoreCriteria, notes: string) => Promise<void>;
  isInShortlist?: boolean;
  onToggleShortlist?: (ideaId: string) => void;
}

const IdeaDetailModalContent: React.FC<{
  idea: Idea;
  onClose: () => void;
  onSaveScore: (ideaId: string, criteria: ScoreCriteria, notes: string) => Promise<void>;
  isInShortlist?: boolean;
  onToggleShortlist?: (ideaId: string) => void;
}> = ({
  idea,
  onClose,
  onSaveScore,
  isInShortlist = false,
  onToggleShortlist,
}) => {
  const initialCriteria = idea.consultantEvaluation?.criteria ??
    idea.aiEvaluation?.criteria ?? {
      businessImpact: 3,
      feasibility: 3,
      strategicAlignment: 3,
      innovation: 3,
    };

  const [criteria, setCriteria] = useState<ScoreCriteria>(initialCriteria);
  const [notes, setNotes] = useState<string>(idea.consultantEvaluation?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentTotal =
    criteria.businessImpact +
    criteria.feasibility +
    criteria.strategicAlignment +
    criteria.innovation;

  const aiTotal = idea.aiEvaluation?.total;
  const scoreDiff = typeof aiTotal === 'number' ? currentTotal - aiTotal : 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveScore(idea.id, criteria, notes);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metadonnees cles */}
      <div className="flex flex-wrap items-center gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
        <Badge variant="theme" themeName={idea.theme}>
          {idea.theme}
        </Badge>
        <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200">
          Direction : {idea.direction}
        </span>
        <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200">
          Site : {idea.site}
        </span>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 ml-auto">
          Budget : {formatBudget(idea.budget)}
        </span>
      </div>

      {/* Description et benefices */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Description de l initiative
          </h4>
          <p className="text-sm text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
            {idea.description}
          </p>
        </div>

        {idea.beneficesAttendus && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Benefices attendus
            </h4>
            <p className="text-sm text-emerald-900 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60 leading-relaxed font-medium">
              {idea.beneficesAttendus}
            </p>
          </div>
        )}
      </div>

      {/* Bloc 1 : Proposition de l IA (Reference immuable) */}
      <div className="bg-purple-50/60 rounded-xl border border-purple-200/80 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
            <h4 className="text-sm font-bold text-purple-900">
              Proposition initiale de l IA
            </h4>
          </div>
          {idea.aiEvaluation && (
            <span className="text-base font-extrabold text-purple-800">
              {idea.aiEvaluation.total} / 20
            </span>
          )}
        </div>

        {idea.aiEvaluation ? (
          <div className="space-y-2.5">
            <p className="text-xs text-purple-950 leading-relaxed italic bg-white/70 p-2.5 rounded-lg border border-purple-100">
              « {idea.aiEvaluation.justification} »
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white/80 p-1.5 rounded-lg border border-purple-100">
                <span className="text-slate-500 block text-[10px]">Impact</span>
                <span className="font-bold text-purple-900">{idea.aiEvaluation.criteria.businessImpact}/5</span>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-purple-100">
                <span className="text-slate-500 block text-[10px]">Faisabilite</span>
                <span className="font-bold text-purple-900">{idea.aiEvaluation.criteria.feasibility}/5</span>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-purple-100">
                <span className="text-slate-500 block text-[10px]">Alignement</span>
                <span className="font-bold text-purple-900">{idea.aiEvaluation.criteria.strategicAlignment}/5</span>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-purple-100">
                <span className="text-slate-500 block text-[10px]">Innovation</span>
                <span className="font-bold text-purple-900">{idea.aiEvaluation.criteria.innovation}/5</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-purple-700">Aucune proposition generee par l IA pour le moment.</p>
        )}
      </div>

      {/* Bloc 2 : Grille d evaluation de Camille (Ajustements Consultant) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Evaluation finale du Consultant (Camille)
            </h4>
            <p className="text-xs text-slate-500">
              Vous pouvez ajuster les notes proposees par l IA et ajouter vos observations.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-blue-600 block leading-none">
              {currentTotal}
              <span className="text-xs font-normal text-slate-400"> / 20</span>
            </span>
            {typeof aiTotal === 'number' && (
              <span
                className={`text-[11px] font-semibold ${
                  scoreDiff > 0
                    ? 'text-emerald-600'
                    : scoreDiff < 0
                    ? 'text-red-600'
                    : 'text-slate-500'
                }`}
              >
                {scoreDiff > 0 ? `+${scoreDiff} pts vs IA` : scoreDiff < 0 ? `${scoreDiff} pts vs IA` : 'Identique a l IA'}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <ScoreInput
            label="Impact business"
            description="Gains financiers, gains de temps, reduction des pannes ou des pertes"
            value={criteria.businessImpact}
            aiValue={idea.aiEvaluation?.criteria.businessImpact}
            onChange={(val) => setCriteria({ ...criteria, businessImpact: val })}
          />
          <ScoreInput
            label="Faisabilite"
            description="Facilite de mise en oeuvre compte tenu du budget et des contraintes terrain"
            value={criteria.feasibility}
            aiValue={idea.aiEvaluation?.criteria.feasibility}
            onChange={(val) => setCriteria({ ...criteria, feasibility: val })}
          />
          <ScoreInput
            label="Alignement strategique"
            description="Coherence avec les priorites Hexavia (securite, ecologie, performance, digital)"
            value={criteria.strategicAlignment}
            aiValue={idea.aiEvaluation?.criteria.strategicAlignment}
            onChange={(val) => setCriteria({ ...criteria, strategicAlignment: val })}
          />
          <ScoreInput
            label="Innovation"
            description="Caractere novateur, rupture technologique ou avancee methodologique"
            value={criteria.innovation}
            aiValue={idea.aiEvaluation?.criteria.innovation}
            onChange={(val) => setCriteria({ ...criteria, innovation: val })}
          />
        </div>

        {/* Remarques consultant */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Commentaires ou reserves du consultant
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex : Projet tres prometteur a condition de caler le deplacement sur l arret d aout..."
            className="w-full rounded-lg border border-slate-300 text-sm p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Pied de fenetre et actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {onToggleShortlist && (
          <Button
            variant={isInShortlist ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => onToggleShortlist(idea.id)}
          >
            {isInShortlist ? 'Retirer de la shortlist' : 'Retenir dans la shortlist'}
          </Button>
        )}

        <div className="flex items-center gap-2.5 ml-auto">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Notation enregistree !
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSaving}
            onClick={handleSave}
          >
            Enregistrer la note
          </Button>
        </div>
      </div>
    </div>
  );
};

export const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({
  idea,
  isOpen,
  onClose,
  onSaveScore,
  isInShortlist = false,
  onToggleShortlist,
}) => {
  if (!idea) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${idea.id} : ${idea.titre}`}
      description={`Deposee le ${idea.dateDepot} par ${idea.prenom} ${idea.nom} (${idea.direction} - ${idea.site})`}
      maxWidth="2xl"
    >
      <IdeaDetailModalContent
        key={idea.id}
        idea={idea}
        onClose={onClose}
        onSaveScore={onSaveScore}
        isInShortlist={isInShortlist}
        onToggleShortlist={onToggleShortlist}
      />
    </Dialog>
  );
};

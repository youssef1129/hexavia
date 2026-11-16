'use client';

import React from 'react';
import { Idea } from '@/types/idea';
import { Badge, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui';
import { formatBudget } from '@/lib/budget-parser';

export interface IdeaTableProps {
  ideas: Idea[];
  onSelectIdea: (idea: Idea) => void;
  shortlistedIds?: Set<string>;
}

export const IdeaTable: React.FC<IdeaTableProps> = ({
  ideas,
  onSelectIdea,
  shortlistedIds = new Set(),
}) => {
  if (ideas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
        <p className="text-sm font-semibold text-slate-800">Aucune idee ne correspond a vos filtres.</p>
        <p className="text-xs text-slate-500 mt-1">Modifiez vos criteres de recherche ou reinitialisez les filtres.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell className="w-20">Code</TableHeaderCell>
          <TableHeaderCell>Titre de l initiative</TableHeaderCell>
          <TableHeaderCell>Theme</TableHeaderCell>
          <TableHeaderCell>Direction & Site</TableHeaderCell>
          <TableHeaderCell>Porteur</TableHeaderCell>
          <TableHeaderCell>Budget estime</TableHeaderCell>
          <TableHeaderCell className="text-center">Note / 20</TableHeaderCell>
          <TableHeaderCell className="text-right w-24">Detail</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {ideas.map((idea) => {
          const score = idea.consultantEvaluation?.total ?? idea.aiEvaluation?.total;
          const isConsultant = Boolean(idea.consultantEvaluation);
          const isShortlisted = shortlistedIds.has(idea.id);

          return (
            <TableRow
              key={idea.id}
              onClick={() => onSelectIdea(idea)}
              highlighted={isShortlisted}
            >
              <TableCell className="font-mono text-xs font-bold text-blue-600">
                {idea.id}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{idea.titre}</span>
                  {isShortlisted && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">
                      Shortlist
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-md">
                  {idea.description}
                </p>
              </TableCell>

              <TableCell>
                <Badge variant="theme" themeName={idea.theme} size="sm">
                  {idea.theme}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-xs font-semibold text-slate-800">{idea.direction}</div>
                <div className="text-[11px] text-slate-500">{idea.site}</div>
              </TableCell>

              <TableCell className="text-xs text-slate-700">
                {idea.prenom} {idea.nom}
              </TableCell>

              <TableCell className="text-xs font-semibold text-slate-900">
                {formatBudget(idea.budget)}
              </TableCell>

              <TableCell className="text-center">
                {typeof score === 'number' ? (
                  <div className="inline-flex flex-col items-center">
                    <span
                      className={`text-sm font-extrabold ${
                        score >= 16
                          ? 'text-emerald-600'
                          : score >= 13
                          ? 'text-blue-600'
                          : score >= 10
                          ? 'text-amber-600'
                          : 'text-red-500'
                      }`}
                    >
                      {score}/20
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                      {isConsultant ? 'Camille' : 'IA'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">A evaluer</span>
                )}
              </TableCell>

              <TableCell className="text-right">
                <span className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                  Consulter →
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

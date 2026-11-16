'use client';

import React from 'react';
import { Input, Select, Button } from '@/components/ui';

export interface FilterState {
  search: string;
  direction: string;
  theme: string;
  site: string;
  scoreRange: string;
  sortBy: 'score' | 'id' | 'date' | 'budget';
  sortOrder: 'asc' | 'desc';
}

export interface IdeaFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  directions: string[];
  themes: string[];
  sites: string[];
  totalCount: number;
  filteredCount: number;
}

export const IdeaFilters: React.FC<IdeaFiltersProps> = ({
  filters,
  onChange,
  onReset,
  directions,
  themes,
  sites,
  totalCount,
  filteredCount,
}) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.direction !== '' ||
    filters.theme !== '' ||
    filters.site !== '' ||
    filters.scoreRange !== '' ||
    filters.sortBy !== 'score';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6 no-print">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recherche textuelle */}
        <div className="lg:col-span-2">
          <Input
            label="Rechercher"
            placeholder="Titre, description, collaborateur ou code..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            leftIcon={
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Filtre par Direction */}
        <div>
          <Select
            label="Direction"
            placeholderOption="Toutes les directions"
            value={filters.direction}
            onChange={(e) => updateFilter('direction', e.target.value)}
            options={directions.map((d) => ({ value: d, label: d }))}
          />
        </div>

        {/* Filtre par Theme */}
        <div>
          <Select
            label="Theme"
            placeholderOption="Tous les themes"
            value={filters.theme}
            onChange={(e) => updateFilter('theme', e.target.value)}
            options={themes.map((t) => ({ value: t, label: t }))}
          />
        </div>
      </div>

      {/* Ligne secondaire de filtres et tri */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
        <div>
          <Select
            label="Site"
            placeholderOption="Tous les sites"
            value={filters.site}
            onChange={(e) => updateFilter('site', e.target.value)}
            options={sites.map((s) => ({ value: s, label: s }))}
          />
        </div>

        <div>
          <Select
            label="Plage de note"
            placeholderOption="Toutes les notes"
            value={filters.scoreRange}
            onChange={(e) => updateFilter('scoreRange', e.target.value)}
            options={[
              { value: 'top', label: 'Excellentes (16 a 20 / 20)' },
              { value: 'good', label: 'Favorables (13 a 15 / 20)' },
              { value: 'average', label: 'Moyennes (10 a 12 / 20)' },
              { value: 'low', label: 'Faibles (< 10 / 20)' },
            ]}
          />
        </div>

        <div>
          <Select
            label="Trier par"
            value={`${filters.sortBy}_${filters.sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('_');
              onChange({
                ...filters,
                sortBy: by as FilterState['sortBy'],
                sortOrder: order as FilterState['sortOrder'],
              });
            }}
            options={[
              { value: 'score_desc', label: 'Note globale (plus elevee)' },
              { value: 'score_asc', label: 'Note globale (plus basse)' },
              { value: 'budget_asc', label: 'Budget estime (croissant)' },
              { value: 'budget_desc', label: 'Budget estime (decroissant)' },
              { value: 'date_desc', label: 'Date de depot (recente)' },
              { value: 'id_asc', label: 'Identifiant (IDEA-001...)' },
            ]}
          />
        </div>

        <div className="flex items-end justify-between sm:justify-end gap-3">
          <div className="text-xs text-slate-500 self-center">
            <span className="font-semibold text-slate-800">{filteredCount}</span> sur {totalCount} idees
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              Reinitialiser
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

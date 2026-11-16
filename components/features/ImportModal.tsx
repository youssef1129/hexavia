'use client';

import React, { useState, useRef } from 'react';
import { Dialog, Button, ErrorMessage } from '@/components/ui';

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
  onResetToDefault: () => Promise<void>;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onResetToDefault,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setErrorDetails([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ideas', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l import du fichier.');
        if (data.details) setErrorDetails(data.details);
        return;
      }

      onImportSuccess(data.ideasCount);
      onClose();
    } catch {
      setError('Impossible de joindre le serveur. Verifiez votre connexion.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleResetDefault = async () => {
    setIsUploading(true);
    setError(null);
    try {
      await onResetToDefault();
      onImportSuccess(40);
      onClose();
    } catch {
      setError('Erreur lors du rechargement des donnees par defaut.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Importer un fichier d idees (CSV)"
      description="Importez un nouveau challenge ou rechargez le fichier officiel d Hexavia."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {error && (
          <ErrorMessage
            title="Echec de l import"
            message={error}
            details={errorDetails}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Zone de depot de fichier */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-blue-50/40"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv"
            className="hidden"
          />
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Cliquez pour selectionner un fichier CSV ou glissez-le ici
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Format attendu : separateur point-virgule (;), encodage UTF-8 avec ou sans BOM.
          </p>
        </div>

        {/* Bouton de secours rapide : Charger Hexavia */}
        <div className="bg-slate-100/70 p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-semibold text-slate-700 mb-2">
            Besoin de tester immediatement avec les 40 idees du cas Hexavia ?
          </p>
          <Button
            variant="secondary"
            size="sm"
            isLoading={isUploading}
            onClick={handleResetDefault}
          >
            Recharger les 40 idees natives d Hexavia
          </Button>
        </div>

        {/* Colonnes requises */}
        <div className="text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Colonnes obligatoires dans l en-tete :</p>
          <p className="font-mono text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 overflow-x-auto">
            id; date_depot; prenom; nom; direction; site; theme; titre; description; benefices_attendus; budget_estime
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

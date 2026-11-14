'use client';

import React from 'react';

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200/90 shadow-sm ${className}`}>
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm bg-white">
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <thead className={`bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-semibold ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <tbody className={`divide-y divide-slate-100 ${className}`}>{children}</tbody>;
};

export const TableRow: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  highlighted?: boolean;
}> = ({ children, className = '', onClick, highlighted = false }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors ${
        highlighted ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <td className={`px-4 py-3.5 text-slate-700 align-middle ${className}`}>{children}</td>;
};

export const TableHeaderCell: React.FC<{
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  onSort?: () => void;
  sortDirection?: 'asc' | 'desc' | null;
}> = ({ children, className = '', sortable = false, onSort, sortDirection }) => {
  return (
    <th
      scope="col"
      onClick={sortable ? onSort : undefined}
      className={`px-4 py-3 text-slate-600 font-semibold ${
        sortable ? 'cursor-pointer select-none hover:text-slate-900' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span>{children}</span>
        {sortable && (
          <span className="text-slate-400 text-xs">
            {sortDirection === 'asc' ? '▲' : sortDirection === 'desc' ? '▼' : '⇅'}
          </span>
        )}
      </div>
    </th>
  );
};

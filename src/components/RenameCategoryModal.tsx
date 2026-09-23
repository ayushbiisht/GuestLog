import { useState } from 'react';
import { RoomCategory } from '../types';
import { X, Check, Tag } from 'lucide-react';

interface RenameCategoryModalProps {
  category: RoomCategory;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCategory: RoomCategory) => void;
}

export function RenameCategoryModal({
  category,
  isOpen,
  onClose,
  onSave,
}: RenameCategoryModalProps) {
  const [name, setName] = useState(category.name);
  const [totalRooms, setTotalRooms] = useState(category.totalRooms);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Category name cannot be empty');
      return;
    }
    if (totalRooms < 1) {
      setError('Total rooms must be at least 1');
      return;
    }

    onSave({
      ...category,
      name: trimmed,
      totalRooms: Number(totalRooms),
    });
    onClose();
  };

  return (
    <div
      id="rename-category-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="rename-category-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#DCE5F5] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBF0F8] bg-[#F8FAFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF4FE] flex items-center justify-center text-[#4B70E2]">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Rename Room Category</h3>
              <p className="text-xs text-slate-500">Global Category Configuration</p>
            </div>
          </div>
          <button
            id="close-rename-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Update Notice */}
        <div className="px-6 pt-4 pb-2">
          <div className="p-3 bg-[#EEF4FE] border border-[#BED6FA] rounded-xl text-xs text-[#2552D0] leading-relaxed">
            <span className="font-bold text-[#1D4ED8]">Global Update:</span> Renaming this category will immediately update its name across the entire app for <strong>all past, present, and future dates</strong> in both the Calendar Dashboard and Timeline Summary.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="category-name-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Category Name
            </label>
            <input
              id="category-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Double Bed, Three Bed, Deluxe Suite"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B70E2] focus:border-transparent transition-all"
              autoFocus
            />
            {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          </div>

          <div>
            <label htmlFor="category-rooms-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Total Room Capacity in Property
            </label>
            <div className="flex items-center gap-3">
              <input
                id="category-rooms-input"
                type="number"
                min="1"
                max="100"
                value={totalRooms}
                onChange={(e) => setTotalRooms(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-28 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B70E2] focus:border-transparent transition-all"
              />
              <span className="text-xs text-slate-500">
                Total physical rooms belonging to this category
              </span>
            </div>
          </div>

          {/* Quick presets helper */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Quick Name Suggestions:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Double Bed', 'Three Bed', 'Single Deluxe', 'King Suite', 'Family Room'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setName(suggestion)}
                  className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-[#EEF4FE] text-slate-700 hover:text-[#4B70E2] rounded-lg transition-colors border border-slate-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              id="cancel-rename-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-rename-category-btn"
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-[#4B70E2] hover:bg-[#3D60CE] active:bg-[#3352B8] rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Global Name
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

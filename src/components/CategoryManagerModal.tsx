import { useState } from 'react';
import { RoomCategory } from '../types';
import { X, Plus, Pencil, Trash2, Check, Tag } from 'lucide-react';

interface CategoryManagerModalProps {
  categories: RoomCategory[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateCategories: (categories: RoomCategory[]) => void;
}

export function CategoryManagerModal({
  categories,
  isOpen,
  onClose,
  onUpdateCategories,
}: CategoryManagerModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTotal, setEditTotal] = useState(1);

  // New category state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTotal, setNewTotal] = useState(4);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const startEditing = (cat: RoomCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditTotal(cat.totalRooms);
    setErrorMsg('');
  };

  const saveEdit = (catId: string) => {
    if (!editName.trim()) {
      setErrorMsg('Category name cannot be empty');
      return;
    }
    const updated = categories.map((c) =>
      c.id === catId
        ? { ...c, name: editName.trim(), totalRooms: Math.max(1, editTotal) }
        : c
    );
    onUpdateCategories(updated);
    setEditingId(null);
    setErrorMsg('');
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMsg('Category name cannot be empty');
      return;
    }
    const newCat: RoomCategory = {
      id: `cat-${Date.now()}`,
      name: newName.trim(),
      totalRooms: Math.max(1, newTotal),
    };
    onUpdateCategories([...categories, newCat]);
    setNewName('');
    setNewTotal(4);
    setIsAddingNew(false);
    setErrorMsg('');
  };

  const handleDelete = (catId: string) => {
    if (categories.length <= 1) {
      setErrorMsg('You must have at least one room category');
      return;
    }
    const updated = categories.filter((c) => c.id !== catId);
    onUpdateCategories(updated);
  };

  const totalCapacity = categories.reduce((sum, c) => sum + c.totalRooms, 0);

  return (
    <div
      id="category-manager-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="category-manager-modal-card"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#DCE5F5] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBF0F8] bg-[#F8FAFD]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF4FE] flex items-center justify-center text-[#4B70E2]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Room Categories & Inventory</h3>
              <p className="text-xs text-slate-500">
                Global settings • Total property capacity: {totalCapacity} rooms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3 bg-[#EEF4FE] border border-[#BED6FA] rounded-xl text-xs text-[#2552D0] leading-relaxed">
            <strong className="font-bold text-[#1D4ED8]">Global Rule:</strong> Renaming any category here updates the name everywhere across the entire app for all past, present, and future dates in both the Calendar and Timeline.
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* List of categories */}
          <div className="space-y-2.5">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;

              if (isEditing) {
                return (
                  <div
                    key={cat.id}
                    className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          Category Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B70E2]"
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          Total Rooms
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={editTotal}
                          onChange={(e) => setEditTotal(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B70E2]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(cat.id)}
                        className="px-3 py-1 text-xs font-semibold text-white bg-[#4B70E2] hover:bg-[#3D60CE] rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 bg-white border border-[#DCE5F5] rounded-xl hover:border-[#93B4FC] transition-colors shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{cat.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-[#EEF4FE] text-[#2552D0] rounded-full font-semibold">
                        {cat.totalRooms} {cat.totalRooms === 1 ? 'room' : 'rooms'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Internal Key: {cat.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEditing(cat)}
                      className="p-1.5 text-slate-500 hover:text-[#4B70E2] hover:bg-[#EEF4FE] rounded-lg transition-colors"
                      title="Edit Category Name & Rooms"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add new category form */}
          {isAddingNew ? (
            <form onSubmit={handleAddNew} className="p-3.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-3">
              <span className="text-xs font-semibold text-slate-700 block">
                Add New Room Category
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Category Name (e.g. Penthouse Suite)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B70E2]"
                    autoFocus
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    placeholder="Rooms"
                    value={newTotal}
                    onChange={(e) => setNewTotal(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B70E2]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold text-white bg-[#4B70E2] hover:bg-[#3D60CE] rounded-lg shadow-2xs"
                >
                  Add Category
                </button>
              </div>
            </form>
          ) : (
            <button
              id="show-add-category-form-btn"
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-[#4B70E2] rounded-xl text-xs font-semibold text-slate-600 hover:text-[#2552D0] hover:bg-[#EEF4FE] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Another Room Category
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F8FAFD] border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#4B70E2] hover:bg-[#3D60CE] active:bg-[#3352B8] rounded-xl shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

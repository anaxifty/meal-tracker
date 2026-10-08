'use client';

import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { Member } from '@/types/mess';

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddMember: (name: string, bnName?: string) => void;
  onUpdateMember: (id: string, name: string, bnName?: string, active?: boolean) => void;
  onDeleteMember: (id: string) => void;
}

export function MembersModal({
  isOpen,
  onClose,
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}: MembersModalProps) {
  const [newName, setNewName] = useState('');
  const [newBnName, setNewBnName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBnName, setEditBnName] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddMember(newName.trim(), newBnName.trim() || undefined);
    setNewName('');
    setNewBnName('');
  };

  const handleStartEdit = (m: Member) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditBnName(m.bnName || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateMember(id, editName.trim(), editBnName.trim() || undefined);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">মেস সদস্য পরিচালনা</h3>
              <p className="text-xs text-slate-500">
                সদস্য যোগ করুন, নাম সম্পাদনা করুন বা বাদ দিন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Add Member Form */}
          <form onSubmit={handleAdd} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">নতুন সদস্য যুক্ত করুন:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="ইংরেজি নাম (যেমন: Tanvir)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-xs p-2 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-hidden"
                required
              />
              <input
                type="text"
                placeholder="বাংলা নাম (যেমন: তানভীর)"
                value={newBnName}
                onChange={(e) => setNewBnName(e.target.value)}
                className="text-xs p-2 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>সদস্য যুক্ত করুন</span>
              </button>
            </div>
          </form>

          {/* Members List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              বর্তমান সদস্যবৃন্দ ({members.length} জন)
            </span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {members.map((m) => {
                const isEditing = editingId === m.id;

                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 bg-white hover:bg-slate-50/70 transition-colors text-xs"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-1/2 p-1.5 border border-slate-300 rounded text-xs"
                          placeholder="Name"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editBnName}
                          onChange={(e) => setEditBnName(e.target.value)}
                          className="w-1/2 p-1.5 border border-slate-300 rounded text-xs"
                          placeholder="বাংলা নাম"
                        />
                        <button
                          onClick={() => handleSaveEdit(m.id)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[11px]">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 mr-2">{m.name}</span>
                            {m.bnName && (
                              <span className="text-slate-500 font-normal">({m.bnName})</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(m)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`আপনি কি "${m.name}" কে মেস থেকে মুছে ফেলতে চান?`)) {
                                onDeleteMember(m.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors cursor-pointer"
          >
            সম্পন্ন
          </button>
        </div>
      </div>
    </div>
  );
}

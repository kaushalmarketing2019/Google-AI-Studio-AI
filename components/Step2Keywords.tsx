import React, { useState, useEffect } from 'react';
import { KeywordData } from '../types';
import { getKeywordsVolume } from '../services/dataForSeoService';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';

interface Step2KeywordsProps {
  initialKeywords: KeywordData[];
  onApprove: (keywords: string[]) => void;
  onRegenerate: () => void;
}

const MiniSpinner: React.FC = () => (
    <div className="w-5 h-5 border-2 border-slate-500 border-t-cyan-400 rounded-full animate-spin"></div>
);

const Step2Keywords: React.FC<Step2KeywordsProps> = ({ initialKeywords, onApprove, onRegenerate }) => {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    setKeywords(initialKeywords);
  }, [initialKeywords]);

  const handleAddKeyword = async () => {
    const trimmedKeyword = newKeyword.trim();
    if (trimmedKeyword && !keywords.some(k => k.text.toLowerCase() === trimmedKeyword.toLowerCase())) {
      const newKeywordObject: KeywordData = { text: trimmedKeyword, volume: null, loading: true };
      setKeywords(prev => [...prev, newKeywordObject]);
      setNewKeyword('');

      try {
        const result = await getKeywordsVolume([trimmedKeyword]);
        const newVolume = result[0]?.volume ?? null;
        setKeywords(currentKeywords =>
          currentKeywords.map(kw =>
            kw.text === trimmedKeyword ? { ...kw, volume: newVolume, loading: false } : kw
          )
        );
      } catch (error) {
        console.error("Failed to fetch volume for new keyword:", error);
        setKeywords(currentKeywords =>
          currentKeywords.map(kw =>
            kw.text === trimmedKeyword ? { ...kw, loading: false } : kw
          )
        );
      }
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };
  
  const startEditing = (index: number, value: string) => {
      setEditingIndex(index);
      setEditingValue(value);
  };
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditingValue(e.target.value);
  }
  
  const saveEdit = async (index: number) => {
      const originalKeywordData = keywords[index];
      const trimmedValue = editingValue.trim();
      setEditingIndex(null);
      
      if (trimmedValue && trimmedValue.toLowerCase() !== originalKeywordData.text.toLowerCase()) {
        setKeywords(currentKeywords => {
            const updated = [...currentKeywords];
            updated[index] = { ...updated[index], text: trimmedValue, volume: null, loading: true };
            return updated;
        });

        try {
            const result = await getKeywordsVolume([trimmedValue]);
            const newVolume = result[0]?.volume ?? null;
            setKeywords(currentKeywords =>
                currentKeywords.map(kw =>
                    kw.text.toLowerCase() === trimmedValue.toLowerCase()
                        ? { ...kw, volume: newVolume, loading: false }
                        : kw
                )
            );
        } catch (error) {
            console.error("Failed to fetch volume for edited keyword:", error);
            setKeywords(currentKeywords =>
                currentKeywords.map(kw =>
                    kw.text.toLowerCase() === trimmedValue.toLowerCase()
                        ? { ...kw, loading: false }
                        : kw
                )
            );
        }
      }
  };
  
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      saveEdit(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10 rounded-2xl p-6 sm:p-8">
      <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Step 2: Review & Approve Keywords</h2>
          <p className="text-slate-400 mt-1">Review keywords and their search volume. Edit, add, or remove to refine the list.</p>
      </div>

      <div className="flex items-center text-sm font-semibold text-slate-400 px-3 pb-3 mb-3 border-b-2 border-slate-700/80">
        <span className="flex-grow">Keyword</span>
        <span className="w-32 text-right">Monthly Volume</span>
        <span className="w-16 ml-4"></span> {/* Spacer for actions */}
      </div>

      <div className="space-y-2 mb-6 max-h-[40vh] overflow-y-auto pr-2 -mr-2">
        {keywords.map((keyword, index) => (
          <div key={keyword.text + index} className="flex items-center bg-slate-800/60 p-3 rounded-lg group transition-all duration-300 hover:bg-slate-700/80 hover:shadow-lg">
            {editingIndex === index ? (
              <input
                type="text"
                value={editingValue}
                onChange={handleEditChange}
                onBlur={() => saveEdit(index)}
                onKeyDown={(e) => handleEditKeyDown(e, index)}
                className="flex-grow bg-slate-700 text-white px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                autoFocus
              />
            ) : (
              <>
                <span className="flex-grow text-slate-200">{keyword.text}</span>
                <span className="w-32 text-right font-mono flex justify-end items-center h-6 text-cyan-400">
                  {keyword.loading ? (
                    <MiniSpinner />
                  ) : keyword.volume !== null ? (
                    keyword.volume.toLocaleString()
                  ) : (
                    <span className="text-slate-500">N/A</span>
                  )}
                </span>
              </>
            )}
            <div className="flex items-center space-x-2 ml-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEditing(index, keyword.text)} className="text-slate-400 hover:text-cyan-400 transition" aria-label={`Edit ${keyword.text}`}>
                <EditIcon />
              </button>
              <button onClick={() => handleRemoveKeyword(index)} className="text-slate-400 hover:text-red-500 transition" aria-label={`Remove ${keyword.text}`}>
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
          placeholder="Add a new keyword"
          className="flex-grow w-full bg-slate-800/80 border-2 border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-300"
        />
        <button onClick={handleAddKeyword} className="bg-slate-700 hover:bg-slate-600 text-white font-bold p-3 rounded-lg transition-colors flex items-center justify-center aspect-square shadow-md" aria-label="Add new keyword">
          <PlusIcon />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={onRegenerate} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
            Regenerate
        </button>
        <button onClick={() => onApprove(keywords.map(k => k.text))} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-xl shadow-cyan-500/20">
            Approve & Generate Plan
        </button>
      </div>
    </div>
  );
};

export default Step2Keywords;
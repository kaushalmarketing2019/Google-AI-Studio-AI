import React, { useState } from 'react';
import { InputType } from '../types';

interface Step1InputProps {
  onSubmit: (input: string, type: InputType) => void;
}

const Step1Input: React.FC<Step1InputProps> = ({ onSubmit }) => {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<InputType>('idea');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim(), inputType);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10 rounded-2xl p-6 sm:p-8">
        <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-100">Step 1: Provide Your Landing Page</h2>
            <p className="text-slate-400 mt-1">Enter an idea or an existing URL to get started.</p>
        </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex justify-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => setInputType('idea')}
            className={`w-full px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
              inputType === 'idea' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            Page Idea
          </button>
          <button
            type="button"
            onClick={() => setInputType('url')}
            className={`w-full px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
              inputType === 'url' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            Page URL
          </button>
        </div>
        <div>
          <label htmlFor="userInput" className="sr-only">
            {inputType === 'idea' ? 'Enter landing page idea' : 'Enter landing page URL'}
          </label>
          <input
            id="userInput"
            type={inputType === 'url' ? 'url' : 'text'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              inputType === 'idea'
                ? 'e.g., "digital marketing services for startups"'
                : 'e.g., https://example.com/services'
            }
            className="w-full text-lg bg-slate-800/80 border-2 border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-300"
            required
          />
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg py-3 px-4 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!input.trim()}
          >
            Start Keyword Research
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1Input;
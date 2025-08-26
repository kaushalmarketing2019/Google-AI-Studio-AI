import React from 'react';
import { OptimizationPlan } from '../types';

interface Step3PlanProps {
  plan: OptimizationPlan;
  onStartOver: () => void;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-lg shadow-blue-500/5 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">{title}</h3>
        {children}
    </div>
);

const Step3Plan: React.FC<Step3PlanProps> = ({ plan, onStartOver }) => {
  return (
    <div className="space-y-6">
       <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-100">Step 3: Your SEO Optimization Plan</h2>
            <p className="text-slate-400 mt-2">Here is your complete AI-generated SEO and content strategy.</p>
        </div>

      <InfoCard title="Meta Details">
        <div className="space-y-4">
            <div>
                <p className="font-semibold text-slate-300 mb-1">Meta Title:</p>
                <p className="text-slate-200 bg-slate-800/80 p-3 rounded-md font-mono text-sm">{plan.metaTitle}</p>
            </div>
            <div>
                <p className="font-semibold text-slate-300 mb-1">Meta Description:</p>
                <p className="text-slate-200 bg-slate-800/80 p-3 rounded-md">{plan.metaDescription}</p>
            </div>
        </div>
      </InfoCard>

      <InfoCard title="Heading & Keyword Placement">
        <div className="space-y-4 text-slate-300">
            <p><strong>H1:</strong> <span className="text-cyan-300 bg-slate-800/80 px-2 py-1 rounded font-mono">{plan.h1}</span></p>
            <div>
                <p className="font-semibold mb-2"><strong>H2 Headings:</strong></p>
                <div className="flex flex-wrap gap-2">
                    {plan.h2.map((kw, i) => <span key={i} className="text-slate-200 bg-slate-800/80 px-2 py-1 rounded">{kw}</span>)}
                </div>
            </div>
             <div>
                <p className="font-semibold mb-2"><strong>H3 Headings:</strong></p>
                <div className="flex flex-wrap gap-2">
                    {plan.h3.map((kw, i) => <span key={i} className="text-slate-200 bg-slate-800/80 px-2 py-1 rounded">{kw}</span>)}
                </div>
            </div>
             <div>
                <p className="font-semibold mb-2"><strong>H4 Headings:</strong></p>
                <div className="flex flex-wrap gap-2">
                    {plan.h4.map((kw, i) => <span key={i} className="text-slate-200 bg-slate-800/80 px-2 py-1 rounded">{kw}</span>)}
                </div>
            </div>
        </div>
      </InfoCard>

      <InfoCard title="SERP Competitor Analysis">
        <div className="text-slate-300">
            <p className="mb-4">
                Top organic search results for the primary commercial keyword:
                <strong className="text-cyan-300 font-mono bg-slate-800/80 px-2 py-1 rounded ml-2">{plan.competitorAnalysis.targetKeyword}</strong>
            </p>
            {plan.competitorAnalysis.competitors.length > 0 ? (
                <ol className="list-decimal list-inside space-y-4 text-slate-300">
                    {plan.competitorAnalysis.competitors.map((competitor, index) => (
                        <li key={index} className="leading-tight">
                            <span className="font-semibold text-slate-200">{competitor.title}</span>
                            <br />
                            <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm break-all transition-colors underline decoration-cyan-400/30 hover:decoration-cyan-300/50">
                                {competitor.url}
                            </a>
                        </li>
                    ))}
                </ol>
            ) : (
                <p>No competitor data could be retrieved for this keyword.</p>
            )}
        </div>
      </InfoCard>

      <InfoCard title="Frequently Asked Questions (FAQs)">
        <div className="space-y-3">
            {plan.faqs.map((faq, i) => (
                <details key={i} className="bg-slate-800/80 rounded-lg p-4 group" name="faq">
                    <summary className="font-semibold text-slate-200 cursor-pointer list-none flex justify-between items-center">
                        {faq.question}
                        <span className="text-cyan-400 transform transition-transform duration-300 group-open:rotate-45">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </span>
                    </summary>
                    <p className="text-slate-300 mt-3 pt-3 border-t-2 border-slate-700/50">{faq.answer}</p>
                </details>
            ))}
        </div>
      </InfoCard>

      <InfoCard title="Content Strategy">
         <div className="space-y-4">
            <div>
                <p className="font-semibold text-slate-300">Framework:</p>
                <p className="text-slate-200">{plan.contentStrategyFramework}</p>
            </div>
            <div>
                <p className="font-semibold text-slate-300">Supporting Blog/Content Ideas:</p>
                <ul className="list-disc list-inside pl-2 space-y-1 text-slate-200">
                    {plan.blogIdeas.map((idea, i) => <li key={i}>{idea}</li>)}
                </ul>
            </div>
            <div>
                <p className="font-semibold text-slate-300">Internal Linking Suggestions:</p>
                <p className="text-slate-200">{plan.internalLinking}</p>
            </div>
         </div>
      </InfoCard>
      
      <div className="text-center pt-4">
        <button
          onClick={onStartOver}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-xl shadow-cyan-500/20 text-lg"
        >
          Start a New Plan
        </button>
      </div>
    </div>
  );
};

export default Step3Plan;
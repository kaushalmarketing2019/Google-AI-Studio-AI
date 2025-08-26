import React, { useState, useCallback } from 'react';
import { OptimizationPlan, InputType, KeywordData } from './types';
import { generateKeywords, generateOptimizationPlan } from './services/geminiService';
import { getKeywordsVolume } from './services/dataForSeoService';
import Header from './components/Header';
import Step1Input from './components/Step1Input';
import Step2Keywords from './components/Step2Keywords';
import Step3Plan from './components/Step3Plan';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [userInput, setUserInput] = useState<string>('');
  const [inputType, setInputType] = useState<InputType>('idea');
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [optimizationPlan, setOptimizationPlan] = useState<OptimizationPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartOver = () => {
    setStep(1);
    setUserInput('');
    setInputType('idea');
    setKeywords([]);
    setOptimizationPlan(null);
    setIsLoading(false);
    setError(null);
  };

  const handleStep1Submit = useCallback(async (input: string, type: InputType) => {
    setIsLoading(true);
    setError(null);
    setUserInput(input);
    setInputType(type);
    try {
      const generatedKeywords = await generateKeywords(input, type);
      const keywordsWithVolume = await getKeywordsVolume(generatedKeywords);
      setKeywords(keywordsWithVolume);
      setStep(2);
    } catch (e) {
      console.error(e);
      setError('Failed to generate keywords. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStep2Approve = useCallback(async (finalKeywords: KeywordData[], primaryKeyword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generateOptimizationPlan(finalKeywords, primaryKeyword);
      setOptimizationPlan(plan);
      setStep(3);
    } catch (e) {
      console.error(e);
      setError('Failed to generate the optimization plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderStepContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
        return (
            <div className="text-center p-8 bg-red-500/10 border border-red-500/50 rounded-2xl backdrop-blur-md">
                <p className="text-red-300 font-semibold mb-4 text-lg">{error}</p>
                <button
                    onClick={handleStartOver}
                    className="bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-red-500/20"
                >
                    Try Again
                </button>
            </div>
        );
    }
    switch (step) {
      case 1:
        return <Step1Input onSubmit={handleStep1Submit} />;
      case 2:
        return <Step2Keywords initialKeywords={keywords} onApprove={handleStep2Approve} onRegenerate={() => handleStep1Submit(userInput, inputType)} />;
      case 3:
        return optimizationPlan ? <Step3Plan plan={optimizationPlan} onStartOver={handleStartOver} /> : null;
      default:
        return <Step1Input onSubmit={handleStep1Submit} />;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Header />
        <main className="mt-10">
          {renderStepContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
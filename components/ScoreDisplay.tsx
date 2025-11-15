import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { FileText, Target, User, Edit3, MessageSquare, Feather, Clipboard, Check, Tag } from './Icons';

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
  const percentage = score * 10;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 8) return 'text-brand-green';
    if (s >= 5) return 'text-yellow-500';
    return 'text-brand-pink';
  };
  
  const getTrackColor = (s: number) => {
    if (s >= 8) return 'stroke-brand-green';
    if (s >= 5) return 'stroke-yellow-500';
    return 'stroke-brand-pink';
  };

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className={`${getTrackColor(score)} transition-all duration-1000 ease-out`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${getColor(score)}`}>
        <span className="text-5xl font-bold font-display">{score}</span>
        <span className="text-lg text-brand-charcoal/70">/ 10</span>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ title: string; text: string; Icon: React.ElementType }> = ({ title, text, Icon }) => (
    <div className="bg-slate-100/50 p-4 rounded-lg h-full border border-gray-200/80">
        <div className="flex items-center gap-2 mb-2">
            <Icon className="w-5 h-5 text-brand-indigo" />
            <h4 className="font-semibold text-brand-charcoal">{title}</h4>
        </div>
        <p className="text-brand-charcoal/80 text-sm">{text}</p>
    </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.improvedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="w-full flex flex-col items-center animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold font-display text-brand-charcoal">Analysis Complete</h2>
      <ScoreCircle score={result.score} />
      
      <div className="w-full text-left space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <h3 className="text-xl font-bold text-brand-charcoal mb-2 flex items-center gap-2 font-display">
            <Tag className="w-5 h-5 text-brand-indigo" />
            Prompt Classification
          </h3>
          <div className="bg-slate-100/50 p-4 rounded-lg border border-gray-200/80">
            <p className="text-sm text-brand-charcoal/80">
              <span className="font-semibold">Detected Technique:</span> <span className="font-bold text-brand-indigo">{result.promptClassification}</span>
            </p>
            <hr className="my-2 border-gray-200" />
            <p className="text-sm text-brand-charcoal/80">{result.classificationFeedback}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-brand-charcoal mb-2 flex items-center gap-2 font-display"><Feather className="w-5 h-5 text-brand-indigo" />Improved Prompt</h3>
          <div className="bg-indigo-50 p-4 rounded-lg relative group border border-indigo-200">
            <pre className="text-brand-charcoal/90 text-sm whitespace-pre-wrap font-sans">{result.improvedPrompt}</pre>
            <button 
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-md text-gray-500 hover:text-brand-indigo transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm border border-gray-200"
              aria-label="Copy improved prompt"
            >
              {copied ? <Check className="w-5 h-5 text-brand-green" /> : <Clipboard className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
            <h3 className="text-xl font-bold text-brand-charcoal mb-2 font-display">Prompt Breakdown</h3>
            <p className="text-sm text-brand-charcoal/70 mb-3">Here's how the AI interpreted the components of your original prompt.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="Context" text={result.unpacked.context} Icon={FileText} />
                <InfoCard title="Role" text={result.unpacked.role} Icon={User} />
                <InfoCard title="Action" text={result.unpacked.action} Icon={Edit3} />
                <InfoCard title="Format" text={result.unpacked.format} Icon={MessageSquare} />
                <InfoCard title="Target & Tone" text={result.unpacked.target} Icon={Target} />
            </div>
        </div>

        <div>
            <h3 className="text-xl font-bold text-brand-charcoal mb-2 font-display">Detailed Feedback</h3>
            <div className="space-y-4">
                <InfoCard title="Overall Feedback" text={result.feedback.overall} Icon={Feather} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard title="Context" text={result.feedback.context} Icon={FileText} />
                    <InfoCard title="Role" text={result.feedback.role} Icon={User} />
                    <InfoCard title="Action" text={result.feedback.action} Icon={Edit3} />
                    <InfoCard title="Format" text={result.feedback.format} Icon={MessageSquare} />
                    <InfoCard title="Target & Tone" text={result.feedback.target} Icon={Target} />
                </div>
            </div>
        </div>
      </div>
       <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #e0f2fe;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #7dd3fc;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #38bdf8;
          }
      `}</style>
    </div>
  );
};

export default ResultsDisplay;
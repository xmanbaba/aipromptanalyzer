import React from 'react';
import { Feather, Layers, Brain, Sparkles } from './Icons';

interface PromptingTechniqueSelectorProps {
  technique: string;
  onTechniqueChange: (technique: string) => void;
}

const techniques = [
  {
    id: 'craft',
    name: 'CRAFT (Zero-Shot)',
    Icon: Feather,
    description: "Standard prompting. You give the AI a direct instruction without providing any examples in the prompt itself.",
    examples: [
        { type: 'Professional', text: 'As a financial analyst, create a report summarizing the Q3 performance of Company XYZ, focusing on revenue growth and profit margins. The format should be a formal memo.' },
        { type: 'Everyday', text: 'Write a short, friendly email to my friends to organize a potluck dinner for Saturday night.' }
    ]
  },
  {
    id: 'one-shot',
    name: 'One-Shot',
    Icon: Sparkles,
    description: "Provide one high-quality example of the task and desired output before giving the final instruction.",
    examples: [
        { type: 'Professional', text: "Example: [Product Name: 'QuantumLeap Laptop', Tone: 'Tech-savvy, professional', Slogan: 'Compute at the speed of thought.']. Your Task: [Product Name: 'EverGreen Smart Garden', Tone: 'Eco-conscious, friendly', Slogan: ...]" },
        { type: 'Everyday', text: "Example: 'Movie: Inception, Genre: Sci-Fi Thriller'. Your task: 'Movie: The Godfather, Genre: ...'" }
    ]
  },
  {
    id: 'few-shot',
    name: 'Few-Shot',
    Icon: Layers,
    description: "Provide 2-5 examples to demonstrate the pattern you want the AI to follow, especially for complex or nuanced tasks.",
    examples: [
        { type: 'Professional', text: "Example 1: [Sentiment: Positive, Text: 'The service was outstanding!']. Example 2: [Sentiment: Negative, Text: 'I was very disappointed with the quality.']. Your Task: [Sentiment: ..., Text: 'It was an average experience.']" },
        { type: 'Everyday', text: "Example 1: 'Input: 10, Output: Even'. Example 2: 'Input: 7, Output: Odd'. Your task: 'Input: 22, Output: ...'" }
    ]
  },
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought (CoT)',
    Icon: Brain,
    description: "Encourage the AI to 'think step by step' to break down complex reasoning problems before giving a final answer.",
    examples: [
        { type: 'Professional', text: "A client has a budget of $5000 for a marketing campaign. CPM is $10 and CPC is $2. If they want to allocate 60% of the budget to awareness (CPM) and 40% to conversions (CPC), how many impressions and clicks will they get? Let's think step by step." },
        { type: 'Everyday', text: "If I have 3 apples and I buy 2 more packs of 4 apples each, but then give half of all my apples to a friend, how many do I have left? Let's think step by step." }
    ]
  }
];

const PromptingTechniqueSelector: React.FC<PromptingTechniqueSelectorProps> = ({ technique, onTechniqueChange }) => {
  const selectedTechnique = techniques.find(t => t.id === technique) || techniques[0];

  return (
    <div className="bg-white p-6 rounded-xl shadow-card animate-fade-in">
      <h3 className="text-lg font-bold font-display text-brand-indigo mb-4">Choose Your Prompting Technique</h3>
      <fieldset>
        <legend className="sr-only">Prompting Technique</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {techniques.map((tech) => (
            <label
              key={tech.id}
              htmlFor={tech.id}
              className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                technique === tech.id
                  ? 'bg-indigo-50 border-brand-indigo shadow-inner'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                id={tech.id}
                name="prompting-technique"
                value={tech.id}
                checked={technique === tech.id}
                onChange={(e) => onTechniqueChange(e.target.value)}
                className="h-4 w-4 text-brand-indigo focus:ring-brand-indigo border-gray-300"
              />
              <span className="ml-3 text-sm font-medium text-brand-charcoal">{tech.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
            <selectedTechnique.Icon className="w-6 h-6 text-brand-indigo flex-shrink-0" />
            <h4 className="text-md font-bold text-brand-charcoal">{selectedTechnique.name}</h4>
        </div>
        <p className="text-sm text-brand-charcoal/80 mb-3">{selectedTechnique.description}</p>
        <div className="space-y-2">
            {selectedTechnique.examples.map((ex, i) => (
                <div key={i} className="text-xs text-brand-charcoal/80 p-2 bg-slate-200/50 rounded-md border-l-4 border-slate-300">
                    <span className="font-semibold text-brand-indigo/80">{ex.type}:</span>
                    <span className="italic ml-1">"{ex.text}"</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PromptingTechniqueSelector;

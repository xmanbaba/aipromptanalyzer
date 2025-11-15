import React from 'react';

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const examples = [
  { 
    prompt: "Act as a social media manager. Write a short, witty Instagram caption for an attached picture of a cat wearing sunglasses. The tone should be playful and engaging.",
    color: "border-brand-pink"
  },
  {
    prompt: "You are a professional chef. Create a simple, healthy recipe for a weeknight dinner based on an attached list of ingredients. Format the output as a markdown recipe card.",
    color: "border-brand-green"
  },
  {
    prompt: "I'm a student. Summarize the key arguments from the attached academic paper into five bullet points. The target audience is someone unfamiliar with the topic.",
    color: "border-brand-indigo"
  },
];

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="space-y-3 animate-fade-in">
      {examples.map((example, index) => (
        <button
          key={index}
          onClick={() => onSelectPrompt(example.prompt)}
          className={`w-full text-left p-3 bg-slate-50 rounded-md hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-sm text-brand-charcoal/80 hover:text-brand-charcoal border-l-4 ${example.color}`}
        >
          {example.prompt}
        </button>
      ))}
    </div>
  );
};

export default ExamplePrompts;
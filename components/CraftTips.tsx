import React from 'react';
import { FileText, User, Edit3, MessageSquare, Target, Lightbulb } from './Icons';

const tipsData = [
  {
    icon: FileText,
    title: "C: Context",
    description: "Provide background information, setting, or constraints. Why is the task important?",
    example: "Example: 'Our company is launching a new eco-friendly water bottle next month.'",
    tip: "Pro Tip: Imagine you're briefing a new team member. What essential info would they need to get started?"
  },
  {
    icon: User,
    title: "R: Role",
    description: "Define the persona the AI should adopt. Who should the AI be?",
    example: "Example: 'You are an expert marketing copywriter specializing in sustainable products.'",
    tip: "Pro Tip: Be specific. Instead of 'an expert,' try 'a skeptical financial analyst' or 'an encouraging fitness coach.'"
  },
  {
    icon: Edit3,
    title: "A: Action",
    description: "State the specific task you want the AI to perform. What should it do?",
    example: "Example: 'Write three taglines for the product launch campaign.'",
    tip: "Pro Tip: Use strong action verbs like 'generate,' 'summarize,' 'critique,' 'rewrite,' or 'compare.'"
  },
  {
    icon: MessageSquare,
    title: "F: Format",
    description: "Specify the desired output structure, style, or length.",
    example: "Example: 'Provide the output as a JSON array of strings.' or '...in a bulleted list.'",
    tip: "Pro Tip: Requesting specific formats like tables, code blocks, or markdown can make the output much easier to use."
  },
  {
    icon: Target,
    title: "T: Target & Tone",
    description: "Describe the intended audience and the desired emotional style.",
    example: "Example: 'The target audience is environmentally-conscious millennials. The tone should be upbeat and inspiring.'",
    tip: "Pro Tip: Use descriptive adjectives for tone, like 'formal,' 'witty,' 'empathetic,' or 'authoritative.'"
  }
];

const TipCard: React.FC<typeof tipsData[0]> = ({ icon: Icon, title, description, example, tip }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200/80 hover:border-brand-indigo/50 transition-colors duration-300">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="w-6 h-6 text-brand-indigo flex-shrink-0" />
      <h4 className="text-lg font-bold font-display text-brand-charcoal">{title}</h4>
    </div>
    <p className="text-brand-charcoal/80 text-sm mb-3">{description}</p>
    <p className="text-sm text-brand-charcoal mb-3 italic bg-indigo-50 p-2 rounded-md border border-indigo-100">{example}</p>
    <div className="flex items-start gap-2 text-sm text-brand-indigo/80">
        <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0"/>
        <p>{tip}</p>
    </div>
  </div>
);

const CraftTips: React.FC = () => {
  return (
    <div id="craft-tips" className="w-full bg-white p-6 rounded-xl shadow-card animate-fade-in">
      <h3 className="text-xl font-bold text-brand-charcoal mb-4 text-center font-display">C.R.A.F.T. Prompting Guide</h3>
      <div className="space-y-4">
        {tipsData.map((item) => (
          <TipCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
};

export default CraftTips;
import React, { useState, useRef } from 'react';
import { AnalysisResult, AttachedFile } from './types';
import { analyzePrompt } from './services/geminiService';
import ResultsDisplay from './components/ScoreDisplay';
import { Lightbulb, Paperclip, XCircle, Sparkles, Feather, User, LogOut } from './components/Icons';
import CraftTips from './components/CraftTips';
import ExamplePrompts from './components/ExamplePrompts';
import PromptingTechniqueSelector from './components/PromptingTechniqueSelector';

// --- Start of new Header Component ---
interface HeaderProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onSignUp: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onLogin, onLogout, onSignUp }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="text-xl sm:text-2xl font-display font-bold tracking-tight">
        <span className="text-brand-pink">C.R.A.F.T.</span> <span className="text-brand-indigo">Prompt Assistant</span>
      </div>
      <nav>
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <User className="w-8 h-8 p-1.5 rounded-full bg-slate-200 text-brand-indigo" />
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-sm font-semibold text-brand-charcoal/80 hover:text-brand-indigo transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onLogin}
              className="text-sm font-semibold text-brand-indigo hover:underline"
              aria-label="Login"
            >
              Login
            </button>
            <button
              onClick={onSignUp}
              className="text-sm font-semibold text-white bg-brand-indigo hover:bg-brand-indigo/90 transition-colors py-2 px-4 rounded-full"
              aria-label="Sign Up"
            >
              Sign Up
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};
// --- End of new Header Component ---


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [promptingTechnique, setPromptingTechnique] = useState<string>('craft');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTips, setShowTips] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleSignUp = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    const MAX_FILES = 2;
    if (attachedFiles.length + files.length > MAX_FILES) {
      setError(`You can attach a maximum of ${MAX_FILES} files.`);
      return;
    }

    const filePromises = Array.from(files).map((file: File) => {
      return new Promise<AttachedFile>((resolve, reject) => {
        const MAX_SIZE_MB = 4;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          reject(`File '${file.name}' is too large. Max size is ${MAX_SIZE_MB}MB.`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1];
          resolve({
            name: file.name,
            mimeType: file.type,
            data: base64Data,
          });
        };
        reader.onerror = () => {
          reject(`Failed to read file '${file.name}'.`);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises)
      .then(newFiles => {
        setAttachedFiles(prevFiles => [...prevFiles, ...newFiles]);
      })
      .catch(err => {
        setError(String(err));
      });

    if (event.target) {
      event.target.value = '';
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setAttachedFiles(files => files.filter((_, index) => index !== indexToRemove));
  };


  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const analysis = await analyzePrompt(prompt, attachedFiles, promptingTechnique);
      setResult(analysis);
    } catch (err) {
      setError('Failed to analyze prompt. Please check your connection or API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExampleSelect = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const isButtonDisabled = prompt.trim() === '' || isLoading;

  return (
    <div className="min-h-screen">
       <Header 
        isAuthenticated={isAuthenticated} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        onSignUp={handleSignUp}
      />
      <main className="max-w-7xl mx-auto flex flex-col space-y-8 p-4 sm:p-6 lg:p-8">
        <header className="text-center">
          <p className="text-brand-charcoal/70 font-light italic mt-1">An AI-powered tool to help you write better prompts.</p>
        </header>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-card">
              <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Write an email to our customers about the new loyalty program, making it sound exciting and exclusive..."
                rows={10}
                className="w-full bg-slate-100/50 border-2 border-gray-200 focus:border-brand-indigo focus:ring-brand-indigo rounded-lg p-4 text-brand-charcoal placeholder-gray-400 transition-colors duration-200"
                aria-label="Prompt Input"
              />
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                multiple
              />
              <div className="mt-4 flex items-center justify-between gap-4">
                 <div className="flex flex-wrap items-center gap-2 flex-grow min-w-0">
                    {attachedFiles.length > 0 &&
                        attachedFiles.map((file, index) => (
                        <div key={index} className="flex min-w-0 max-w-full items-center gap-2 text-sm bg-indigo-100 text-brand-indigo py-1.5 px-3 rounded-full">
                            <Paperclip className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate" title={file.name}>
                            {file.name}
                            </span>
                            <button
                            onClick={() => handleRemoveFile(index)}
                            className="text-indigo-400 hover:text-brand-indigo flex-shrink-0"
                            aria-label={`Remove ${file.name}`}
                            >
                            <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        ))
                    }
                 </div>
                <button
                  onClick={handleAttachClick}
                  disabled={attachedFiles.length >= 2}
                  className="text-brand-indigo border-2 border-brand-indigo hover:bg-brand-indigo hover:text-white transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-brand-indigo"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                  <span>Attach</span>
                </button>
              </div>
            </div>

            <PromptingTechniqueSelector
                technique={promptingTechnique}
                onTechniqueChange={setPromptingTechnique}
            />
            
            <ExamplePrompts onSelectPrompt={handleExampleSelect} />
            
            <div className="flex justify-center">
              <button
                  onClick={() => setShowTips(!showTips)}
                  className="text-brand-indigo hover:underline font-medium transition-colors duration-200 flex items-center justify-center gap-1 text-sm py-2 px-4"
                  aria-expanded={showTips}
                  aria-controls="craft-tips"
              >
                  <Lightbulb className="w-4 h-4" />
                  <span>{showTips ? 'Hide Prompting Guide' : 'Show Prompting Guide'}</span>
              </button>
            </div>
            
            {showTips && <CraftTips />}

            <button
              onClick={handleSubmit}
              disabled={isButtonDisabled}
              className={`w-full text-lg font-bold py-4 px-6 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center gap-3 text-white
              ${isButtonDisabled 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-brand-indigo to-brand-pink hover:-translate-y-1 hover:shadow-lg'
              }
              ${isLoading ? 'animate-pulse-strong' : ''}`}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Prompt'}
            </button>
          </div>

          <div className="flex flex-col justify-center items-center bg-white p-6 rounded-xl shadow-card min-h-[400px] lg:min-h-0">
            {isLoading ? (
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-brand-indigo mx-auto animate-spin" style={{animationDuration: '3s'}} />
                <p className="mt-4 text-lg font-medium text-brand-charcoal">AI is thinking...</p>
                <p className="text-brand-charcoal/70">Crafting your feedback.</p>
              </div>
            ) : error ? (
              <div className="text-center text-brand-pink">
                <h3 className="text-xl font-bold">Error</h3>
                <p>{error}</p>
              </div>
            ) : result ? (
              <ResultsDisplay result={result} />
            ) : (
              <div className="text-center">
                <Feather className="w-16 h-16 mx-auto text-brand-indigo opacity-50" />
                <h2 className="mt-4 text-2xl font-bold font-display text-brand-charcoal">Awaiting Your Prompt</h2>
                <p className="mt-2 text-brand-charcoal/70">Enter a prompt and click "Analyze" to see the magic happen.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
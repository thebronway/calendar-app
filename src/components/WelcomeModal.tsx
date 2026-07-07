import React, { useMemo } from 'react';
import { X, BookOpen, Github, ArrowRight, CalendarDays, CalendarCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import packageInfo from '../../package.json';
// Vite feature: imports the raw text of the markdown file
import changelogRaw from '../../CHANGELOG.md?raw';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToGuide: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onGoToGuide }) => {
  const version = packageInfo.version;

  // Dynamically extract the changelog for the current version
  const latestChangelog = useMemo(() => {
    const lines = changelogRaw.split('\n');
    let isCapturing = false;
    let extracted: string[] = [];

    // Attempt 1: Look for exact version match
    for (const line of lines) {
      if (line.startsWith(`### Release v${version}`)) {
        isCapturing = true;
        continue;
      }
      if (isCapturing && line.startsWith('### Release')) {
        break; // Stop when we hit the previous version's header
      }
      if (isCapturing && line.trim()) {
        extracted.push(line);
      }
    }

    // Attempt 2 (Fallback): If manually tagged and missing, just grab the topmost release block
    if (extracted.length === 0) {
      isCapturing = false;
      for (const line of lines) {
        if (!isCapturing && line.startsWith('### Release')) {
          isCapturing = true;
          continue; 
        } else if (isCapturing && line.startsWith('### Release')) {
          break; 
        }
        if (isCapturing && line.trim()) {
          extracted.push(line);
        }
      }
    }

    return extracted.length > 0 ? extracted.join('\n') : 'No specific changelog details found for this version.';
  }, [version]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-theme-panel text-theme-text border border-theme-item rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-theme-accent p-6 sm:p-8 flex justify-between items-start relative overflow-hidden shrink-0">
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 border border-white/30 text-theme-accent-text rounded-full text-xs font-bold mb-3 tracking-wider uppercase">
              Update Successful
            </span>
            <h2 className="text-3xl font-extrabold text-theme-accent-text leading-tight">
              Welcome to v{version}!
            </h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors relative z-10 bg-black/20 hover:bg-black/40 p-1.5 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8 bg-theme-base">
          
          {/* Quick Start Section */}
          <section>
            <h3 className="text-sm font-bold text-theme-text-secondary uppercase tracking-widest mb-3 flex items-center">
              <div className="bg-theme-accent/20 p-1.5 rounded-md mr-2">
                <CalendarDays size={18} className="text-theme-accent" />
              </div>
              Getting Started
            </h3>
            <p className="text-theme-text text-sm leading-relaxed mb-4">
              Thank you for updating! Your calendar is fully self-hosted and ready to go. Here are a few quick tips to get you up and running:
            </p>
            <ul className="space-y-2 text-sm text-theme-text mb-4 ml-1">
              <li className="flex items-start">
                <span className="text-theme-accent mr-2 font-bold">•</span>
                <span>Click the <strong>Key icon</strong> in the bottom bar to define your custom Categories (colors) and Activities (icons).</span>
              </li>
              <li className="flex items-start">
                <span className="text-theme-accent mr-2 font-bold">•</span>
                <span>Click the <strong>Settings icon</strong> to customize your app layout, timezone, and privacy features.</span>
              </li>
            </ul>
            <button 
              onClick={() => { onClose(); onGoToGuide(); }}
              className="text-sm font-bold text-theme-accent hover:opacity-80 flex items-center group transition-colors"
            >
              <BookOpen size={16} className="mr-2" /> Read the full User Guide
              <ArrowRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
            </button>
          </section>

          <hr className="border-theme-grid-divider" />

          {/* Dynamic Changelog Section */}
          <section>
            <h3 className="text-sm font-bold text-theme-text-secondary uppercase tracking-widest mb-4 flex items-center">
              <div className="bg-theme-accent-secondary/20 p-1.5 rounded-md mr-2">
                <CalendarCheck size={18} className="text-theme-accent-secondary" />
              </div>
              What's New in v{version}
            </h3>
            <div className="bg-theme-panel border border-theme-item rounded-xl p-5 shadow-sm">
              <div className="prose prose-sm prose-blue dark:prose-invert max-w-none prose-li:my-1 text-theme-text">
                <ReactMarkdown>
                  {latestChangelog}
                </ReactMarkdown>
              </div>
            </div>
            
            <a 
              href="https://github.com/thebronway/calendar-app/blob/main/CHANGELOG.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-bold text-theme-text-secondary hover:text-theme-text mt-4 transition-colors"
            >
              <Github size={16} className="mr-2" /> View full changelog on GitHub
            </a>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 bg-theme-item border-t border-theme-item shrink-0 flex justify-end">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto bg-theme-accent hover:opacity-90 text-theme-accent-text font-bold py-3 px-8 rounded-xl shadow-lg transition-colors flex items-center justify-center"
          >
            Got it, let's go!
          </button>
        </div>

      </div>
    </div>
  );
};

export default WelcomeModal;
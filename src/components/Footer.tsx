import React from 'react';
import { Github, Database, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="max-w-screen-2xl mx-auto p-4 sm:p-6 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-300 dark:border-gray-700 mt-12">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <span>v0.8.6</span>
        <span className="hidden sm:inline">|</span>
        <a
          href="https://github.com/thebronway/calendar-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Github size={16} /> GitHub
        </a>
        <span className="hidden sm:inline">|</span>
        <a
          href="https://hub.docker.com/r/thebronway/calendar-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Database size={16} /> Docker Hub
        </a>
        <span className="hidden sm:inline">|</span>
        <a
          href="https://brian.conway.im/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Globe size={16} /> brian.conway.im
        </a>
      </div>
    </footer>
  );
};

export default Footer;

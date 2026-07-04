import React from 'react';
import Footer from '../Footer';
import { sanitizeHtml } from '../../utils/helpers';

interface MainLayoutProps {
  bannerHtml?: string | null;
  header: React.ReactNode;
  modals: React.ReactNode;
  children: React.ReactNode;
  hasBottomNav?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ bannerHtml, header, modals, children, hasBottomNav }) => {
  return (
    <div className={`min-h-screen bg-theme-base transition-colors duration-300 font-sans text-gray-900 dark:text-gray-100 ${hasBottomNav ? 'pb-24 sm:pb-28' : ''}`}>
      {bannerHtml && (
        <div
          className="sticky top-0 z-[70] bg-yellow-50 border-b border-yellow-300 text-yellow-800 py-2 px-4 text-center text-sm font-medium shadow-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(bannerHtml) }}
        />
      )}

      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6">
        {header}
        {children}
      </div>

      {modals}
      <Footer />
    </div>
  );
};

export default MainLayout;
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import guideContent from '../../docs/USER_GUIDE.md?raw';

const UserGuide: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 md:p-10 mb-8 max-w-4xl mx-auto">
      <div className="prose prose-blue dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {guideContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default UserGuide;
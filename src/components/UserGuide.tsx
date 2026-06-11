import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rawGuideContent from '../../docs/USER_GUIDE.md?raw';

// Seamlessly rewrite GitHub-native relative paths into absolute production assets at runtime
const transformedContent = rawGuideContent.replace(
  /src=["']\.\.\/public\/screenshots\/(.*?)["']/g,
  'src="/screenshots/$1"'
);

const UserGuide: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 md:p-10 mb-8 max-w-4xl mx-auto">
      <div className="prose prose-blue dark:prose-invert max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw, rehypeSlug]}
          components={{
            a: ({ node, ...props }) => {
              // Check if the link is an external HTTP link
              const isExternal = props.href?.startsWith('http');
              return (
                <a
                  {...props}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                />
              );
            },
          }}
        >
          {transformedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default UserGuide;
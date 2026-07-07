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
  // React SPAs don't natively scroll to URL hashes on initial load.
  // This hook catches the hash on load and after clicking ToC links.
  React.useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          // Slight delay to ensure the DOM has painted the markdown
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  return (
    <div className="bg-theme-panel text-theme-text rounded-xl shadow-sm border border-theme-item p-6 md:p-10 mb-8 max-w-4xl mx-auto">
      <div className="prose prose-blue dark:prose-invert max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw, rehypeSlug]}
          components={{
            a: ({ node, ...props }) => {
              const isExternal = props.href?.startsWith('http');
              const isHash = props.href?.startsWith('#');
              
              return (
                <a
                  {...props}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  onClick={(e) => {
                    // Manually handle internal hash routing securely
                    if (isHash && props.href) {
                      e.preventDefault();
                      window.history.pushState(null, '', props.href);
                      window.dispatchEvent(new HashChangeEvent('hashchange'));
                    }
                  }}
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
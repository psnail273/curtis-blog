import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="article-prose prose-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => {
            if (!src || typeof src !== 'string') return null;
            return (
              <span className="block my-8">
                <Image
                  src={src}
                  alt={alt || ''}
                  width={768}
                  height={432}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="w-full h-auto rounded-lg"
                />
              </span>
            );
          },
          // First paragraph gets drop cap via CSS
          p: ({ children, node }) => {
            const parent = node?.position;
            const isFirst = parent?.start?.line === 1;
            return (
              <p className={isFirst ? 'drop-cap' : undefined}>
                {children}
              </p>
            );
          },
          // Links open in new tab for external URLs
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

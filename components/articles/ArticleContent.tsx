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
          // Images break wider for editorial impact
          img: ({ src, alt }) => {
            if (!src || typeof src !== 'string') return null;
            return (
              <span className="block -mx-4 md:-mx-8 lg:-mx-16 my-8">
                <Image
                  src={src}
                  alt={alt || ''}
                  width={896}
                  height={504}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 896px"
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

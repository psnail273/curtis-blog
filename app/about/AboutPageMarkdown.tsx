'use client';

import ReactMarkdown from 'react-markdown';

interface AboutPageMarkdownProps {
  content: string;
}

/**
 * Client component that renders Markdown content for the about page.
 * Uses the `markdown-preview` CSS class defined in globals.css for
 * consistent styling with the site's warm cream/Mid-Century Modern theme.
 *
 * react-markdown does not render raw HTML by default, providing XSS safety.
 */
export function AboutPageMarkdown({ content }: AboutPageMarkdownProps) {
  return (
    <div className="markdown-preview text-base leading-relaxed">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo, useCallback, Children, isValidElement } from 'react';
import { useMediaQuery } from './hooks/useMediaQuery';

interface AnimatedOutputProps {
  content: React.ReactNode;
  onComplete: () => void;
  onScrollRequest?: () => void;
  linesPerTick?: number;
  tickDelay?: number;
  skipSignal?: boolean;
}

export function AnimatedOutput({
  content,
  onComplete,
  onScrollRequest,
  linesPerTick = 1,
  tickDelay = 40,
  skipSignal = false,
}: AnimatedOutputProps) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Parse content into array of "lines" (child elements or text lines)
  const lines = useMemo(() => {
    if (!content) return [];

    // If content is a React element with children, extract children as lines
    if (isValidElement(content)) {
      const props = content.props as { children?: React.ReactNode };
      if (props.children) {
        const childArray = Children.toArray(props.children);
        return childArray;
      }
    }

    // If content is an array, use as-is
    if (Array.isArray(content)) {
      return content;
    }

    // If content is a single element or string, treat as one line
    return [content];
  }, [content]);

  const totalLines = lines.length;
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Handle skip signal from parent
  useEffect(() => {
    if (skipSignal && !isComplete) {
      setVisibleLineCount(totalLines);
      setIsComplete(true);
      onComplete();
    }
  }, [skipSignal, isComplete, totalLines, onComplete]);

  // Handle reduced motion -- show everything immediately
  useEffect(() => {
    if (prefersReducedMotion && !isComplete) {
      setVisibleLineCount(totalLines);
      setIsComplete(true);
      onComplete();
    }
  }, [prefersReducedMotion, isComplete, totalLines, onComplete]);

  // Handle empty content
  useEffect(() => {
    if (totalLines === 0 && !isComplete) {
      setIsComplete(true);
      onComplete();
    }
  }, [totalLines, isComplete, onComplete]);

  // Line-by-line reveal animation
  useEffect(() => {
    if (prefersReducedMotion || isComplete || totalLines === 0) return;

    if (visibleLineCount >= totalLines) {
      setIsComplete(true);
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setVisibleLineCount((prev) => Math.min(prev + linesPerTick, totalLines));
    }, tickDelay);

    return () => clearTimeout(timer);
  }, [visibleLineCount, totalLines, prefersReducedMotion, isComplete, onComplete, linesPerTick, tickDelay]);

  // Trigger scroll when new lines appear
  const handleScrollRequest = useCallback(() => {
    if (onScrollRequest) {
      onScrollRequest();
    }
  }, [onScrollRequest]);

  useEffect(() => {
    if (visibleLineCount > 0) {
      handleScrollRequest();
    }
  }, [visibleLineCount, handleScrollRequest]);

  return (
    <div>
      {lines.slice(0, visibleLineCount).map((line, index) => (
        <div
          key={index}
          className="terminal-output-line"
        >
          {line}
        </div>
      ))}
    </div>
  );
}

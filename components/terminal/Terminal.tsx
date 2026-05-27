'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TerminalWindow } from './TerminalWindow';
import { TerminalOutput } from './TerminalOutput';
import { TerminalInput } from './TerminalInput';
import { executeCommand, CLEAR_TERMINAL_SIGNAL } from './commands';
import type { CommandContext } from './commands';
import './terminal.css';

export interface CommandHistoryEntry {
  id: string;
  command: string;
  output: React.ReactNode;
  timestamp: number;
  directory: string;
}

export function Terminal() {
  const [commandHistory, setCommandHistory] = useState<CommandHistoryEntry[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('~');
  const [animatingEntryId, setAnimatingEntryId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [skipSignal, setSkipSignal] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message (will animate on first load)
  useEffect(() => {
    const welcomeId = 'welcome';
    setCommandHistory([
      {
        id: welcomeId,
        command: '',
        output: (
          <>
            <p>Welcome to Curtis&apos;s Blog Terminal.</p>
            <p className="text-muted">Type &apos;help&apos; for available commands.</p>
          </>
        ),
        timestamp: Date.now(),
        directory: '~',
      },
    ]);

    // Animate welcome message
    setAnimatingEntryId(welcomeId);
    setIsAnimating(true);
  }, []);

  // Always keep terminal scrolled to the bottom
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    scrollToBottom();
    // Also scroll after the next paint to catch layout shifts
    requestAnimationFrame(scrollToBottom);
  }, [commandHistory]);

  // Smooth scroll callback for animation ticks
  const handleScrollRequest = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setAnimatingEntryId(null);
    setIsAnimating(false);
    setSkipSignal(false);
  }, []);

  const handleSkipAnimation = useCallback(() => {
    // Signal AnimatedOutput to skip to the end
    setSkipSignal(true);
  }, []);

  // Escape key to skip animation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && animatingEntryId) {
        handleSkipAnimation();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [animatingEntryId, handleSkipAnimation]);

  const handleCommandSubmit = (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return; // Ignore empty commands

    // Don't allow new commands while animating
    if (isAnimating) return;

    const context: CommandContext = {
      currentDirectory,
      setCurrentDirectory,
    };

    const output = executeCommand(trimmed, context);

    // Check for special CLEAR_TERMINAL_SIGNAL
    if (output === CLEAR_TERMINAL_SIGNAL) {
      const welcomeId = 'welcome-' + Date.now();
      setCommandHistory([
        {
          id: welcomeId,
          command: '',
          output: (
            <>
              <p>Welcome to Curtis&apos;s Blog Terminal.</p>
              <p className="text-muted">Type &apos;help&apos; for available commands.</p>
            </>
          ),
          timestamp: Date.now(),
          directory: currentDirectory,
        },
      ]);
      setCurrentInput('');

      // Animate the new welcome message
      setAnimatingEntryId(welcomeId);
      setIsAnimating(true);
      setSkipSignal(false);
      return;
    }

    // Normal command: add to history and trigger animation (limit to last 20 entries)
    const newEntryId = Date.now().toString();
    setCommandHistory((prev) => {
      const updated = [
        ...prev,
        {
          id: newEntryId,
          command: trimmed,
          output,
          timestamp: Date.now(),
          directory: currentDirectory,
        },
      ];
      return updated.slice(-20);
    });
    setCurrentInput('');

    // Start animation for new entry
    setAnimatingEntryId(newEntryId);
    setIsAnimating(true);
    setSkipSignal(false);
  };

  return (
    <TerminalWindow>
      <div
        ref={contentRef}
        className="terminal-scrollable overflow-y-auto max-h-[250px] sm:max-h-[350px] md:max-h-[500px] overscroll-contain cursor-text"
        onClick={() => {
          // Focus input when user clicks anywhere in terminal
          const input = document.getElementById('terminal-input');
          if (input) {
            input.focus();
          }
        }}
      >
        <TerminalOutput
          history={commandHistory}
          animatingEntryId={animatingEntryId}
          onAnimationComplete={handleAnimationComplete}
          onSkipAnimation={handleSkipAnimation}
          onScrollRequest={handleScrollRequest}
          skipSignal={skipSignal}
        />
      </div>
      <TerminalInput
        value={currentInput}
        onChange={setCurrentInput}
        onSubmit={handleCommandSubmit}
        disabled={isAnimating}
        currentDirectory={currentDirectory}
      />
    </TerminalWindow>
  );
}

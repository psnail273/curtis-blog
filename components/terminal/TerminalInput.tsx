'use client';

import { useRef, useEffect } from 'react';

interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (command: string) => void;
  disabled?: boolean;
  currentDirectory?: string;
}

export function TerminalInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  currentDirectory = '~',
}: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const prevDisabledRef = useRef(disabled);

  // Auto-focus only on desktop (screen width > 768px)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, []);

  // Restore focus when animation completes (disabled transitions true -> false)
  useEffect(() => {
    const wasDisabled = prevDisabledRef.current;
    prevDisabledRef.current = disabled;

    if (wasDisabled && !disabled) {
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        inputRef.current?.focus();
      }
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        onSubmit(value);
      }
    }
  };

  return (
    <div className="flex items-center gap-1 min-h-[44px] py-2 min-w-0">
      <label
        htmlFor="terminal-input"
        className={`font-terminal shrink-0 text-xs sm:text-sm ${
          disabled ? 'text-muted' : 'text-accent'
        }`}
      >
        <span className="hidden sm:inline">visitor@curtis.blog {currentDirectory} $</span>
        <span className="sm:hidden">visitor {currentDirectory} $</span>
      </label>

      {/* Input field */}
      <input
        ref={inputRef}
        id="terminal-input"
        type="text"
        value={value}
        onChange={(e) => !disabled && onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="terminal-input flex-1 bg-transparent outline-none font-terminal text-base text-body disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        aria-label="Terminal command input"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

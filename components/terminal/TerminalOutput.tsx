import { CommandHistoryEntry } from './Terminal';
import { AnimatedOutput } from './AnimatedOutput';

interface TerminalOutputProps {
  history: CommandHistoryEntry[];
  animatingEntryId: string | null;
  onAnimationComplete: () => void;
  onSkipAnimation: () => void;
  onScrollRequest?: () => void;
  skipSignal?: boolean;
}

export function TerminalOutput({
  history,
  animatingEntryId,
  onAnimationComplete,
  onSkipAnimation,
  onScrollRequest,
  skipSignal = false,
}: TerminalOutputProps) {
  return (
    <div
      className="space-y-3 mb-4 font-terminal"
      onClick={() => {
        if (animatingEntryId) {
          onSkipAnimation();
        }
      }}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {history.map((entry) => {
        const isAnimating = entry.id === animatingEntryId;

        return (
          <div key={entry.id} className="space-y-1">
            {/* Show prompt + command if command exists */}
            {entry.command && (
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-accent shrink-0 text-xs sm:text-sm">
                  <span className="hidden sm:inline">visitor@curtis.blog $</span>
                  <span className="sm:hidden">visitor $</span>
                </span>
                <span className="text-body truncate">{entry.command}</span>
              </div>
            )}

            {/* Show output - animated if this is the current animating entry */}
            {entry.output && (
              <div className="text-body pl-0">
                {isAnimating ? (
                  <AnimatedOutput
                    content={entry.output}
                    onComplete={onAnimationComplete}
                    onScrollRequest={onScrollRequest}
                    skipSignal={skipSignal}
                  />
                ) : (
                  entry.output
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

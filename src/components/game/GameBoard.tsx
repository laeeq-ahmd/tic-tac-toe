import React from 'react';
import { Player, Board } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  board: Board;
  currentPlayer: Player;
  winningLine: number[] | null;
  onCellClick: (index: number) => void;
  disabled?: boolean;
  isWaiting?: boolean; // New prop for restart request state
}

const XMark: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <svg
    className="w-12 h-12 sm:w-16 sm:h-16"
    viewBox="0 0 100 100"
  >
    <line
      x1="20" y1="20" x2="80" y2="80"
      className={cn(
        "stroke-player-x stroke-[8] rounded-full",
        animate && "animate-draw-x"
      )}
      strokeLinecap="round"
    />
    <line
      x1="80" y1="20" x2="20" y2="80"
      className={cn(
        "stroke-player-x stroke-[8] rounded-full",
        animate && "animate-draw-x"
      )}
      strokeLinecap="round"
      style={{ animationDelay: '0.1s' }}
    />
  </svg>
);

const OMark: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <svg
    className="w-12 h-12 sm:w-16 sm:h-16"
    viewBox="0 0 100 100"
  >
    <circle
      cx="50" cy="50" r="35"
      className={cn(
        "stroke-player-o stroke-[8] fill-none",
        animate && "animate-draw-o"
      )}
      strokeLinecap="round"
    />
  </svg>
);

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPlayer,
  winningLine,
  onCellClick,
  disabled = false,
  isWaiting = false,
}) => {
  const isWinningCell = (index: number) => winningLine?.includes(index);

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-6 animate-scale-in">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => onCellClick(index)}
            disabled={disabled || cell !== null}
            className={cn(
              "aspect-square rounded-2xl flex items-center justify-center",
              "transition-all duration-300 ease-out",
              "bg-secondary/50",
              "border border-border/50",
              "w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] md:w-[96px] md:h-[96px]",

              // Cursor state
              (disabled || cell !== null || isWaiting) ? "cursor-not-allowed" : "cursor-pointer",
              isWaiting && "opacity-80",

              // Hover effects (only if active, empty, and NOT waiting)
              !cell && !disabled && !isWaiting && "hover:bg-secondary hover:scale-[1.02] hover:shadow-card active:scale-[0.98]",

              isWinningCell(index) && cell === 'X' && "glow-x bg-primary/10",
              isWinningCell(index) && cell === 'O' && "glow-o bg-accent/10",
            )}
          >
            {cell === 'X' && <XMark />}
            {cell === 'O' && <OMark />}
            {!cell && !disabled && !isWaiting && (
              <span className="opacity-0 group-hover:opacity-20 transition-opacity">
                {currentPlayer === 'X' ? <XMark animate={false} /> : <OMark animate={false} />}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;

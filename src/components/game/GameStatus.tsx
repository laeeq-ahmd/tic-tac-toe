import React from 'react';
import { Player, GameStatus as Status } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';
import { Trophy, Minus } from 'lucide-react';

interface GameStatusProps {
  currentPlayer: Player;
  winner: Player;
  status: Status;
  isYourTurn?: boolean;
  playerLabel?: string;
  opponentLabel?: string;
  mySymbol?: 'X' | 'O' | null;
}

const GameStatusDisplay: React.FC<GameStatusProps> = ({
  currentPlayer,
  winner,
  status,
  isYourTurn = true,
  playerLabel = 'Player',
  opponentLabel = 'Opponent',
  mySymbol = null,
}) => {
  const renderContent = () => {
    if (status === 'won') {
      return (
        <div className="flex items-center gap-3 animate-scale-in">
          <div className={cn(
            "p-3 rounded-2xl",
            winner === 'X' ? "bg-primary/20 text-player-x" : "bg-accent/20 text-player-o"
          )}>
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Winner</p>
            <p className={cn(
              "text-2xl font-bold",
              winner === 'X' ? "text-player-x" : "text-player-o"
            )}>
              Player {winner}
            </p>
          </div>
        </div>
      );
    }

    if (status === 'draw') {
      return (
        <div className="flex items-center gap-3 animate-scale-in">
          <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
            <Minus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Game Over</p>
            <p className="text-2xl font-bold text-foreground">It's a Draw!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-4 h-4 rounded-full animate-pulse",
          currentPlayer === 'X' ? "bg-player-x" : "bg-player-o"
        )} />
        <div>
          <p className="text-sm text-muted-foreground">Current Turn</p>
          <p className={cn(
            "text-xl font-semibold",
            currentPlayer === 'X' ? "text-player-x" : "text-player-o"
          )}>
            Player {currentPlayer}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between w-full">
      {renderContent()}

      {mySymbol && (
        <div className="text-right border-l pl-4 border-border/50">
          <p className="text-xs text-muted-foreground mb-0.5">You are</p>
          <div className={cn(
            "px-2 py-1 rounded-lg text-sm font-bold inline-block",
            mySymbol === 'X' ? "bg-player-x/10 text-player-x" : "bg-player-o/10 text-player-o"
          )}>
            Player {mySymbol}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStatusDisplay;

import React from 'react';
import { cn } from '@/lib/utils';

interface ScoreBoardProps {
  scores: { X: number; O: number; draws: number };
  playerXLabel?: string;
  playerOLabel?: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
  scores,
  playerXLabel = 'Player X',
  playerOLabel = 'Player O',
}) => {
  return (
    <div className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4 animate-fade-up">
      <div className="flex-1 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{playerXLabel}</p>
        <p className="text-2xl font-bold text-player-x">{scores.X}</p>
      </div>
      
      <div className="flex-1 text-center border-x border-border/50 px-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Draws</p>
        <p className="text-2xl font-bold text-muted-foreground">{scores.draws}</p>
      </div>
      
      <div className="flex-1 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{playerOLabel}</p>
        <p className="text-2xl font-bold text-player-o">{scores.O}</p>
      </div>
    </div>
  );
};

export default ScoreBoard;

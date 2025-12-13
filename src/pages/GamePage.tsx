import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useGameState, GameMode, BotDifficulty } from '@/hooks/useGameState';
import { ArrowLeft, RotateCcw, Home, Users, Bot, Brain, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { socket } from '@/lib/socket'; // Import socket
import { Button } from '@/components/ui/button';
import GameBoard from '@/components/game/GameBoard';
import GameStatusDisplay from '@/components/game/GameStatus';
import ScoreBoard from '@/components/game/ScoreBoard';
import Confetti from '@/components/game/Confetti';
import AnimatedBackground from '@/components/AnimatedBackground';
import ThemeToggle from '@/components/ThemeToggle';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useParams<{ mode: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const gameMode = (mode as GameMode) || 'local';

  const roomCode = searchParams.get('room');
  const urlSymbol = searchParams.get('symbol') as 'X' | 'O' | null;

  // For bot mode, if no symbol in URL, we wait for selection
  const [botPlayerSymbol, setBotPlayerSymbol] = useState<'X' | 'O' | null>(urlSymbol);
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');

  const mySymbol = gameMode === 'bot' ? botPlayerSymbol : urlSymbol;
  const displaySymbol = gameMode === 'bot' ? mySymbol : urlSymbol;

  const {
    board,
    currentPlayer,
    winner,
    winningLine,
    status,
    scores,
    makeMove,
    resetGame,
    opponentDisconnected,
    restartRequested,
    opponentRequestedRestart,
    rejectRestart,
    highlightButtons,
  } = useGameState(gameMode, { roomCode, mySymbol, difficulty });

  if (gameMode === 'bot' && !botPlayerSymbol) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6">
        <AnimatedBackground />
        <ThemeToggle />

        <div className="w-full max-w-md animate-fade-up space-y-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Game Setup</h1>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Select Difficulty</p>
            <div className="relative grid grid-cols-3 p-2 glass-card rounded-2xl isolate">
              {/* Sliding Background */}
              <div
                className={cn(
                  "absolute top-2 bottom-2 left-2 w-[calc((100%-1rem)/3)] rounded-xl bg-background shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] -z-10",
                  difficulty === 'medium' && "translate-x-[100%]",
                  difficulty === 'hard' && "translate-x-[200%]"
                )}
              />

              {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "py-3 px-4 rounded-xl text-sm font-semibold transition-colors capitalize",
                    difficulty === d
                      ? cn(
                        d === 'easy' && "text-emerald-500",
                        d === 'medium' && "text-player-x",
                        d === 'hard' && "text-player-o"
                      )
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Choose Your Side</p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="game"
                size="xl"
                className="h-auto py-8 flex flex-col gap-4"
                onClick={() => setBotPlayerSymbol('X')}
              >
                <p className="font-semibold text-lg">Play as X</p>
                <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-primary/10">
                  <span className="text-4xl font-bold text-player-x">X</span>
                </div>
                <p className="text-sm text-muted-foreground">You go first</p>
              </Button>

              <Button
                variant="game"
                size="xl"
                className="h-auto py-8 flex flex-col gap-4"
                onClick={() => setBotPlayerSymbol('O')}
              >
                <p className="font-semibold text-lg">Play as O</p>
                <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-accent/10">
                  <span className="text-4xl font-bold text-player-o">O</span>
                </div>
                <p className="text-sm text-muted-foreground">Bot goes first</p>
              </Button>
            </div>
          </div>

          <Button variant="ghost" onClick={() => navigate('/')}>
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  const getModeTitle = () => {
    switch (gameMode) {
      case 'local': return 'Local 2-Player';
      case 'bot': return 'Play vs Bot';
      default: return 'Tic Tac Toe+';
    }
  };

  const getPlayerLabels = () => {
    if (gameMode === 'bot') {
      return mySymbol === 'X'
        ? { X: 'You', O: 'Bot' }
        : { X: 'Bot', O: 'You' };
    }
    return { X: 'Player X', O: 'Player O' };
  };

  const handleLeave = () => {
    if (gameMode === 'online') {
      socket.emit('leave_room');
    }
    navigate('/');
  };

  const labels = getPlayerLabels();

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      <AnimatedBackground />
      <ThemeToggle />
      <Confetti show={status === 'won'} />

      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between mb-8 animate-fade-up">
        <Button
          variant="glass"
          size="icon"
          onClick={handleLeave}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <h1 className="text-xl font-semibold text-foreground">
          {getModeTitle()}
        </h1>

        <div className="w-11" /> {/* Spacer for alignment */}
      </header>

      <main className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Score Board */}
        <ScoreBoard
          scores={scores}
          playerXLabel={labels.X}
          playerOLabel={labels.O}
        />

        {/* Game Status */}
        <div className="glass-card rounded-2xl px-6 py-4 w-full animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <GameStatusDisplay
            currentPlayer={currentPlayer}
            winner={winner}
            status={status}
            mySymbol={displaySymbol}
          />
        </div>

        {/* Game Board */}
        <div style={{ animationDelay: '0.2s' }}>
          <GameBoard
            board={board}
            currentPlayer={currentPlayer}
            winningLine={winningLine}
            onCellClick={makeMove}
            disabled={status !== 'playing' || (gameMode === 'bot' && currentPlayer !== mySymbol)}
            isWaiting={restartRequested || opponentRequestedRestart}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          {opponentRequestedRestart ? (
            <div className="flex flex-1 gap-2">
              <Button
                variant="glass"
                size="lg"
                className={cn(
                  "flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20 transition-all duration-300",
                  highlightButtons && "shadow-[0_0_20px_rgba(34,197,94,0.6)] border-green-500"
                )}
                onClick={resetGame}
              >
                <Check className="w-5 h-5 stroke-[3]" />
              </Button>
              <Button
                variant="glass"
                size="lg"
                className={cn(
                  "flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20 transition-all duration-300",
                  highlightButtons && "shadow-[0_0_20px_rgba(239,68,68,0.6)] border-red-500"
                )}
                onClick={rejectRestart}
              >
                <X className="w-5 h-5 stroke-[3]" />
              </Button>
            </div>
          ) : (
            <Button
              variant="glass"
              size="lg"
              onClick={() => {
                if (opponentDisconnected) {
                  navigate('/multiplayer');
                } else {
                  resetGame();
                }
              }}
              disabled={restartRequested && !opponentDisconnected}
              className="flex-1 gap-2"
            >
              <RotateCcw className={cn("w-4 h-4", restartRequested && "animate-spin")} />
              {opponentDisconnected ? 'New Game'
                : restartRequested ? 'Waiting...'
                  : (status !== 'playing' ? 'Play Again' : 'Restart')}
            </Button>
          )}

          {/* Navigation - Only show if not waiting for restart or just show as auxiliary */}
          <Button
            variant="glass"
            size="lg"
            className="flex-1"
            onClick={handleLeave}
          >
            <Home className="w-4 h-4 mr-2" />
            Menu
          </Button>
        </div>
      </main>
    </div>
  );
};


export default GamePage;

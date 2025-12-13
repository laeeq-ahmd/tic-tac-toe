import { useState, useCallback, useEffect } from 'react';
import { socket } from '@/lib/socket';
import { toast } from 'sonner';

export type Player = 'X' | 'O' | null;
export type Board = Player[];
export type GameMode = 'local' | 'online' | 'bot';
export type GameStatus = 'playing' | 'won' | 'draw';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player;
  winningLine: number[] | null;
  status: GameStatus;
  scores: { X: number; O: number; draws: number };
}

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const initialBoard = (): Board => Array(9).fill(null);

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export function useGameState(mode: GameMode, options?: { roomCode?: string | null, mySymbol?: 'X' | 'O' | null, difficulty?: BotDifficulty }) {
  const [board, setBoard] = useState<Board>(initialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [restartRequested, setRestartRequested] = useState(false);
  const [opponentRequestedRestart, setOpponentRequestedRestart] = useState(false);

  const checkWinner = useCallback((board: Board): { winner: Player; line: number[] | null } => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: combo };
      }
    }
    return { winner: null, line: null };
  }, []);

  const checkDraw = useCallback((board: Board): boolean => {
    return board.every(cell => cell !== null);
  }, []);

  const getBotMove = useCallback((board: Board): number => {
    const bot = options?.mySymbol === 'O' ? 'X' : 'O';
    // Opponent is options?.mySymbol (which is 'X' if bot is 'O', or 'O' if bot is 'X')
    const opponent = options?.mySymbol || (bot === 'X' ? 'O' : 'X');

    const available = board.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
    const difficulty = options?.difficulty || 'hard';

    // Helper to find winning move
    const findWinningMove = (player: Player): number | null => {
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          const testBoard = [...board];
          testBoard[i] = player;
          const { winner } = checkWinner(testBoard);
          if (winner === player) return i;
        }
      }
      return null;
    };

    // Easy: Random move
    if (difficulty === 'easy') {
      if (Math.random() > 0.3) {
        // 70% chance purely random
        return available[Math.floor(Math.random() * available.length)];
      }
      // 30% chance to try to win somewhat accidentally or block? 
      // Actually, for "Easy", purely random is good, or maybe just block if obvious.
      // Let's stick to mostly random but take a win if it's there to be slightly competitive.
      const winMove = findWinningMove(bot);
      if (winMove !== null) return winMove;
      return available[Math.floor(Math.random() * available.length)];
    }

    // Medium: Win if can, Block if can (50% chance), then Random
    if (difficulty === 'medium') {
      const winMove = findWinningMove(bot);
      if (winMove !== null) return winMove;

      const blockMove = findWinningMove(opponent);
      if (blockMove !== null && Math.random() > 0.4) { // 60% chance to block
        return blockMove;
      }

      // Center if available (good strategy)
      if (board[4] === null) return 4;

      return available[Math.floor(Math.random() * available.length)];
    }

    // Hard: Unbeatable (Win -> Block -> Center -> Corners -> Random)
    if (difficulty === 'hard') {
      const winMove = findWinningMove(bot);
      if (winMove !== null) return winMove;

      const blockMove = findWinningMove(opponent);
      if (blockMove !== null) return blockMove;

      if (board[4] === null) return 4;

      const corners = [0, 2, 6, 8];
      const availableCorners = corners.filter(i => board[i] === null);
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
      }

      return available[Math.floor(Math.random() * available.length)];
    }

    return available[Math.floor(Math.random() * available.length)];
  }, [checkWinner, options]);

  // Online Logic
  useEffect(() => {
    if (mode !== 'online' || !options?.roomCode) return;

    socket.connect();

    const onMoveMade = (data: { board: Board, currentPlayer: Player }) => {
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);

      const { winner: gameWinner, line } = checkWinner(data.board);
      if (gameWinner) {
        setWinner(gameWinner);
        setWinningLine(line);
        setStatus('won');
        setScores(prev => ({
          ...prev,
          [gameWinner]: prev[gameWinner!] + 1
        }));
      } else if (checkDraw(data.board)) {
        setStatus('draw');
        setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      }
    };

    const onGameReset = (room: any) => {
      toast.success("Game restarted");
      setBoard(room.board);
      setCurrentPlayer(room.currentPlayer);
      setWinner(null);
      setWinningLine(null);
      setStatus('playing');
      setRestartRequested(false);
      setOpponentRequestedRestart(false);
    };

    const onPlayerLeft = () => {
      console.log('Received player_left event');
      toast.error("Opponent disconnected");
      setOpponentDisconnected(true);
      setStatus('won'); // End the game

      // Award win to local player
      if (options?.mySymbol) {
        setWinner(options.mySymbol);
        setScores(prev => ({
          ...prev,
          [options.mySymbol!]: prev[options.mySymbol!] + 1
        }));
      }
    };

    const onRestartRequested = (requesterId: string) => {
      if (requesterId !== socket.id) {
        toast.info("Opponent requested restart");
        setOpponentRequestedRestart(true);
      } else {
        setRestartRequested(true);
      }
    };

    const onRestartRejected = () => {
      toast.error("Restart request rejected");
      setRestartRequested(false);
      setOpponentRequestedRestart(false);
    };

    socket.on('move_made', onMoveMade);
    socket.on('game_reset', onGameReset);
    socket.on('player_left', onPlayerLeft);
    socket.on('restart_requested', onRestartRequested);
    socket.on('restart_rejected', onRestartRejected);

    return () => {
      socket.off('move_made', onMoveMade);
      socket.off('game_reset', onGameReset);
      socket.off('player_left', onPlayerLeft);
      socket.off('restart_requested', onRestartRequested);
      socket.off('restart_rejected', onRestartRejected);
      // socket.emit('leave_room'); // Removed to prevent accidental leave on re-renders
    };
  }, [mode, options?.roomCode, checkWinner, checkDraw]);


  // Determine Bot Symbol
  const botSymbol = options?.mySymbol === 'O' ? 'X' : 'O';
  const [highlightButtons, setHighlightButtons] = useState(false);

  const makeMove = useCallback((index: number) => {
    // Show disconnected error if opponent left
    if (opponentDisconnected) {
      toast.error("Opponent disconnected");
      return false;
    }

    // Block moves if waiting for restart
    if (restartRequested) {
      toast.info("Waiting for opponent to respond");
      return false;
    }
    if (opponentRequestedRestart) {
      toast.info("Check the restart request");
      setHighlightButtons(true);
      setTimeout(() => setHighlightButtons(false), 1000); // Reset highlight after 1s
      return false;
    }

    if (board[index] !== null || status !== 'playing') return false;

    // Online Move Logic
    if (mode === 'online') {
      if (!options?.roomCode || !options?.mySymbol) return false;
      if (currentPlayer !== options.mySymbol) return false;

      socket.emit('make_move', {
        roomCode: options.roomCode,
        index,
        symbol: options.mySymbol
      });
      return true;
    }

    // Local / Bot Move Logic
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const { winner: gameWinner, line } = checkWinner(newBoard);

    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      setStatus('won');
      setScores(prev => ({
        ...prev,
        [gameWinner]: prev[gameWinner] + 1
      }));
      return true;
    }

    if (checkDraw(newBoard)) {
      setStatus('draw');
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      return true;
    }

    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setCurrentPlayer(nextPlayer);

    return true;
  }, [board, currentPlayer, status, mode, checkWinner, checkDraw, options, restartRequested, opponentRequestedRestart]);

  // Bot Turn Effect
  useEffect(() => {
    if (mode === 'bot' && currentPlayer === botSymbol && status === 'playing') {
      const timer = setTimeout(() => {
        const botIndex = getBotMove(board);
        if (botIndex !== undefined && botIndex >= 0) {
          makeMove(botIndex);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mode, currentPlayer, botSymbol, status, board, getBotMove, makeMove]);

  const resetGame = useCallback(() => {
    if (mode === 'online') {
      if (options?.roomCode) {
        socket.emit('request_restart', options.roomCode);
        setRestartRequested(true);
      }
      return;
    }

    setBoard(initialBoard());
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
    setStatus('playing');
  }, [mode, options]);

  const rejectRestart = useCallback(() => {
    if (mode === 'online' && options?.roomCode) {
      socket.emit('reject_restart', options.roomCode);
      setOpponentRequestedRestart(false);
    }
  }, [mode, options]);

  useEffect(() => {
    if (status === 'playing') {
      setRestartRequested(false);
      setOpponentRequestedRestart(false);
    }
  }, [status]);

  const resetScores = useCallback(() => {
    setScores({ X: 0, O: 0, draws: 0 });
  }, []);

  return {
    board,
    currentPlayer,
    winner,
    winningLine,
    status,
    scores,
    makeMove,
    resetGame,
    resetScores,
    opponentDisconnected,
    restartRequested,
    opponentRequestedRestart,
    rejectRestart,
    highlightButtons,
  };
}

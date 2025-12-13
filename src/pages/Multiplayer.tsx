import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnimatedBackground from '@/components/AnimatedBackground';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { socket } from '@/lib/socket';

const Multiplayer: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    socket.connect();

    const onRoomCreated = (code: string) => {
      setRoomCode(code);
      setMode('create');
      setIsWaiting(true);
    };

    const onGameStart = (data: { symbol: string, roomCode: string, roomState: any }) => {
      // Navigate to game with room code and assigned symbol
      navigate(`/play/online?room=${data.roomCode}&symbol=${data.symbol}`);
    };

    const onAssignedSymbol = (symbol: string) => {
      // This might come separately or with game_start. 
      // We'll trust game_start or URL params in GamePage logic.
    };

    const onError = (message: string) => {
      toast.error(message);
      setIsWaiting(false);
    };

    const onConnectError = () => {
      toast.error("Failed to connect to server. Is it running?");
      setIsWaiting(false);
    };

    socket.on('room_created', onRoomCreated);
    socket.on('game_start', onGameStart);
    socket.on('error', onError);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('room_created', onRoomCreated);
      socket.off('game_start', onGameStart);
      socket.off('error', onError);
      socket.off('connect_error', onConnectError);
    };
  }, [navigate, roomCode, joinCode]);

  const handleCreateRoom = () => {
    socket.emit('create_room');
  };

  const handleJoinRoom = () => {
    if (joinCode.length !== 5) {
      toast.error('Please enter a valid 5-character room code');
      return;
    }
    socket.emit('join_room', joinCode);
  };

  const copyRoomCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(roomCode);
        setCopied(true);
        toast.success('Room code copied!');
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (err) {
      // Fallback for HTTP/LAN
      const textArea = document.createElement("textarea");
      textArea.value = roomCode;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('Room code copied!');
      } catch (e) {
        toast.error('Failed to copy code manually');
      }
      document.body.removeChild(textArea);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    if (mode === 'select') {
      navigate('/');
    } else {
      setMode('select');
      setIsWaiting(false);
      setRoomCode('');
      setJoinCode('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      <AnimatedBackground />
      <ThemeToggle />

      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between mb-8 animate-fade-up">
        <Button variant="glass" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Online Multiplayer</h1>
        <div className="w-11" />
      </header>

      <main className="w-full max-w-md flex flex-col items-center gap-6">
        {mode === 'select' && (
          <div className="w-full space-y-4 animate-fade-up">
            <Button
              variant="game"
              size="xl"
              className="w-full justify-start gap-4 px-6"
              onClick={handleCreateRoom}
            >
              <div className="p-2 rounded-xl bg-primary/10">
                <Plus className="w-6 h-6 text-player-x" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Create Room</p>
                <p className="text-sm text-muted-foreground font-normal">Generate a code & invite a friend</p>
              </div>
            </Button>

            <Button
              variant="game"
              size="xl"
              className="w-full justify-start gap-4 px-6"
              onClick={() => setMode('join')}
            >
              <div className="p-2 rounded-xl bg-accent/10">
                <Users className="w-6 h-6 text-player-o" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Join Room</p>
                <p className="text-sm text-muted-foreground font-normal">Enter a room code to play</p>
              </div>
            </Button>
          </div>
        )}

        {mode === 'create' && (
          <div className="w-full space-y-6 animate-fade-up">
            {/* Room Code Card */}
            <div className="glass-card rounded-3xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="relative">
                <p className="text-sm text-muted-foreground mb-4">Your Room Code</p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  {roomCode.split('').map((char, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-12 h-16 sm:w-16 sm:h-20 flex items-center justify-center",
                        "bg-secondary rounded-xl text-3xl sm:text-5xl font-bold",
                        "border-2 border-primary/20 animate-glow-pulse"
                      )}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={copyRoomCode}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Waiting Status */}
            {isWaiting && (
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Waiting for opponent...</span>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              className="w-full"
              onClick={handleBack}
            >
              Cancel
            </Button>
          </div>
        )}

        {mode === 'join' && (
          <div className="w-full space-y-6 animate-fade-up">
            <div className="glass-card rounded-3xl p-8">
              <p className="text-sm text-muted-foreground mb-4 text-center">Enter Room Code</p>
              <Input
                value={joinCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setJoinCode(value.slice(0, 5));
                }}
                placeholder="XXXXX"
                className="text-center text-3xl sm:text-5xl font-bold tracking-[0.2em] sm:tracking-[0.5em] h-16 sm:h-20 uppercase placeholder:text-muted-foreground/20"
                maxLength={5}
              />
            </div>

            <Button
              variant="game-primary"
              size="xl"
              className="w-full"
              onClick={handleJoinRoom}
              disabled={joinCode.length !== 5}
            >
              Join Game
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={handleBack}
            >
              Cancel
            </Button>
          </div>
        )}


      </main>
    </div>
  );
};

export default Multiplayer;

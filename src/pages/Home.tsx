import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wifi, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/AnimatedBackground';
import ThemeToggle from '@/components/ThemeToggle';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <AnimatedBackground />
      <ThemeToggle />

      <main className="w-full max-w-md mx-auto flex flex-col items-center gap-12 animate-fade-up">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <img
            src="/home.png"
            alt="Tic Tac Toe Plus"
            className="w-24 h-24 mb-4 mx-auto rounded-3xl shadow-elevated object-cover"
          />
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            <span className="gradient-text">Tic Tac Toe</span>
            <span className="text-accent">+</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            The classic game, reimagined
          </p>
        </div>

        {/* Game Mode Buttons */}
        <div className="w-full space-y-4">
          <Button
            variant="game"
            size="xl"
            className="w-full justify-start gap-4 px-6"
            onClick={() => navigate('/play/local')}
          >
            <div className="p-2 rounded-xl bg-primary/10">
              <Users className="w-6 h-6 text-player-x" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Local 2-Player</p>
              <p className="text-sm text-muted-foreground font-normal">Play with a friend</p>
            </div>
          </Button>

          <Button
            variant="game"
            size="xl"
            className="w-full justify-start gap-4 px-6"
            onClick={() => navigate('/multiplayer')}
          >
            <div className="p-2 rounded-xl bg-accent/10">
              <Wifi className="w-6 h-6 text-player-o" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Online Multiplayer</p>
              <p className="text-sm text-muted-foreground font-normal">Challenge anyone, anywhere</p>
            </div>
          </Button>

          <Button
            variant="game"
            size="xl"
            className="w-full justify-start gap-4 px-6"
            onClick={() => navigate('/play/bot')}
          >
            <div className="p-2 rounded-xl bg-primary/10">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Play vs Bot</p>
              <p className="text-sm text-muted-foreground font-normal">Test your skills</p>
            </div>
          </Button>
        </div>


      </main>
    </div>
  );
};

export default Home;

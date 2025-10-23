import { useState, useEffect } from 'react';
import TournamentBracket from '@/components/TournamentBracket';
import AdminPanel from '@/components/AdminPanel';
import { Toaster } from '@/components/ui/toaster';
import Icon from '@/components/ui/icon';
import funcUrls from '../../backend/func2url.json';

interface Match {
  id: number;
  round: string;
  match_number: number;
  team1?: {
    id: number;
    name: string;
    logo_url?: string;
  };
  team2?: {
    id: number;
    name: string;
    logo_url?: string;
  };
  team1_score: number;
  team2_score: number;
  winner_id?: number;
  status: string;
}

const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(funcUrls['get-matches']);
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 blur-3xl -z-10"></div>
          <div className="inline-flex items-center gap-3 mb-4 bg-primary/10 px-6 py-2 rounded-full">
            <Icon name="Trophy" size={28} className="text-primary" />
            <span className="text-sm font-bold text-primary tracking-wider">TOURNAMENT SYSTEM 5v5</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4 tracking-tight">
            ТУРНИРНАЯ СЕТКА
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Профессиональная система управления турниром с автоматической генерацией сетки
          </p>
        </header>

        <div className="max-w-7xl mx-auto mb-8">
          <AdminPanel onBracketGenerated={fetchMatches} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Icon name="Loader2" size={48} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Загрузка турнирной сетки...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="AlertCircle" size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Турнирная сетка не создана</h2>
            <p className="text-muted-foreground mb-6">
              Используйте админ-панель выше для формирования сетки турнира
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <TournamentBracket matches={matches} />
          </div>
        )}

        <footer className="mt-16 text-center text-sm text-muted-foreground border-t pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon name="Award" size={16} />
            <span>Турнирная система 5 на 5</span>
          </div>
          <p>Автоматическая генерация • Плей-офф • 8 команд</p>
        </footer>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;

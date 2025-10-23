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
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchMatches = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const challongeTournamentId = localStorage.getItem('challonge_tournament_id');
      const iframeMode = localStorage.getItem('challonge_iframe_mode');
      
      if (!challongeTournamentId) {
        setMatches([]);
        if (showLoading) setLoading(false);
        return;
      }

      if (iframeMode === 'true') {
        setTournamentId(challongeTournamentId);
        if (showLoading) setLoading(false);
        return;
      }
      
      const response = await fetch(`${funcUrls['challonge-sync']}?tournament_id=${encodeURIComponent(challongeTournamentId)}`);
      const data = await response.json();
      
      if (response.ok) {
        setMatches(data.matches || []);
        setTournamentId(challongeTournamentId);
        setLastUpdate(new Date());
        localStorage.setItem('challonge_matches', JSON.stringify(data.matches || []));
      } else {
        const cachedMatches = localStorage.getItem('challonge_matches');
        if (cachedMatches) {
          setMatches(JSON.parse(cachedMatches));
        }
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      const cachedMatches = localStorage.getItem('challonge_matches');
      if (cachedMatches) {
        setMatches(JSON.parse(cachedMatches));
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    
    const interval = setInterval(() => {
      fetchMatches(false);
    }, 3000);
    
    return () => clearInterval(interval);
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
            Прямая трансляция турнирной сетки с Challonge в реальном времени
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
        ) : tournamentId && localStorage.getItem('challonge_iframe_mode') === 'true' ? (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                <Icon name="Link" size={16} className="text-primary" />
                <span className="font-medium">Турнир: {tournamentId}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg border border-accent/20">
                <Icon name="ExternalLink" size={16} className="text-accent" />
                <span className="text-muted-foreground">Iframe режим</span>
              </div>
            </div>
            <div className="max-w-6xl mx-auto bg-card rounded-lg border-2 border-border overflow-hidden shadow-xl">
              <iframe 
                src={`https://challonge.com/${tournamentId}/module`}
                width="100%" 
                height="700" 
                frameBorder="0" 
                scrolling="auto" 
                allowTransparency={true}
                className="w-full"
              />
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="AlertCircle" size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Турнир не подключен</h2>
            <p className="text-muted-foreground mb-6">
              Введите ID турнира Challonge в поле выше для загрузки сетки
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {tournamentId && (
              <div className="mb-6 flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Icon name="Link" size={16} className="text-primary" />
                  <span className="font-medium">Турнир: {tournamentId}</span>
                </div>
                {lastUpdate && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-lg border border-success/20">
                    <Icon name="RefreshCw" size={16} className="text-success animate-spin-slow" />
                    <span className="text-muted-foreground">
                      Обновлено: {lastUpdate.toLocaleTimeString('ru-RU')}
                    </span>
                  </div>
                )}
              </div>
            )}
            <TournamentBracket matches={matches} />
          </div>
        )}

        <footer className="mt-16 text-center text-sm text-muted-foreground border-t pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon name="Award" size={16} />
            <span>Турнирная система 5 на 5</span>
          </div>
          <p>Challonge Integration • Live Updates • Обновление каждые 3 сек</p>
        </footer>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
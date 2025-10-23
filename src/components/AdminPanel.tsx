import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import funcUrls from '../../backend/func2url.json';

interface AdminPanelProps {
  onBracketGenerated: () => void;
}

const AdminPanel = ({ onBracketGenerated }: AdminPanelProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tournamentUrl, setTournamentUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const generateBracket = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(funcUrls['generate-bracket'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Сетка сформирована!",
          description: `Создано ${data.matchesCreated} матчей турнира`,
        });
        onBracketGenerated();
      } else {
        throw new Error(data.error || 'Ошибка генерации сетки');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось сформировать сетку',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const syncFromChallonge = async () => {
    if (!tournamentUrl.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ID или URL турнира Challonge",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    
    try {
      const tournamentId = tournamentUrl.split('/').pop() || tournamentUrl;
      const response = await fetch(`${funcUrls['challonge-sync']}?tournament_id=${encodeURIComponent(tournamentId)}`);
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('challonge_tournament_id', tournamentId);
        localStorage.setItem('challonge_matches', JSON.stringify(data.matches || []));
        
        toast({
          title: "Синхронизация выполнена!",
          description: `Загружено ${data.matches?.length || 0} матчей из Challonge`,
        });
        onBracketGenerated();
      } else {
        throw new Error(data.error || 'Ошибка синхронизации с Challonge');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось синхронизировать с Challonge',
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-2">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-primary rounded-lg">
          <Icon name="Settings" size={24} className="text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Админ-панель</h3>
          <p className="text-sm text-muted-foreground">Управление турнирной сеткой</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Icon name="Link" size={16} />
            Синхронизация с Challonge
          </label>
          <div className="flex gap-2">
            <Input 
              placeholder="Введите ID или URL турнира (например: my_tournament)"
              value={tournamentUrl}
              onChange={(e) => setTournamentUrl(e.target.value)}
              disabled={isSyncing}
              className="flex-1"
            />
            <Button 
              onClick={syncFromChallonge} 
              disabled={isSyncing || !tournamentUrl.trim()}
              variant="outline"
              className="shrink-0"
            >
              {isSyncing ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Синхронизация...
                </>
              ) : (
                <>
                  <Icon name="RefreshCw" size={18} className="mr-2" />
                  Загрузить
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Пример: https://challonge.com/my_tournament или просто my_tournament
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">или</span>
          </div>
        </div>

        <Button 
          onClick={generateBracket} 
          disabled={isGenerating}
          size="lg"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
        >
          {isGenerating ? (
            <>
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              Формирование сетки...
            </>
          ) : (
            <>
              <Icon name="Zap" size={20} className="mr-2" />
              Создать случайную сетку
            </>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-card rounded border text-center">
            <Icon name="Users" size={20} className="mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">32 команды</p>
          </div>
          <div className="p-3 bg-card rounded border text-center">
            <Icon name="Trophy" size={20} className="mx-auto mb-1 text-success" />
            <p className="text-xs text-muted-foreground">Плей-офф 5v5</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdminPanel;
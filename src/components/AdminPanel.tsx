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
            Подключение турнира Challonge
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
              size="lg"
              className="shrink-0 bg-primary hover:bg-primary/90"
            >
              {isSyncing ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Подключение...
                </>
              ) : (
                <>
                  <Icon name="Radio" size={18} className="mr-2" />
                  Подключить
                </>
              )}
            </Button>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
            <div>
              <p className="mb-1">Пример: https://challonge.com/my_tournament или просто my_tournament</p>
              <p>После подключения сетка будет автоматически обновляться каждые 3 секунды</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-success/10 rounded border border-success/20 text-center">
            <Icon name="Radio" size={20} className="mx-auto mb-1 text-success" />
            <p className="text-xs text-muted-foreground font-medium">Live трансляция</p>
          </div>
          <div className="p-3 bg-primary/10 rounded border border-primary/20 text-center">
            <Icon name="Zap" size={20} className="mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground font-medium">Каждые 3 сек</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdminPanel;
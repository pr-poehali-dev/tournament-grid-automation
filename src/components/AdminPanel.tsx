import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import funcUrls from '../../backend/func2url.json';

interface AdminPanelProps {
  onBracketGenerated: () => void;
}

const AdminPanel = ({ onBracketGenerated }: AdminPanelProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
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

      <div className="flex flex-col gap-3">
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
              Сформировать турнирную сетку
            </>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="p-3 bg-card rounded border text-center">
            <Icon name="Users" size={20} className="mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">8 команд</p>
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
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Team {
  id: number;
  name: string;
  logo_url?: string;
}

interface Match {
  id: number;
  round: string;
  match_number: number;
  team1?: Team;
  team2?: Team;
  team1_score: number;
  team2_score: number;
  winner_id?: number;
  status: string;
}

interface TournamentBracketProps {
  matches: Match[];
}

const TournamentBracket = ({ matches }: TournamentBracketProps) => {
  const rounds = ['quarter', 'semi', 'final'];
  
  const getMatchesByRound = (round: string) => {
    return matches.filter(m => m.round === round).sort((a, b) => a.match_number - b.match_number);
  };

  const getRoundTitle = (round: string) => {
    switch(round) {
      case 'quarter': return 'ЧЕТВЕРТЬФИНАЛ';
      case 'semi': return 'ПОЛУФИНАЛ';
      case 'final': return 'ФИНАЛ';
      default: return round.toUpperCase();
    }
  };

  const MatchCard = ({ match }: { match: Match }) => {
    const team1Won = match.winner_id === match.team1?.id;
    const team2Won = match.winner_id === match.team2?.id;
    const isFinished = match.status === 'finished';

    return (
      <Card className="p-4 mb-4 bg-card border-2 hover:border-primary transition-all duration-200">
        <div className="space-y-2">
          <div className={`flex items-center justify-between p-3 rounded ${team1Won && isFinished ? 'bg-success/10 border border-success' : 'bg-secondary/50'}`}>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Users" size={16} className="text-primary" />
              </div>
              <span className={`font-semibold ${team1Won && isFinished ? 'text-success' : 'text-foreground'}`}>
                {match.team1?.name || 'TBD'}
              </span>
            </div>
            <span className={`text-2xl font-bold ${team1Won && isFinished ? 'text-success' : 'text-muted-foreground'} min-w-[2rem] text-center`}>
              {isFinished ? match.team1_score : '-'}
            </span>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-xs text-muted-foreground font-medium px-2 py-1 bg-secondary rounded">
              VS
            </div>
          </div>

          <div className={`flex items-center justify-between p-3 rounded ${team2Won && isFinished ? 'bg-success/10 border border-success' : 'bg-secondary/50'}`}>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Users" size={16} className="text-primary" />
              </div>
              <span className={`font-semibold ${team2Won && isFinished ? 'text-success' : 'text-foreground'}`}>
                {match.team2?.name || 'TBD'}
              </span>
            </div>
            <span className={`text-2xl font-bold ${team2Won && isFinished ? 'text-success' : 'text-muted-foreground'} min-w-[2rem] text-center`}>
              {isFinished ? match.team2_score : '-'}
            </span>
          </div>

          {isFinished && match.winner_id && (
            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t">
              <Icon name="Trophy" size={14} className="text-success" />
              <span className="text-xs font-semibold text-success">
                ПОБЕДИТЕЛЬ: {match.winner_id === match.team1?.id ? match.team1?.name : match.team2?.name}
              </span>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {rounds.map((round) => {
        const roundMatches = getMatchesByRound(round);
        
        return (
          <div key={round} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary tracking-tight">
                {getRoundTitle(round)}
              </h2>
              <div className="h-1 w-16 bg-accent mx-auto mt-2 rounded-full"></div>
            </div>
            
            <div className={`space-y-4 ${round === 'quarter' ? 'mt-0' : round === 'semi' ? 'mt-12' : 'mt-24'}`}>
              {roundMatches.length > 0 ? (
                roundMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))
              ) : (
                <Card className="p-8 text-center border-dashed">
                  <Icon name="Calendar" size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Матчи не сформированы</p>
                </Card>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TournamentBracket;

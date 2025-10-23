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
  const round16Matches = matches.filter(m => m.round === 'round16').sort((a, b) => a.match_number - b.match_number);
  const quarterMatches = matches.filter(m => m.round === 'quarter').sort((a, b) => a.match_number - b.match_number);
  const semiMatches = matches.filter(m => m.round === 'semi').sort((a, b) => a.match_number - b.match_number);
  const finalMatch = matches.find(m => m.round === 'final');

  const TeamRow = ({ team, score, isWinner, isFinished }: { team?: Team; score: number; isWinner: boolean; isFinished: boolean }) => (
    <div className={`flex items-center justify-between px-3 py-2 rounded-md border ${isWinner && isFinished ? 'bg-success/10 border-success' : 'bg-card border-border'}`}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name="Users" size={12} className="text-primary" />
        </div>
        <span className={`text-sm font-medium ${isWinner && isFinished ? 'text-success font-semibold' : 'text-foreground'}`}>
          {team?.name || 'TBD'}
        </span>
      </div>
      <span className={`text-lg font-bold ${isWinner && isFinished ? 'text-success' : 'text-muted-foreground'} min-w-[1.5rem] text-right`}>
        {isFinished ? score : '-'}
      </span>
    </div>
  );

  const MatchBox = ({ match, className = '' }: { match: Match; className?: string }) => {
    const isFinished = match.status === 'finished';
    const team1Won = match.winner_id === match.team1?.id;
    const team2Won = match.winner_id === match.team2?.id;

    return (
      <div className={`bg-secondary/30 rounded-lg p-2 border-2 border-border hover:border-primary/50 transition-colors ${className}`}>
        <TeamRow team={match.team1} score={match.team1_score} isWinner={team1Won} isFinished={isFinished} />
        <div className="h-1"></div>
        <TeamRow team={match.team2} score={match.team2_score} isWinner={team2Won} isFinished={isFinished} />
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-5 gap-6">
          
          <div>
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-primary tracking-tight">1/8 ФИНАЛА</h2>
              <div className="h-1 w-12 bg-accent mx-auto mt-1 rounded-full"></div>
            </div>
            <div className="space-y-4">
              {round16Matches.map((match) => (
                <MatchBox key={match.id} match={match} />
              ))}
            </div>
          </div>

          <div>
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-primary tracking-tight">ЧЕТВЕРТЬФИНАЛ</h2>
              <div className="h-1 w-12 bg-accent mx-auto mt-1 rounded-full"></div>
            </div>
            <div className="space-y-[76px] mt-[50px]">
              {quarterMatches.map((match) => (
                <MatchBox key={match.id} match={match} />
              ))}
            </div>
          </div>

          <div>
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-primary tracking-tight">ПОЛУФИНАЛ</h2>
              <div className="h-1 w-12 bg-accent mx-auto mt-1 rounded-full"></div>
            </div>
            <div className="space-y-[236px] mt-[126px]">
              {semiMatches.map((match) => (
                <MatchBox key={match.id} match={match} />
              ))}
            </div>
          </div>

          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-primary tracking-tight">ФИНАЛ</h2>
              <div className="h-1 w-16 bg-accent mx-auto mt-2 rounded-full"></div>
            </div>
            <div className="flex items-center justify-center" style={{ minHeight: '500px', paddingTop: '180px' }}>
              {finalMatch ? (
                <MatchBox match={finalMatch} className="shadow-xl w-full" />
              ) : (
                <Card className="p-8 text-center border-dashed w-full">
                  <Icon name="Trophy" size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Финал не сформирован</p>
                </Card>
              )}
            </div>
          </div>

          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-primary tracking-tight">ПОБЕДИТЕЛЬ</h2>
              <div className="h-1 w-16 bg-accent mx-auto mt-2 rounded-full"></div>
            </div>
            <div className="flex items-center justify-center" style={{ minHeight: '500px', paddingTop: '180px' }}>
              {finalMatch?.status === 'finished' && finalMatch.winner_id ? (
                <Card className="p-6 text-center bg-gradient-to-br from-accent/20 to-primary/10 border-2 border-accent shadow-xl w-full">
                  <Icon name="Trophy" size={48} className="mx-auto text-accent mb-3" />
                  <div className="text-2xl font-bold text-primary mb-1">
                    {finalMatch.winner_id === finalMatch.team1?.id ? finalMatch.team1?.name : finalMatch.team2?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">Чемпион турнира</div>
                </Card>
              ) : (
                <Card className="p-8 text-center border-dashed w-full">
                  <Icon name="Award" size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Победитель определится</p>
                </Card>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
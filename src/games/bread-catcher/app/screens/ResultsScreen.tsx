/**
 * Final Results (plan §22) — chỉ xuất hiện khi mọi đội đã chơi xong.
 * Class: bảng xếp hạng + mở quà cho đội thắng. Solo: thành tích cá nhân.
 */
import { ICONS, mascotUrl } from '@/games/bread-catcher/app/assets';
import Button from '@/platform/ui/Button';
import Leaderboard, { TeamTotalsCard } from '@/games/bread-catcher/app/components/Leaderboard';
import { useAppState, useTeamTotals } from '@/games/bread-catcher/app/hooks';
import { SFX } from '@/platform/audio/sfx';
import { accuracyOf, rankTeams, winnersOf, type Standing } from '@/games/bread-catcher/session/ranking';
import { sessionActions, type ActiveSession } from '@/games/bread-catcher/session/sessionStore';
import { LEVELS } from '@/games/bread-catcher/session/settings';
import { UI_TEXT } from '@/games/bread-catcher/session/text';
import type { TurnResult } from '@/games/bread-catcher/session/types';
import { formatPercent, formatTime } from '@/shared/format';

export default function ResultsScreen() {
  const session = useAppState((state) => state.session);
  if (!session) return null;
  return session.settings.mode === 'solo' ? (
    <SoloResults session={session} />
  ) : (
    <ClassResults session={session} />
  );
}

function ClassResults({ session }: { session: ActiveSession }) {
  const standings = rankTeams(session.teams, session.results);
  const winners = winnersOf(standings);
  const hasTotals = useTeamTotals().length > 0;

  return (
    <div className="screen results">
      <h1 className="results__title">{UI_TEXT.finalResults}</h1>

      <div className="winner-banner">
        <img src={ICONS.crown} alt="" width={54} height={36} />
        <span className="winner-banner__label">{UI_TEXT.winner}</span>
        <span className="winner-banner__names">
          {winners.map((winner, index) => (
            <span key={winner.team.id} className="winner-banner__name" title={winner.team.name}>
              {index > 0 && '& '}
              {winner.team.name}
            </span>
          ))}
        </span>
      </div>

      <ol className="standings">
        {standings.map((standing) => (
          <StandingRow key={standing.team.id} standing={standing} />
        ))}
      </ol>

      {/* Bảng tổng điểm nhiều buổi; vừa reset thì hiện bảng tĩnh (trống) */}
      {session.leaderboard && hasTotals ? <Leaderboard update={session.leaderboard} /> : <TeamTotalsCard />}

      <div className="results__actions">
        <Button color="orange" size="lg" onClick={() => sessionActions.openGift()}>
          {UI_TEXT.openGift}
        </Button>
        <div className="results__row">
          <Button color="green" sfx={SFX.UI_START} onClick={() => sessionActions.playAgain()}>
            {UI_TEXT.playAgain}
          </Button>
          <Button color="blue" onClick={() => sessionActions.goHome()}>
            {UI_TEXT.home}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StandingRow({ standing }: { standing: Standing }) {
  const { team, result, place } = standing;
  return (
    <li className={`standing standing--place-${Math.min(place, 3)}`}>
      <span className="standing__place">{place}</span>
      <img className="standing__mascot" src={mascotUrl(team.mascot)} alt="" width={48} height={54} />
      <div className="standing__body">
        <div className="standing__head">
          <span className="standing__name" title={team.name}>
            {team.name}
          </span>
          <span className="standing__score">{result.score}</span>
        </div>
        <Stats result={result} compact />
      </div>
    </li>
  );
}

function SoloResults({ session }: { session: ActiveSession }) {
  const [team] = session.teams;
  const result = session.results[0];
  if (!team || !result) return null;
  const best = session.soloBest;

  return (
    <div className="screen results">
      <h1 className="results__title">{UI_TEXT.yourResults}</h1>

      <div className="card solo-card">
        <img className="solo-card__mascot" src={mascotUrl(team.mascot)} alt="" width={72} height={81} />
        <p className="solo-card__name" title={team.name}>
          {team.name}
        </p>
        <p className="solo-card__score">
          {result.score} <small>{UI_TEXT.points}</small>
        </p>
        {best && (
          <p className={`solo-card__best ${best.isNewBest ? 'is-new' : ''}`}>
            {best.isNewBest ? UI_TEXT.newBest : `${UI_TEXT.best} ${best.best}`} ·{' '}
            {LEVELS[session.settings.levelId].label}
          </p>
        )}
        <Stats result={result} />
        <ul className="word-list">
          {result.attempts.map((attempt, index) => (
            <li key={index} className={attempt.correct ? 'is-correct' : 'is-wrong'}>
              {attempt.word}
              <span aria-label={attempt.correct ? UI_TEXT.correct : UI_TEXT.wrong}>
                {attempt.correct ? '✓' : '✗'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="results__row">
        <Button color="green" size="lg" sfx={SFX.UI_START} onClick={() => sessionActions.playAgain()}>
          {UI_TEXT.playAgain}
        </Button>
        <Button color="blue" size="lg" onClick={() => sessionActions.goHome()}>
          {UI_TEXT.home}
        </Button>
      </div>
    </div>
  );
}

function Stats({ result, compact = false }: { result: TurnResult; compact?: boolean }) {
  const stats = [
    { label: UI_TEXT.correct, value: String(result.correctWords) },
    { label: UI_TEXT.wrong, value: String(result.wrongWords) },
    { label: UI_TEXT.accuracy, value: formatPercent(accuracyOf(result)) },
    { label: UI_TEXT.timeLeft, value: formatTime(result.timeRemainingMs) },
  ];
  return (
    <dl className={`stats ${compact ? 'stats--compact' : ''}`}>
      {stats.map((stat) => (
        <div key={stat.label} className="stats__item">
          <dt>{stat.label}</dt>
          <dd>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

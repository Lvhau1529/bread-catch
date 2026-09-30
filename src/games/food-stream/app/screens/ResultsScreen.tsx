/**
 * Kết quả lượt (plan §28 "results screen"; §5.2 winner screen chỉ để ăn mừng):
 *   Solo      — LIVE COMPLETE! + sao, điểm, người xem, tim, từ đã học, sang cấp tiếp theo
 *   Classroom — đội thắng / hoà, điểm cả hai đội, không có phản ứng tiêu cực cho đội thua
 */
import { useFoodStream } from '@/games/food-stream/app/hooks';
import { imageUrl, streamerUrl } from '@/games/food-stream/app/images';
import { getLevel } from '@/games/food-stream/content/levels';
import { getPack } from '@/games/food-stream/content/packs';
import {
  foodStreamActions,
  nextLevelId,
  type ActiveSession,
  type SessionOutcome,
} from '@/games/food-stream/session/store';
import type { QuestionRecord, TeamScore } from '@/games/food-stream/session/types';
import { TEXT } from '@/games/food-stream/text';
import Button from '@/platform/ui/Button';
import { compactNumber } from '@/shared/format';

export default function ResultsScreen() {
  const session = useFoodStream((state) => state.session);
  const outcome = useFoodStream((state) => state.outcome);
  if (!session || !outcome) return null;
  return (
    <div className="screen fs-results">
      {session.settings.mode === 'solo' ? (
        <SoloResults session={session} outcome={outcome} />
      ) : (
        <ClassroomResults outcome={outcome} />
      )}
      <WordsLearned records={outcome.result.records} />
      <Actions session={session} />
    </div>
  );
}

function SoloResults({ session, outcome }: { session: ActiveSession; outcome: SessionOutcome }) {
  const { result, previous } = outcome;
  const score = result.teams[0]?.score ?? 0;
  const isNewBest = score > (previous?.best ?? 0) || result.stars > (previous?.stars ?? 0);
  const level = getLevel(session.settings.levelId);
  return (
    <>
      <h1 className="fs-results__title">{result.perfect ? TEXT.perfect : TEXT.liveComplete}</h1>
      <div className="card fs-solo">
        <img className="fs-solo__streamer" src={streamerUrl(session.teams[0].streamer)} alt="" />
        <p className="fs-solo__level">
          {getPack(session.settings.packId).title} · {level.number}. {level.title}
        </p>
        <Stars count={result.stars} />
        {isNewBest && <p className="fs-solo__best">{TEXT.newBest}</p>}
        <dl className="fs-stats">
          <Stat label={TEXT.score} value={String(score)} />
          <Stat label={TEXT.viewers} value={compactNumber(result.viewers)} />
          <Stat label={TEXT.hearts} value={compactNumber(result.hearts)} />
          <Stat label={TEXT.bestStreak} value={String(result.teams[0]?.bestStreak ?? 0)} />
        </dl>
        <p className="fs-solo__total">
          {TEXT.totalViewers}: <b>{compactNumber(outcome.totalViewers)}</b>
        </p>
      </div>
    </>
  );
}

function ClassroomResults({ outcome }: { outcome: SessionOutcome }) {
  const { teams } = outcome.result;
  const top = Math.max(...teams.map((team) => team.score));
  const winners = teams.filter((team) => team.score === top);
  const title = winners.length === 1 ? `${winners[0].team.name} ${TEXT.teamWins}` : TEXT.tie;
  return (
    <>
      <h1 className="fs-results__title">{title}</h1>
      <p className="fs-results__subtitle">{TEXT.greatTeamwork}</p>
      <ul className="fs-teams">
        {teams.map((team) => (
          <TeamCard key={team.team.id} score={team} winner={winners.length === 1 && winners[0] === team} />
        ))}
      </ul>
    </>
  );
}

function TeamCard({ score, winner }: { score: TeamScore; winner: boolean }) {
  return (
    <li className={`fs-team fs-team--${score.team.id === 0 ? 'a' : 'b'} ${winner ? 'is-winner' : ''}`}>
      {winner && <img className="fs-team__crown" src={imageUrl('ui.crown')} alt="" />}
      <img
        className="fs-team__streamer"
        src={streamerUrl(score.team.streamer, winner ? 'wow' : 'happy')}
        alt=""
      />
      <span className="fs-team__name">{score.team.name}</span>
      <span className="fs-team__score">{score.score}</span>
      <dl className="fs-stats fs-stats--compact">
        <Stat label={TEXT.correct} value={String(score.correct)} />
        <Stat label={TEXT.bestStreak} value={String(score.bestStreak)} />
      </dl>
    </li>
  );
}

/** Từ / âm đã trả lời đúng, có tranh nếu có (plan: "Words learned") */
function WordsLearned({ records }: { records: readonly QuestionRecord[] }) {
  // Mỗi từ một lần; hỏi lại nhiều lần thì chỉ cần một lần đúng ngay là tính "đúng ngay"
  const unique = new Map<string, QuestionRecord>();
  records
    .filter((record) => record.answeredBy !== null)
    .forEach((record) => {
      const seen = unique.get(record.label);
      if (!seen || (!seen.firstTry && record.firstTry)) unique.set(record.label, record);
    });
  if (unique.size === 0) return null;
  return (
    <section className="card fs-words">
      <h2>{TEXT.wordsLearned}</h2>
      <ul>
        {[...unique.values()].map((record) => (
          <li key={record.label} className={record.firstTry ? 'is-first-try' : undefined}>
            {record.picture && <img src={imageUrl(record.picture)} alt="" />}
            <span>{record.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Actions({ session }: { session: ActiveSession }) {
  const next = session.settings.mode === 'solo' ? nextLevelId(session.settings) : undefined;
  return (
    <div className="fs-results__actions">
      {next && (
        <Button color="pink" size="lg" onClick={() => foodStreamActions.playNextLevel()}>
          {TEXT.nextLevel} ▶
        </Button>
      )}
      <div className="fs-results__row">
        <Button color="green" onClick={() => foodStreamActions.playAgain()}>
          {TEXT.playAgain}
        </Button>
        <Button color="blue" onClick={() => foodStreamActions.openSetup()}>
          {TEXT.changeSetup}
        </Button>
      </div>
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="fs-stars" aria-label={`${count} / 3`}>
      {[0, 1, 2].map((index) => (
        <img
          key={index}
          src={imageUrl('ui.star')}
          alt=""
          className={index < count ? 'is-earned' : undefined}
          style={{ animationDelay: `${0.25 + index * 0.3}s` }}
        />
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="fs-stats__item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/**
 * Game Setup (plan §3–§5): chế độ, gói từ, cấp độ, thời gian, tên đội.
 * Class Mode hiện 3 ô tên đội; Solo Mode chỉ 1 ô tên người chơi.
 * Lựa chọn được nhớ cho lần sau (session/storage.ts).
 */
import type { ReactNode } from 'react';
import { mascotUrl } from '@/app/assets';
import Button from '@/app/components/Button';
import OptionGroup, { type Option } from '@/app/components/OptionGroup';
import TimeInput from '@/app/components/TimeInput';
import { TeamTotalsCard } from '@/app/components/Leaderboard';
import { useAppState, useTeamTotals } from '@/app/hooks/useStore';
import { SFX } from '@/game/config/assets';
import { GameBridge } from '@/game/bridge';
import { PACK_ORDER, PACKS, packPreview } from '@/session/content';
import { sessionActions } from '@/session/sessionStore';
import { LEVEL_ORDER, LEVELS, TIME_OPTIONS, timeLimitSeconds } from '@/session/settings';
import {
  DEFAULT_PLAYER_NAME,
  DEFAULT_TEAM_NAMES,
  MAX_NAME_LENGTH,
  SOLO_MASCOT,
  TEAM_MASCOTS,
} from '@/session/teams';
import { UI_TEXT } from '@/session/text';
import type { GameMode, LevelId, PackId, SetupDraft, TimeOption } from '@/session/types';
import { speech } from '@/shared/speech';

const MODE_OPTIONS: Option<GameMode>[] = [
  { value: 'class', label: UI_TEXT.classMode, sub: '3 teams' },
  { value: 'solo', label: UI_TEXT.soloMode, sub: '1 player' },
];

const PACK_OPTIONS: Option<PackId>[] = PACK_ORDER.map((id) => ({
  value: id,
  label: PACKS[id].label,
  sub: packPreview(id, 3),
}));

const LEVEL_OPTIONS: Option<LevelId>[] = LEVEL_ORDER.map((id) => ({
  value: id,
  label: LEVELS[id].label,
  tone: id,
}));

export default function SetupScreen() {
  const draft = useAppState((state) => state.draft);
  const hasTotals = useTeamTotals().length > 0;
  const update = (patch: Partial<SetupDraft>) => sessionActions.updateDraft(patch);
  const level = LEVELS[draft.levelId];

  const timeOptions: Option<TimeOption>[] = TIME_OPTIONS.map((time) =>
    time === 'auto'
      ? { value: time, label: UI_TEXT.auto, sub: `${level.suggestedTime}s` }
      : { value: time, label: String(time), sub: 'sec' },
  );

  const setTeamName = (index: number, name: string) => {
    const teamNames = [...draft.teamNames] as SetupDraft['teamNames'];
    teamNames[index] = name;
    update({ teamNames });
  };

  const start = () => {
    speech.unlock(); // iOS: giọng đọc chỉ bật được trong thao tác chạm
    GameBridge.playSfx(SFX.UI_START);
    sessionActions.startSession();
  };

  return (
    <div className="screen setup">
      <header className="screen__header">
        <button
          type="button"
          className="icon-btn"
          aria-label={UI_TEXT.back}
          onClick={() => sessionActions.goHome()}
        >
          ←
        </button>
        <h1>{UI_TEXT.gameSetup}</h1>
      </header>

      <div className="card setup__form">
        <Field label={UI_TEXT.gameMode}>
          <OptionGroup
            label={UI_TEXT.gameMode}
            options={MODE_OPTIONS}
            value={draft.mode}
            onChange={(mode) => update({ mode })}
          />
        </Field>

        <Field label={UI_TEXT.phonicsPack}>
          <OptionGroup
            label={UI_TEXT.phonicsPack}
            options={PACK_OPTIONS}
            value={draft.packId}
            onChange={(packId) => update({ packId })}
            columns={2}
          />
        </Field>

        <Field label={UI_TEXT.level}>
          <OptionGroup
            label={UI_TEXT.level}
            options={LEVEL_OPTIONS}
            value={draft.levelId}
            onChange={(levelId) => update({ levelId })}
            columns={3}
          />
          <p className={`field__hint ${level.troll ? 'field__hint--hard' : ''}`}>{level.hint}</p>
        </Field>

        <Field label={UI_TEXT.time}>
          <OptionGroup
            label={UI_TEXT.time}
            options={timeOptions}
            value={draft.time}
            onChange={(time) => update({ time })}
            columns={3}
          />
          <TimeInput
            value={draft.time}
            effectiveSeconds={timeLimitSeconds(draft)}
            onChange={(time) => update({ time })}
          />
        </Field>

        {draft.mode === 'class' ? (
          <Field label={UI_TEXT.teams}>
            <div className="teams">
              {TEAM_MASCOTS.map((mascot, index) => (
                <NameInput
                  key={mascot}
                  mascot={mascotUrl(mascot)}
                  label={[UI_TEXT.team1, UI_TEXT.team2, UI_TEXT.team3][index]}
                  placeholder={DEFAULT_TEAM_NAMES[index]}
                  value={draft.teamNames[index]}
                  onChange={(name) => setTeamName(index, name)}
                />
              ))}
            </div>
          </Field>
        ) : (
          <Field label={UI_TEXT.player}>
            <NameInput
              mascot={mascotUrl(SOLO_MASCOT)}
              label={UI_TEXT.player}
              placeholder={DEFAULT_PLAYER_NAME}
              value={draft.playerName}
              onChange={(playerName) => update({ playerName })}
            />
          </Field>
        )}
      </div>

      {/* Tổng điểm các đội từ các buổi trước (có nút reset) */}
      {draft.mode === 'class' && hasTotals && <TeamTotalsCard />}

      <Button color="green" size="lg" sfx={null} className="setup__start" onClick={start}>
        {UI_TEXT.start}
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="field">
      <legend className="field__label">{label}</legend>
      {children}
    </fieldset>
  );
}

interface NameInputProps {
  mascot: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function NameInput({ mascot, label, placeholder, value, onChange }: NameInputProps) {
  return (
    <label className="name-input">
      <img src={mascot} alt="" width={40} height={45} />
      <span className="visually-hidden">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder.toUpperCase()}
        maxLength={MAX_NAME_LENGTH}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        enterKeyHint="done"
        onChange={(event) => onChange(event.target.value)}
        // "Done" trên bàn phím điện thoại: chỉ đóng bàn phím, không bắt đầu game
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
      />
    </label>
  );
}

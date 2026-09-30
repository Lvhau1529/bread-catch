/**
 * Nhóm lựa chọn dạng chip (radio group) cho màn Setup của các game. Chip cao tối thiểu 48px.
 */
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';

export interface Option<T> {
  value: T;
  label: string;
  /** Dòng phụ nhỏ bên dưới nhãn */
  sub?: string;
  /** Màu riêng khi được chọn (vd: màu theo level) */
  tone?: string;
  /** Ảnh minh hoạ phía trên nhãn */
  icon?: string;
}

interface OptionGroupProps<T> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
}

export default function OptionGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns = options.length,
}: OptionGroupProps<T>) {
  return (
    <div
      className="options"
      role="radiogroup"
      aria-label={label}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`option ${option.tone ? `option--${option.tone}` : ''} ${selected ? 'is-selected' : ''}`}
            onClick={() => {
              if (selected) return;
              playSfx(SFX.UI_CLICK);
              onChange(option.value);
            }}
          >
            {option.icon && <img className="option__icon" src={option.icon} alt="" />}
            <span className="option__label">{option.label}</span>
            {option.sub && <span className="option__sub">{option.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

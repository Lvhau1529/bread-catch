/**
 * Ô nhập tên đội / người chơi kèm ảnh đại diện (lưu ngay khi gõ — game tự xử lý `onChange`).
 */
interface NameInputProps {
  /** Ảnh đại diện (mascot / nhân vật) */
  image: string;
  label: string;
  placeholder: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
}

export default function NameInput({ image, label, placeholder, value, maxLength, onChange }: NameInputProps) {
  return (
    <label className="name-input">
      <img src={image} alt="" width={40} height={45} />
      <span className="visually-hidden">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder.toUpperCase()}
        maxLength={maxLength}
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

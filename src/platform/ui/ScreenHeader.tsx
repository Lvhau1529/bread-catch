/**
 * Đầu màn React (Setup...): nút quay lại + tiêu đề.
 */
import BackButton from '@/platform/ui/BackButton';
import styles from '@/platform/ui/ScreenHeader.module.scss';

interface ScreenHeaderProps {
  title: string;
  backLabel: string;
  onBack: () => void;
}

export default function ScreenHeader({ title, backLabel, onBack }: ScreenHeaderProps) {
  return (
    <header className={styles.header}>
      <BackButton label={backLabel} onClick={onBack} />
      <h1>{title}</h1>
    </header>
  );
}

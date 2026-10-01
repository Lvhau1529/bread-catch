/**
 * Gốc của app: màn chọn game (hub) hoặc game đang mở.
 * Mỗi game được tải động (chunk riêng) khi mở lần đầu; rời game thì unmount toàn bộ (kể cả Phaser).
 */
import {
  Component,
  lazy,
  Suspense,
  useEffect,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { isUnlocked, walletStore } from '@/platform/gems/wallet';
import HubScreen from '@/platform/hub/HubScreen';
import { useStore } from '@/platform/hooks/useStore';
import { platformActions, platformStore } from '@/platform/platformStore';
import type { GameManifest, UpcomingGame } from '@/platform/types';
import Button from '@/platform/ui/Button';
import { MASCOT } from '@/platform/ui/icons';
import RotateHint from '@/platform/ui/RotateHint';
import styles from '@/platform/PlatformApp.module.scss';

const lazyRoots = new Map<string, LazyExoticComponent<ComponentType>>();

/** `lazy()` phải được gọi một lần cho mỗi game để React không tải lại / mount lại */
function rootOf(game: GameManifest): LazyExoticComponent<ComponentType> {
  let root = lazyRoots.get(game.id);
  if (!root) {
    root = lazy(game.load);
    lazyRoots.set(game.id, root);
  }
  return root;
}

interface PlatformAppProps {
  games: readonly GameManifest[];
  upcoming: readonly UpcomingGame[];
}

export default function PlatformApp({ games, upcoming }: PlatformAppProps) {
  const activeId = useStore(platformStore, (state) => state.activeGameId);
  const wallet = useStore(walletStore, (state) => state);
  // Link mở thẳng game đang khoá (#/<id>) -> về màn chọn game
  const game = games.find((item) => item.id === activeId && isUnlocked(item, wallet));
  const GameRoot = game ? rootOf(game) : null;

  // Game không tồn tại / đang khoá: bỏ hash để lần bấm thẻ game sau vẫn mở được
  useEffect(() => {
    if (activeId && !game) platformActions.exitToHub();
  }, [activeId, game]);

  return (
    <>
      {GameRoot ? (
        <LoadErrorBoundary key={activeId}>
          <Suspense
            fallback={
              <div className={styles.loading}>
                <img className={clsx(styles.mascot, styles.running)} src={MASCOT.loading} alt="" />
                LOADING…
              </div>
            }
          >
            <GameRoot />
          </Suspense>
        </LoadErrorBoundary>
      ) : (
        <HubScreen games={games} upcoming={upcoming} />
      )}
      <RotateHint />
    </>
  );
}

/** Không tải được game (mất mạng khi chưa cache...) -> báo lỗi + quay lại màn chọn game */
class LoadErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  /** Ghi lỗi thật ra console để còn biết nguyên nhân (màn lỗi chỉ hiện câu chung chung) */
  override componentDidCatch(error: unknown): void {
    console.error('[Phonics Arcade] Game failed to load:', error);
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <div className={styles.loading}>
        <img className={styles.mascot} src={MASCOT.error} alt="" />
        <p>Oops! The game could not load.</p>
        {/* Tải lại trang: lấy lại file mới (vd sau khi deploy bản mới, file cũ đã bị xoá) */}
        <Button color="green" onClick={() => window.location.reload()}>
          TRY AGAIN
        </Button>
        <Button color="blue" onClick={() => platformActions.exitToHub()}>
          BACK TO GAMES
        </Button>
      </div>
    );
  }
}

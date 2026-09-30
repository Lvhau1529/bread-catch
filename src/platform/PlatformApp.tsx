/**
 * Gốc của app: màn chọn game (hub) hoặc game đang mở.
 * Mỗi game được tải động (chunk riêng) khi mở lần đầu; rời game thì unmount toàn bộ (kể cả Phaser).
 */
import {
  Component,
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react';
import HubScreen from '@/platform/hub/HubScreen';
import { useStore } from '@/platform/hooks/useStore';
import { platformActions, platformStore } from '@/platform/platformStore';
import type { GameManifest } from '@/platform/types';
import Button from '@/platform/ui/Button';
import RotateHint from '@/platform/ui/RotateHint';

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

export default function PlatformApp({ games }: { games: readonly GameManifest[] }) {
  const activeId = useStore(platformStore, (state) => state.activeGameId);
  const game = games.find((item) => item.id === activeId);
  const GameRoot = game ? rootOf(game) : null;

  return (
    <>
      {GameRoot ? (
        <LoadErrorBoundary key={activeId}>
          <Suspense fallback={<div className="app-loading">LOADING…</div>}>
            <GameRoot />
          </Suspense>
        </LoadErrorBoundary>
      ) : (
        <HubScreen games={games} />
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

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="app-loading">
        <p>Oops! The game could not load.</p>
        <Button color="blue" onClick={() => platformActions.exitToHub()}>
          BACK TO GAMES
        </Button>
      </div>
    );
  }
}

/**
 * Panel kem có thể kéo dài theo chiều dọc (3-slice: đỉnh / thân / đáy).
 * Tự cắt frame từ texture gốc nên chạy được cả WebGL lẫn Canvas.
 */
import Phaser from 'phaser';

export interface PanelSlices {
  /** Chiều cao phần đỉnh giữ nguyên (px của texture) */
  top: number;
  /** Chiều cao phần đáy giữ nguyên */
  bottom: number;
}

export default class Panel extends Phaser.GameObjects.Container {
  readonly panelWidth: number;
  readonly panelHeight: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    height: number,
    slices: PanelSlices,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const texture = scene.textures.get(textureKey);
    const source = texture.getSourceImage();
    const width = source.width;
    const middleSource = source.height - slices.top - slices.bottom;
    const middleHeight = Math.max(0, height - slices.top - slices.bottom);

    const frame = (name: string, fy: number, fh: number): string => {
      if (!texture.has(name)) texture.add(name, 0, 0, fy, width, fh);
      return name;
    };

    const top = -height / 2;
    this.add([
      scene.add.image(0, top, textureKey, frame('top', 0, slices.top)).setOrigin(0.5, 0),
      scene.add
        .image(0, top + slices.top, textureKey, frame('middle', slices.top, middleSource))
        .setOrigin(0.5, 0)
        .setDisplaySize(width, middleHeight),
      scene.add
        .image(
          0,
          top + slices.top + middleHeight,
          textureKey,
          frame('bottom', source.height - slices.bottom, slices.bottom),
        )
        .setOrigin(0.5, 0),
    ]);

    this.panelWidth = width;
    this.panelHeight = height;
  }

  /** Y (local) của mép trên panel — tiện cho việc xếp nội dung từ trên xuống */
  get top(): number {
    return -this.panelHeight / 2;
  }
}

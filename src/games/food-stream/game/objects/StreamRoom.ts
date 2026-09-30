/**
 * Phòng livestream vẽ vừa một khung chữ nhật: tường sọc + dây đèn + sàn gỗ (vẽ bằng code,
 * co giãn theo mọi tỉ lệ màn hình) và đạo cụ cắt từ art board (cửa sổ, kệ sách, cây, máy quay...).
 * Màu tường đổi theo `variant` (mỗi gói một màu) để các "phòng" khác nhau.
 */
import Phaser from 'phaser';
import { DEPTH, THEME } from '@/games/food-stream/game/config/theme';

const LIGHT_COLORS = [0xffd23f, 0xff6f9c, 0x7ad3ff, 0x9bea7a];

interface Prop {
  key: string;
  /** Vị trí theo tỉ lệ khung (tâm đáy của đạo cụ) */
  x: number;
  y: number;
  /** Chiều cao theo tỉ lệ cạnh khung (cạnh nhỏ hơn giữa chiều cao và 3/4 chiều rộng) */
  height: number;
  /** Chỉ hiện khi khung đủ rộng (bố cục ngang / màn chờ) */
  wideOnly?: boolean;
}

const PROPS: Prop[] = [
  { key: 'prop.window', x: 0.2, y: 0.6, height: 0.46 },
  { key: 'prop.shelf', x: 0.8, y: 0.56, height: 0.4 },
  { key: 'prop.chalkboard', x: 0.5, y: 0.6, height: 0.44, wideOnly: true },
  { key: 'prop.lamp', x: 0.06, y: 0.86, height: 0.28 },
  { key: 'prop.plant', x: 0.93, y: 0.88, height: 0.28 },
];

const FRAME_RADIUS = 14;

/** Tỉ lệ rộng / cao từ đó coi là khung "rộng" */
const WIDE_RATIO = 1.25;

export default class StreamRoom extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, area: Phaser.Geom.Rectangle, variant = 0, { framed = true } = {}) {
    super(scene, 0, 0);
    this.setDepth(DEPTH.ROOM);
    const colors = THEME.roomWalls[variant % THEME.roomWalls.length];
    const floorTop = area.y + area.height * 0.8;

    const g = scene.add.graphics();
    // Tường sọc
    g.fillStyle(colors.wall).fillRect(area.x, area.y, area.width, area.height);
    g.fillStyle(colors.stripe);
    for (let x = area.x; x < area.right; x += 28) g.fillRect(x, area.y, 14, floorTop - area.y);
    // Chân tường
    g.fillStyle(THEME.hex.white, 0.7).fillRect(area.x, floorTop - 10, area.width, 10);
    // Sàn gỗ
    g.fillStyle(THEME.hex.wood).fillRect(area.x, floorTop, area.width, area.bottom - floorTop);
    g.lineStyle(2, THEME.hex.woodDark, 0.5);
    for (let y = floorTop + 12; y < area.bottom; y += 12) g.lineBetween(area.x, y, area.right, y);
    this.add(g);

    this.addLights(area);
    const wide = area.width / area.height >= WIDE_RATIO;
    // Khung cao (sân khấu bố cục ngang): đạo cụ theo chiều rộng để không quá to
    const unit = Math.min(area.height, area.width * 0.75);
    PROPS.filter((prop) => wide || !prop.wideOnly).forEach((prop) => {
      const image = scene.add.image(area.x + area.width * prop.x, area.y + area.height * prop.y, prop.key);
      image.setOrigin(0.5, 1).setScale((unit * prop.height) / image.height);
      this.add(image);
    });

    scene.add.existing(this);
    if (framed) {
      // Cắt phần đạo cụ tràn ra ngoài khung, rồi vẽ viền khung phía trên
      const shape = scene.make.graphics({}, false);
      shape.fillStyle(THEME.hex.white).fillRoundedRect(area.x, area.y, area.width, area.height, FRAME_RADIUS);
      this.setMask(shape.createGeometryMask());
      scene.add
        .graphics()
        .setDepth(DEPTH.ROOM)
        .lineStyle(4, THEME.hex.ink)
        .strokeRoundedRect(area.x, area.y, area.width, area.height, FRAME_RADIUS);
    }
  }

  /** Dây đèn nhấp nháy dọc mép trên */
  private addLights(area: Phaser.Geom.Rectangle): void {
    const wire = this.scene.add.graphics();
    const sag = 10;
    const count = Math.max(6, Math.round(area.width / 34));
    const points: Phaser.Math.Vector2[] = [];
    for (let i = 0; i <= count; i += 1) {
      const t = i / count;
      const x = area.x + 10 + (area.width - 20) * t;
      const y = area.y + 10 + Math.sin(t * Math.PI * 3) ** 2 * sag;
      points.push(new Phaser.Math.Vector2(x, y));
    }
    wire.lineStyle(2, 0x6b4a3a).strokePoints(points);
    this.add(wire);
    points.slice(1, -1).forEach((point, index) => {
      const bulb = this.scene.add.circle(point.x, point.y + 5, 4, LIGHT_COLORS[index % LIGHT_COLORS.length]);
      this.add(bulb);
      this.scene.tweens.add({
        targets: bulb,
        alpha: 0.45,
        duration: 700,
        delay: index * 120,
        yoyo: true,
        repeat: -1,
      });
    });
  }
}

/**
 * Nội dung của "game làm bánh" giả (TROLL MODE).
 * Toàn bộ chữ / số liệu "câu view" nằm ở đây để dễ sửa, không lẫn vào component.
 */

const sprite = (path: string) => `assets/${path}.png`;

export const BRAND = {
  name: 'Tiệm Bánh Mơ Ước',
  subtitle: 'BAKERY DREAM',
  tagline: 'Game làm bánh số 1 dành cho bạn!',
  heroImage: sprite('backgrounds/bg_bakery_03'),
  credit: 'Made by haulv',
};

export const STATS = [
  { value: '4.9 ★', label: '12,8K đánh giá' },
  { value: '1M+', label: 'lượt chơi' },
  { value: '#1', label: 'Game ẩm thực' },
];

export const FEATURES = [
  { icon: '🥐', text: '200+ công thức bánh' },
  { icon: '🎂', text: 'Trang trí bánh siêu xinh' },
  { icon: '🏪', text: 'Mở tiệm bánh của riêng bạn' },
  // { icon: '🎁', text: 'Quà tân thủ 1.000 xu' },
];

export const FLOATING_SPRITES = [
  { src: sprite('bread/bread_04'), className: 'fb-float--a' },
  { src: sprite('items/star'), className: 'fb-float--b' },
  { src: sprite('items/heart'), className: 'fb-float--c' },
  { src: sprite('bread/bread_02'), className: 'fb-float--d' },
];

export interface Recipe {
  id: string;
  name: string;
  image: string;
  tag: string;
  stars: number;
  time: string;
}

export const RECIPES: Recipe[] = [
  {
    id: 'roll',
    name: 'Cuộn Quế Dâu Tây',
    image: sprite('bread/bread_04'),
    tag: 'HOT 🔥',
    stars: 3,
    time: '5 phút',
  },
  {
    id: 'baguette',
    name: 'Bánh Mì Baguette',
    image: sprite('bread/bread_02'),
    tag: 'Kinh điển',
    stars: 2,
    time: '3 phút',
  },
  {
    id: 'loaf',
    name: 'Bánh Mì Sandwich',
    image: sprite('bread/bread_03'),
    tag: 'Dễ làm',
    stars: 1,
    time: '2 phút',
  },
  {
    id: 'bun',
    name: 'Bánh Mì Tròn Bơ',
    image: sprite('bread/bread_01'),
    tag: 'MỚI',
    stars: 1,
    time: '2 phút',
  },
];

export const KNEAD = {
  step: 'Bước 1/2 · Nhào bột',
  hint: 'Chạm thật nhanh để nhào bột!',
  tapsNeeded: 8,
  cheers: ['Tuyệt!', 'Khéo tay ghê!', 'Nhào đều nào!', 'Bột mịn rồi!', 'Siêu đầu bếp!'],
};

export type BakePhase = 'heating' | 'done' | 'dropping' | 'recovering' | 'stuck' | 'opened';

export const BAKE = {
  step: 'Bước 2/2 · Nướng bánh',
  /** Diễn biến thanh nướng: lên 100% → tụt xuống → bò lên lại... kẹt ở 99% */
  timeline: [
    { phase: 'heating', to: 100, ms: 2600 },
    { phase: 'done', to: 100, ms: 500 },
    { phase: 'dropping', to: 64, ms: 500 },
    { phase: 'recovering', to: 99, ms: 1300 },
  ] satisfies { phase: BakePhase; to: number; ms: number }[],
  /** Chữ lúc đang nướng, đổi theo % (from tăng dần) */
  heatingLines: [
    { from: 0, text: 'Làm nóng lò...' },
    { from: 25, text: 'Bột đang nở...' },
    { from: 55, text: 'Vỏ bánh vàng dần...' },
    { from: 85, text: 'Sắp chín rồi...' },
    { from: 100, text: 'Chín rồi! 🎉' },
  ],
  phaseLines: {
    done: 'Chín rồi! 🎉',
    dropping: 'Ơ... lò nguội mất?!',
    recovering: 'Nhóm lửa lại...',
    stuck: 'Còn đúng 1% nữa thôi...',
    opened: 'Ơ...?',
  },
  openButton: 'MỞ LÒ 🔥',
  /** Nút MỞ LÒ né bao nhiêu lần trước khi chịu cho bấm */
  dodges: 5,
  dodgeLines: ['Hụt rồi!', 'Nhanh tay lên!', 'Suýt được rồi!', 'Cố thêm chút!', 'Lần này chắc chắn!'],
};

export const REVEAL = {
  gameName: 'BREAD CATCHER',
  button: 'HỨNG BÁNH NGAY!',
};

export const CTA = {
  start: 'BẮT ĐẦU LÀM BÁNH',
  fineprint: 'Miễn phí · Không quảng cáo · Chơi offline',
  chooseRecipe: 'Chọn món đầu tiên của bạn',
  chooseHint: 'Mở khoá thêm 196 công thức khi lên cấp!',
};

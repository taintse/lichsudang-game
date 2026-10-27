export type ThemeId = 'flame' | 'autumn' | 'dbp' | 'victory' | 'doimoi';

export interface StageMeta {
  id: string;
  year: string;
  title: string;
  kicker: string;
  blurb: string;
  howTo: string;
  theme: ThemeId;
}

export const STAGES: StageMeta[] = [
  {
    id: 'flame',
    year: '1930',
    title: 'Ngọn lửa đầu tiên',
    kicker: 'Chặng 1 · Dòng thời gian',
    blurb:
      'Từ Hội nghị hợp nhất năm 1930 đến đêm toàn quốc kháng chiến. Kéo các mốc về đúng thứ tự — trên cùng là sự kiện sớm nhất.',
    howTo: 'Kéo thả hoặc bấm mũi tên. Trên cùng là sự kiện xảy ra sớm nhất.',
    theme: 'flame',
  },
  {
    id: 'autumn',
    year: '1945',
    title: 'Mùa thu cách mạng',
    kicker: 'Chặng 2 · Ghim địa danh',
    blurb:
      'Cách mạng tháng Tám và những địa danh đã đi vào lịch sử. Chạm sơ đồ, ghim nơi sự kiện diễn ra — càng gần càng nhiều điểm.',
    howTo: 'Chạm sơ đồ để thả ghim. Kính lúp hiện phía trên ngón tay. Có thể sửa trước khi chốt.',
    theme: 'autumn',
  },
  {
    id: 'dbp',
    year: '1954',
    title: 'Điện Biên Phủ',
    kicker: 'Chặng 3 · Mở manh mối',
    blurb:
      'Kháng chiến chống thực dân Pháp, đỉnh cao là chiến dịch Điện Biên Phủ và Hiệp định Giơ-ne-vơ. Manh mối hiện dần — đoán càng sớm càng được nhiều điểm.',
    howTo: 'Chọn một phương án hoặc gõ đáp án. Đoán sai bị trừ điểm. Đoán đúng sớm được điểm cao.',
    theme: 'dbp',
  },
  {
    id: 'victory',
    year: '1975',
    title: 'Thống nhất đất nước',
    kicker: 'Chặng 4 · Nối cặp',
    blurb:
      'Từ Nghị quyết 15 đến mùa xuân 1975. Nối chiến dịch, sự kiện với năm hoặc ý nghĩa — nhanh và đúng thì có thưởng tốc độ.',
    howTo: 'Chọn một ô bên trái, rồi chọn ô bên phải khớp với nó. Ghép hết trước khi hết giờ.',
    theme: 'victory',
  },
  {
    id: 'doimoi',
    year: '1986',
    title: 'Đổi mới',
    kicker: 'Chặng 5 · Đặt cược',
    blurb:
      'Đại hội VI và những quyết sách Đổi mới. Mỗi người được cấp thêm 800 điểm vốn. Mang điểm đang có ra cược — đúng thì phần cược được nhân đôi, sai thì mất.',
    howTo: 'Chọn mức cược và một phương án rồi chốt. Đúng: được cộng đúng số điểm đã cược. Sai: mất số điểm đó.',
    theme: 'doimoi',
  },
];

export function stageById(id: string): StageMeta {
  const stage = STAGES.find((s) => s.id === id);
  if (!stage) throw new Error('Không có chặng ' + id);
  return stage;
}

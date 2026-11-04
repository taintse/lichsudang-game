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
    id: 'boiCanh',
    year: '1935–36',
    title: 'Bối cảnh đổi',
    kicker: 'Chặng 1 · Xếp chuỗi',
    blurb:
      'Bạn là một cán bộ. Thế giới và trong nước đã khác năm 1930. Hãy xếp đúng chuỗi thích ứng — bước đầu ở trên cùng.',
    howTo: 'Kéo thả hoặc bấm mũi tên. Trên cùng là bước xảy ra trước.',
    theme: 'flame',
  },
  {
    id: 'nhiemVu',
    year: '1936',
    title: 'Đổi nhiệm vụ trước mắt',
    kicker: 'Chặng 2 · Chia hai phía',
    blurb:
      'Nhiệm vụ trước mắt đổi, mục tiêu lâu dài thì không bỏ. Đưa mỗi khẩu hiệu về đúng thời kỳ hoặc đúng cách hiểu.',
    howTo: 'Đưa mỗi thẻ sang trái hoặc phải. Chốt khi đã xếp hết.',
    theme: 'autumn',
  },
  {
    id: 'lucLuong',
    year: '1936–39',
    title: 'Mở rộng mặt trận',
    kicker: 'Chặng 3 · Chiêu mộ',
    blurb:
      'Không chỉ công nhân và nông dân. Hãy tập hợp những người có chung yêu cầu dân sinh, dân chủ, hòa bình.',
    howTo: 'Chạm để đưa vào mặt trận. Chọn nhầm sẽ bị trừ. Bấm lại để bỏ ra trước khi chốt.',
    theme: 'dbp',
  },
  {
    id: 'phuongPhap',
    year: '1936–37',
    title: 'Đổi cách đấu tranh',
    kicker: 'Chặng 4 · Nối cặp',
    blurb:
      'Công khai đi với bí mật, hợp pháp đi với nửa hợp pháp. Nối mỗi việc với cách làm phù hợp.',
    howTo: 'Chọn một ô bên trái, rồi chọn ô bên phải khớp với nó.',
    theme: 'victory',
  },
  {
    id: 'baiHoc',
    year: '1939',
    title: 'Bốn chìa khóa',
    kicker: 'Chặng 5 · Đặt cược',
    blurb:
      'Bốn bài học và lời kết. Mỗi người được thêm 800 điểm vốn. Cược đúng thì được cộng đúng phần đã cược, cược sai thì mất.',
    howTo: 'Chọn mức cược và một phương án rồi chốt. Đúng được cộng phần cược. Sai mất phần cược.',
    theme: 'doimoi',
  },
];

export function stageById(id: string): StageMeta {
  const stage = STAGES.find((item) => item.id === id);
  if (!stage) throw new Error('Không có chặng ' + id);
  return stage;
}

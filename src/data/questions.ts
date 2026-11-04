/**
 * NGÂN HÀNG CÂU HỎI — Phong trào dân chủ 1936–1939.
 *
 * Nguồn: bài thuyết trình «Phong trào dân chủ 1936–1939: Thích ứng chiến lược»
 * và giáo trình Lịch sử Đảng Cộng sản Việt Nam (Bộ GD&ĐT).
 * Không thêm số liệu, tên người hay địa danh không có trong nguồn này.
 *
 * `stageId` trùng id trong `src/data/stages.ts`.
 * `timeLimit` tính bằng giây. Người chơi không thấy `sort`, `bucket`, `ok`.
 * `event`: `double` nhân đôi điểm gốc nếu có điểm dương; `spy` trừ thêm nếu chưa đúng.
 */
import type { PlaceId } from '../geo/places';

export type Twist = 'double' | 'spy';

export interface TimelineItem {
  id: string;
  text: string;
  year: string;
  sort: number;
}

export interface TimelineChallenge {
  t: 'timeline';
  id: string;
  stageId: string;
  prompt: string;
  timeLimit: number;
  headline: string;
  explanation: string;
  items: TimelineItem[];
  event?: Twist;
}

export interface MapOption {
  id: string;
  placeId: PlaceId;
}

export interface MapChallenge {
  t: 'map';
  id: string;
  stageId: string;
  prompt: string;
  timeLimit: number;
  options: MapOption[];
  correctId: string;
  headline: string;
  explanation: string;
  event?: Twist;
}

export interface ClueChallenge {
  t: 'clues';
  id: string;
  stageId: string;
  prompt: string;
  timeLimit: number;
  clues: { text: string; revealAt: number }[];
  options: string[];
  aliases: string[];
  headline: string;
  explanation: string;
  event?: Twist;
}

export interface MatchChallenge {
  t: 'match';
  id: string;
  stageId: string;
  prompt: string;
  timeLimit: number;
  pairs: { id: string; left: string; right: string }[];
  headline: string;
  explanation: string;
  event?: Twist;
}

export interface BetOption {
  id: string;
  text: string;
}

export interface BetChallenge {
  t: 'bet';
  id: string;
  stageId: string;
  /** Shown during the bet, before the question. */
  topic: string;
  scenario: string;
  question: string;
  timeLimit: number;
  options: BetOption[];
  correctId: string;
  headline: string;
  explanation: string;
  event?: Twist;
}

export interface BucketChallenge {
  t: 'bucket';
  id: string;
  stageId: string;
  prompt: string;
  timeLimit: number;
  leftLabel: string;
  rightLabel: string;
  cards: { id: string; text: string; bucket: 'left' | 'right' }[];
  headline: string;
  explanation: string;
  event?: Twist;
}

export interface RecruitChallenge {
  t: 'recruit';
  id: string;
  stageId: string;
  prompt: string;
  timeLimit: number;
  cards: { id: string; text: string; ok: boolean }[];
  headline: string;
  explanation: string;
  event?: Twist;
}

export type Challenge =
  | TimelineChallenge
  | MapChallenge
  | ClueChallenge
  | MatchChallenge
  | BetChallenge
  | BucketChallenge
  | RecruitChallenge;

export const CHALLENGES: Challenge[] = [
  {
    t: 'timeline',
    id: 'tl-chuoi',
    stageId: 'boiCanh',
    prompt: 'Xếp chuỗi thích ứng chiến lược. Bước xảy ra trước nằm trên cùng.',
    timeLimit: 14,
    headline: 'Bối cảnh, nhiệm vụ, lực lượng, cách làm',
    explanation:
      'Bốn bước then chốt, đúng thứ tự trong chuỗi sáu bước: bối cảnh đổi, rồi đổi nhiệm vụ trước mắt, mở lực lượng, đổi cách đấu tranh. Giữa bước một và hai còn việc đánh giá lại tương quan lực lượng. Cuối chuỗi là tích lũy cho mục tiêu lâu dài. Mục tiêu không bỏ.',
    items: [
      { id: 's1', text: 'Bối cảnh thay đổi', year: 'Bước 1', sort: 1 },
      { id: 's3', text: 'Đổi nhiệm vụ trước mắt', year: 'Bước 2', sort: 2 },
      { id: 's4', text: 'Mở rộng lực lượng', year: 'Bước 3', sort: 3 },
      { id: 's5', text: 'Đổi cách đấu tranh', year: 'Bước 4', sort: 4 },
    ],
  },
  {
    t: 'bucket',
    id: 'bk-boi-canh',
    stageId: 'boiCanh',
    prompt: 'Mỗi thẻ thuộc bối cảnh thế giới hay trong nước?',
    timeLimit: 12,
    leftLabel: 'Thế giới',
    rightLabel: 'Trong nước',
    headline: 'Thế giới và trong nước cùng đổi',
    explanation:
      'Phát xít và Mặt trận Nhân dân ở Pháp năm 1936 là bối cảnh thế giới. Đại hội VII Quốc tế Cộng sản năm 1935 cũng kêu gọi chống phát xít, chống chiến tranh, giữ hòa bình. Trong nước, ách thuộc địa khiến nhu cầu tự do, dân chủ, đời sống trở nên cấp thiết.',
    cards: [
      { id: 'w1', text: 'Phát xít Đức, Ý, Nhật', bucket: 'left' },
      { id: 'w3', text: 'Mặt trận Nhân dân ở Pháp', bucket: 'left' },
      { id: 'd1', text: 'Đời sống thuộc địa khó khăn', bucket: 'right' },
      { id: 'd2', text: 'Đòi tự do và dân chủ', bucket: 'right' },
    ],
  },
  {
    t: 'bucket',
    id: 'bk-khau-hieu',
    stageId: 'nhiemVu',
    prompt: 'Đưa mỗi nhiệm vụ trước mắt về đúng thời kỳ.',
    timeLimit: 12,
    leftLabel: '1930–1931',
    rightLabel: '1936–1939',
    headline: 'Đổi nhiệm vụ trước mắt',
    explanation:
      '1930–1931 tập trung chống đế quốc và phong kiến. 1936–1939 chuyển sang chống thực dân phản động, chống phát xít, chống chiến tranh, đòi tự do, dân chủ, cơm áo và hòa bình. Mục tiêu lâu dài không đổi.',
    cards: [
      { id: 'a1', text: 'Chống đế quốc', bucket: 'left' },
      { id: 'a2', text: 'Chống phong kiến', bucket: 'left' },
      { id: 'b1', text: 'Chống thực dân phản động', bucket: 'right' },
      { id: 'b3', text: 'Cơm áo và hòa bình', bucket: 'right' },
    ],
  },
  {
    t: 'bucket',
    id: 'bk-hieu-dung',
    stageId: 'nhiemVu',
    prompt: 'Đâu là cách hiểu đúng về thích ứng 1936–1939?',
    timeLimit: 12,
    leftLabel: 'Hiểu đúng',
    rightLabel: 'Hiểu sai',
    headline: 'Giữ mục tiêu, đổi sách lược',
    explanation:
      'Thích ứng là chọn nhiệm vụ, lực lượng và cách làm cho đúng lúc. Không bỏ mục tiêu lâu dài, cũng không áp dụng máy móc nhiệm vụ 1930–1931.',
    cards: [
      { id: 'h1', text: 'Giữ mục tiêu lâu dài', bucket: 'left' },
      { id: 'h3', text: 'Linh hoạt sách lược', bucket: 'left' },
      { id: 's1', text: 'Bỏ mục tiêu lâu dài', bucket: 'right' },
      { id: 's2', text: 'Giữ nguyên việc năm 1930', bucket: 'right' },
    ],
  },
  {
    t: 'recruit',
    id: 'rc-luc-luong',
    stageId: 'lucLuong',
    prompt: 'Chọn lực lượng đưa vào mặt trận. Chọn nhầm bị trừ.',
    timeLimit: 12,
    event: 'spy',
    headline: 'Mở rộng, không chỉ công nông',
    explanation:
      'Mặt trận gồm công nhân, nông dân, tiểu tư sản, trí thức và lực lượng dân chủ, tiến bộ. Không đưa thế lực thực dân phản động hay phát xít vào.',
    cards: [
      { id: 'f1', text: 'Công nhân, nông dân', ok: true },
      { id: 'f3', text: 'Tiểu tư sản, trí thức', ok: true },
      { id: 'f5', text: 'Lực lượng dân chủ', ok: true },
      { id: 'f8', text: 'Thế lực phát xít', ok: false },
    ],
  },
  {
    t: 'bucket',
    id: 'bk-mau-so',
    stageId: 'lucLuong',
    prompt: 'Đâu là điểm chung, đâu không bắt buộc?',
    timeLimit: 12,
    leftLabel: 'Điểm chung',
    rightLabel: 'Không bắt buộc',
    headline: 'Dân sinh, dân chủ, hòa bình',
    explanation:
      'Điểm chung để tập hợp là dân sinh, dân chủ, hòa bình. Không đòi người tham gia phải cùng mục tiêu cách mạng lâu dài.',
    cards: [
      { id: 'c1', text: 'Dân sinh', bucket: 'left' },
      { id: 'c2', text: 'Dân chủ', bucket: 'left' },
      { id: 'c3', text: 'Hòa bình', bucket: 'left' },
      { id: 'c4', text: 'Cùng mục tiêu lâu dài', bucket: 'right' },
    ],
  },
  {
    t: 'match',
    id: 'mh-phuong-phap',
    stageId: 'phuongPhap',
    prompt: 'Nối cách làm với chỗ dùng.',
    timeLimit: 14,
    event: 'double',
    headline: 'Công khai đi với bí mật',
    explanation:
      'Kết hợp công khai và bí mật, hợp pháp và nửa hợp pháp. Mít tinh, kiến nghị, báo chí và nghị trường là đường công khai để tuyên truyền, vận động, tập hợp quần chúng.',
    pairs: [
      { id: 'p1', left: 'Công khai và bí mật', right: 'Dùng cả hai' },
      { id: 'p2', left: 'Hợp pháp, nửa hợp pháp', right: 'Tận dụng chỗ hợp pháp' },
      { id: 'p3', left: 'Mít tinh, kiến nghị', right: 'Nêu yêu cầu quần chúng' },
      { id: 'p4', left: 'Báo chí, nghị trường', right: 'Đòi quyền dân chủ' },
    ],
  },
  {
    t: 'match',
    id: 'mh-phong-trao',
    stageId: 'phuongPhap',
    prompt: 'Nối phong trào với việc đã làm.',
    timeLimit: 14,
    headline: 'Đưa yêu cầu ra chỗ công khai',
    explanation:
      'Đông Dương Đại hội năm 1936 để nhân dân trình bày nguyện vọng dân sinh, dân chủ. Năm 1937, dịp phái viên Chính phủ Pháp sang, quần chúng mít tinh nêu yêu cầu. Báo chí, nghị trường và đấu tranh của các tầng lớp xoay quanh đời sống và quyền lợi thiết thực.',
    pairs: [
      { id: 'm1', left: 'Đông Dương Đại hội 1936', right: 'Nguyện vọng dân sinh' },
      { id: 'm2', left: 'Phái viên Pháp, 1937', right: 'Mít tinh công khai' },
      { id: 'm3', left: 'Báo chí, nghị trường', right: 'Tuyên truyền dân chủ' },
      { id: 'm4', left: 'Công nhân, nông dân', right: 'Đòi đời sống, quyền lợi' },
    ],
  },
  {
    t: 'bet',
    id: 'bet-boi-canh',
    stageId: 'baiHoc',
    topic: 'Chủ đề: Bài học về bối cảnh',
    scenario: 'Muốn áp việc năm 1930 vào năm 1936.',
    question: 'Bài học nào đúng?',
    timeLimit: 12,
    correctId: 'dung',
    headline: 'Không áp dụng máy móc',
    explanation: 'Phải đánh giá đúng bối cảnh. Nhiệm vụ trước mắt của 1930–1931 không đem nguyên sang 1936–1939.',
    options: [
      { id: 'dung', text: 'Xét bối cảnh, đừng máy móc' },
      { id: 'sai1', text: 'Đổi mục tiêu cho hợp thời' },
      { id: 'sai2', text: 'Thu hẹp mặt trận' },
      { id: 'sai3', text: 'Bỏ hình thức công khai' },
    ],
  },
  {
    t: 'bet',
    id: 'bet-y-nghia',
    stageId: 'baiHoc',
    topic: 'Chủ đề: Ý nghĩa thích ứng',
    scenario: 'Có người bảo thích ứng là đổi mục tiêu.',
    question: 'Cách hiểu nào đúng?',
    timeLimit: 12,
    correctId: 'giu',
    headline: 'Giữ mục tiêu, đổi cách đi',
    explanation:
      'Thích ứng chiến lược không phải thay đổi hay từ bỏ mục tiêu. Đó là chọn nhiệm vụ, lực lượng và phương thức phù hợp từng thời điểm.',
    options: [
      { id: 'doi', text: 'Đổi mục tiêu lâu dài' },
      { id: 'giu', text: 'Giữ mục tiêu, đổi cách làm' },
      { id: 'bi', text: 'Chỉ đấu tranh bí mật' },
      { id: 'hep', text: 'Chỉ công nhân, nông dân' },
    ],
  },
  {
    t: 'bet',
    id: 'bet-chia-khoa',
    stageId: 'baiHoc',
    topic: 'Chủ đề: Bốn chìa khóa',
    scenario: 'Lớp chốt điều cần nhớ của giai đoạn.',
    question: 'Bốn chìa khóa là gì?',
    timeLimit: 12,
    correctId: 'bon',
    headline: 'Bốn chìa khóa',
    explanation:
      'Kiên định mục tiêu, linh hoạt sách lược, mở rộng lực lượng, thích ứng với thời cuộc. Giai đoạn này cũng chuẩn bị lực lượng, tổ chức và kinh nghiệm cho các giai đoạn sau.',
    options: [
      { id: 'bon', text: 'Giữ mục tiêu, linh hoạt, mở rộng, thích ứng' },
      { id: 'cho', text: 'Đổi mục tiêu, thu hẹp, chỉ bí mật' },
      { id: 'khoi', text: 'Khởi nghĩa ngay, giành chính quyền' },
      { id: 'cu', text: 'Giữ nguyên sách lược 1930' },
    ],
  },
];

export function challengeAt(pos: number): Challenge | null {
  return CHALLENGES[pos] ?? null;
}

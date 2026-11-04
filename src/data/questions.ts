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
    timeLimit: 22,
    headline: 'Sáu bước, không bỏ mục tiêu',
    explanation:
      'Bối cảnh đổi thì đánh giá lại, rồi mới đổi nhiệm vụ trước mắt, mở lực lượng, đổi cách đấu tranh, và tích lũy cho mục tiêu lâu dài. Mục tiêu chiến lược vẫn giữ.',
    items: [
      { id: 's1', text: 'Bối cảnh thay đổi', year: 'Bước 1', sort: 1 },
      { id: 's2', text: 'Đánh giá lại tình hình và tương quan lực lượng', year: 'Bước 2', sort: 2 },
      { id: 's3', text: 'Điều chỉnh nhiệm vụ trước mắt', year: 'Bước 3', sort: 3 },
      { id: 's4', text: 'Mở rộng lực lượng tham gia', year: 'Bước 4', sort: 4 },
      { id: 's5', text: 'Thay đổi hình thức đấu tranh', year: 'Bước 5', sort: 5 },
      { id: 's6', text: 'Tích lũy lực lượng và kinh nghiệm cho mục tiêu lâu dài', year: 'Bước 6', sort: 6 },
    ],
  },
  {
    t: 'bucket',
    id: 'bk-boi-canh',
    stageId: 'boiCanh',
    prompt: 'Mỗi thẻ thuộc bối cảnh thế giới hay trong nước?',
    timeLimit: 18,
    leftLabel: 'Thế giới',
    rightLabel: 'Trong nước',
    headline: 'Thế giới và trong nước cùng đổi',
    explanation:
      'Phát xít, Đại hội VII Quốc tế Cộng sản năm 1935 và Mặt trận Nhân dân ở Pháp năm 1936 là bối cảnh thế giới. Trong nước, ách thuộc địa khiến nhu cầu tự do, dân chủ và đời sống trở nên cấp thiết.',
    cards: [
      { id: 'w1', text: 'Phát xít mạnh ở Đức, Ý, Nhật; nguy cơ chiến tranh thế giới', bucket: 'left' },
      { id: 'w2', text: 'Đại hội VII Quốc tế Cộng sản, 1935: chống phát xít, chống chiến tranh, bảo vệ hòa bình', bucket: 'left' },
      { id: 'w3', text: 'Năm 1936, Mặt trận Nhân dân lên cầm quyền ở Pháp', bucket: 'left' },
      { id: 'd1', text: 'Dưới chế độ thuộc địa, đời sống kinh tế và chính trị khó khăn', bucket: 'right' },
      { id: 'd2', text: 'Nhu cầu tự do, dân chủ, cải thiện đời sống rất cấp thiết', bucket: 'right' },
      { id: 'd3', text: 'Hoàn cảnh mới đòi hỏi phương thức đấu tranh mới', bucket: 'right' },
    ],
  },
  {
    t: 'bucket',
    id: 'bk-khau-hieu',
    stageId: 'nhiemVu',
    prompt: 'Đưa mỗi nhiệm vụ trước mắt về đúng thời kỳ.',
    timeLimit: 18,
    leftLabel: '1930–1931',
    rightLabel: '1936–1939',
    headline: 'Đổi nhiệm vụ trước mắt, không đổi mục tiêu',
    explanation:
      '1930–1931 tập trung chống đế quốc và phong kiến. 1936–1939 chuyển sang chống chế độ phản động thuộc địa, chống phát xít, chống chiến tranh, đòi tự do, dân chủ, cơm áo và hòa bình.',
    cards: [
      { id: 'a1', text: 'Tập trung chống đế quốc', bucket: 'left' },
      { id: 'a2', text: 'Tập trung chống phong kiến', bucket: 'left' },
      { id: 'b1', text: 'Chống chế độ phản động thuộc địa', bucket: 'right' },
      { id: 'b2', text: 'Chống phát xít, chống nguy cơ chiến tranh', bucket: 'right' },
      { id: 'b3', text: 'Đòi tự do, dân chủ, cơm áo và hòa bình', bucket: 'right' },
    ],
  },
  {
    t: 'bucket',
    id: 'bk-hieu-dung',
    stageId: 'nhiemVu',
    prompt: 'Đâu là cách hiểu đúng về thích ứng 1936–1939?',
    timeLimit: 18,
    leftLabel: 'Hiểu đúng',
    rightLabel: 'Hiểu sai',
    headline: 'Linh hoạt sách lược, giữ mục tiêu',
    explanation:
      'Thích ứng là chọn nhiệm vụ, lực lượng và cách làm cho đúng lúc. Không phải bỏ mục tiêu lâu dài, cũng không phải áp dụng máy móc nhiệm vụ 1930–1931.',
    cards: [
      { id: 'h1', text: 'Kiên định mục tiêu lâu dài, linh hoạt sách lược', bucket: 'left' },
      { id: 'h2', text: 'Không bỏ mục tiêu cách mạng lâu dài', bucket: 'left' },
      { id: 'h3', text: 'Chọn nhiệm vụ, lực lượng và cách làm phù hợp từng lúc', bucket: 'left' },
      { id: 's1', text: 'Thích ứng là đổi hoặc bỏ mục tiêu', bucket: 'right' },
      { id: 's2', text: 'Cứ giữ nguyên nhiệm vụ 1930–1931, không cần xét bối cảnh mới', bucket: 'right' },
      { id: 's3', text: 'Chỉ nhận người đã cùng mục tiêu lâu dài', bucket: 'right' },
    ],
  },
  {
    t: 'recruit',
    id: 'rc-luc-luong',
    stageId: 'lucLuong',
    prompt: 'Đưa vào mặt trận những lực lượng phù hợp. Chọn nhầm sẽ bị trừ.',
    timeLimit: 22,
    event: 'spy',
    headline: 'Mở rộng, không chỉ công nông',
    explanation:
      'Mặt trận gồm công nhân, nông dân, tiểu tư sản, trí thức, lực lượng dân chủ và tiến bộ, và người cùng yêu cầu chống phản động, chống phát xít, đòi tự do dân chủ. Không đưa thế lực thực dân phản động hay phát xít vào.',
    cards: [
      { id: 'f1', text: 'Công nhân', ok: true },
      { id: 'f2', text: 'Nông dân', ok: true },
      { id: 'f3', text: 'Tiểu tư sản', ok: true },
      { id: 'f4', text: 'Trí thức', ok: true },
      { id: 'f5', text: 'Lực lượng dân chủ, tiến bộ', ok: true },
      { id: 'f6', text: 'Người cùng đòi tự do, dân chủ, chống phát xít', ok: true },
      { id: 'f7', text: 'Thế lực thực dân phản động', ok: false },
      { id: 'f8', text: 'Thế lực phát xít', ok: false },
    ],
  },
  {
    t: 'bucket',
    id: 'bk-mau-so',
    stageId: 'lucLuong',
    prompt: 'Lấy gì làm điểm chung, và điều gì không được bắt buộc?',
    timeLimit: 18,
    leftLabel: 'Điểm chung',
    rightLabel: 'Không bắt buộc',
    headline: 'Dân sinh, dân chủ, hòa bình',
    explanation:
      'Điểm chung để tập hợp là dân sinh, dân chủ, hòa bình. Không đòi người tham gia phải cùng mục tiêu cách mạng lâu dài.',
    cards: [
      { id: 'c1', text: 'Dân sinh', bucket: 'left' },
      { id: 'c2', text: 'Dân chủ', bucket: 'left' },
      { id: 'c3', text: 'Hòa bình', bucket: 'left' },
      { id: 'c4', text: 'Cùng mục tiêu cách mạng lâu dài', bucket: 'right' },
      { id: 'c5', text: 'Phải nhận toàn bộ mục tiêu lâu dài mới được vào', bucket: 'right' },
    ],
  },
  {
    t: 'match',
    id: 'mh-phuong-phap',
    stageId: 'phuongPhap',
    prompt: 'Nối mỗi cách làm với chỗ dùng của nó.',
    timeLimit: 20,
    event: 'double',
    headline: 'Công khai đi với bí mật',
    explanation:
      'Kết hợp công khai và bí mật, hợp pháp và nửa hợp pháp. Mít tinh, kiến nghị, báo chí và nghị trường là đường công khai để tuyên truyền, vận động, tập hợp quần chúng.',
    pairs: [
      { id: 'p1', left: 'Công khai và bí mật', right: 'Dùng cả hai, không bỏ một phía' },
      { id: 'p2', left: 'Hợp pháp và nửa hợp pháp', right: 'Tận dụng chỗ hợp pháp để tuyên truyền, vận động' },
      { id: 'p3', left: 'Mít tinh, kiến nghị, yêu sách', right: 'Đưa yêu cầu dân sinh, dân chủ ra trước quần chúng' },
      { id: 'p4', left: 'Báo chí và nghị trường', right: 'Đấu tranh công khai đòi quyền dân chủ' },
    ],
  },
  {
    t: 'match',
    id: 'mh-phong-trao',
    stageId: 'phuongPhap',
    prompt: 'Nối mỗi phong trào với việc đã làm.',
    timeLimit: 18,
    headline: 'Đưa yêu cầu ra chỗ công khai',
    explanation:
      'Đông Dương Đại hội năm 1936 để nhân dân trình bày nguyện vọng dân sinh, dân chủ. Năm 1937, dịp phái viên Chính phủ Pháp sang, quần chúng mít tinh nêu yêu cầu. Báo chí, nghị trường và đấu tranh của các tầng lớp xoay quanh đời sống và quyền lợi thiết thực.',
    pairs: [
      { id: 'm1', left: 'Đông Dương Đại hội, 1936', right: 'Nhân dân trình bày nguyện vọng dân sinh, dân chủ' },
      { id: 'm2', left: 'Năm 1937, phái viên Chính phủ Pháp sang Đông Dương', right: 'Mít tinh, nêu yêu cầu công khai' },
      { id: 'm3', left: 'Báo chí và nghị trường', right: 'Tuyên truyền, đòi quyền dân chủ' },
      { id: 'm4', left: 'Công nhân, nông dân và các tầng lớp khác', right: 'Đòi yêu cầu thiết thực về đời sống, quyền lợi' },
    ],
  },
  {
    t: 'bet',
    id: 'bet-boi-canh',
    stageId: 'baiHoc',
    scenario: 'Một cán bộ muốn lấy nguyên nhiệm vụ năm 1930–1931 áp vào năm 1936.',
    question: 'Bài học nào nói đúng việc này?',
    timeLimit: 16,
    correctId: 'dung',
    headline: 'Không áp dụng máy móc',
    explanation: 'Phải đánh giá đúng bối cảnh. Nhiệm vụ trước mắt của 1930–1931 không đem nguyên sang 1936–1939.',
    options: [
      { id: 'dung', text: 'Đánh giá đúng bối cảnh, không áp dụng máy móc' },
      { id: 'sai1', text: 'Đổi luôn mục tiêu lâu dài cho hợp thời' },
      { id: 'sai2', text: 'Thu hẹp mặt trận để dễ lãnh đạo' },
      { id: 'sai3', text: 'Bỏ hết hình thức công khai' },
    ],
  },
  {
    t: 'bet',
    id: 'bet-y-nghia',
    stageId: 'baiHoc',
    scenario: 'Có người nói thích ứng chiến lược là đổi mục tiêu của Đảng.',
    question: 'Cách hiểu nào đúng với giai đoạn 1936–1939?',
    timeLimit: 16,
    correctId: 'giu',
    headline: 'Giữ mục tiêu, đổi cách đi',
    explanation:
      'Thích ứng chiến lược không phải thay đổi hay từ bỏ mục tiêu. Đó là chọn nhiệm vụ, lực lượng và phương thức phù hợp từng thời điểm.',
    options: [
      { id: 'doi', text: 'Đổi mục tiêu cách mạng lâu dài cho hợp thời' },
      { id: 'giu', text: 'Giữ mục tiêu lâu dài; chọn nhiệm vụ, lực lượng và cách làm phù hợp lúc đó' },
      { id: 'bi', text: 'Chỉ đấu tranh bí mật, bỏ hình thức công khai' },
      { id: 'hep', text: 'Chỉ tập hợp công nhân và nông dân' },
    ],
  },
  {
    t: 'bet',
    id: 'bet-chia-khoa',
    stageId: 'baiHoc',
    scenario: 'Lớp chốt bốn điều cần nhớ của cả giai đoạn.',
    question: 'Bốn chìa khóa là gì?',
    timeLimit: 16,
    correctId: 'bon',
    headline: 'Bốn chìa khóa',
    explanation:
      'Kiên định mục tiêu, linh hoạt sách lược, mở rộng lực lượng, thích ứng với thời cuộc. Giai đoạn này cũng chuẩn bị lực lượng, tổ chức và kinh nghiệm cho các giai đoạn sau.',
    options: [
      { id: 'bon', text: 'Kiên định mục tiêu, linh hoạt sách lược, mở rộng lực lượng, thích ứng với thời cuộc' },
      { id: 'cho', text: 'Đổi mục tiêu, thu hẹp lực lượng, chỉ bí mật, chờ thời' },
      { id: 'khoi', text: 'Chống đế quốc, chống phong kiến, khởi nghĩa ngay, giành chính quyền' },
      { id: 'cu', text: 'Bỏ mặt trận, dựa một giai cấp, giữ nguyên sách lược 1930–1931' },
    ],
  },
];

export function challengeAt(pos: number): Challenge | null {
  return CHALLENGES[pos] ?? null;
}

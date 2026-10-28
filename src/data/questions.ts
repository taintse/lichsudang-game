/**
 * NGÂN HÀNG CÂU HỎI — sửa file này khi muốn đổi nội dung buổi học.
 *
 * Mỗi phần tử trong `CHALLENGES` là một thử thách, xếp đúng thứ tự chơi.
 * `stageId` phải trùng một id trong `src/data/stages.ts`.
 *
 * Các kiểu (`t`):
 * - timeline: `items` xếp theo thời gian sớm → muộn. `sort` là số để so thứ tự
 *   (ví dụ 19450819 = 19/8/1945). Người chơi không thấy `sort` hay `year`.
 * - map: đúng 4 `options`. Mỗi option có `id` (tự đặt) và `placeId`
 *   (một địa danh trong `src/geo/places.ts`). `correctId` trùng `id` của
 *   phương án đúng. Bốn mốc nên cách xa nhau trên sơ đồ để dễ chạm.
 * - clues: `aliases` là các cách gõ được tính đúng (có hoặc không dấu).
 *   `options` là 4 phương án. Đáp án đúng phải khớp một alias.
 * - match: `pairs` là các cặp trái ↔ phải. Không cần đánh dấu đáp án riêng.
 * - bet: đúng một `correctId` trùng `id` của một phương án.
 *
 * `timeLimit` tính bằng giây. `headline` là dòng đáp án in lớn trên máy chiếu.
 * `explanation` là lời giảng viên đọc sau mỗi câu — nên đúng giáo trình,
 * ngắn, và có thể đọc to trong khoảng 20 giây.
 *
 * Nội dung bám các mốc đã được khẳng định trong Giáo trình Lịch sử Đảng
 * Cộng sản Việt Nam (chương trình đại học) và sách giáo khoa phổ thông:
 * 1930, Cách mạng tháng Tám 1945, kháng chiến chống Pháp, kháng chiến chống Mỹ,
 * Đại hội VI và Đổi mới. Sửa câu chữ cho khớp slide của giảng viên nếu cần.
 */
import type { PlaceId } from '../geo/places';

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
}

export interface MapOption {
  /** Id ổn định để giảng viên sửa. Người chơi không thấy id này. */
  id: string;
  placeId: PlaceId;
}

export interface MapChallenge {
  t: 'map';
  id: string;
  stageId: string;
  prompt: string;
  timeLimit: number;
  /** Đúng 4 địa điểm, một đúng và ba nhiễu. */
  options: MapOption[];
  /** Trùng `id` của phương án đúng trong `options`. */
  correctId: string;
  headline: string;
  explanation: string;
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
}

export type Challenge = TimelineChallenge | MapChallenge | ClueChallenge | MatchChallenge | BetChallenge;

export const CHALLENGES: Challenge[] = [
  {
    t: 'timeline',
    id: 'tl-khoi-dau',
    stageId: 'flame',
    prompt: 'Những mốc đầu tiên của Đảng. Xếp từ sớm nhất (trên cùng) đến muộn nhất.',
    timeLimit: 36,
    headline: '1930 → 1939',
    explanation:
      'Ngày 3/2/1930, Hội nghị hợp nhất do Nguyễn Ái Quốc triệu tập tại Hương Cảng thành lập Đảng Cộng sản Việt Nam, thông qua Chính cương vắn tắt và Sách lược vắn tắt. Tháng 10/1930, Hội nghị Trung ương lần thứ nhất đổi tên thành Đảng Cộng sản Đông Dương và thông qua Luận cương chính trị do Trần Phú khởi thảo. Cao trào dân chủ diễn ra những năm 1936–1939. Tháng 11/1939, Hội nghị Trung ương 6 tại Bà Điểm (Hóc Môn) chuyển hướng: đặt giải phóng dân tộc lên hàng đầu.',
    items: [
      { id: 'k7', text: 'Hội nghị hợp nhất thành lập Đảng Cộng sản Việt Nam tại Hương Cảng', year: '3/2/1930', sort: 19300203 },
      { id: 'k2', text: 'Hội nghị Trung ương 1: Luận cương chính trị, đổi tên Đảng Cộng sản Đông Dương', year: '10/1930', sort: 19301001 },
      { id: 'k9', text: 'Cao trào Mặt trận Dân chủ Đông Dương đòi dân sinh, dân chủ', year: '1936–1939', sort: 19360701 },
      { id: 'k4', text: 'Hội nghị Trung ương 6 chuyển hướng, ưu tiên giải phóng dân tộc', year: '11/1939', sort: 19391101 },
    ],
  },
  {
    t: 'timeline',
    id: 'tl-toi-khoi-nghia',
    stageId: 'flame',
    prompt: 'Con đường tới khởi nghĩa. Xếp từ sớm nhất (trên cùng) đến muộn nhất.',
    timeLimit: 36,
    headline: '1941 → 9/3/1945',
    explanation:
      'Ngày 28/1/1941, Nguyễn Ái Quốc về nước, đến Pác Bó (Cao Bằng). Hội nghị Trung ương 8 (tháng 5/1941) quyết định thành lập Mặt trận Việt Minh ngày 19/5/1941. Ngày 22/12/1944, Đội Việt Nam Tuyên truyền Giải phóng quân ra đời tại Cao Bằng, do đồng chí Võ Nguyên Giáp chỉ huy. Ngày 9/3/1945, Nhật đảo chính Pháp, làm thay đổi đột ngột tình hình Đông Dương.',
    items: [
      { id: 'n3', text: 'Nguyễn Ái Quốc về nước, trực tiếp lãnh đạo cách mạng tại Pác Bó', year: '28/1/1941', sort: 19410128 },
      { id: 'n8', text: 'Thành lập Mặt trận Việt Minh tại Hội nghị Trung ương 8', year: '19/5/1941', sort: 19410519 },
      { id: 'n1', text: 'Thành lập Đội Việt Nam Tuyên truyền Giải phóng quân', year: '22/12/1944', sort: 19441222 },
      { id: 'n6', text: 'Nhật đảo chính Pháp ở Đông Dương', year: '9/3/1945', sort: 19450309 },
    ],
  },
  {
    t: 'timeline',
    id: 'tl-tan-trao',
    stageId: 'flame',
    prompt: 'Từ đảo chính Nhật–Pháp tới Tân Trào. Xếp từ sớm nhất (trên cùng) đến muộn nhất.',
    timeLimit: 36,
    headline: '12/3/1945 → 16/8/1945',
    explanation:
      'Ngày 12/3/1945, Thường vụ Trung ương ra Chỉ thị «Nhật – Pháp bắn nhau và hành động của chúng ta». Ngày 4/6/1945, Khu giải phóng Việt Bắc được thành lập, trung tâm là Tân Trào. Từ 13 đến 15/8/1945, Hội nghị toàn quốc của Đảng tại Tân Trào quyết định phát động Tổng khởi nghĩa. Ngày 16/8/1945, Đại hội Quốc dân lập Ủy ban Dân tộc giải phóng do Hồ Chí Minh làm Chủ tịch.',
    items: [
      { id: 'p4', text: 'Chỉ thị «Nhật – Pháp bắn nhau và hành động của chúng ta»', year: '12/3/1945', sort: 19450312 },
      { id: 'p1', text: 'Thành lập Khu giải phóng Việt Bắc, trung tâm đặt tại Tân Trào', year: '4/6/1945', sort: 19450604 },
      { id: 'p8', text: 'Hội nghị toàn quốc của Đảng quyết định Tổng khởi nghĩa', year: '13–15/8/1945', sort: 19450813 },
      { id: 'p2', text: 'Đại hội Quốc dân Tân Trào lập Ủy ban Dân tộc giải phóng', year: '16/8/1945', sort: 19450816 },
    ],
  },
  {
    t: 'timeline',
    id: 'tl-thang-tam',
    stageId: 'flame',
    prompt: 'Những ngày Cách mạng tháng Tám và Ngày Độc lập. Xếp từ sớm nhất (trên cùng) đến muộn nhất.',
    timeLimit: 34,
    headline: '19/8 → 2/9/1945',
    explanation:
      'Khởi nghĩa giành chính quyền thắng lợi ở Hà Nội ngày 19/8, ở Huế ngày 23/8 và ở Sài Gòn ngày 25/8/1945. Chiều 2/9/1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa.',
    items: [
      { id: 'r5', text: 'Khởi nghĩa giành chính quyền thắng lợi ở Hà Nội', year: '19/8/1945', sort: 19450819 },
      { id: 'r1', text: 'Khởi nghĩa giành chính quyền thắng lợi ở Huế', year: '23/8/1945', sort: 19450823 },
      { id: 'r7', text: 'Khởi nghĩa giành chính quyền thắng lợi ở Sài Gòn', year: '25/8/1945', sort: 19450825 },
      { id: 'r3', text: 'Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình', year: '2/9/1945', sort: 19450902 },
    ],
  },
  {
    t: 'timeline',
    id: 'tl-khang-chien',
    stageId: 'flame',
    prompt: 'Từ chính quyền non trẻ tới đêm toàn quốc kháng chiến. Xếp từ sớm nhất (trên cùng) đến muộn nhất.',
    timeLimit: 36,
    headline: '6/1 → 19/12/1946',
    explanation:
      'Ngày 6/1/1946, cả nước tổng tuyển cử bầu Quốc hội khóa I — cuộc tổng tuyển cử đầu tiên. Hiệp định Sơ bộ (6/3/1946) và Tạm ước (14/9/1946) là những nhân nhượng có nguyên tắc để tranh thủ thời gian. Đêm 19/12/1946, toàn quốc kháng chiến bùng nổ. Hồ Chí Minh kêu gọi: thà hy sinh tất cả, chứ nhất định không chịu mất nước, nhất định không chịu làm nô lệ.',
    items: [
      { id: 's8', text: 'Tổng tuyển cử bầu Quốc hội khóa I trên cả nước', year: '6/1/1946', sort: 19460106 },
      { id: 's2', text: 'Ký Hiệp định Sơ bộ với Pháp', year: '6/3/1946', sort: 19460306 },
      { id: 's6', text: 'Ký Tạm ước, tiếp tục nhân nhượng có nguyên tắc', year: '14/9/1946', sort: 19460914 },
      { id: 's1', text: 'Toàn quốc kháng chiến bùng nổ', year: '19/12/1946', sort: 19461219 },
    ],
  },
  {
    t: 'map',
    id: 'map-pacbo',
    stageId: 'autumn',
    prompt: 'Chọn nơi Nguyễn Ái Quốc về nước ngày 28/1/1941 và chủ trì Hội nghị Trung ương 8.',
    timeLimit: 22,
    options: [
      { id: 'pacBo', placeId: 'pacBo' },
      { id: 'dienBien', placeId: 'dienBien' },
      { id: 'hue', placeId: 'hue' },
      { id: 'saiGon', placeId: 'saiGon' },
    ],
    correctId: 'pacBo',
    headline: 'Pác Bó, Cao Bằng',
    explanation:
      'Pác Bó thuộc Hà Quảng, Cao Bằng, sát biên giới. Đây là nơi Nguyễn Ái Quốc ở và làm việc sau khi về nước, và là nơi họp Hội nghị Trung ương 8 (tháng 5/1941) quyết định thành lập Mặt trận Việt Minh.',
  },
  {
    t: 'map',
    id: 'map-tantrao',
    stageId: 'autumn',
    prompt: 'Chọn thủ đô Khu giải phóng — nơi họp Hội nghị toàn quốc của Đảng và Đại hội Quốc dân tháng 8/1945.',
    timeLimit: 22,
    options: [
      { id: 'tanTrao', placeId: 'tanTrao' },
      { id: 'vinh', placeId: 'vinh' },
      { id: 'quyNhon', placeId: 'quyNhon' },
      { id: 'saiGon', placeId: 'saiGon' },
    ],
    correctId: 'tanTrao',
    headline: 'Tân Trào, Tuyên Quang',
    explanation:
      'Tân Trào (Sơn Dương, Tuyên Quang) là trung tâm Khu giải phóng Việt Bắc, được thành lập ngày 4/6/1945. Giữa tháng 8/1945, Hội nghị toàn quốc của Đảng quyết định Tổng khởi nghĩa; Đại hội Quốc dân lập Ủy ban Dân tộc giải phóng do Hồ Chí Minh làm Chủ tịch.',
  },
  {
    t: 'map',
    id: 'map-badinh',
    stageId: 'autumn',
    prompt: 'Chọn nơi Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa.',
    timeLimit: 20,
    options: [
      { id: 'baDinh', placeId: 'baDinh' },
      { id: 'hue', placeId: 'hue' },
      { id: 'quyNhon', placeId: 'quyNhon' },
      { id: 'saiGon', placeId: 'saiGon' },
    ],
    correctId: 'baDinh',
    headline: 'Quảng trường Ba Đình, Hà Nội',
    explanation:
      'Chiều 2/9/1945, tại Quảng trường Ba Đình (Hà Nội), Hồ Chí Minh đọc Tuyên ngôn Độc lập trước đồng bào. Nước Việt Nam Dân chủ Cộng hòa ra đời.',
  },
  {
    t: 'map',
    id: 'map-hue',
    stageId: 'autumn',
    prompt: 'Chọn thành phố miền Trung giành chính quyền ngày 23/8/1945.',
    timeLimit: 20,
    options: [
      { id: 'hue', placeId: 'hue' },
      { id: 'pacBo', placeId: 'pacBo' },
      { id: 'dienBien', placeId: 'dienBien' },
      { id: 'saiGon', placeId: 'saiGon' },
    ],
    correctId: 'hue',
    headline: 'Huế',
    explanation:
      'Ngày 23/8/1945, khởi nghĩa thắng lợi ở Huế. Cùng Hà Nội (19/8) và Sài Gòn (25/8), Huế là một trong ba đô thị then chốt của Cách mạng tháng Tám.',
  },
  {
    t: 'map',
    id: 'map-saigon',
    stageId: 'autumn',
    prompt: 'Chọn thành phố miền Nam giành chính quyền ngày 25/8/1945.',
    timeLimit: 20,
    options: [
      { id: 'saiGon', placeId: 'saiGon' },
      { id: 'pacBo', placeId: 'pacBo' },
      { id: 'dienBien', placeId: 'dienBien' },
      { id: 'vinh', placeId: 'vinh' },
    ],
    correctId: 'saiGon',
    headline: 'Sài Gòn',
    explanation:
      'Ngày 25/8/1945, khởi nghĩa thắng lợi ở Sài Gòn. Chính quyền ở đô thị lớn nhất miền Nam về tay nhân dân, hoàn thành những ngày Tổng khởi nghĩa ở ba miền.',
  },
  {
    t: 'map',
    id: 'map-dienbien',
    stageId: 'autumn',
    prompt: 'Chọn lòng chảo Tây Bắc, nơi chiến dịch từ 13/3 đến 7/5/1954 làm nên bước ngoặt kết thúc chiến tranh với Pháp.',
    timeLimit: 22,
    options: [
      { id: 'dienBien', placeId: 'dienBien' },
      { id: 'pacBo', placeId: 'pacBo' },
      { id: 'hue', placeId: 'hue' },
      { id: 'saiGon', placeId: 'saiGon' },
    ],
    correctId: 'dienBien',
    headline: 'Điện Biên Phủ',
    explanation:
      'Điện Biên Phủ là tập đoàn cứ điểm mạnh của Pháp ở lòng chảo miền Tây Bắc. Chiến dịch kéo dài 56 ngày đêm. Ngày 7/5/1954, quân ta làm chủ tập đoàn cứ điểm. Thắng lợi này mở đường tới Hiệp định Giơ-ne-vơ.',
  },
  {
    t: 'clues',
    id: 'clue-dbp',
    stageId: 'dbp',
    prompt: 'Đây là trận đánh nào?',
    timeLimit: 36,
    clues: [
      { text: 'Tập đoàn cứ điểm của Pháp nằm trong một lòng chảo ở Tây Bắc.', revealAt: 0 },
      { text: 'Bộ chỉ huy ta chuyển từ «đánh nhanh, thắng nhanh» sang «đánh chắc, tiến chắc».', revealAt: 9 },
      { text: 'Mở màn ngày 13/3/1954 và kéo dài 56 ngày đêm.', revealAt: 18 },
      { text: 'Ngày 7/5/1954 ta làm chủ cứ điểm; chỉ huy Pháp Đờ Cát-xtơ-ri bị bắt.', revealAt: 27 },
    ],
    options: ['Điện Biên Phủ', 'Chiến dịch Biên giới', 'Việt Bắc thu – đông 1947', 'Điện Biên Phủ trên không'],
    aliases: ['Điện Biên Phủ', 'Điện Biên', 'Dien Bien Phu'],
    headline: 'Điện Biên Phủ',
    explanation:
      'Chiến dịch Điện Biên Phủ (13/3–7/5/1954) do Đại tướng Võ Nguyên Giáp làm Tổng chỉ huy. Ta đánh theo phương châm «đánh chắc, tiến chắc», qua ba đợt, và làm chủ tập đoàn cứ điểm ngày 7/5/1954. Đây là thắng lợi quân sự quyết định của cuộc kháng chiến chống Pháp.',
  },
  {
    t: 'clues',
    id: 'clue-giap',
    stageId: 'dbp',
    prompt: 'Người chỉ huy này là ai?',
    timeLimit: 36,
    clues: [
      { text: 'Được giao chỉ huy đội vũ trang tuyên truyền thành lập cuối năm 1944.', revealAt: 0 },
      { text: 'Được phong Đại tướng năm 1948, giữ cương vị Tổng tư lệnh.', revealAt: 9 },
      { text: 'Trực tiếp làm Tổng chỉ huy mặt trận Điện Biên Phủ.', revealAt: 18 },
      { text: 'Cùng Bộ Chỉ huy quyết định phương châm «đánh chắc, tiến chắc».', revealAt: 27 },
    ],
    options: ['Võ Nguyên Giáp', 'Trường Chinh', 'Phạm Văn Đồng', 'Nguyễn Chí Thanh'],
    aliases: ['Võ Nguyên Giáp', 'Đại tướng Võ Nguyên Giáp', 'Vo Nguyen Giap'],
    headline: 'Võ Nguyên Giáp',
    explanation:
      'Đồng chí Võ Nguyên Giáp chỉ huy Đội Việt Nam Tuyên truyền Giải phóng quân thành lập ngày 22/12/1944, được phong Đại tướng năm 1948 và trực tiếp chỉ huy chiến dịch Điện Biên Phủ. Quyết định chuyển phương châm sang «đánh chắc, tiến chắc» là một lựa chọn then chốt của Bộ Chỉ huy.',
  },
  {
    t: 'clues',
    id: 'clue-geneve',
    stageId: 'dbp',
    prompt: 'Văn kiện nào được nhắc tới?',
    timeLimit: 36,
    clues: [
      { text: 'Ký kết năm 1954, ngay sau thắng lợi quân sự quyết định ở Tây Bắc.', revealAt: 0 },
      { text: 'Các bên tham dự hội nghị công nhận độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của Việt Nam.', revealAt: 9 },
      { text: 'Lấy khoảng vĩ tuyến 17, dọc sông Bến Hải, làm giới tuyến quân sự tạm thời.', revealAt: 18 },
      { text: 'Quy định tập kết trong 300 ngày; tổng tuyển cử thống nhất được dự kiến vào tháng 7/1956.', revealAt: 27 },
    ],
    options: ['Hiệp định Giơ-ne-vơ (1954)', 'Hiệp định Sơ bộ (1946)', 'Hiệp định Paris (1973)', 'Tạm ước (1946)'],
    aliases: ['Hiệp định Giơ-ne-vơ', 'Hiệp định Giơ-ne-vơ (1954)', 'Hiệp định Giơnevơ', 'Hiệp định Genève', 'Hiệp định Geneva', 'Giơnevơ', 'Geneve', 'Geneva'],
    headline: 'Hiệp định Giơ-ne-vơ',
    explanation:
      'Hiệp định Giơ-ne-vơ được ký ngày 21/7/1954. Hiệp định công nhận độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của Việt Nam; lấy vĩ tuyến 17 (sông Bến Hải) làm giới tuyến quân sự tạm thời; quy định thời hạn tập kết 300 ngày. Cuộc tổng tuyển cử tự do dự kiến tháng 7/1956 sau đó không được thực hiện.',
  },
  {
    t: 'clues',
    id: 'clue-bien-gioi',
    stageId: 'dbp',
    prompt: 'Chiến dịch nào được mô tả?',
    timeLimit: 36,
    clues: [
      { text: 'Diễn ra thu – đông năm 1950 trên tuyến Cao Bằng – Lạng Sơn.', revealAt: 0 },
      { text: 'Quân ta tiêu diệt nhiều cứ điểm, mở đầu bằng Đông Khê.', revealAt: 9 },
      { text: 'Phá thế bị bao vây của căn cứ địa Việt Bắc.', revealAt: 18 },
      { text: 'Khai thông biên giới, mở đường tiếp nhận chi viện quốc tế.', revealAt: 27 },
    ],
    options: ['Chiến dịch Biên giới 1950', 'Chiến dịch Việt Bắc 1947', 'Chiến dịch Tây Nguyên 1975', 'Chiến dịch Hồ Chí Minh'],
    aliases: ['Chiến dịch Biên giới', 'Chiến dịch Biên giới 1950', 'Biên giới thu đông 1950', 'Biên giới 1950'],
    headline: 'Chiến dịch Biên giới 1950',
    explanation:
      'Chiến dịch Biên giới thu – đông 1950 (tháng 9–10/1950) giải phóng một vùng rộng trên tuyến Cao Bằng – Lạng Sơn, tiêu diệt cứ điểm Đông Khê và nhiều vị trí khác. Căn cứ địa Việt Bắc được khai thông với biên giới, cuộc kháng chiến thoát thế bị cô lập.',
  },
  {
    t: 'clues',
    id: 'clue-dang-lao-dong',
    stageId: 'dbp',
    prompt: 'Tên gọi nào của Đảng được nói tới?',
    timeLimit: 36,
    clues: [
      { text: 'Tên này được công bố khi Đảng ra hoạt động công khai.', revealAt: 0 },
      { text: 'Quyết định tại Đại hội đại biểu toàn quốc lần thứ II.', revealAt: 9 },
      { text: 'Đại hội họp tháng 2/1951 tại Vinh Quang, Chiêm Hóa, Tuyên Quang.', revealAt: 18 },
      { text: 'Hồ Chí Minh được bầu làm Chủ tịch Đảng, Trường Chinh làm Tổng Bí thư.', revealAt: 27 },
    ],
    options: ['Đảng Lao động Việt Nam', 'Đảng Cộng sản Đông Dương', 'Đảng Cộng sản Việt Nam', 'Đảng Dân chủ Việt Nam'],
    aliases: ['Đảng Lao động Việt Nam', 'Dang Lao dong Viet Nam', 'Đảng Lao động'],
    headline: 'Đảng Lao động Việt Nam',
    explanation:
      'Tại Đại hội II (11–19/2/1951), Đảng ra hoạt động công khai với tên Đảng Lao động Việt Nam. Nên nhớ chuỗi tên: Đảng Cộng sản Việt Nam (3/2/1930) → Đảng Cộng sản Đông Dương (10/1930) → Đảng Lao động Việt Nam (1951) → Đảng Cộng sản Việt Nam (Đại hội IV, 12/1976).',
  },
  {
    t: 'clues',
    id: 'clue-1912',
    stageId: 'dbp',
    prompt: 'Sự kiện nào được mô tả?',
    timeLimit: 36,
    clues: [
      { text: 'Diễn ra đêm 19/12/1946, bắt đầu từ Hà Nội rồi lan ra cả nước.', revealAt: 0 },
      { text: 'Khép lại những tháng nhân nhượng sau Tạm ước.', revealAt: 9 },
      { text: 'Chủ tịch Hồ Chí Minh ra lời kêu gọi cùng đêm ấy.', revealAt: 18 },
      { text: 'Lời kêu gọi có câu: thà hy sinh tất cả, chứ nhất định không chịu mất nước, nhất định không chịu làm nô lệ.', revealAt: 27 },
    ],
    options: ['Toàn quốc kháng chiến', 'Nhật đảo chính Pháp', 'Tổng khởi nghĩa tháng Tám', 'Chiến dịch Việt Bắc 1947'],
    aliases: ['Toàn quốc kháng chiến', 'Kháng chiến toàn quốc', '19/12/1946', 'Lời kêu gọi toàn quốc kháng chiến'],
    headline: 'Toàn quốc kháng chiến',
    explanation:
      'Đêm 19/12/1946, cuộc kháng chiến toàn quốc bùng nổ, mở đầu ở Hà Nội. Hồ Chí Minh ra Lời kêu gọi toàn quốc kháng chiến, khẳng định quyết tâm bảo vệ độc lập vừa giành được. Cuộc kháng chiến được xác định là toàn dân, toàn diện, lâu dài, dựa vào sức mình là chính.',
  },
  {
    t: 'match',
    id: 'match-moc-nam',
    stageId: 'victory',
    prompt: 'Nối sự kiện với mốc thời gian đúng.',
    timeLimit: 38,
    headline: '1959 → 1965',
    explanation:
      'Tháng 1/1959, Hội nghị Trung ương 15 ra Nghị quyết 15, cho phép dùng bạo lực cách mạng ở miền Nam. Ngày 20/12/1960, Mặt trận Dân tộc Giải phóng miền Nam Việt Nam ra đời. Tháng 8/1964, sự kiện Vịnh Bắc Bộ bị Mỹ lợi dụng để leo thang đánh phá miền Bắc. Ngày 8/3/1965, Mỹ đưa quân chiến đấu vào Đà Nẵng, mở đầu chiến lược «chiến tranh cục bộ».',
    pairs: [
      { id: 'u3', left: 'Nghị quyết 15 của Trung ương', right: 'Tháng 1/1959' },
      { id: 'u7', left: 'Thành lập Mặt trận Dân tộc Giải phóng miền Nam', right: '20/12/1960' },
      { id: 'u1', left: 'Sự kiện Vịnh Bắc Bộ', right: 'Tháng 8/1964' },
      { id: 'u5', left: 'Mỹ đưa quân chiến đấu vào Đà Nẵng', right: '8/3/1965' },
    ],
  },
  {
    t: 'match',
    id: 'match-1968-1975',
    stageId: 'victory',
    prompt: 'Nối sự kiện với năm diễn ra.',
    timeLimit: 36,
    headline: '1968 → 1975',
    explanation:
      'Tết Mậu Thân 1968, quân và dân ta tổng tiến công và nổi dậy, buộc Mỹ phải xuống thang và ngồi vào đàm phán Paris. Tháng 12/1972, cuộc tập kích bằng B-52 vào Hà Nội – Hải Phòng bị đánh bại (Điện Biên Phủ trên không). Hiệp định Paris ký ngày 27/1/1973. Ngày 30/4/1975, chiến dịch Hồ Chí Minh giải phóng Sài Gòn, kết thúc chiến tranh.',
    pairs: [
      { id: 'v2', left: 'Tổng tiến công và nổi dậy Tết Mậu Thân', right: 'Năm 1968' },
      { id: 'v8', left: 'Điện Biên Phủ trên không', right: 'Tháng 12/1972' },
      { id: 'v4', left: 'Hiệp định Paris', right: '27/1/1973' },
      { id: 'v1', left: 'Giải phóng Sài Gòn, kết thúc chiến tranh', right: '30/4/1975' },
    ],
  },
  {
    t: 'match',
    id: 'match-y-nghia',
    stageId: 'victory',
    prompt: 'Nối sự kiện với ý nghĩa lịch sử.',
    timeLimit: 42,
    headline: 'Bốn ý nghĩa then chốt',
    explanation:
      'Nghị quyết 15 mở đường kết hợp đấu tranh chính trị với đấu tranh vũ trang ở miền Nam. Tết Mậu Thân 1968 làm lung lay ý chí xâm lược và đẩy Mỹ vào thương lượng. Hiệp định Paris 1973 ghi nhận cam kết của Mỹ tôn trọng độc lập, chủ quyền, thống nhất, toàn vẹn lãnh thổ của Việt Nam và rút hết quân. Chiến dịch Hồ Chí Minh kết thúc bằng giải phóng Sài Gòn ngày 30/4/1975.',
    pairs: [
      { id: 'w6', left: 'Nghị quyết 15 (1/1959)', right: 'Kết hợp đấu tranh chính trị và vũ trang ở miền Nam' },
      { id: 'w2', left: 'Tết Mậu Thân 1968', right: 'Buộc Mỹ xuống thang, ngồi vào đàm phán Paris' },
      { id: 'w9', left: 'Hiệp định Paris 1973', right: 'Mỹ cam kết rút quân, tôn trọng thống nhất Việt Nam' },
      { id: 'w4', left: 'Chiến dịch Hồ Chí Minh', right: 'Giải phóng Sài Gòn, kết thúc chiến tranh' },
    ],
  },
  {
    t: 'match',
    id: 'match-xuan-1975',
    stageId: 'victory',
    prompt: 'Nối từng mốc của mùa xuân 1975 với ngày giải phóng.',
    timeLimit: 36,
    headline: 'Hành quân xuân 1975',
    explanation:
      'Chiến dịch Tây Nguyên mở màn bằng trận Buôn Ma Thuột ngày 10/3/1975 (thị xã được giải phóng ngày 11/3). Huế giải phóng ngày 26/3, Đà Nẵng ngày 29/3. Chiến dịch Hồ Chí Minh bắt đầu ngày 26/4 và toàn thắng ngày 30/4/1975 khi Sài Gòn được giải phóng.',
    pairs: [
      { id: 'x5', left: 'Mở màn giải phóng Buôn Ma Thuột', right: '10/3/1975' },
      { id: 'x1', left: 'Giải phóng Huế', right: '26/3/1975' },
      { id: 'x8', left: 'Giải phóng Đà Nẵng', right: '29/3/1975' },
      { id: 'x3', left: 'Giải phóng Sài Gòn', right: '30/4/1975' },
    ],
  },
  {
    t: 'match',
    id: 'match-thong-nhat',
    stageId: 'victory',
    prompt: 'Nối mốc với nội dung tương ứng.',
    timeLimit: 40,
    headline: 'Từ chiến dịch đến tên nước, tên Đảng',
    explanation:
      'Chiến dịch Tây Nguyên mở đầu cuộc Tổng tiến công và nổi dậy Xuân 1975. «Điện Biên Phủ trên không» là 12 ngày đêm (18–29/12/1972) quân dân miền Bắc đánh bại cuộc tập kích chiến lược bằng B-52. Ngày 2/7/1976, Quốc hội khóa VI quyết định tên nước Cộng hòa xã hội chủ nghĩa Việt Nam, thủ đô Hà Nội. Đại hội IV (12/1976) quyết định Đảng lấy tên Đảng Cộng sản Việt Nam.',
    pairs: [
      { id: 'y4', left: 'Chiến dịch Tây Nguyên', right: 'Mở màn Tổng tiến công Xuân 1975' },
      { id: 'y7', left: 'Điện Biên Phủ trên không', right: '12 ngày đêm đánh bại tập kích B-52' },
      { id: 'y2', left: 'Quốc hội khóa VI, ngày 2/7/1976', right: 'Đặt tên nước Cộng hòa xã hội chủ nghĩa Việt Nam' },
      { id: 'y9', left: 'Đại hội IV tháng 12/1976', right: 'Đảng lấy tên Đảng Cộng sản Việt Nam' },
    ],
  },
  {
    t: 'bet',
    id: 'bet-ba-chuong-trinh',
    stageId: 'doimoi',
    scenario:
      'Đại hội VI (tháng 12/1986) xác định phải tập trung sức giải quyết những nhu cầu bức thiết của đời sống nhân dân và của nền kinh tế.',
    question: 'Ba chương trình kinh tế lớn được đề ra là gì?',
    timeLimit: 28,
    options: [
      { id: 'c4', text: 'Lương thực – thực phẩm, hàng tiêu dùng, hàng xuất khẩu' },
      { id: 'c1', text: 'Công nghiệp nặng, quốc phòng và thể thao thành tích cao' },
      { id: 'c7', text: 'Giữ nguyên tem phiếu, đóng cửa, chỉ trông vào viện trợ' },
      { id: 'c2', text: 'Tư nhân hóa toàn bộ ngân hàng, bỏ quản lý của Nhà nước' },
    ],
    correctId: 'c4',
    headline: 'Lương thực, hàng tiêu dùng, hàng xuất khẩu',
    explanation:
      'Đại hội VI chủ trương dồn sức cho ba chương trình mục tiêu: lương thực – thực phẩm, hàng tiêu dùng và hàng xuất khẩu. Đây là cách giải quyết ách tắc trước mắt, ổn định đời sống và tạo tích lũy để phát triển.',
  },
  {
    t: 'bet',
    id: 'bet-khoan-10',
    stageId: 'doimoi',
    scenario:
      'Nông nghiệp là mặt trận then chốt. Năm 1981 đã có Chỉ thị 100 về khoán sản phẩm. Năm 1988, Trung ương đi một bước xa hơn.',
    question: 'Nghị quyết 10-NQ/TW năm 1988 (Khoán 10) quyết định điều gì?',
    timeLimit: 30,
    options: [
      { id: 'd2', text: 'Khoán sản phẩm đến nhóm và người lao động trong hợp tác xã' },
      { id: 'd8', text: 'Khoán đến hộ, giao ruộng sử dụng ổn định lâu dài' },
      { id: 'd1', text: 'Thu hồi ruộng đã chia, tập trung hết về hợp tác xã cấp cao' },
      { id: 'd5', text: 'Bán ruộng đất cho công ty nước ngoài' },
    ],
    correctId: 'd8',
    headline: 'Khoán 10: khoán đến hộ',
    explanation:
      'Chỉ thị 100-CT/TW (13/1/1981) mới là khoán sản phẩm đến nhóm và người lao động. Nghị quyết 10-NQ/TW (5/4/1988), thường gọi là Khoán 10, khoán đến hộ, công nhận hộ xã viên là đơn vị kinh tế tự chủ và giao đất sử dụng ổn định lâu dài. Sản xuất lương thực chuyển biến rõ sau bước này.',
  },
  {
    t: 'bet',
    id: 'bet-tong-bi-thu',
    stageId: 'doimoi',
    scenario: 'Đại hội VI họp ở Hà Nội từ ngày 15 đến 18/12/1986 và thông qua đường lối đổi mới toàn diện.',
    question: 'Ai được bầu làm Tổng Bí thư tại Đại hội VI?',
    timeLimit: 24,
    options: [
      { id: 'e6', text: 'Trường Chinh' },
      { id: 'e1', text: 'Lê Duẩn' },
      { id: 'e9', text: 'Nguyễn Văn Linh' },
      { id: 'e3', text: 'Đỗ Mười' },
    ],
    correctId: 'e9',
    headline: 'Nguyễn Văn Linh',
    explanation:
      'Đại hội VI bầu đồng chí Nguyễn Văn Linh làm Tổng Bí thư. Đồng chí Trường Chinh giữ cương vị Tổng Bí thư trong những tháng chuẩn bị đại hội (7–12/1986). Đồng chí Lê Duẩn mất tháng 7/1986. Đồng chí Đỗ Mười sau này làm Tổng Bí thư từ Đại hội VII (1991).',
  },
  {
    t: 'bet',
    id: 'bet-co-che',
    stageId: 'doimoi',
    scenario:
      'Trước Đổi mới, nền kinh tế vận hành theo cơ chế kế hoạch hóa tập trung, quan liêu, bao cấp và ngày càng ách tắc.',
    question: 'Đại hội VI chủ trương chuyển sang cơ chế nào?',
    timeLimit: 30,
    options: [
      { id: 'f3', text: 'Giữ nguyên bao cấp, phân phối tem phiếu cho mọi mặt hàng' },
      { id: 'f8', text: 'Kinh tế hàng hóa nhiều thành phần, theo cơ chế thị trường có sự quản lý của Nhà nước, định hướng xã hội chủ nghĩa' },
      { id: 'f1', text: 'Thị trường tự do, Nhà nước rút khỏi vai trò quản lý' },
      { id: 'f5', text: 'Chỉ còn kinh tế nhà nước, xóa mọi thành phần khác' },
    ],
    correctId: 'f8',
    headline: 'Thị trường có quản lý, định hướng xã hội chủ nghĩa',
    explanation:
      'Đường lối Đổi mới khẳng định phát triển kinh tế hàng hóa nhiều thành phần, vận hành theo cơ chế thị trường có sự quản lý của Nhà nước, theo định hướng xã hội chủ nghĩa. Đó không phải là quay lại bao cấp, cũng không phải từ bỏ định hướng xã hội chủ nghĩa hay vai trò quản lý của Nhà nước.',
  },
  {
    t: 'bet',
    id: 'bet-dau-tu',
    stageId: 'doimoi',
    scenario: 'Cùng với đổi mới bên trong, Việt Nam bắt đầu mở cửa, thu hút vốn và kỹ thuật từ bên ngoài.',
    question: 'Luật Đầu tư nước ngoài tại Việt Nam, thông qua tháng 12/1987, mở ra điều gì?',
    timeLimit: 26,
    options: [
      { id: 'g7', text: 'Cấm mọi hình thức hợp tác kinh tế với nước ngoài' },
      { id: 'g2', text: 'Chỉ nhận viện trợ không hoàn lại, không nhận vốn đầu tư' },
      { id: 'g5', text: 'Cho phép thu hút đầu tư trực tiếp của nước ngoài' },
      { id: 'g1', text: 'Nhượng toàn bộ quyền quản lý cảng biển cho tư nhân nước ngoài' },
    ],
    correctId: 'g5',
    headline: 'Mở cửa đón đầu tư trực tiếp nước ngoài',
    explanation:
      'Tháng 12/1987, Quốc hội thông qua Luật Đầu tư nước ngoài tại Việt Nam — một trong những đạo luật sớm của thời Đổi mới. Luật tạo khuôn khổ pháp lý để thu hút đầu tư trực tiếp nước ngoài, cụ thể hóa chủ trương mở rộng quan hệ kinh tế quốc tế.',
  },
];

export function challengeAt(pos: number): Challenge | null {
  return CHALLENGES[pos] ?? null;
}

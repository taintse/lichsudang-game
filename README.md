# Ngọn Lửa Sử Đảng

Trò chơi trên lớp cho học phần **Lịch sử Đảng Cộng sản Việt Nam**. Cả lớp chơi trên điện thoại và laptop của mình. Máy chiếu là máy chủ: hiện mã phòng, mã QR, bảng xếp hạng và lễ trao thưởng. Ba người dẫn đầu đứng trên bục.

Không cần tài khoản. Không có máy chủ trả phí. Tab máy chiếu giữ phòng và phát trạng thái qua kênh MQTT công khai (WebSocket bảo mật, cổng 443) nên điện thoại ở mạng khác, kể cả 4G, vẫn vào được.

Địa chỉ sau khi triển khai: [https://taintse.github.io/lichsudang-game/](https://taintse.github.io/lichsudang-game/)

## Chạy một buổi trên lớp

1. Mở Chrome hoặc Edge trên máy nối máy chiếu. Vào trang chủ, bấm **Tạo phòng máy chiếu**.
2. Chiếu mã phòng, mã QR và đường dẫn. Sinh viên quét mã, hoặc mở **Vào phòng** rồi gõ mã, tên và một biểu tượng. Không cần đăng ký.
3. Tên không phù hợp: bấm dấu × cạnh tên, rồi **Mời ra**. Người đó không vào lại được bằng cùng tên trong phòng này.
4. Khi lớp đã vào, bấm **Bắt đầu**. Mỗi chặng tự chạy: khoảng 7 giây giới thiệu, hết giờ câu hỏi thì khóa đáp án, 10 giây lời giải, 6 giây top 10. Giảng viên vẫn bấm được để đi nhanh hơn. Không có đồng hồ tổng của cả ván — chỉ đồng hồ từng câu.
5. Giữa các câu, bấm **Bảng xếp hạng** để xem top 10: hàng trượt theo thứ hạng mới, mũi tên lên xuống, điểm chạy số. Phím **N** (hoặc mũi tên phải) sang bước tiếp. Phím **cách** tạm dừng khi đang chơi. **Kết thúc phòng** chốt điểm sớm.
6. Hết câu cuối, máy chiếu dừng ở **Sẵn sàng trao giải**. Điện thoại hiện «Đang chờ trao giải». Chỉ khi giảng viên bấm **Trao giải** thì pháo hoa và lời «Chúc mừng các chiến sĩ xuất sắc» mới chạy, rồi hạng ba, hạng nhì, hạng nhất (bấm tiếp hoặc đợi vài giây), sau đó bảng top 10 với ba hạng nhận giải được tô. Rồi chọn **Chơi lại với người cũ**, **Tạo phòng mới**, hoặc **Về trang chủ**.

**Tab máy chiếu phải mở suốt buổi.** Đóng tab là hết phòng. Nếu vừa tải lại tab máy chiếu, phòng cố lấy lại mã cũ trong khoảng ba giờ (cùng trình duyệt, cùng tab phiên). Sinh viên tải lại trang thì vào lại bằng tên cũ và giữ điểm, miễn là tab máy chiếu vẫn sống. Chơi lại hoặc tạo phòng mới thì điểm cũ không bị giữ lại.

Người chơi không cần cùng mạng Wi-Fi với máy chiếu. Máy chiếu và điện thoại gặp nhau qua kênh công khai HiveMQ và EMQX (WebSocket cổng 443). Nếu sau khoảng 12 giây vẫn chưa vào, màn hình hiện lỗi và nút **Thử lại**: kiểm tra mã phòng, tab máy chiếu đang mở, và internet của điện thoại.

Một phòng khoảng 40–60 người. Vượt quá mức đó, người vào sau được báo phòng đã đầy.

## Năm chặng — Phong trào dân chủ 1936–1939

| Thời | Tên | Cách chơi |
| --- | --- | --- |
| 1935–36 | Bối cảnh đổi | Kéo thả (hoặc nút ▲▼, phím mũi tên) xếp bốn bước then chốt. Rồi chia thẻ thế giới / trong nước (vuốt hoặc nút, phím ← →) |
| 1936 | Đổi nhiệm vụ trước mắt | Chia khẩu hiệu 1930–1931 với 1936–1939, và cách hiểu đúng / hiểu sai |
| 1936–39 | Mở rộng mặt trận | Chạm để chiêu mộ đúng lực lượng. Một vòng mật thám: chọn nhầm bị trừ thêm. Rồi chia điểm chung / điều không bắt buộc |
| 1936–37 | Đổi cách đấu tranh | Nối cách làm và nối phong trào tiêu biểu. Một vòng được nhân đôi điểm |
| 1939 | Bốn chìa khóa | Ba câu cược. Đúng được cộng phần đã cược, sai thì mất |

Đúng liên tiếp có chuỗi combo (tối đa ×1,6) và thưởng tốc độ khi câu hoàn hảo. Đầu chặng cược mỗi người được cộng **800 điểm vốn**. Hòa điểm: người có tổng thời gian trả lời ngắn hơn xếp trên; nếu vẫn hòa thì người vào phòng trước xếp trên.

**11 câu, mỗi câu tối đa 4 thẻ.** Nếu không ai bấm bỏ qua, cả ván tới màn «Sẵn sàng trao giải» khoảng **6 phút 13 giây** (373 giây: 5 × 7 giây giới thiệu + 3 × 8 giây đặt cược + 138 giây trả lời + 11 × 16 giây đáp án và bảng). Không có đồng hồ tổng.

Mỗi thao tác được lưu ngay. Hết giờ, máy chiếu chấm bản lưu cuối, kể cả khi chưa bấm **Chốt**. Chưa đụng vào câu thì 0 điểm. Đúng một phần được điểm phần đó (thứ tự, thẻ, cặp). **Điểm tốc độ chỉ khi bấm Chốt và câu hoàn hảo** — lúc chốt là mốc thời gian. Không chốt thì vẫn có điểm nội dung, không có thưởng tốc độ.

Ba câu cuối: khoảng 8 giây chỉ hiện chủ đề và mức cược (25%, 50%, tất tay, hoặc thanh trượt). Chưa chọn thì mặc định **25%** điểm đang có. Dưới 100 điểm thì khoản cược tính trên mức sàn 100, để người gần 0 vẫn đổi được hạng. Hết giờ cược thì khóa mức, rồi mới hiện câu hỏi khoảng 12 giây.

Người chơi dùng điện thoại hoặc laptop, cùng trang **Vào phòng**. Vuốt có nút và phím mũi tên. Nút bấm cao ít nhất 44px. Chạm lần đầu bật tiếng.

## Chơi thử một mình

Trang chủ → **Chơi thử**. Một bên là máy chiếu, một bên là điện thoại. Trên màn hẹp, dùng hai tab «Máy chiếu» và «Điện thoại». Nút **Gợi ý đáp án đúng** chỉ có ở chế độ này. Hết ván có thể chơi lại, tạo phiên mới, hoặc về trang chủ.

## Sửa câu hỏi

Toàn bộ câu nằm trong [`src/data/questions.ts`](src/data/questions.ts). Lời từng chặng nằm trong [`src/data/stages.ts`](src/data/stages.ts). Ngân sách thời gian nằm trong [`src/data/timing.ts`](src/data/timing.ts).

`stageId` là `boiCanh`, `nhiemVu`, `lucLuong`, `phuongPhap` hoặc `baiHoc`.

- `timeline`: `items` xếp từ bước trước tới bước sau. `sort` là số thứ tự. Người chơi không thấy `sort` và `year`.
- `bucket`: mỗi thẻ có `bucket` là `left` hoặc `right`. Người chơi không thấy trường này. Giao diện có nút hai phía, vuốt, và phím mũi tên.
- `recruit`: thẻ `ok: true` được đưa vào mặt trận. Chọn thẻ `ok: false` bị trừ.
- `match`: mỗi `pairs` là một cặp trái ↔ phải.
- `bet`: đúng một `correctId`.
- `event`: `double` nhân đôi điểm gốc nếu dương; `spy` trừ thêm khi chưa đúng.

`timeLimit` tính bằng giây. `explanation` nên đọc được trong khoảng 10 giây vì máy tự sang bảng xếp hạng.

Nội dung bám bài «Phong trào dân chủ 1936–1939: Thích ứng chiến lược» và giáo trình Lịch sử Đảng Cộng sản Việt Nam (Bộ GD&ĐT). Xem [`CONTENT_AUDIT.md`](CONTENT_AUDIT.md). Không có câu bản đồ trong ván này. Sơ đồ trong mã nguồn, nếu được bật lại, vẫn ghi Quần đảo Hoàng Sa và Quần đảo Trường Sa là của Việt Nam, biển là Biển Đông, không có đường lưỡi bò.

Chạy thử sau khi sửa:

```bash
npm install
npm test
npm run dev
```

Mở `http://localhost:5173/lichsudang-game/` rồi vào **Chơi thử**.

## Triển khai GitHub Pages

Workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) chạy khi đẩy lên nhánh `main`: cài gói, chạy kiểm thử, dựng site tĩnh và đẩy lên GitHub Pages.

Repo này đã chọn **Settings → Pages → Build and deployment → Source = GitHub Actions**. Mỗi lần đẩy `main`, workflow dựng site và cập nhật [https://taintse.github.io/lichsudang-game/](https://taintse.github.io/lichsudang-game/). Token của GitHub Actions không đủ quyền tạo site Pages mới; nếu triển khai sang repo khác thì vẫn phải chọn nguồn GitHub Actions một lần.

Ứng dụng dùng `HashRouter` (`/#/host`, `/#/play`, `/#/join/MÃ`, `/#/thu`) nên đường dẫn vẫn đúng trên GitHub Pages. `base` trong Vite là `/lichsudang-game/`.

## Giới hạn

- Tab máy chiếu là máy chủ. Tắt tab là hết phòng.
- Phòng đi qua broker MQTT công khai (HiveMQ, EMQX), không mật khẩu. Không dùng cho dữ liệu riêng tư. Nếu cả hai broker cùng tắt, phòng không mở được.
- Khoảng 50–60 người là mức thực tế của một tab trình duyệt.
- Người quyết tâm có thể tải file JavaScript của trang máy chiếu để xem đáp án. Điểm vẫn do máy chiếu chấm theo thời điểm nhận câu trả lời, không tin số liệu máy người chơi tự khai.
- Sơ đồ Việt Nam là hình minh họa, không phải bản đồ hành chính. Đất liền, đảo gần bờ, Quần đảo Hoàng Sa và Quần đảo Trường Sa cùng một màu. Tên biển là Biển Đông.
- Hòa điểm: người vào phòng trước xếp trên.
- Âm thanh tổng hợp trong trình duyệt (không nhạc có bản quyền). Nút tắt tiếng nằm trên cùng, nhớ trong máy.

Phông chữ Be Vietnam Pro và Source Serif 4 (kèm phần chữ Việt) phát hành theo giấy phép SIL Open Font License. Bản giấy phép nằm trong `public/licenses/`.

# Ngọn Lửa Sử Đảng

Trò chơi trên lớp cho học phần **Lịch sử Đảng Cộng sản Việt Nam**. Cả lớp chơi trên điện thoại và laptop của mình. Máy chiếu là máy chủ: hiện mã phòng, mã QR, bảng xếp hạng và lễ trao thưởng. Ba người dẫn đầu đứng trên bục.

Không cần tài khoản. Không có máy chủ trả phí. Tab máy chiếu giữ phòng và phát trạng thái qua kênh MQTT công khai (WebSocket bảo mật, cổng 443) nên điện thoại ở mạng khác, kể cả 4G, vẫn vào được.

Địa chỉ sau khi triển khai: [https://taintse.github.io/lichsudang-game/](https://taintse.github.io/lichsudang-game/)

## Chạy một buổi trên lớp

1. Mở Chrome hoặc Edge trên máy nối máy chiếu. Vào trang chủ, bấm **Tạo phòng máy chiếu**.
2. Chiếu mã phòng, mã QR và đường dẫn. Sinh viên quét mã, hoặc mở **Vào phòng** rồi gõ mã, tên và một biểu tượng. Không cần đăng ký.
3. Tên không phù hợp: bấm dấu × cạnh tên, rồi **Mời ra**. Người đó không vào lại được bằng cùng tên trong phòng này.
4. Khi lớp đã vào, bấm **Bắt đầu**. Mỗi chặng có một kiểu chơi khác nhau. Sau mỗi câu, bấm **Hiện đáp án** để đọc lời giải, rồi **Bảng xếp hạng**.
5. Phím **N** (hoặc mũi tên phải) sang bước tiếp theo. Phím **cách** tạm dừng / tiếp tục khi đang chơi. **Kết thúc phòng** trao thưởng sớm với điểm hiện tại, có bước xác nhận.
6. Hết năm câu của chặng Đổi mới, máy chiếu mở lễ trao thưởng: tên, biểu tượng và điểm của hạng nhất, nhì, ba hiện ngay trên bục. Sau đó chọn **Chơi lại với người cũ** (cùng phòng, điểm về không, điện thoại tự về màn chờ), **Tạo phòng mới** (mã và QR mới, điện thoại được báo nhập mã mới), hoặc **Về trang chủ**.

**Tab máy chiếu phải mở suốt buổi.** Đóng tab là hết phòng. Nếu vừa tải lại tab máy chiếu, phòng cố lấy lại mã cũ trong khoảng ba giờ (cùng trình duyệt, cùng tab phiên). Sinh viên tải lại trang thì vào lại bằng tên cũ và giữ điểm, miễn là tab máy chiếu vẫn sống. Chơi lại hoặc tạo phòng mới thì điểm cũ không bị giữ lại.

Người chơi không cần cùng mạng Wi-Fi với máy chiếu. Máy chiếu và điện thoại gặp nhau qua kênh công khai HiveMQ và EMQX (WebSocket cổng 443). Nếu sau khoảng 12 giây vẫn chưa vào, màn hình hiện lỗi và nút **Thử lại**: kiểm tra mã phòng, tab máy chiếu đang mở, và internet của điện thoại.

Một phòng khoảng 40–60 người. Vượt quá mức đó, người vào sau được báo phòng đã đầy.

## Năm chặng

| Năm | Tên | Cách chơi |
| --- | --- | --- |
| 1930 | Ngọn lửa đầu tiên | Kéo thả (hoặc nút mũi tên) xếp sự kiện từ sớm đến muộn |
| 1945 | Mùa thu cách mạng | Chạm sơ đồ Việt Nam, ghim nơi sự kiện diễn ra. Càng gần càng nhiều điểm |
| 1954 | Điện Biên Phủ | Manh mối hiện dần. Đoán sớm được điểm cao, đoán sai bị trừ |
| 1975 | Thống nhất đất nước | Nối cặp sự kiện với năm hoặc ý nghĩa, càng nhanh càng tốt |
| 1986 | Đổi mới | Cược một phần điểm đang có. Đúng thì được cộng đúng phần đã cược, sai thì mất phần đó |

Đúng liên tiếp có chuỗi combo (tối đa ×1,6) và thưởng tốc độ khi câu được tính là hoàn hảo. Đầu chặng Đổi mới mỗi người được cộng **800 điểm vốn** để còn điểm mà cược; thứ hạng chưa đổi cho đến khi có người cược đúng hoặc sai. Hòa điểm thì người vào phòng trước xếp trên.

Có **27 câu**, khoảng 15–20 phút nếu giảng viên đọc ngắn phần giải thích.

## Chơi thử một mình

Trang chủ → **Chơi thử**. Một bên là máy chiếu, một bên là điện thoại. Trên màn hẹp, dùng hai tab «Máy chiếu» và «Điện thoại». Nút **Gợi ý đáp án đúng** chỉ có ở chế độ này. Hết ván có thể chơi lại, tạo phiên mới, hoặc về trang chủ.

## Sửa câu hỏi

Toàn bộ câu nằm trong [`src/data/questions.ts`](src/data/questions.ts). Lời giới thiệu từng chặng nằm trong [`src/data/stages.ts`](src/data/stages.ts). Tọa độ địa danh nằm trong [`src/geo/places.ts`](src/geo/places.ts).

Trong `CHALLENGES`, mỗi phần tử là một câu, xếp đúng thứ tự chơi. `stageId` phải là `flame`, `autumn`, `dbp`, `victory` hoặc `doimoi`.

- `timeline`: `items` theo thời gian sớm → muộn. `sort` là số để so (ví dụ `19450819` = 19/8/1945). Người chơi không thấy `sort` và `year`.
- `map`: `placeId` là một trong `pacBo`, `tanTrao`, `baDinh`, `hue`, `saiGon`, `dienBien`. Đổi tọa độ trong `places.ts` nếu cần. Sơ đồ là hình minh họa, không phải bản đồ hành chính. Quần đảo Hoàng Sa và Quần đảo Trường Sa được vẽ trong Biển Đông, cùng màu đất liền.
- `clues`: `aliases` là các cách gõ được tính đúng (có hoặc không dấu, lệch một hai chữ). `options` là bốn phương án. Đáp án đúng phải khớp một alias — nếu phương án có thêm năm trong ngoặc thì đưa cả cụm đó vào `aliases`.
- `match`: mỗi `pairs` là một cặp trái ↔ phải. Không cần đánh dấu đáp án riêng.
- `bet`: đúng một `correctId` trùng `id` của một phương án.

`timeLimit` tính bằng giây. `headline` là dòng đáp án in lớn. `explanation` là lời đọc sau mỗi câu, khoảng 20 giây.

Nội dung hiện tại bám các mốc đã được khẳng định trong giáo trình đại học và sách giáo khoa phổ thông: Hội nghị hợp nhất 3/2/1930, Cách mạng tháng Tám 1945, kháng chiến chống Pháp và Điện Biên Phủ, kháng chiến chống Mỹ và thống nhất 1975, Đại hội VI và Đổi mới 1986. Sửa câu chữ cho khớp slide của giảng viên nếu cần. Không vẽ chân dung người thật.

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

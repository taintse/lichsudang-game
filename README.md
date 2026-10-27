# Ngọn Lửa Sử Đảng

Trò chơi trên lớp cho học phần **Lịch sử Đảng Cộng sản Việt Nam**. Cả lớp chơi trên điện thoại và laptop của mình. Máy chiếu là máy chủ: hiện mã phòng, mã QR, bảng xếp hạng và lễ trao thưởng. Ba người dẫn đầu đứng trên bục.

Không cần tài khoản. Không có máy chủ trả phí. Tab máy chiếu giữ phòng bằng kết nối trực tiếp giữa các trình duyệt (PeerJS / WebRTC).

Địa chỉ sau khi triển khai: [https://taintse.github.io/lichsudang-game/](https://taintse.github.io/lichsudang-game/)

## Chạy một buổi trên lớp

1. Mở Chrome hoặc Edge trên máy nối máy chiếu. Vào trang chủ, bấm **Tạo phòng máy chiếu**.
2. Chiếu mã phòng, mã QR và đường dẫn. Sinh viên quét mã, hoặc mở **Vào phòng** rồi gõ mã, tên và một biểu tượng. Không cần đăng ký.
3. Tên không phù hợp: bấm dấu × cạnh tên, rồi **Mời ra**. Người đó không vào lại được bằng cùng tên trong phòng này.
4. Khi lớp đã vào, bấm **Bắt đầu**. Mỗi chặng có một kiểu chơi khác nhau. Sau mỗi câu, bấm **Hiện đáp án** để đọc lời giải, rồi **Bảng xếp hạng**.
5. Phím **N** (hoặc mũi tên phải) sang bước tiếp theo. Phím **cách** tạm dừng / tiếp tục khi đang chơi.
6. Hết năm câu của chặng Đổi mới, máy chiếu mở lễ trao thưởng: hạng ba, hạng nhì, hạng nhất, rồi cả bảng. Mỗi điện thoại hiện hạng của chính người đó.

**Tab máy chiếu phải mở suốt buổi.** Đóng tab, mất mạng hoặc tải lại quá lâu thì phòng mất kết nối. Nếu vừa tải lại tab máy chiếu, phòng cố lấy lại mã cũ trong khoảng ba giờ (cùng trình duyệt, cùng tab phiên). Sinh viên tải lại trang thì vào lại bằng tên cũ và giữ điểm, miễn là tab máy chiếu vẫn sống.

Nên dùng Wi-Fi ổn định. Mạng trường chặn kết nối trực tiếp giữa các máy (WebRTC / UDP) thì điện thoại không vào được phòng. Khi đó thử phát Wi-Fi từ laptop máy chiếu, hoặc một mạng không chặn UDP.

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

Trang chủ → **Chơi thử**. Một bên là máy chiếu, một bên là điện thoại. Trên màn hẹp, dùng hai tab «Máy chiếu» và «Điện thoại». Nút **Gợi ý đáp án đúng** chỉ có ở chế độ này, để xem đáp án khi soạn câu.

## Sửa câu hỏi

Toàn bộ câu nằm trong [`src/data/questions.ts`](src/data/questions.ts). Lời giới thiệu từng chặng nằm trong [`src/data/stages.ts`](src/data/stages.ts). Tọa độ địa danh nằm trong [`src/geo/places.ts`](src/geo/places.ts).

Trong `CHALLENGES`, mỗi phần tử là một câu, xếp đúng thứ tự chơi. `stageId` phải là `flame`, `autumn`, `dbp`, `victory` hoặc `doimoi`.

- `timeline`: `items` theo thời gian sớm → muộn. `sort` là số để so (ví dụ `19450819` = 19/8/1945). Người chơi không thấy `sort` và `year`.
- `map`: `placeId` là một trong `pacBo`, `tanTrao`, `baDinh`, `hue`, `saiGon`, `dienBien`. Đổi tọa độ trong `places.ts` nếu cần. Sơ đồ là hình minh họa, không phải bản đồ hành chính.
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

**Một lần, chủ repo cần bật Pages.** Vào **Settings → Pages → Build and deployment → Source** và chọn **GitHub Actions**. Workflow có thử bật nguồn này tự động; token của GitHub Actions thường không đủ quyền quản trị nên bước đó có thể bị bỏ qua. Sau khi chọn đúng nguồn, mỗi lần đẩy `main` sẽ tự cập nhật [https://taintse.github.io/lichsudang-game/](https://taintse.github.io/lichsudang-game/).

Ứng dụng dùng `HashRouter` (`/#/host`, `/#/play`, `/#/join/MÃ`, `/#/thu`) nên đường dẫn vẫn đúng trên GitHub Pages. `base` trong Vite là `/lichsudang-game/`.

## Giới hạn

- Tab máy chiếu là máy chủ. Tắt tab là hết phòng.
- Kết nối đi qua broker công khai `0.peerjs.com` và WebRTC. Không có máy chuyển tiếp (TURN) miễn phí, không cần tài khoản. Mạng chặn UDP thì người chơi không nối được.
- Khoảng 50–60 người là mức thực tế của một tab trình duyệt.
- Người quyết tâm có thể tải file JavaScript của trang máy chiếu để xem đáp án. Điểm vẫn do máy chiếu chấm theo thời điểm nhận câu trả lời, không tin số liệu máy người chơi tự khai.
- Sơ đồ Việt Nam là hình minh họa (đất liền và một số đảo gần bờ), không phải bản đồ hành chính, không vẽ Hoàng Sa và Trường Sa.
- Hòa điểm: người vào phòng trước xếp trên.
- Âm thanh tổng hợp trong trình duyệt (không nhạc có bản quyền). Nút tắt tiếng nằm trên cùng, nhớ trong máy.

Phông chữ Be Vietnam Pro và Source Serif 4 (kèm phần chữ Việt) phát hành theo giấy phép SIL Open Font License. Bản giấy phép nằm trong `public/licenses/`.

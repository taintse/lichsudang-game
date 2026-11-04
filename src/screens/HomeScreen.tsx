import { Link } from 'react-router-dom';
import { STAGES } from '../data/stages';
import { Grain, Star } from '../components/art';

export function HomeScreen() {
  return (
    <div className="screen theme-flame home">
      <Grain />
      <header className="mast">
        <Star className="mast-star" />
        <div>
          <p className="brand">Trò chơi trên lớp</p>
          <p className="brand-sub">Không cần tài khoản</p>
        </div>
      </header>
      <main className="home-main">
        <p className="eyebrow">Lịch sử Đảng Cộng sản Việt Nam</p>
        <h1>
          Ngọn Lửa
          <br />
          Sử Đảng
        </h1>
        <p className="lead">
          Phong trào dân chủ 1936–1939. Cả lớp chơi trên điện thoại và laptop. Máy chiếu giữ phòng, tính điểm và trao giải cho ba người dẫn đầu.
        </p>
        <ol className="year-row">
          {STAGES.map((stage) => (
            <li key={stage.id}>
              <b>{stage.year}</b>
              <span>{stage.title}</span>
            </li>
          ))}
        </ol>
        <div className="home-actions">
          <Link className="btn btn-red big" to="/host">
            Tạo phòng máy chiếu
          </Link>
          <Link className="btn big" to="/play">
            Vào phòng
          </Link>
          <Link className="btn ghost big" to="/thu">
            Chơi thử
          </Link>
        </div>
        <section className="rules">
          <h2>Luật tính điểm</h2>
          <ul>
            <li>Máy tự lưu mỗi thao tác. Hết giờ vẫn chấm bản đã lưu. Chưa làm gì thì 0 điểm.</li>
            <li>Bấm Chốt khi xong sớm để lấy điểm tốc độ. Không chốt thì vẫn được điểm nội dung, không có thưởng tốc độ.</li>
            <li>Chặng cuối đặt cược trước khi thấy câu. Chưa chọn thì mặc định 25% điểm đang có.</li>
            <li>Đúng liên tiếp thì có chuỗi combo, tối đa ×1,6.</li>
            <li>Chặng cuối được cược điểm: đúng thì được cộng phần đã cược, sai thì mất phần đó.</li>
            <li>Hòa điểm thì người có tổng thời gian trả lời ngắn hơn xếp trên.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

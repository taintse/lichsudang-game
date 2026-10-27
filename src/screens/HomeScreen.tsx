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
          Cả lớp chơi trên điện thoại và laptop. Máy chiếu giữ phòng, tính điểm và trao thưởng cho ba người dẫn đầu.
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
            <li>Đúng và nhanh được nhiều điểm hơn.</li>
            <li>Đúng liên tiếp thì có chuỗi combo, tối đa ×1,6.</li>
            <li>Chặng Đổi mới được cược điểm: đúng thì phần cược nhân đôi, sai thì mất phần cược.</li>
            <li>Hòa điểm thì người vào phòng trước xếp trên.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

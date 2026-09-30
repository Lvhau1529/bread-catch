/**
 * HƯỚNG DẪN cho giáo viên / phụ huynh (tiếng Việt).
 * Mở ở Home (nút HƯỚNG DẪN) hoặc từ nút "?" cạnh từng mục ở Setup — tự cuộn tới đúng phần.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { mascotUrl } from '@/app/assets';
import {
  COMBOS,
  GUIDE_SECTIONS,
  HARD_TRICKS,
  LEVEL_GUIDE,
  PACK_GUIDE,
  TIME_GUIDE,
  type GuideSectionId,
} from '@/app/guide/guideContent';
import { closeGuide, guideStore } from '@/app/guide/guideStore';
import { useStore } from '@/app/hooks/useStore';
import { SFX } from '@/game/config/assets';
import { GameBridge } from '@/game/bridge';
import { PACK_ORDER, PACKS } from '@/session/content';
import { LEVEL_ORDER, LEVELS, RULES } from '@/session/settings';
import { TEAM_MASCOTS } from '@/session/teams';

export default function GuideDialog() {
  const { open, section } = useStore(guideStore, (state) => state);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Mở tới đúng phần được yêu cầu
  useEffect(() => {
    if (!open) return;
    bodyRef.current?.querySelector(`#guide-${section}`)?.scrollIntoView({ block: 'start' });
  }, [open, section]);

  // Esc để đóng
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGuide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const jumpTo = (id: GuideSectionId) => {
    bodyRef.current?.querySelector(`#guide-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="guide-backdrop" onClick={closeGuide}>
      <div
        className="guide"
        role="dialog"
        aria-modal="true"
        aria-label="Hướng dẫn"
        lang="vi"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="guide__header">
          <h1>Hướng dẫn cho giáo viên & phụ huynh</h1>
          <button
            type="button"
            className="icon-btn icon-btn--close"
            aria-label="Đóng"
            onClick={() => {
              GameBridge.playSfx(SFX.UI_CLICK);
              closeGuide();
            }}
          >
            ✕
          </button>
        </header>

        <nav className="guide__nav" aria-label="Mục lục">
          {GUIDE_SECTIONS.map((item) => (
            <button key={item.id} type="button" onClick={() => jumpTo(item.id)}>
              {item.title}
            </button>
          ))}
        </nav>

        <div className="guide__body" ref={bodyRef}>
          <Section id="about" title="Trò chơi là gì?">
            <p>
              <b>Phonics Bread Catcher</b> là trò chơi luyện <b>phonics</b> (đánh vần – ghép âm tiếng Anh) cho
              trẻ khoảng 5 tuổi. Những chiếc bánh mì có in chữ cái rơi xuống, bé di chuyển chiếc rổ để{' '}
              <b>hứng đúng từng chữ theo thứ tự</b> và ghép thành từ.
            </p>
            <p>
              Bé được luyện: nhận diện chữ cái, nghe âm và ghép âm thành từ, đọc từ ngắn, phản xạ tay – mắt.
            </p>
            <p className="guide__note">
              Chữ trong trò chơi là tiếng Anh (đúng như khi học). Phần hướng dẫn này dành cho người lớn.
            </p>
          </Section>

          <Section id="howto" title="Cách chơi (hướng dẫn cho bé)">
            <ol className="guide__steps">
              <li>
                Nhìn ô từ phía trên (hoặc <b>nghe</b> máy đọc từ — bấm nút loa xanh để nghe lại).
              </li>
              <li>
                Di chuyển rổ: <b>điện thoại/máy tính bảng</b> — đặt ngón tay ở bất kỳ đâu rồi kéo sang
                trái/phải; <b>máy tính</b> — rê chuột hoặc phím ← →.
              </li>
              <li>
                Hứng <b>chữ đầu tiên</b> của từ trước, rồi đến chữ thứ hai… Ô đang cần hứng có viền vàng nhấp
                nháy.
              </li>
              <li>
                Hứng nhầm <b>một</b> chữ thì từ đó kết thúc và chuyển sang từ khác (không sao cả — từ đó sẽ
                quay lại để luyện sau).
              </li>
              <li>
                Ghép đúng cả từ được <b>+{RULES.correctWordScore} điểm</b>. Mỗi lượt tối đa{' '}
                {RULES.wordsPerTurn} từ hoặc tới khi hết giờ.
              </li>
            </ol>
            <p className="guide__note">
              Mẹo cho bé: đừng vội — chờ chữ cần hứng rơi tới gần rồi mới di chuyển rổ, tránh những chữ khác.
            </p>
          </Section>

          <Section id="modes" title="Chế độ chơi">
            <div className="guide__cards">
              <article className="guide-card">
                <h3>
                  <span className="guide-card__mascots">
                    {TEAM_MASCOTS.map((mascot) => (
                      <img key={mascot} src={mascotUrl(mascot)} alt="" width={28} height={32} />
                    ))}
                  </span>
                  CLASS MODE — Lớp học
                </h3>
                <p>
                  3 đội thi đua (để trống tên sẽ là LIONS / TIGERS / PANDAS). <b>Xúc xắc</b> chọn đội chơi
                  trước; thứ tự đã được xáo sẵn từ đầu nên mỗi đội chơi đúng 1 lượt, cùng cấp độ và thời gian
                  → công bằng.
                </p>
                <p>
                  Hết 3 lượt: bảng <b>FINAL RESULTS</b>, đội thắng được <b>mở hộp quà</b>. Điểm các buổi được
                  cộng dồn vào <b>CLASS LEADERBOARD</b>.
                </p>
              </article>
              <article className="guide-card">
                <h3>SOLO MODE — Một mình</h3>
                <p>
                  Một bé chơi (phụ huynh chơi cùng con ở nhà). Không có xúc xắc, cuối lượt xem điểm, độ chính
                  xác, danh sách từ đúng/sai và <b>điểm cao nhất</b> theo từng cấp độ.
                </p>
              </article>
            </div>
          </Section>

          <Section id="packs" title="Gói từ (PHONICS PACK) — chơi từ nào?">
            <p>Chọn nhóm từ sẽ xuất hiện. Từ càng dài càng khó, vì phải hứng đúng nhiều chữ liên tiếp.</p>
            <div className="guide__cards">
              {PACK_ORDER.map((id) => (
                <article key={id} className="guide-card">
                  <h3>{PACKS[id].label}</h3>
                  <p className="guide-card__lead">{PACK_GUIDE[id].short}</p>
                  <p>{PACK_GUIDE[id].detail}</p>
                  <p className="guide-card__use">
                    <b>Nên dùng:</b> {PACK_GUIDE[id].whenToUse}
                  </p>
                </article>
              ))}
            </div>
          </Section>

          <Section id="levels" title="Cấp độ (LEVEL) — nhanh/chậm và gợi ý bao nhiêu?">
            <p>
              Cấp độ quyết định <b>tốc độ chữ rơi</b> và <b>mức gợi ý</b> trong ô từ. Từ GENTLE đến FAST, gợi
              ý giảm dần: từ "nhìn chữ mà hứng" sang "nghe âm rồi tự ghép chữ".
            </p>
            <div className="guide__cards">
              {LEVEL_ORDER.map((id) => (
                <article key={id} className={`guide-card guide-card--${id}`}>
                  <h3>{LEVELS[id].label}</h3>
                  <p className="guide-card__lead">{LEVEL_GUIDE[id].short}</p>
                  <p>
                    <b>Ô từ:</b> {LEVEL_GUIDE[id].hint}
                  </p>
                  <p>
                    <b>Tốc độ:</b> {LEVEL_GUIDE[id].speed}
                  </p>
                  <p className="guide-card__use">
                    <b>Nên dùng:</b> {LEVEL_GUIDE[id].whenToUse}
                  </p>
                  {id === 'hard' && (
                    <ul className="guide__list">
                      {HARD_TRICKS.map((trick) => (
                        <li key={trick}>{trick}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
            <p className="guide__note">
              NORMAL và FAST cần <b>giọng đọc</b>. Nếu máy không đọc được (hoặc đã tắt VOICE ở màn chính),
              game tự hiện từ để bé vẫn chơi được.
            </p>
          </Section>

          <Section id="time" title="Thời gian mỗi lượt (TIME)">
            <ul className="guide__list">
              <li>{TIME_GUIDE.auto}</li>
              <li>{TIME_GUIDE.presets}</li>
              <li>{TIME_GUIDE.custom}</li>
              <li>{TIME_GUIDE.note}</li>
            </ul>
          </Section>

          <Section id="combos" title="Gợi ý kết hợp cho trẻ 5 tuổi">
            <div className="guide__table-wrap">
              <table className="guide__table">
                <thead>
                  <tr>
                    <th>Giai đoạn</th>
                    <th>Gói từ</th>
                    <th>Cấp độ</th>
                  </tr>
                </thead>
                <tbody>
                  {COMBOS.map((combo) => (
                    <tr key={combo.stage}>
                      <td>{combo.stage}</td>
                      <td>{combo.pack}</td>
                      <td>{combo.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="teacher" title="Dành cho giáo viên">
            <ul className="guide__list">
              <li>
                <b>Máy chiếu:</b> mở trên máy tính nối máy chiếu/TV — game tự chuyển bố cục ngang, chữ và nút
                phóng to cho cả lớp nhìn rõ.
              </li>
              <li>
                <b>Nút trên màn chơi:</b> ⏸ tạm dừng (màn hình tối lại, chữ bị ẩn để không ai "nhìn trước";
                chơi tiếp sẽ đếm ngược 3-2-1), ↩ rời game về màn cài đặt, ■ kết thúc game. Hai nút sau đều hỏi
                xác nhận.
              </li>
              <li>Kết thúc khi chưa đủ 3 đội thì không có bảng xếp hạng (để công bằng).</li>
              <li>
                <b>Xếp hạng:</b> điểm cao hơn thắng; bằng điểm thì đội hứng nhầm ít hơn thắng; vẫn bằng thì
                đội còn nhiều thời gian hơn; vẫn bằng thì đồng hạng (các đội đồng hạng nhất đều được mở quà).
              </li>
              <li>
                <b>CLASS LEADERBOARD:</b> cộng dồn điểm qua nhiều buổi (lưu trên máy). Đội vượt hạng có hiệu
                ứng "RANK UP!". Nút <b>RESET SCORES</b> ở màn kết quả và màn cài đặt để làm lại từ đầu (ví dụ
                sang học kỳ mới).
              </li>
              <li>
                Tên đội và các lựa chọn được <b>lưu tự động</b> cho lần sau. Phần thưởng trong hộp quà đang là
                nội dung mẫu — giáo viên có thể tự trao phần thưởng thật.
              </li>
              <li>
                Gợi ý tổ chức: mỗi đội cử 1 bạn điều khiển, cả đội cùng <b>đọc to</b> chữ cần hứng; đổi người
                điều khiển sau mỗi buổi.
              </li>
            </ul>
          </Section>

          <Section id="parents" title="Dành cho phụ huynh">
            <ul className="guide__list">
              <li>
                Chọn <b>PLAY SOLO MODE</b>, gói <b>EARLY BLENDING</b> hoặc <b>BLENDING WORDS</b>, cấp{' '}
                <b>GENTLE</b> hoặc <b>EASY</b>.
              </li>
              <li>
                Trước khi hứng, cùng con <b>đọc từng âm</b> rồi ghép lại, ví dụ: /m/ – /a/ – /p/ → "map". Bấm
                nút loa để nghe lại cách đọc.
              </li>
              <li>Khi con hứng nhầm, hãy động viên — từ đó sẽ quay lại để con luyện tiếp.</li>
              <li>
                Mỗi lần chơi ngắn 5–10 phút là đủ. Khi con làm tốt ở EASY, thử NORMAL để luyện nghe mà không
                nhìn chữ.
              </li>
              <li>Chơi trên điện thoại nên cầm dọc; có thể tắt nhạc (MUSIC) nếu con dễ bị phân tâm.</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: GuideSectionId; title: string; children: ReactNode }) {
  return (
    <section className="guide__section" id={`guide-${id}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

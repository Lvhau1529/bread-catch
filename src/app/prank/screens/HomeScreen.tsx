import { BRAND, CTA, FEATURES, FLOATING_SPRITES } from '@/app/prank/content';

interface HomeScreenProps {
  onStart: () => void;
}

/** Trang chủ "game làm bánh" — càng hấp dẫn càng tốt */
export default function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <section className="fb-screen">
      <header className="fb-hero">
        <img className="fb-hero__bg pixel" src={BRAND.heroImage} alt="" />
        <div className="fb-hero__shade" />
        {FLOATING_SPRITES.map((item) => (
          <img key={item.src} className={`fb-float ${item.className} pixel`} src={item.src} alt="" />
        ))}
        <div className="fb-logo">
          <span className="fb-logo__badge">MỚI</span>
          <h1 className="fb-logo__title">{BRAND.name}</h1>
          <p className="fb-logo__subtitle">{BRAND.subtitle}</p>
        </div>
      </header>

      <p className="fb-tagline">{BRAND.tagline}</p>

      {/* <ul className="fb-stats">
        {STATS.map((stat) => (
          <li key={stat.label} className="fb-stats__item">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul> */}

      <ul className="fb-features">
        {FEATURES.map((feature) => (
          <li key={feature.text} className="fb-features__item">
            <span className="fb-features__icon" aria-hidden>
              {feature.icon}
            </span>
            {feature.text}
          </li>
        ))}
      </ul>

      <button type="button" className="fb-cta" onClick={onStart}>
        {CTA.start}
      </button>
      <p className="fb-fineprint">{CTA.fineprint}</p>
      <p className="fb-credit">{BRAND.credit}</p>
    </section>
  );
}

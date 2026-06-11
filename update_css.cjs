const fs = require('fs');

const newCSS = `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: #fff; }
a { text-decoration: none; color: inherit; }

/* NAV */
.nav { display: flex; align-items: center; justify-content: space-between; padding: 14px 40px; background: #fff; border-bottom: 1px solid #F3F4F6; position: sticky; top: 0; z-index: 100; }
.logo { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.logo-icon { width: 34px; height: 34px; border-radius: 9px; background: #1e40af; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 17px; }
.logo-text { font-size: 16px; font-weight: 600; color: #111827; }
.nav-links { display: flex; gap: 24px; }
.nav-link { font-size: 14px; color: #6B7280; cursor: pointer; transition: color .2s; }
.nav-link:hover { color: #1e40af; }
.nav-btns { display: flex; gap: 10px; align-items: center; }
.btn-outline { padding: 8px 16px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 13px; background: #fff; cursor: pointer; color: #374151; font-weight: 500; transition: background .2s; }
.btn-outline:hover { background: #F9FAFB; }
.btn-primary { padding: 8px 18px; border-radius: 8px; font-size: 13px; background: #1e40af; color: #fff; border: none; cursor: pointer; font-weight: 600; transition: background .2s; }
.btn-primary:hover { background: #1d3a9e; }

/* HERO */
.hero { max-width: 1100px; margin: 0 auto; padding: 64px 40px 56px; display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: center; }
.new-badge { display: inline-flex; align-items: center; gap: 7px; background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 20px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: #3730A3; margin-bottom: 18px; cursor: pointer; }
.new-dot { width: 6px; height: 6px; border-radius: 50%; background: #4F46E5; }
.hero-h1 { font-size: 36px; font-weight: 700; line-height: 1.3; color: #111827; margin-bottom: 16px; }
.hero-h1 span { color: #1e40af; }
.hero-sub { font-size: 15px; color: #6B7280; line-height: 1.75; margin-bottom: 28px; }
.hero-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 22px; }
.btn-hero { padding: 13px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; }
.btn-hero-primary { background: #1e40af; color: #fff; border: none; box-shadow: 0 4px 14px rgba(30,64,175,0.3); }
.btn-hero-secondary { background: #F9FAFB; color: #374151; border: 1px solid #E5E7EB; }
.trust-row { display: flex; gap: 18px; flex-wrap: wrap; }
.trust-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6B7280; }
.trust-item i { font-size: 13px; color: #16a34a; }

/* DASHBOARD PREVIEW */
.dash-preview { background: #F9FAFB; border-radius: 14px; border: 1px solid #E5E7EB; padding: 18px; box-shadow: 0 8px 32px rgba(0,0,0,0.07); }
.dash-bar { display: flex; align-items: center; gap: 6px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #E5E7EB; }
.dash-dot { width: 8px; height: 8px; border-radius: 50%; }
.dash-url { font-size: 11px; color: #9CA3AF; background: #fff; border: 1px solid #E5E7EB; border-radius: 5px; padding: 3px 10px; flex: 1; text-align: center; }
.dash-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.metric-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; }
.metric-label { font-size: 11px; color: #6B7280; margin-bottom: 4px; }
.metric-val { font-size: 22px; font-weight: 700; color: #111827; }
.metric-sub { font-size: 11px; color: #16a34a; margin-top: 3px; display: flex; align-items: center; gap: 3px; }
.inv-section-label { font-size: 11px; font-weight: 600; color: #6B7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.invoice-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
.invoice-row:last-child { border-bottom: none; }
.inv-avatar { width: 28px; height: 28px; border-radius: 50%; background: #EEF2FF; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #3730A3; flex-shrink: 0; }
.inv-name { font-size: 13px; color: #111827; flex: 1; font-weight: 500; }
.inv-amt { font-size: 13px; font-weight: 600; color: #111827; }
.inv-badge { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 600; margin-left: 6px; }
.inv-paid { background: #DCFCE7; color: #166534; }
.inv-due { background: #FEF9C3; color: #854D0E; }

/* DIVIDER */
.divider { height: 1px; background: #F3F4F6; margin: 0 40px; }

/* SECTIONS */
.section { max-width: 1100px; margin: 0 auto; padding: 52px 40px; }
.section-eyebrow { font-size: 12px; font-weight: 700; color: #1e40af; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px; }
.section-title { font-size: 26px; font-weight: 700; color: #111827; margin-bottom: 10px; line-height: 1.3; }
.section-sub { font-size: 15px; color: #6B7280; line-height: 1.7; margin-bottom: 32px; max-width: 600px; }

/* FEATURES */
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feat-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; transition: box-shadow .2s; }
.feat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.feat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; font-size: 20px; }
.feat-icon-blue { background: #EEF2FF; color: #3730A3; }
.feat-icon-green { background: #F0FDF4; color: #16a34a; }
.feat-icon-amber { background: #FFFBEB; color: #92400E; }
.feat-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 6px; }
.feat-desc { font-size: 13px; color: #6B7280; line-height: 1.65; }

/* STEPS */
.steps-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; position: relative; }
.step-card { text-align: center; padding: 24px 20px; position: relative; }
.step-card:not(:last-child)::after { content: ''; position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 1px; height: 60%; background: #E5E7EB; }
.step-num { width: 40px; height: 40px; border-radius: 50%; background: #EEF2FF; color: #1e40af; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; margin: 0 auto 14px; }
.step-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 6px; }
.step-desc { font-size: 13px; color: #6B7280; line-height: 1.65; }

/* PRICING */
.pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.price-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; padding: 24px; }
.price-card-featured { border: 2px solid #1e40af; position: relative; }
.price-badge { font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; background: #EEF2FF; color: #1e40af; display: inline-block; margin-bottom: 12px; }
.price-plan { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 6px; }
.price-amt { font-size: 30px; font-weight: 800; color: #111827; line-height: 1; }
.price-period { font-size: 13px; font-weight: 400; color: #6B7280; }
.price-divider { height: 1px; background: #E5E7EB; margin: 16px 0; }
.price-item { display: flex; align-items: flex-start; gap: 7px; font-size: 13px; color: #374151; margin-bottom: 8px; line-height: 1.5; }
.price-item i { font-size: 14px; color: #16a34a; margin-top: 1px; flex-shrink: 0; }
.price-btn { width: 100%; margin-top: 16px; padding: 11px; border-radius: 9px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: background .2s; }
.price-btn-main { background: #1e40af; color: #fff; }
.price-btn-main:hover { background: #1d3a9e; }
.price-btn-outline { background: #F9FAFB; color: #374151; border: 1px solid #E5E7EB; }
.price-btn-outline:hover { background: #F3F4F6; }

/* REVIEWS */
.reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.review-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; }
.stars { color: #F59E0B; font-size: 14px; margin-bottom: 10px; letter-spacing: 2px; }
.review-text { font-size: 13px; color: #374151; line-height: 1.7; margin-bottom: 14px; }
.reviewer { display: flex; align-items: center; gap: 10px; }
.rev-avatar { width: 32px; height: 32px; border-radius: 50%; background: #EEF2FF; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #3730A3; flex-shrink: 0; }
.rev-name { font-size: 13px; font-weight: 600; color: #111827; }
.rev-biz { font-size: 11px; color: #9CA3AF; }

/* SHOP TYPES */
.shops-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.shop-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 14px 8px; text-align: center; }
.shop-icon { font-size: 22px; margin-bottom: 6px; }
.shop-label { font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 2px; }
.shop-sub { font-size: 10px; color: #9CA3AF; }

/* CTA */
.cta-section { background: #1e40af; padding: 60px 40px; text-align: center; }
.cta-title { font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 12px; }
.cta-sub { font-size: 15px; color: rgba(255,255,255,0.8); margin-bottom: 28px; }
.cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-white { padding: 13px 24px; background: #fff; color: #1e40af; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 7px; }
.btn-ghost { padding: 13px 24px; background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.3); border-radius: 10px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 7px; }

/* FOOTER */
.footer-top { max-width: 1100px; margin: 0 auto; padding: 44px 40px 28px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 32px; }
.footer-brand-desc { font-size: 13px; color: #6B7280; line-height: 1.7; margin-top: 10px; }
.footer-col-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 12px; }
.footer-link { display: block; font-size: 13px; color: #6B7280; margin-bottom: 9px; cursor: pointer; transition: color .2s; }
.footer-link:hover { color: #1e40af; }
.footer-bottom { border-top: 1px solid #F3F4F6; padding: 16px 40px; max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.footer-copy { font-size: 12px; color: #9CA3AF; }
.footer-socials { display: flex; gap: 8px; }
.social-btn { width: 30px; height: 30px; border-radius: 8px; background: #F9FAFB; border: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6B7280; font-size: 15px; transition: background .2s; }
.social-btn:hover { background: #EEF2FF; color: #1e40af; }

@media(max-width:768px){
  .hero,.footer-top{grid-template-columns:1fr}
  .features-grid,.pricing-grid,.reviews-grid{grid-template-columns:1fr 1fr}
  .steps-row,.shops-grid{grid-template-columns:1fr 1fr}
  .nav-links{display:none}
  .hero{padding:36px 20px}
  .section{padding:36px 20px}
  .divider{margin:0 20px}
}
`;

const fileStr = fs.readFileSync('app/landing.css', 'utf-8');
const modalIdx = fileStr.indexOf('/* MODAL */');
const modalCSS = modalIdx !== -1 ? fileStr.substring(modalIdx) : '';

fs.writeFileSync('app/landing.css', newCSS + '\n' + modalCSS);
console.log("Updated landing.css");

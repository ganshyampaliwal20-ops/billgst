const fs = require('fs');

let css = fs.readFileSync('app/landing.css', 'utf-8');

const mobileCSSOverrides = `
/* MOBILE OVERRIDES FOR SMALLER BOXES AND SOCIAL ICONS */
@media(max-width: 768px) {
  /* Smaller 3 Easy Steps boxes */
  .step-card {
    padding: 16px 12px !important;
    border-radius: 12px !important;
    min-height: auto !important;
  }
  .s-num {
    width: 24px !important;
    height: 24px !important;
    font-size: 0.8rem !important;
    top: -8px !important;
    left: 16px !important;
  }
  .step-card h4 {
    font-size: 1rem !important;
    margin-bottom: 6px !important;
  }
  .step-card p {
    font-size: 0.8rem !important;
    line-height: 1.4 !important;
    margin-bottom: 0 !important;
  }
  .step-grid {
    gap: 16px !important;
  }

  /* Social buttons ultra small in one row */
  .landing-follow-grid {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    gap: 8px !important;
    padding-bottom: 10px !important;
    justify-content: flex-start !important;
    -webkit-overflow-scrolling: touch;
  }
  .lf-card {
    flex: 0 0 auto !important;
    width: auto !important;
    min-width: unset !important;
    padding: 8px 12px !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 8px !important;
    border-radius: 8px !important;
  }
  .lfc-icon {
    margin-bottom: 0 !important;
  }
  .lfc-icon svg {
    width: 16px !important;
    height: 16px !important;
  }
  .lfc-label {
    font-size: 0.8rem !important;
    margin-bottom: 0 !important;
  }
  .lfc-sub, .lfc-arrow {
    display: none !important; /* Hide subtitle and arrow to save space */
  }
}
`;

if (!css.includes('MOBILE OVERRIDES FOR SMALLER BOXES')) {
    css += '\n' + mobileCSSOverrides;
    fs.writeFileSync('app/landing.css', css);
    console.log('Added CSS overrides');
} else {
    console.log('CSS already added');
}

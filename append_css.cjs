const fs = require('fs');

const css = `
/* KHATABOOK ENTRY OVERLAY */
.kb-entry-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}
.kb-entry-header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f1f5f9;
}
.kb-back-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  cursor: pointer;
}
.kb-title {
  font-size: 18px;
  font-weight: 700;
  margin-left: 8px;
}
.kb-title.red { color: #dc2626; }
.kb-title.green { color: #16a34a; }
.kb-title.blue { color: #2563eb; }

.kb-entry-body {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.kb-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  position: relative;
}
.kb-card.kb-no-pad {
  padding: 0;
}

.kb-currency {
  font-size: 28px;
  font-weight: 700;
  margin-right: 12px;
}
.kb-currency.red { color: #dc2626; }
.kb-currency.green { color: #16a34a; }

.kb-amt-input {
  border: none;
  outline: none;
  font-size: 28px;
  font-weight: 700;
  width: 100%;
  background: transparent;
}
.kb-amt-input.red { color: #dc2626; }
.kb-amt-input.green { color: #16a34a; }

.kb-note-input {
  border: none;
  outline: none;
  font-size: 15px;
  width: 100%;
  padding: 16px;
  background: transparent;
  color: #374151;
}

.kb-row-split {
  display: flex;
  gap: 12px;
}
.kb-date-card, .kb-attach-card {
  flex: 1;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  box-shadow: none;
}
.kb-date-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #374151;
  width: 100%;
}

.kb-attach-card {
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}
.kb-new-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #2563eb;
  color: white;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
}

.kb-photos-preview {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}
.kb-photo-item {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}
.kb-photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.kb-photo-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #dc2626;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
}

.kb-entry-footer {
  padding: 16px;
  background: #f1f5f9;
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
.kb-save-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}
.kb-save-btn.red {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}
.kb-save-btn.green {
  background: #16a34a;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
}
.kb-save-btn.blue {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

@media (min-width: 768px) {
  .kb-entry-overlay {
    position: absolute;
    border-left: 1px solid var(--border);
  }
}
`;

fs.appendFileSync('F:/bill/app/dashboard/expenses/hisaab.css', css);

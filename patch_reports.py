import re

with open('app/dashboard/reports/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# find return (
idx = content.find("\n    return (")
if idx == -1:
    print("Could not find return")
    exit(1)

head = content[:idx]

new_jsx = """    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
  :root{
    --ink:#0B1330;
    --ink-soft:#454E6B;
    --muted:#7A8199;
    --bg:#F1F3F9;
    --card:#FFFFFF;
    --border:#E5E8F2;
    --gold:#B9862F;
    --gold-soft:#F4E9D8;
    --teal:#0E7C61;
    --teal-soft:#E3F3EE;
    --red:#C0392B;
    --red-soft:#FBEAE8;
    --navy-deep:#0B1330;
  }
  .report-wrapper *{box-sizing:border-box;}
  .report-wrapper{background:var(--bg); font-family:'Inter',sans-serif; color:var(--ink); display:flex; justify-content:center; padding:32px 16px; min-height:100vh;}
  .app{
    width:100%;
    max-width:412px;
    background:var(--bg);
    border-radius:28px;
    overflow:hidden;
    box-shadow:0 30px 60px -20px rgba(11,19,48,0.25);
    border:1px solid #d9dcea;
  }

  /* Header */
  .header{
    background:var(--navy-deep);
    padding:22px 20px 26px;
    color:#fff;
  }
  .header-top{
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:20px;
  }
  .brand{ display:flex; align-items:center; gap:10px; }
  .brand-mark{
    width:34px; height:34px; border-radius:9px;
    background:linear-gradient(160deg,var(--gold) 0%, #8f6420 100%);
    display:flex; align-items:center; justify-content:center;
    font-family:'Fraunces',serif; font-weight:600; font-size:16px; color:#fff;
  }
  .brand-name{ font-family:'Fraunces',serif; font-weight:500; font-size:19px; letter-spacing:0.2px;}
  .brand-name span{ color:var(--gold); }
  .header-icons{ display:flex; gap:14px; align-items:center; }
  .icon-btn{
    width:34px; height:34px; border-radius:9px;
    background:rgba(255,255,255,0.08);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer;
  }
  .icon-btn svg{ width:17px; height:17px; stroke:#EDEFF6; }

  .hero-title{ font-family:'Fraunces',serif; font-size:30px; font-weight:500; line-height:1.1;}
  .hero-sub{ color:#B7BCD6; font-size:13.5px; margin-top:5px; }

  .period-row{
    display:flex; gap:8px; margin-top:20px; overflow-x: auto; padding-bottom: 4px;
  }
  .period-row::-webkit-scrollbar { display: none; }
  .pill{
    flex:1;
    text-align:center;
    padding:10px 12px;
    border-radius:10px;
    font-size:13px;
    font-weight:600;
    display:flex; align-items:center; justify-content:center; gap:6px;
    cursor:pointer;
    border:1px solid rgba(255,255,255,0.14);
    color:#EDEFF6;
    background:rgba(255,255,255,0.06);
    white-space: nowrap;
  }
  .pill.active{
    background:var(--gold);
    color:#241800;
    border-color:var(--gold);
  }
  .pill svg{ width:14px; height:14px; }

  /* Content */
  .content{ padding:18px 18px 28px; }

  .advisory{
    background:var(--gold-soft);
    border:1px solid #e6d3ac;
    border-left:4px solid var(--gold);
    border-radius:10px;
    padding:13px 14px;
    display:flex;
    align-items:flex-start;
    gap:10px;
    margin-bottom:20px;
  }
  .advisory svg{ width:17px; height:17px; stroke:#8f6420; flex-shrink:0; margin-top:1px;}
  .advisory-text{ font-size:12.8px; line-height:1.4; color:#5c4415; flex:1; }
  .advisory-text b{ display:block; font-size:13.2px; color:#402f0d; margin-bottom:1px; text-transform: uppercase; }
  .advisory-link{
    font-size:12.5px; font-weight:700; color:var(--navy-deep);
    text-decoration:underline; text-underline-offset:2px; white-space:nowrap; align-self:center; cursor: pointer;
  }

  .section-label{
    font-size:12.5px; font-weight:600; color:var(--muted);
    margin:0 2px 10px; text-transform:none;
  }

  .kpi-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
    margin-bottom:22px;
  }
  .kpi{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:14px;
    padding:14px;
    cursor: pointer;
  }
  .kpi-top{
    display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;
  }
  .kpi-icon{
    width:30px; height:30px; border-radius:8px;
    background:#EEF0F8;
    display:flex; align-items:center; justify-content:center;
  }
  .kpi-icon svg{ width:15px; height:15px; stroke:var(--navy-deep); }
  .kpi.warn .kpi-icon{ background:var(--red-soft); }
  .kpi.warn .kpi-icon svg{ stroke:var(--red); }
  .delta{
    font-size:11.5px; font-weight:700; display:flex; align-items:center; gap:2px;
  }
  .delta.up{ color:var(--teal); }
  .delta.down{ color:var(--red); }
  .kpi-value{
    font-family:'Inter',sans-serif; font-variant-numeric:tabular-nums;
    font-size:19px; font-weight:700; color:var(--ink); line-height:1.15;
  }
  .kpi-label{
    font-size:11.8px; color:var(--muted); margin-top:3px; font-weight:500;
  }

  .chart-card{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:14px;
    padding:18px 16px 8px;
  }
  .chart-head{
    display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;
  }
  .chart-head h3{ font-size:15.5px; font-weight:700; color:var(--ink); }
  .chart-head p{ font-size:12px; color:var(--muted); margin-top:2px; }
  .legend{ display:flex; align-items:center; gap:6px; font-size:12px; color:var(--ink-soft); font-weight:600; }
  .legend-dot{ width:8px; height:8px; border-radius:50%; background:var(--gold); }

  .chart-wrap{ margin-top:6px; position:relative; height:120px; width:100%; }
  .week-labels{
    display:flex; justify-content:space-between; padding:6px 4px 4px;
    font-size:11px; color:var(--muted); font-weight:500;
  }

  .export-row{
    display:flex; gap:10px; margin-top:18px;
  }
  .export-btn{
    flex:1;
    display:flex; align-items:center; justify-content:center; gap:7px;
    padding:12px 10px;
    border-radius:11px;
    font-size:13px; font-weight:700;
    border:1px solid var(--border);
    background:var(--card);
    color:var(--ink);
    cursor:pointer;
  }
  .export-btn:active{ transform:scale(0.98); }
  .export-btn svg{ width:15px; height:15px; }
` }} />

            <div className="report-wrapper">
                <div className="app">
                    <div className="header">
                        <div className="header-top">
                            <div className="brand">
                                <div className="brand-mark">{businessProfile?.business_name?.[0]?.toUpperCase() || 'B'}</div>
                                <div className="brand-name">{businessProfile?.business_name || 'BillGST'}</div>
                            </div>
                            <div className="header-icons">
                                <div className="icon-btn" onClick={() => router.push('/dashboard/settings')}>
                                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="hero-title">{t.reports || 'Reports'}</div>
                        <div className="hero-sub">{t.businessOverview || 'Business overview'} &middot; {period}</div>

                        <div className="period-row">
                            <div className={`pill ${period === 'This Month' ? 'active' : ''}`} onClick={() => setPeriod('This Month')}>{t.periodThisMonth || 'This Month'}</div>
                            <div className={`pill ${period === 'Last Month' ? 'active' : ''}`} onClick={() => setPeriod('Last Month')}>{t.periodLastMonth || 'Last Month'}</div>
                            <div className={`pill ${period === 'This Year' ? 'active' : ''}`} onClick={() => setPeriod('This Year')}>{t.periodThisYear || 'This Year'}</div>
                        </div>
                    </div>

                    <div className="content">
                        <div className="advisory">
                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            <div className="advisory-text">
                                <b>{t.advisory || 'ADVISORY'}</b>
                                {t.hsnComplianceHint || 'Ensure HSN codes for GST compliance'}
                            </div>
                            <div className="advisory-link" onClick={() => toast(t.itcMaximizeToast || 'Claim ITC efficiently')}>{t.maximizeItc || 'Maximize ITC'}</div>
                        </div>

                        <div className="section-label">{t.keyMetrics || 'Key metrics'}</div>
                        <div className="kpi-grid">
                            <div className="kpi" onClick={() => router.push('/dashboard/invoices')}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    </div>
                                    <div className="delta up">↑</div>
                                </div>
                                <div className="kpi-value">{formatLakhs(totalSales)}</div>
                                <div className="kpi-label">{t.totalRevenue || 'Total revenue'}</div>
                            </div>

                            <div className="kpi" onClick={handleDownloadExcel}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7"/></svg>
                                    </div>
                                    <div className="delta up">↑</div>
                                </div>
                                <div className="kpi-value">{formatLakhs(totalProfit)}</div>
                                <div className="kpi-label">{t.netProfit || 'Net profit'}</div>
                            </div>

                            <div className="kpi" onClick={() => router.push('/dashboard/invoices')}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
                                    </div>
                                    <div className="delta down">↓</div>
                                </div>
                                <div className="kpi-value">{invoiceCount}</div>
                                <div className="kpi-label">{t.totalInvoices || 'Total invoices'}</div>
                            </div>

                            <div className="kpi" onClick={() => toast(`Average Order Value: ${formatLakhs(avgOrderValue)}`)}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                                    </div>
                                    <div className="delta up">↑</div>
                                </div>
                                <div className="kpi-value">{formatLakhs(avgOrderValue)}</div>
                                <div className="kpi-label">{t.avgOrderValue || 'Avg order value'}</div>
                            </div>

                            <div className="kpi warn" onClick={() => router.push('/dashboard/invoices?status=PENDING')}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                    </div>
                                    <div className="delta down">↓</div>
                                </div>
                                <div className="kpi-value">{formatLakhs(paymentPending)}</div>
                                <div className="kpi-label">{t.paymentPending || 'Payment pending'}</div>
                            </div>

                            <div className="kpi" onClick={() => router.push('/dashboard/customers')}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <div className="delta up">↑</div>
                                </div>
                                <div className="kpi-value">{customers?.length || 0}</div>
                                <div className="kpi-label">{t.activeCustomers || 'Active customers'}</div>
                            </div>

                        </div>

                        <div className="section-label">{t.revenueTrend || 'Revenue trend'}</div>
                        <div className="chart-card">
                            <div className="chart-head">
                                <div>
                                    <h3>{t.revenueTrend || 'Revenue breakdown'}</h3>
                                </div>
                                <div className="legend"><span className="legend-dot"></span>{t.totalRevenue || 'Revenue'}</div>
                            </div>
                            <div className="chart-wrap">
                                <canvas ref={monthlyChartRef}></canvas>
                            </div>
                        </div>

                        <div className="export-row">
                            <div className="export-btn" onClick={handleTallyXML}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#0E7C61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                {t.exportTally || 'Export Tally XML'}
                            </div>
                            <div className="export-btn" onClick={handleDownloadExcel}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#0E7C61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                {t.exportExcel || 'Export Excel'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReportsContent />
        </Suspense>
    );
}
"""

with open('app/dashboard/reports/page.tsx', 'w', encoding='utf-8') as f:
    f.write(head + new_jsx)

print("Updated Reports Page JSX")

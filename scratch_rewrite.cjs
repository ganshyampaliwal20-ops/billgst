const fs = require('fs');
const file = 'f:/bill/app/dashboard/expenses/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const stateLogic = `
    const numPress = (val: string) => {
        if (val === '.' && amtInp.includes('.')) return;
        if (amtInp === '0' && val !== '.') setAmtInp(val);
        else setAmtInp(amtInp + val);
    };
    const numBackspace = () => {
        if (amtInp.length <= 1) setAmtInp('0');
        else setAmtInp(amtInp.slice(0, -1));
    };
    const openNumpad = (type: string) => {
        setEntryType(type as any);
        setAmtInp('0');
        setEntryNote('');
        setEntryDate(new Date().toISOString().split('T')[0]);
        setPendingPhotos([]);
        setIsAddEntryOpen(true);
    };
    const closeNumpad = () => {
        setIsAddEntryOpen(false);
    };
`;

// First, restore the original content if we already messed it up.
// Actually, to be safe, let's pull from git if possible, or just replace the broken chunk.
// Wait, since we wrote the bad chunk, we can just replace from {/* ════════ SCREEN 2: DETAIL ════════ */} to {/* Add Customer Sheet */} again.
// But the bad chunk is already in there. Let's just overwrite the bad chunk with the fixed chunk.

const detailStart = content.indexOf('{/* ════════ SCREEN 2: DETAIL ════════ */}');
const detailEnd = content.indexOf('{/* Add Customer Sheet */}');

const newDetail = `{/* ════════ SCREEN 2: DETAIL ════════ */}
            {currentCust ? (
                <div className={\`screen \${activeScreen === 'detail' ? 'active' : ''}\`} id="screen-detail">
                    <div className="topbar">
                        <button className="back-btn" onClick={handleBack}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                        </button>
                        <div className="topbar-center">
                            <div className="topbar-name">{currentCust.name}</div>
                            <div className={\`topbar-due \${custStats.isNeg ? '' : 'positive'}\`}>
                                ₹{new Intl.NumberFormat('en-IN').format(Math.abs(custStats.net))} {custStats.isNeg ? 'Due' : 'Advance'}
                            </div>
                        </div>
                        <div className="topbar-actions">
                            <button className="icon-btn" onClick={() => openEditCust(currentCust)} title="Edit Customer">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button className="icon-btn" onClick={deleteCustomer} title="Delete Customer">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                            </button>
                        </div>
                    </div>

                    <div className="balance-banner">
                        <div className="balance-label">Total Balance Due</div>
                        <div className={\`balance-amount \${custStats.isNeg ? '' : 'positive'}\`}>
                            ₹{new Intl.NumberFormat('en-IN').format(Math.abs(custStats.net))}
                        </div>
                        <div className={\`balance-status \${custStats.isNeg ? '' : 'positive'}\`}>
                            <span className="balance-status-dot"></span>
                            {custStats.isNeg ? 'You Will Get' : 'You Will Give'}
                        </div>
                        <div className="balance-stats">
                            <div className="bal-stat">
                                <div className="bal-stat-label">Total Given</div>
                                <div className="bal-stat-val red">₹{new Intl.NumberFormat('en-IN').format(Math.abs(custStats.debit))}</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="bal-stat">
                                <div className="bal-stat-label">Total Received</div>
                                <div className="bal-stat-val green">₹{new Intl.NumberFormat('en-IN').format(Math.abs(custStats.credit))}</div>
                            </div>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <button className="qa-btn remind" onClick={() => sendWhatsAppRemind(currentCust, custStats.net)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                            Remind
                        </button>
                        <button className="qa-btn statement" onClick={exportPDF}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                            Statement
                        </button>
                        <button className="qa-btn whatsapp" onClick={() => sendWhatsAppStatement(currentCust, custStats.net)}>
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.116 1.523 5.845L.057 23.057l5.33-1.397A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
                            WhatsApp
                        </button>
                        <button className="qa-btn call" onClick={() => window.open(\`tel:\${currentCust.phone}\`, '_self')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v3z"/></svg>
                            Call
                        </button>
                    </div>

                    <div className="filter-bar">
                        {[{ id: 'all', l: 'All' }, { id: 'debit', l: 'Given' }, { id: 'credit', l: 'Received' }, { id: 'advance', l: 'Advance' }].map(f => (
                            <button key={f.id} className={\`filter-chip \${currentFilter === f.id ? 'active' : ''}\`} onClick={() => setCurrentFilter(f.id)}>{f.l}</button>
                        ))}
                        <button className="sort-btn filter-right" onClick={() => setTxnSortAsc(!txnSortAsc)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M9 18h6"/></svg>
                            Sort
                        </button>
                    </div>

                    <div className="txn-list">
                        {(() => {
                            let txns = currentCust.txns;
                            if (currentFilter !== 'all') txns = txns.filter((t: any) => t.type === currentFilter);
                            if (!txns.length) return <div className="empty-state"><div className="empty-ico">📋</div><div className="empty-title">Koi entry nahi</div><div className="empty-sub">Neeche se credit ya debit add karo</div></div>;

                            const groups: any = {};
                            txns.forEach((t: any) => {
                                const dStr = t.date.split('T')[0] || t.date;
                                if (!groups[dStr]) groups[dStr] = [];
                                groups[dStr].push(t);
                            });

                            return Object.keys(groups).sort((a, b) => txnSortAsc ? a.localeCompare(b) : b.localeCompare(a)).map(date => {
                                const dayTxns = groups[date];
                                const dayTotal = dayTxns.reduce((s: number, t: any) => s + (t.type === 'credit' ? t.amt : -t.amt), 0);
                                return (
                                    <React.Fragment key={date}>
                                        <div className="date-group-label">
                                            <span>{formatDateShort(date)}</span>
                                        </div>
                                        {dayTxns.map((t: any, i: number) => {
                                            const isCr = t.type === 'credit';
                                            const isAdv = t.type === 'advance';
                                            const typeClass = isCr ? 'received' : isAdv ? 'advance' : 'given';
                                            const hasPhotos = t.photos && t.photos.length > 0;

                                            return (
                                                <div className="txn-card" key={t.id} data-type={typeClass} style={{ animationDelay: \`\${i * 0.04}s\` }}>
                                                    <div className="txn-card-inner">
                                                        <div className={\`txn-type-icon \${typeClass}\`}>
                                                            {isCr ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> : 
                                                             isAdv ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> : 
                                                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
                                                        </div>
                                                        <div className="txn-body">
                                                            <div className="txn-top-row">
                                                                <div>
                                                                    <div className={\`txn-amount \${typeClass}\`}>₹{new Intl.NumberFormat('en-IN').format(t.amt)}</div>
                                                                    <div className="txn-time">
                                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                                                        {formatTime(t.date)} &nbsp;·&nbsp; {isCr ? 'Received' : isAdv ? 'Advance' : 'Given'}
                                                                    </div>
                                                                </div>
                                                                {hasPhotos ? (
                                                                    <img className="bill-thumb" src={t.photos[0]} onClick={() => setLightboxImg(t.photos[0])} alt="Bill" />
                                                                ) : (
                                                                    <label htmlFor={\`file-cam-\${t.id}\`} className="bill-thumb-placeholder" title="Add Bill Photo">
                                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                                                        <input type="file" style={{ display: 'none' }} id={\`file-cam-\${t.id}\`} accept="image/*" capture="environment" onChange={(e) => handleTxnPhoto(e, t.id)} />
                                                                    </label>
                                                                )}
                                                            </div>
                                                            <div className="txn-note">{t.note || t.name}</div>
                                                        </div>
                                                    </div>
                                                    <div className="txn-footer">
                                                        <div>
                                                            <div className="txn-balance-label">Actions</div>
                                                            <div className="txn-balance-val" style={{ color: 'var(--ink3)' }}>
                                                                <button onClick={() => openEditEntry(t)} style={{ background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', marginRight: '10px' }}>✏️ Edit</button>
                                                                <button onClick={() => deleteTxn(t.id, t.amt, t.type)} style={{ background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', color: 'var(--red)' }}>🗑 Delete</button>
                                                            </div>
                                                        </div>
                                                        <div className={\`txn-attachment \${hasPhotos ? 'has-bill' : ''}\`} onClick={() => setLightboxImg(hasPhotos ? t.photos[0] : null)}>
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                                                            {hasPhotos ? 'Bill Added ✓' : 'Add Bill'}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            });
                        })()}
                    </div>
                    
                    <div className="export-actions">
                        <button className="qa-btn pdf" onClick={exportPDF}>📄 PDF Download</button>
                        <button className="qa-btn excel" onClick={downloadCustomerExcel}>📊 Excel Download</button>
                    </div>

                    <div className="spacer"></div>

                    {/* ADD ENTRY PANEL */}
                    <div className="add-panel" id="addPanel">
                        <div className={\`amount-area \${isAddEntryOpen ? 'show' : ''}\`} id="amountArea">
                            <div className={\`amount-type-label \${entryType === 'debit' ? 'given' : entryType === 'credit' ? 'received' : 'advance'}\`}>
                                {entryType === 'debit' ? '↑ Given' : entryType === 'credit' ? '↓ Received' : '⚡ Advance'}
                            </div>
                            <div className="amount-display"><span className="curr">₹</span><span>{new Intl.NumberFormat('en-IN').format(parseFloat(amtInp || '0')) + (amtInp.endsWith('.') ? '.' : '')}</span></div>
                            <div className={\`amount-underline \${entryType === 'debit' ? 'given' : entryType === 'credit' ? 'received' : 'advance'}\`}></div>
                        </div>

                        <div className={\`extra-fields \${isAddEntryOpen ? 'show' : ''}\`}>
                            <div className="extra-field-row">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                <input type="text" placeholder="Add note (optional)" value={entryNote} onChange={e => setEntryNote(e.target.value)} />
                            </div>
                            <label htmlFor="billFileCamNew" className="extra-field-row">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                <span style={{ color: pendingPhotos.length ? 'var(--green)' : 'var(--ink3)' }}>{pendingPhotos.length ? '✓ Bill Photo Added' : 'Add Bill Photo'}</span>
                                <input type="file" id="billFileCamNew" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                            </label>
                            <div className="extra-field-row">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                                <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '13px', color: 'var(--ink)' }} />
                            </div>
                        </div>

                        <div className={\`numpad \${isAddEntryOpen ? 'show' : ''}\`}>
                            <button className="num-key" onClick={() => numPress('1')}>1</button>
                            <button className="num-key" onClick={() => numPress('2')}>2</button>
                            <button className="num-key" onClick={() => numPress('3')}>3</button>
                            <button className="num-key" onClick={() => numPress('4')}>4</button>
                            <button className="num-key" onClick={() => numPress('5')}>5</button>
                            <button className="num-key" onClick={() => numPress('6')}>6</button>
                            <button className="num-key" onClick={() => numPress('7')}>7</button>
                            <button className="num-key" onClick={() => numPress('8')}>8</button>
                            <button className="num-key" onClick={() => numPress('9')}>9</button>
                            <button className="num-key decimal" onClick={() => numPress('.')}>.</button>
                            <button className="num-key zero" onClick={() => numPress('0')}>0</button>
                            <button className="num-key backspace" onClick={() => numBackspace()}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
                            </button>
                        </div>

                        <div className={\`confirm-row \${isAddEntryOpen ? 'show' : ''}\`}>
                            <button className="btn-back-entry" onClick={closeNumpad}>← Back</button>
                            <button className={\`btn-confirm \${entryType === 'debit' ? 'given' : entryType === 'credit' ? 'received' : 'advance'}\`} onClick={() => {
                                saveEntry();
                                closeNumpad();
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                                Confirm
                            </button>
                        </div>

                        <div className="action-row" style={{ display: isAddEntryOpen ? 'none' : 'grid' }}>
                            <button className="action-btn given-btn" onClick={() => openNumpad('debit')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                Given
                            </button>
                            <button className="action-btn advance-btn" onClick={() => openNumpad('advance')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                Advance
                            </button>
                            <button className="action-btn received-btn" onClick={() => openNumpad('credit')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                                Received
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={\`screen pc-empty-state-container \${activeScreen === 'detail' ? 'active' : ''}\`} id="screen-detail">
                    <div className="empty-state" style={{ height: '100%', justifyContent: 'center' }}>
                        <div className="empty-ico" style={{ fontSize: '64px', marginBottom: '20px' }}>👈</div>
                        <div className="empty-title" style={{ fontSize: '20px' }}>Customer Select Karein</div>
                        <div className="empty-sub" style={{ fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>Left side list me se kisi customer par click karke unka poora hisaab dekhein.</div>
                    </div>
                </div>
            )}
            
            {/* Add Customer Sheet */}`;

const fullNewContent = content.substring(0, detailStart) + newDetail + content.substring(detailEnd + '{/* Add Customer Sheet */}'.length);

fs.writeFileSync(file, fullNewContent, 'utf8');

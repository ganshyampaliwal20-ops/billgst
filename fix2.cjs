const fs = require('fs');
let c = fs.readFileSync('f:/bill/app/dashboard/settings/page.tsx', 'utf-8');
let t = c.substring(c.indexOf('{/* WhatsApp API Connect */}'), c.indexOf('{/* Branding & Signatory */}'));
let repl = `                            {/* WhatsApp Scanner */}
                            <div style={{ marginTop: '20px', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Personal WhatsApp Connection (For PDF Invoices & Bot Reminders)</div>
                                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>Scan the QR code below via WhatsApp "Linked Devices" to allow the system to send PDFs directly from your own number.</p>

                                {waStatus === 'DISCONNECTED' || waStatus === 'ERROR' ? (
                                    <button onClick={handleConnectWhatsApp} disabled={waLoading} className="upload-btn" style={{ background: 'var(--grad)', color: '#fff', border: 'none', padding: '10px 16px' }}>
                                        {waLoading ? 'Starting Bot Engine...' : 'Connect Your WhatsApp'}
                                    </button>
                                ) : waStatus === 'STARTING_SERVICE' || waStatus === 'STARTING' ? (
                                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block' }}>
                                        {waQr ? <QRCodeSVG value={waQr} size={200} /> : <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#000' }}>⏳ Generating QR...</span></div>}
                                        <p style={{ color: '#000', fontSize: '12px', fontWeight: 600, marginTop: '12px', textAlign: 'center' }}>Scan via WhatsApp Linked Devices</p>
                                    </div>
                                ) : (
                                    <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid var(--green)', padding: '16px', borderRadius: '12px', display: 'inline-block' }}>
                                        <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                            WhatsApp is Connected & Active
                                        </div>
                                        <button onClick={handleDisconnectWhatsApp} disabled={waLoading} className="upload-btn" style={{ marginTop: '12px', color: 'var(--red)', borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.1)' }}>
                                            {waLoading ? 'Disconnecting...' : 'Disconnect WhatsApp'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    `;
c = c.replace(t, repl);
fs.writeFileSync('f:/bill/app/dashboard/settings/page.tsx', c);
console.log('DONE');

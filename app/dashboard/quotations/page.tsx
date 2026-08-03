'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaHandHoldingUsd, FaWhatsapp, FaDownload, FaTimes, FaFileInvoice, FaTrash, FaChevronDown, FaEllipsisV, FaCheckCircle, FaClock, FaEdit, FaEye } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { generateQuotationPDF } from '@/lib/pdf-generator';
import { toast } from 'react-hot-toast';
import { getVisitingCardText, openWhatsAppChat } from '@/lib/whatsapp-utils';

export default function QuotationsPage() {
    const router = useRouter();
    const { quotations, fetchQuotations, updateQuotation, businessProfile } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [openCards, setOpenCards] = useState<string[]>([]);
    const [selectedQuo, setSelectedQuo] = useState<any>(null);
    const [showDetail, setShowDetail] = useState(false);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        if (fetchQuotations) fetchQuotations(false, 1);
    }, []);

    const toggleCard = (name: string) => {
        setOpenCards(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
    };

    const filteredQuotations = quotations.filter((q: any) => {
        const matchesSearch = (q.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (q.quotation_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        if (filter === 'all') return matchesSearch;
        const status = (q.status || '').toLowerCase();
        if (filter === 'received' && (status === 'received' || status === 'accepted')) return matchesSearch;
        if (filter === 'pending' && status === 'pending') return matchesSearch;
        return matchesSearch && status === filter;
    });

    const customersMap = new Map();
    filteredQuotations.forEach((q: any) => {
        if (!customersMap.has(q.customer_name)) {
            customersMap.set(q.customer_name, {
                name: q.customer_name,
                count: 0,
                total: 0,
                latest: q.quotation_date,
                status: q.status,
                items: []
            });
        }
        const c = customersMap.get(q.customer_name);
        c.count += 1;
        c.total += parseFloat(q.total_amount || 0);
        c.items.push(q);
        if (new Date(q.quotation_date) > new Date(c.latest)) c.latest = q.quotation_date;
    });

    const customers = Array.from(customersMap.values());

    const openDetail = (q: any) => {
        setSelectedQuo(q);
        setShowDetail(true);
    };

    const handleDownload = async (q: any) => {
        try {
            const loadToast = toast.loading('Generating PDF...');
            await generateQuotationPDF(q, businessProfile, true);
            toast.dismiss(loadToast);
            toast.success('Downloaded!');
        } catch (e) {
            toast.error('Download failed');
        }
    };

    const handleShareRow = async (q: any) => {
        const phone = (q.customer_phone || '').replace(/\D/g, '');
        if (!phone) {
            toast.error('Pahle customer ka mobile number add karein, uske baad WhatsApp par share hoga.', { icon: '📱' });
            return;
        }
        try {
            const pdfDoc = await generateQuotationPDF(q, businessProfile, false);
            if (!pdfDoc) return;
            const blob = pdfDoc.output('blob');
            const file = new File([blob], `Quotation-${q.quotation_number}.pdf`, { type: 'application/pdf' });
            let message = `Hi ${q.customer_name}, here is your quotation ${q.quotation_number} for ₹${parseFloat(q.total_amount).toLocaleString('en-IN')}`;
            message += getVisitingCardText(businessProfile);

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'Quotation', text: message });
            } else {
                openWhatsAppChat(phone, message);
                toast.success('Opening WhatsApp...');
            }
        } catch (e) { toast.error('Share failed'); }
    };

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        try {
            if (fetchQuotations) await fetchQuotations(true, nextPage);
            setPage(nextPage);
        } catch(e) {
            console.error(e);
        }
        setIsLoadingMore(false);
    };

    return (
        <div className="quotations-list-wrapper">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                
                :root {
                    --bg: #f0f2f8; --white: #fff; --ink: #0c0e1a; --ink2: #2c3050; --ink3: #6b718f; --ink4: #a8adc4;
                    --border: #e2e5f0; --border2: #d0d4e8; --green: #00b37e; --green-lt: #e0f7f0;
                    --amber: #f0a500; --amber-lt: #fff4dc; --blue: #2f6ff5; --blue-lt: #e8efff;
                    --indigo: #4338ca; --sh: 0 2px 10px rgba(12,14,26,.07);
                }

                .quotations-list-wrapper {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background: var(--bg); min-height: 100vh; color: var(--ink);
                    padding-bottom: 100px;
                }

                .topbar {
                    background: linear-gradient(135deg, #0f1235 0%, #1e2460 100%);
                    padding: 25px 15px 30px; position: sticky; top: 0; z-index: 200;
                    margin: 0 5px; border-radius: 0 0 15px 15px;
                    display: flex; flex-direction: column; align-items: center; text-align: center;
                }
                
                .header-col-1 { margin-bottom: 25px; }
                .tb-title { font-size: 22px; font-weight: 700; color: white; display: block; margin-bottom: 2px; }
                .tb-sub { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }

                .header-col-2 { width: 100%; max-width: 500px; }
                .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; }
                
                .stat-pill {
                    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px; padding: 12px 10px; text-align: center; cursor: pointer;
                    transition: all 0.2s;
                }
                .stat-pill:active { transform: scale(0.95); }
                .stat-pill.active { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.4); }
                
                .stat-num { font-size: 15px; font-weight: 700; color: white; }
                .stat-lbl { font-size: 9px; color: rgba(255,255,255,0.5); text-transform: uppercase; margin-top: 4px; }

                .search-wrap { background: var(--white); padding: 10px 15px 15px; border-bottom: 1px solid var(--border); margin: 10px 5px; border-radius: 15px; }
                .search-box {
                    display: flex; align-items: center; gap: 10px; background: var(--bg);
                    border: 1.5px solid var(--border2); border-radius: 12px; padding: 10px 15px;
                }
                .search-box input { border: none; background: none; outline: none; flex: 1; font-size: 14px; }

                .filter-wrap { padding: 10px 15px; display: flex; gap: 8px; overflow-x: auto; background: var(--white); margin: 0 5px; border-radius: 12px; }
                .ftab {
                    padding: 7px 15px; border-radius: 99px; font-size: 12px; font-weight: 600;
                    border: 1.5px solid var(--border2); background: none; color: var(--ink3); cursor: pointer;
                }
                .ftab.active { background: var(--ink); border-color: var(--ink); color: white; }

                .list-container { padding: 10px 0; display: flex; flex-direction: column; gap: 12px; margin: 0 5px; }
                
                .cust-card {
                    background: var(--white); border-radius: 18px; border: 1px solid var(--border);
                    box-shadow: var(--sh); overflow: hidden; animation: cardUp 0.4s ease both;
                }
                @keyframes cardUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

                .cust-head { display: flex; align-items: center; gap: 12px; padding: 15px; cursor: pointer; }
                .avatar { width: 45px; height: 45px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; }
                .cust-info { flex: 1; }
                .cust-name { font-size: 15px; font-weight: 700; }
                .cust-total { font-weight: 800; color: var(--indigo); }
                
                .inv-list { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; background: #fafbff; }
                .cust-card.open .inv-list { max-height: 1000px; }

                .inv-row {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 12px 15px; border-top: 1px solid var(--border); cursor: pointer;
                }
                .inv-id { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--ink3); }
                .inv-amt { font-weight: 700; font-size: 14px; }

                .fab {
                    position: fixed; bottom: 30px; right: 30px; width: 56px; height: 56px;
                    border-radius: 18px; background: var(--ink); color: white;
                    display: flex; align-items: center; justify-content: center; font-size: 24px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.2); z-index: 300;
                }

                .overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px);
                    display: flex; align-items: flex-end; z-index: 500;
                }
                .sheet {
                    background: white; border-radius: 24px 24px 0 0; width: 100%;
                    max-height: 85vh; overflow-y: auto; padding: 20px 25px 40px;
                    animation: sheetUp 0.3s ease-out;
                }
                @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .sheet-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 20px; }

                .sd-btn {
                    padding: 12px; border-radius: 12px; border: none; font-weight: 700;
                    display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px;
                }
                .sdb-wa { background: #dcfce7; color: #16a34a; }
                .sdb-pdf { background: var(--blue-lt); color: var(--blue); }
            ` }} />

            <div className="topbar">
                <div className="header-col-1">
                    <span className="tb-title">Quotations</span>
                    <span className="tb-sub">Manage Your Deals</span>
                </div>
                
                <div className="header-col-2">
                    <div className="stats-row">
                        <div className={`stat-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                            <div className="stat-num">{quotations.length}</div>
                            <div className="stat-lbl">Total</div>
                        </div>
                        <div className={`stat-pill ${filter === 'received' ? 'active' : ''}`} onClick={() => setFilter('received')}>
                            <div className="stat-num">₹{quotations.reduce((acc: any, q: any) => acc + parseFloat(q.paid_amount || 0), 0).toLocaleString('en-IN')}</div>
                            <div className="stat-lbl">Received</div>
                        </div>
                        <div className={`stat-pill ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                            <div className="stat-num">₹{quotations.reduce((acc: any, q: any) => acc + (parseFloat(q.total_amount || 0) - parseFloat(q.paid_amount || 0)), 0).toLocaleString('en-IN')}</div>
                            <div className="stat-lbl">Due</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="search-wrap">
                <div className="search-box">
                    <FaSearch color="var(--ink4)" />
                    <input type="text" placeholder="Search customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="filter-wrap">
                {['All', 'Pending', 'Received', 'Draft'].map(f => (
                    <button key={f} className={`ftab ${filter === f.toLowerCase() ? 'active' : ''}`} onClick={() => setFilter(f.toLowerCase())}>{f}</button>
                ))}
            </div>

            <div className="list-container">
                {customers.map((c: any) => (
                    <div key={c.name} className={`cust-card ${openCards.includes(c.name) ? 'open' : ''}`}>
                        <div className="cust-head" onClick={() => toggleCard(c.name)}>
                            <div className="avatar" style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed)' }}>{c.name[0]}</div>
                            <div className="cust-info">
                                <div className="cust-name">{c.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--ink3)' }}>{c.count} Quotation</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="cust-total">₹{c.total.toLocaleString('en-IN')}</div>
                                <div style={{ fontSize: '10px', color: 'var(--amber)', fontWeight: '700' }}>DUE</div>
                            </div>
                        </div>
                        <div className="inv-list">
                            {c.items.map((q: any) => (
                                <div key={q.id} className="inv-row" onClick={() => openDetail(q)}>
                                    <div>
                                        <div className="inv-id">{q.quotation_number}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--ink4)' }}>{new Date(q.quotation_date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="inv-amt">₹{parseFloat(q.total_amount).toLocaleString('en-IN')}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Centered Load More Button */}
            {quotations?.length >= 20 && quotations.length % 20 === 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
                    <button 
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        style={{ 
                            padding: '10px 24px', fontSize: '14px', fontWeight: 600, 
                            borderRadius: '8px', background: 'var(--blue-lt)', color: 'var(--blue)', 
                            border: '1px solid var(--border2)', cursor: isLoadingMore ? 'not-allowed' : 'pointer', transition: 'background 0.2s'
                        }}
                    >
                        {isLoadingMore ? 'Loading...' : 'Load More Quotations'}
                    </button>
                </div>
            )}

            <Link href="/dashboard/quotations/new" className="fab">
                <FaPlus />
            </Link>

            {showDetail && selectedQuo && (
                <div className="overlay" onClick={() => setShowDetail(false)}>
                    <div className="sheet" onClick={e => e.stopPropagation()}>
                        <div className="sheet-handle"></div>
                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--ink4)', fontFamily: 'DM Mono' }}>Number: {selectedQuo.quotation_number}</div>
                            <div style={{ fontSize: '22px', fontWeight: '800' }}>{selectedQuo.customer_name}</div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--red)', marginTop: '10px' }}>₹{parseFloat(selectedQuo.total_amount).toLocaleString('en-IN')}</div>
                        </div>

                        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '15px', marginBottom: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '13px', color: 'var(--ink3)' }}>Date</span>
                                <span style={{ fontWeight: '600' }}>{new Date(selectedQuo.quotation_date).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <span style={{ fontSize: '13px', color: 'var(--ink3)' }}>Status</span>
                                <span style={{ color: 'var(--amber)', fontWeight: '700' }}>DUE</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button className="sd-btn sdb-wa" onClick={() => handleShareRow(selectedQuo)}>
                                <FaWhatsapp /> WhatsApp
                            </button>
                            <button className="sd-btn sdb-pdf" onClick={() => handleDownload(selectedQuo)}>
                                <FaDownload /> PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ReferralPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/referrals')
            .then(res => res.json())
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const refLink = typeof window !== 'undefined' ? `${window.location.origin}/?signup=true&ref=${data?.code || ''}` : '';

    const copyLink = () => {
        navigator.clipboard.writeText(refLink).catch(() => {});
        toast.success('Link copy ho gaya!');
    };

    const shareWA = () => {
        const msg = encodeURIComponent('BillGST par free account banao aur 20 free invoices pao! Mera referral link: ' + refLink);
        window.open('https://wa.me/?text=' + msg, '_blank');
    };

    const shareSMS = () => {
        window.open('sms:?body=' + encodeURIComponent('BillGST par free account banao aur 20 free invoices pao! ' + refLink));
    };

    const shareEmail = () => {
        window.open('mailto:?subject=20%20Free%20Invoices%20BillGST%20par!&body=' + encodeURIComponent('Mere dost! BillGST par free account banao aur 20 free invoices pao.\n\nLink: ' + refLink));
    };

    const totalEarned = data?.totalEarned || 0;
    const balance = data?.balance || 0;
    const used = totalEarned - balance;
    const progress = totalEarned > 0 ? (used / totalEarned) * 100 : 0;

    return (
        <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f0f2f5", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "20px" }}>
            <div style={{ maxWidth: "680px", width: "100%", padding: "1rem 0" }}>
                {/* Header */}
                <div style={{ background: "linear-gradient(135deg, #1a1f6e, #4a55e8)", borderRadius: "12px", padding: "1.5rem", color: "#fff", marginBottom: "1rem" }}>
                    <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>Refer karo, rewards pao</h1>
                    <p style={{ fontSize: "13px", opacity: 0.75 }}>Har successful referral par aapko aur aapke dost ko 20 free invoices milte hain</p>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "1rem" }}>
                    <div style={{ background: "#fff", borderRadius: "8px", padding: "14px 16px", border: "0.5px solid #e0e0e0" }}>
                        <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Total referrals</div>
                        <div style={{ fontSize: "22px", fontWeight: 600, color: "#4a55e8" }}>{data?.totalReferrals || 0}</div>
                    </div>
                    <div style={{ background: "#fff", borderRadius: "8px", padding: "14px 16px", border: "0.5px solid #e0e0e0" }}>
                        <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Invoices earned</div>
                        <div style={{ fontSize: "22px", fontWeight: 600, color: "#4a55e8" }}>{totalEarned}</div>
                    </div>
                    <div style={{ background: "#fff", borderRadius: "8px", padding: "14px 16px", border: "0.5px solid #e0e0e0" }}>
                        <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Invoices remaining</div>
                        <div style={{ fontSize: "22px", fontWeight: 600, color: "#4a55e8" }}>{balance}</div>
                    </div>
                </div>

                {/* Referral Link */}
                <div style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Aapka referral link</div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <div style={{ flex: 1, background: "#f5f5f5", border: "0.5px solid #e0e0e0", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#222", fontFamily: "monospace", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                            {refLink}
                        </div>
                        <button onClick={copyLink} style={{ padding: "9px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "0.5px solid #ccc", background: "#fff", color: "#222", transition: "background 0.15s" }}>Copy</button>
                    </div>

                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "16px", marginBottom: "8px" }}>Share karein</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "12px" }}>
                        <button onClick={shareWA} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px 8px", borderRadius: "8px", border: "0.5px solid #e0e0e0", background: "#fff", cursor: "pointer", fontSize: "11px", color: "#666", transition: "background 0.15s" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#dcfce7" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                    <path d="M11.999 2C6.486 2 2 6.486 2 12c0 1.73.445 3.397 1.293 4.875L2.05 21.95l5.19-1.232A9.948 9.948 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18a7.951 7.951 0 01-4.063-1.117l-.289-.172-3.082.731.776-2.999-.188-.307A7.946 7.946 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
                                </svg>
                            </div>
                            WhatsApp
                        </button>
                        <button onClick={shareSMS} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px 8px", borderRadius: "8px", border: "0.5px solid #e0e0e0", background: "#fff", cursor: "pointer", fontSize: "11px", color: "#666", transition: "background 0.15s" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#e0e7ff" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#4a55e8">
                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                                </svg>
                            </div>
                            SMS
                        </button>
                        <button onClick={shareEmail} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px 8px", borderRadius: "8px", border: "0.5px solid #e0e0e0", background: "#fff", cursor: "pointer", fontSize: "11px", color: "#666", transition: "background 0.15s" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fef9c3" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ca8a04">
                                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                            </div>
                            Email
                        </button>
                        <button onClick={copyLink} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px 8px", borderRadius: "8px", border: "0.5px solid #e0e0e0", background: "#fff", cursor: "pointer", fontSize: "11px", color: "#666", transition: "background 0.15s" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fce7f3" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#db2777">
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                </svg>
                            </div>
                            Copy link
                        </button>
                    </div>
                </div>

                {/* How it works */}
                <div style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Kaise kaam karta hai</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "4px" }}>
                        <div style={{ textAlign: "center", padding: "12px 8px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#e0e7ff", color: "#3730a3", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>1</div>
                            <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.5 }}>Apna referral link share karein dost ke saath</div>
                        </div>
                        <div style={{ textAlign: "center", padding: "12px 8px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#e0e7ff", color: "#3730a3", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>2</div>
                            <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.5 }}>Dost BillGST par free account banaye</div>
                        </div>
                        <div style={{ textAlign: "center", padding: "12px 8px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#e0e7ff", color: "#3730a3", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>3</div>
                            <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.5 }}>Dono ko 20-20 free invoices milte hain</div>
                        </div>
                    </div>
                </div>

                {/* Referral List */}
                <div style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Aapke referrals</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {data?.referrals?.length === 0 && (
                            <div style={{ padding: "20px 0", textAlign: "center", fontSize: "13px", color: "#888" }}>Abhi tak koi referral nahi hai. Apne doston ko invite karein!</div>
                        )}
                        {data?.referrals?.map((ref: any, i: number) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < data.referrals.length - 1 ? "0.5px solid #e0e0e0" : "none" }}>
                                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#3730a3", flexShrink: 0 }}>
                                    {ref.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "13px", fontWeight: 500, color: "#222" }}>{ref.name}</div>
                                    <div style={{ fontSize: "11px", color: "#999", marginTop: "1px" }}>Joined {new Date(ref.date).toLocaleDateString()}</div>
                                </div>
                                <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "20px", fontWeight: 500, background: ref.status === 'JOINED' ? "#dcfce7" : "#fef9c3", color: ref.status === 'JOINED' ? "#166534" : "#854d0e" }}>
                                    {ref.status === 'JOINED' ? 'Joined' : 'Pending'}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ marginTop: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888", marginBottom: "6px" }}>
                            <span>Invoices used</span>
                            <span>{used} / {totalEarned || 0}</span>
                        </div>
                        <div style={{ height: "8px", background: "#f0f0f0", borderRadius: "20px", overflow: "hidden" }}>
                            <div style={{ height: "100%", background: "#4a55e8", borderRadius: "20px", transition: "width 0.5s", width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Reward Summary */}
                <div style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Reward summary</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid #e0e0e0" }}>
                        <span style={{ fontSize: "13px", color: "#333" }}>Invoices per referral</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#4a55e8" }}>20 free</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid #e0e0e0" }}>
                        <span style={{ fontSize: "13px", color: "#333" }}>Total earned</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#4a55e8" }}>{totalEarned} invoices</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid #e0e0e0" }}>
                        <span style={{ fontSize: "13px", color: "#333" }}>Invoices used</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#ef4444" }}>{used}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
                        <span style={{ fontSize: "13px", color: "#333" }}>Invoices remaining</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#4a55e8" }}>{balance} invoices</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
// Dynamic import used for Chart.js
import { generateHisaabPDF } from '@/lib/pdf-generator';
import { getVisitingCardText, openWhatsAppChat } from '@/lib/whatsapp-utils';

export default function CustomerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { customers, invoices, fetchInvoices, fetchCustomers, updateCustomer, businessProfile } = useStore() as any;
    const [isClient, setIsClient] = useState(false);

    // Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('UPI / GPay');
    const [paymentNote, setPaymentNote] = useState('');

    useEffect(() => {
        if (!isClient) return;
        const action = searchParams.get('action');
        const amt = searchParams.get('amount');
        if (action === 'payment') {
            setShowPaymentModal(true);
            if (amt) setPaymentAmount(amt);
        }
    }, [isClient, searchParams]);

    const [activeTab, setActiveTab] = useState('Overview');
    // Promise State
    const [showPromiseModal, setShowPromiseModal] = useState(false);
    const [promiseDate, setPromiseDate] = useState('');
    const [promiseNote, setPromiseNote] = useState('');
    const [fetchedPayments, setFetchedPayments] = useState<any[]>([]);

    const chartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        setIsClient(true);
        if (customers.length === 0) fetchCustomers();
        if (invoices.length === 0) fetchInvoices();
    }, []);

    const customer = customers.find((c: any) => c.id === id);

    useEffect(() => {
        if (customer?.promise_date) {
            setPromiseDate(customer.promise_date.split('T')[0]);
        }
    }, [customer]);

    useEffect(() => {
        if (!isClient) return;
        const fetchCustPayments = async () => {
            try {
                const res = await fetch(`/api/payments?customer_id=${id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setFetchedPayments(data);
                }
            } catch (e) {}
        };
        fetchCustPayments();
    }, [isClient, id]);

    const customerInvoices = invoices
        .filter((inv: any) => inv.customer_id === id || inv.customer?.id === id)
        .sort((a: any, b: any) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime());

    const totalSales = customerInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.total_amount || 0), 0);
    const totalPaid = customerInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.paid_amount || 0), 0);
    const totalDue = Math.max(0, totalSales - totalPaid);

    useEffect(() => {
        if (!isClient || !chartRef.current) return;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const labels: string[] = [];
        const billedData = [0, 0, 0, 0, 0, 0];
        const paidData = [0, 0, 0, 0, 0, 0];

        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(monthNames[d.getMonth()]);
        }

        customerInvoices.forEach((inv: any) => {
            if (!inv.invoice_date) return;
            const invDate = new Date(inv.invoice_date);
            for (let i = 0; i < 6; i++) {
                const bDate = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
                if (bDate.getFullYear() === invDate.getFullYear() && bDate.getMonth() === invDate.getMonth()) {
                    billedData[i] += parseFloat(inv.total_amount || 0);
                    paidData[i] += parseFloat(inv.paid_amount || 0);
                    break;
                }
            }
        });

        fetchedPayments.forEach((p: any) => {
            if (!p.payment_date) return;
            const pDate = new Date(p.payment_date);
            for (let i = 0; i < 6; i++) {
                const bDate = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
                if (bDate.getFullYear() === pDate.getFullYear() && bDate.getMonth() === pDate.getMonth()) {
                    paidData[i] += parseFloat(p.amount || 0);
                    break;
                }
            }
        });

        let chartInstance: any;

        const initChart = async () => {
            const { default: Chart } = await import('chart.js/auto');
            if (!chartRef.current) return;
            chartInstance = new Chart(chartRef.current, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Billed', data: billedData, backgroundColor: 'rgba(79,70,229,0.15)', borderColor: '#4f46e5', borderWidth: 2, borderRadius: 6, borderSkipped: false },
                    { label: 'Paid', data: paidData, backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6, borderSkipped: false }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '₹' + (ctx.raw as number / 1000).toFixed(1) + 'K' } } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Sora', size: 11 }, color: '#7c88a6' } },
                    y: { grid: { color: '#f0f2f8' }, ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#7c88a6', callback: v => '₹' + (v as number / 1000) + 'K' } }
                }
            }
        });
        };
        initChart();

        return () => {
            if (chartInstance) chartInstance.destroy();
        };
    }, [isClient, customer, invoices, fetchedPayments]);

    if (!isClient) return null;

    if (!customer) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-800">Customer Not Found</h2>
                <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    const formatLakhs = (val: number) => {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lk`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)} K`;
        return `₹${Number(val || 0).toLocaleString('en-IN')}`;
    };

    const handlePayment = async () => {
        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) {
            toast.error('⚠ Valid amount daalo!');
            return;
        }

        try {
            const unpaidInvoices = customerInvoices
                .filter((inv: any) => (parseFloat(inv.total_amount) - parseFloat(inv.paid_amount || 0)) > 0.1)
                .sort((a: any, b: any) => new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime());

            let remainingPayment = amount;
            let processedCount = 0;

            for (const inv of unpaidInvoices) {
                if (remainingPayment <= 0.01) break;
                const currentPaid = parseFloat(inv.paid_amount || 0);
                const currentTotal = parseFloat(inv.total_amount);
                const pending = currentTotal - currentPaid;

                const paymentForInvoice = remainingPayment >= pending ? pending : remainingPayment;
                remainingPayment -= paymentForInvoice;

                const newPaidAmount = currentPaid + paymentForInvoice;
                const newStatus = Math.abs(newPaidAmount - currentTotal) < 0.1 ? 'PAID' : 'PARTIAL';

                await fetch('/api/invoices', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: inv.id, paid_amount: newPaidAmount, status: newStatus })
                });
                processedCount++;
            }

            // Record as explicit payment history
            try {
                await fetch('/api/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id: id,
                        amount: amount,
                        payment_mode: paymentMode,
                        payment_note: paymentNote
                    })
                });

                // Refresh payments
                const payRes = await fetch(`/api/payments?customer_id=${id}`);
                if (payRes.ok) {
                    const payData = await payRes.json();
                    if (Array.isArray(payData)) setFetchedPayments(payData);
                }
            } catch(e) {}

            toast.success(`✅ ₹${amount.toLocaleString('en-IN')} received via ${paymentMode}`);
            if (Math.abs(amount - Math.max(0, totalSales - totalPaid)) < 0.1) {
                await updateCustomer(id, { promise_date: null });
            }
            await fetchInvoices(true);
            setShowPaymentModal(false);
            setPaymentAmount('');
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const getHisaabPayload = () => {
        const txns: any[] = [];
        let totalSalesComputed = 0;
        let totalPaidComputed = 0;

        customerInvoices.forEach((inv: any) => {
             if (inv.invoice_date) {
                 txns.push({
                     date: new Date(inv.invoice_date).toISOString(),
                     amt: parseFloat(inv.total_amount || 0),
                     type: 'debit',
                     name: 'Invoice ' + inv.invoice_number
                 });
                 totalSalesComputed += parseFloat(inv.total_amount || 0);

                 if (parseFloat(inv.paid_amount || 0) > 0) {
                     txns.push({
                         date: new Date(inv.invoice_date).toISOString(),
                         amt: parseFloat(inv.paid_amount || 0),
                         type: 'credit',
                         name: 'Payment (Inv ' + inv.invoice_number + ')'
                     });
                     totalPaidComputed += parseFloat(inv.paid_amount || 0);
                 }
             }
        });

        fetchedPayments.forEach((p: any) => {
             if (p.payment_date) {
                 txns.push({
                     date: new Date(p.payment_date).toISOString(),
                     amt: parseFloat(p.amount || 0),
                     type: 'credit',
                     name: 'Payment ' + (p.payment_mode ? `(${p.payment_mode})` : '')
                 });
                 totalPaidComputed += parseFloat(p.amount || 0);
             }
        });

        txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const realTotalDue = Math.max(0, totalSalesComputed - totalPaidComputed);

        return {
            ...customer,
            txns: txns,
            balance: -realTotalDue
        };
    };

    const handleWhatsApp = async () => {
        const phone = customer.phone?.replace(/\D/g, '') || '';
        if (!phone) {
            toast.error('Customer ka mobile number add karein');
            return;
        }

        const payload = getHisaabPayload();
        
        let shareId = customer.id;
        try {
            await fetch('/api/hisaab/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const res = await fetch('/api/hisaab/link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ custId: customer.id }) });
            const json = await res.json();
            if (json.shortId) shareId = json.shortId;
        } catch(e) {}

        const shareUrl = `${window.location.origin}/h/${shareId}`;

        let text = `Namaste ${customer.name || 'Customer'} 🙏\n\n`;
        text += `Aapka *Ledger Statement* ready hai.\n\n`;
        text += `💰 *Total Outstanding Amount:* ₹${totalDue.toLocaleString('en-IN')}\n`;
        text += `📉 *Status:* Aapko Dena Hai\n\n`;
        text += `📄 *Poora Hisaab Dekhne & PDF Download karne ke liye link par click karein:*\n${shareUrl}\n\n`;
        text += `Dhanyawad,\n*${businessProfile?.name || 'BillGST Pro'}*`;

        openWhatsAppChat(phone, text);
        toast.success('Opening WhatsApp...');
    };

    const handleDownloadStatement = async () => {
        const toastId = toast.loading('Statement open ho raha hai...');
        try {
            const payload = getHisaabPayload();
            let shareUrl = `/hisaab/v?d=${btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}`;
            try {
                await fetch('/api/hisaab/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const res = await fetch('/api/hisaab/link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ custId: customer.id }) });
                const json = await res.json();
                if (json.shortId) {
                    shareUrl = `/h/${json.shortId}`;
                }
            } catch(e) {}

            toast.dismiss(toastId);
            router.push(shareUrl);
        } catch (error) {
            toast.dismiss(toastId);
            toast.error('Error opening statement');
        }
    };

    const setCommitment = async () => {
        if (!promiseDate) {
            toast.error('⚠ Date select karo!');
            return;
        }
        try {
            await updateCustomer(id, { promise_date: promiseDate || null });
            setShowPromiseModal(false);
            const formatted = new Date(promiseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
            toast.success('📅 Payment date set: ' + formatted);
        } catch (e) {
            toast.error('Failed to update promise date');
        }
    };

    const initials = (customer.name || 'U').charAt(0).toUpperCase();
    const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    const commitDateStr = customer.promise_date ? new Date(customer.promise_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No promise date set';

    const combinedPayments = (() => {
        const list: any[] = [];
        fetchedPayments.forEach((p: any) => {
             list.push({
                 rawDate: new Date(p.payment_date).getTime(),
                 date: new Date(p.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                 mode: p.payment_mode || 'Cash',
                 amt: '₹' + Number(p.amount).toLocaleString('en-IN'),
                 note: p.payment_note ? `Note: ${p.payment_note}` : 'Payment Received'
             });
        });
        
        customerInvoices.forEach((inv: any) => {
             if (parseFloat(inv.paid_amount || 0) > 0) {
                 list.push({
                     rawDate: new Date(inv.invoice_date).getTime(),
                     date: new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                     mode: 'Invoice Advance',
                     amt: '₹' + Number(inv.paid_amount).toLocaleString('en-IN'),
                     note: 'Inv. ' + inv.invoice_number
                 });
             }
        });
        
        return list.sort((a,b) => b.rawDate - a.rawDate).slice(0, 10);
    })();

    return (
        <div className="cust-summary-wrapper">
            <style dangerouslySetInnerHTML={{
                __html: `
:root {
  --bg: #f8fafc;
  --white: #ffffff;
  --ink: #0f172a;
  --ink2: #1e293b;
  --slate: #475569;
  --muted: #64748b;
  --border: #e2e8f0;
  --faint: #f1f5f9;
  --indigo: #4f46e5;
  --teal: #0ea5e9;
  --green: #10b981;
  --green-soft: rgba(16,185,129,0.1);
  --red: #ef4444;
  --red-soft: rgba(239,68,68,0.1);
  --amber: #f59e0b;
  --amber-soft: rgba(245,158,11,0.1);
  --shadow: 0 1px 3px rgba(0,0,0,0.05),0 1px 2px rgba(0,0,0,0.03);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -1px rgba(0,0,0,0.03);
}
.cust-summary-wrapper *, .cust-summary-wrapper *::before, .cust-summary-wrapper *::after{box-sizing:border-box;margin:0;padding:0}
.cust-summary-wrapper{font-family:'Sora',sans-serif;background:var(--bg);color:var(--ink);min-height:100vh}

.shell{max-width:1000px;margin:0 auto;background:var(--bg);min-height:100vh;position:relative;padding-bottom:100px;box-shadow:0 0 40px rgba(0,0,0,0.03)}

.appbar{
  background:linear-gradient(135deg,#0b0f1e 0%,#1c2340 70%,#2d3561 100%);
  padding:12px 20px;
  display:flex;align-items:center;justify-content:space-between;
  position: relative;
  overflow: hidden;
}
.appbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #0ea5e9, #10b981, #ec4899, #4f46e5);
  background-size: 400% 100%;
  animation: glowLine 3s linear infinite;
  box-shadow: 0 -3px 15px rgba(14,165,233,0.5);
}
@keyframes glowLine {
  0% { background-position: 100% 0; }
  100% { background-position: -300% 0; }
}
.appbar-brand, .date-chip { position: relative; z-index: 2; }
.appbar-brand{display:flex;align-items:center;gap:8px}
.app-icon{width:28px;height:28px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px; color: #fff;}
.app-name{font-size:13px;font-weight:800;color:#fff}
.app-sub{font-size:9px;color:rgba(255,255,255,0.45);font-weight:400}
.date-chip{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:#fff;padding:4px 10px;border-radius:20px;font-size:10.5px;font-weight:600;display:flex;align-items:center;gap:5px}
.date-dot{width:6px;height:6px;border-radius:50%;background:#10b981}

.cust-header{
  background:linear-gradient(135deg,#1e3a5f 0%,#1e40af 60%,#2563eb 100%);
  padding:16px 20px 14px;
  position:relative;overflow:hidden;
}
.cust-header::before{content:'';position:absolute;width:120px;height:120px;background:rgba(255,255,255,0.04);border-radius:50%;top:-40px;right:-20px}
.cust-header::after{content:'';position:absolute;width:60px;height:60px;background:rgba(255,255,255,0.04);border-radius:50%;bottom:-10px;left:30px}
.ch-top{display:flex;align-items:center;gap:10px;margin-bottom:12px;position:relative;z-index:1}
.back-btn{width:30px;height:30px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;cursor:pointer;transition:all .2s;text-decoration:none;flex-shrink:0}
.back-btn:hover{background:rgba(255,255,255,0.2)}
.cust-avatar{width:38px;height:38px;background:linear-gradient(135deg,#f59e0b,#f97316);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;flex-shrink:0;}
.cust-meta{flex:1}
.cust-name{font-size:16px;font-weight:800;color:#fff;letter-spacing:-.2px}
.cust-sub{font-size:10px;color:rgba(255,255,255,0.55);font-weight:400;margin-top:1px}
.edit-btn{width:30px;height:30px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;transition:all .2s;flex-shrink:0;color:#fff;}
.edit-btn:hover{background:rgba(255,255,255,0.2)}

.stats-bar{display:grid;grid-template-columns:1fr 1fr 1fr;background:rgba(255,255,255,0.06);border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);position:relative;z-index:1}
.stat-cell{padding:8px;text-align:center;border-right:1px solid rgba(255,255,255,0.1)}
.stat-cell:last-child{border-right:none}
.stat-lbl{font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:rgba(255,255,255,0.6);margin-bottom:3px}
.stat-num{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:#fff}
.stat-num.red{color:#fb7185}
.stat-num.green{color:#34d399}
.stat-num.amber{color:#fbbf24}

.body{padding:14px 20px 0}

.quick-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.qa-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;background:var(--white);border-radius:12px;border:1px solid var(--border);cursor:pointer;transition:all .2s;box-shadow:var(--shadow)}
.qa-btn:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);border-color:#cbd5e1}
.qa-icon{font-size:20px}
.qa-label{font-size:9.5px;font-weight:700;color:var(--slate);text-align:center;line-height:1.2}

.card{background:var(--white);border-radius:12px;padding:12px;box-shadow:var(--shadow);border:1px solid var(--border);margin-bottom:10px;animation:fadeUp .4s ease both}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

.card-title{font-size:12px;font-weight:700;color:var(--ink);letter-spacing:-.2px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between}
.card-title-sub{font-size:9.5px;font-weight:500;color:var(--muted)}
.see-all{font-size:10px;font-weight:600;color:var(--indigo);cursor:pointer}

.info-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--faint)}
.info-row:last-child{border-bottom:none;padding-bottom:0;}
.info-icon{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}
.info-key{font-size:9.5px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--muted)}
.info-val{font-size:12px;font-weight:600;color:var(--ink);font-family:'JetBrains Mono',monospace}

.commitment-box{background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1px solid #fde68a;border-radius:10px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:all .2s}
.comm-left{display:flex;align-items:center;gap:8px}
.comm-icon{font-size:16px}
.comm-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#92400e}
.comm-date{font-size:12px;font-weight:700;color:#78350f;margin-top:1px}
.set-date-btn{background:#f59e0b;color:#fff;border:none;padding:5px 10px;border-radius:6px;font-family:'Sora',sans-serif;font-size:10px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:4px}
.set-date-btn:hover{background:#d97706}

.inv-head{display:grid;grid-template-columns:60px 1fr 70px auto;gap:6px;padding:6px 0;border-bottom:1.5px solid var(--faint)}
.inv-head span{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted)}
.inv-row{display:grid;grid-template-columns:60px 1fr 70px auto;gap:6px;padding:8px 0;border-bottom:1px solid var(--faint);transition:all .15s;cursor:pointer;align-items:center}
.inv-row:last-child{border-bottom:none;padding-bottom:0;}
.inv-row:hover{background:var(--faint);margin:0 -6px;padding:8px 6px;border-radius:8px}
.inv-date{font-size:10px;color:var(--muted);font-weight:500}
.inv-no{font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:600;color:var(--indigo)}
.inv-status{display:inline-flex;align-items:center;gap:3px;padding:2px 5px;border-radius:4px;font-size:9px;font-weight:700}
.inv-status.paid{background:var(--green-soft);color:var(--green)}
.inv-status.pending{background:var(--red-soft);color:var(--red)}
.inv-status.partial{background:var(--amber-soft);color:var(--amber)}
.inv-amt{font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:700;color:var(--ink);text-align:right}

canvas{max-height:140px; width: 100%;}

.tags-row{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.tag{padding:3px 9px;border-radius:20px;font-size:9.5px;font-weight:700;border:1px solid}
.tag.vip{background:#faf5ff;color:#7c3aed;border-color:#ddd6fe}
.tag.regular{background:#eff6ff;color:#2563eb;border-color:#bfdbfe}
.tag.new{background:#f0fdf4;color:#059669;border-color:#bbf7d0}

.bottom-bar{
  position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
  width:calc(100% - 40px);max-width:960px;
  border-radius:18px;
  background:linear-gradient(135deg,#4f46e5,#7c3aed);
  padding:16px 20px;
  display:flex;align-items:center;justify-content:center;gap:8px;
  cursor:pointer;
  box-shadow:0 10px 30px rgba(79,70,229,0.35);
  z-index:40;
}
.bottom-bar .pay-icon{font-size:18px}
.bottom-bar .pay-text{font-size:13.5px;font-weight:800;color:#fff;letter-spacing:-.2px}
.bottom-bar .pay-amt{font-family:'JetBrains Mono',monospace;font-size:13.5px;font-weight:700;color:rgba(255,255,255,0.8)}

.modal-overlay{position:fixed;inset:0;background:rgba(11,15,30,0.6);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:flex-end;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s}
.modal-overlay.open{opacity:1;pointer-events:all}
.modal{background:var(--white);border-radius:18px 18px 0 0;width:100%;max-width:440px;padding:14px 16px 24px;transform:translateY(100%);transition:transform .3s cubic-bezier(.22,1,.36,1)}
.modal-overlay.open .modal{transform:translateY(0)}
.modal-handle{width:28px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 12px}
.modal-title{font-size:14.5px;font-weight:800;color:var(--ink);margin-bottom:12px}
.modal-input{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:9px;font-family:'Sora',sans-serif;font-size:13px;color:var(--ink);outline:none;margin-bottom:10px;}
.modal-input:focus{border-color:var(--indigo);box-shadow:0 0 0 2px rgba(79,70,229,0.1)}
.modal-actions{display:flex;gap:8px;margin-top:2px}
.modal-btn{flex:1;padding:10px;border-radius:9px;font-family:'Sora',sans-serif;font-size:13px;font-weight:700;cursor:pointer;border:none;}
.modal-btn.cancel{background:var(--faint);color:var(--slate);border:1px solid var(--border)}
.modal-btn.confirm{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;}

@media (min-width: 768px) {
  .body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    align-items: start;
  }
  .quick-actions {
    grid-column: 1 / -1;
    margin-bottom: 6px;
  }
  .card {
    margin-bottom: 0;
    height: 100%;
  }
  .stats-bar {
    grid-template-columns: repeat(3, 1fr);
  }
}
            ` }} />

            <div className="shell">
                <div className="appbar">
                    <div className="appbar-brand">
                        <div className="app-icon">💼</div>
                        <div className="app-name">Business</div>
                    </div>
                    <div className="date-chip" suppressHydrationWarning><div className="date-dot"></div>{currentDate}</div>
                </div>

                <div className="cust-header">
                    <div className="ch-top">
                        <div className="back-btn" onClick={() => router.back()}>‹</div>
                        <div className="cust-avatar">{initials}</div>
                        <div className="cust-meta">
                            <div className="cust-name">{customer.name}</div>
                            <div className="cust-sub">Customer History &amp; Summary</div>
                        </div>
                        <div className="edit-btn" onClick={() => toast('Edit mode open!')}>✏️</div>
                    </div>
                    <div className="stats-bar">
                        <div className="stat-cell">
                            <div className="stat-lbl">Total Sales</div>
                            <div className="stat-num amber">{formatLakhs(totalSales)}</div>
                        </div>
                        <div className="stat-cell">
                            <div className="stat-lbl">Total Paid</div>
                            <div className="stat-num green">{formatLakhs(totalPaid)}</div>
                        </div>
                        <div className="stat-cell">
                            <div className="stat-lbl">Outstanding</div>
                            <div className="stat-num red">{formatLakhs(totalDue)}</div>
                        </div>
                    </div>
                </div>

                <div className="body">
                    <div className="quick-actions" style={{ animation: "fadeUp .3s .05s ease both" }}>
                        <a href={`tel:${customer.phone}`} className="qa-btn call" style={{ textDecoration: 'none' }}>
                            <span className="qa-icon">📞</span><span className="qa-label">Call</span>
                        </a>
                        <div className="qa-btn whatsapp" onClick={handleWhatsApp}>
                            <span className="qa-icon">💬</span><span className="qa-label">WhatsApp</span>
                        </div>
                        <a href={`sms:${customer.phone}?body=${encodeURIComponent('Hi ' + customer.name + ', \n\nPlease clear your outstanding balance of ₹' + totalDue)}`} className="qa-btn sms" style={{ textDecoration: 'none' }}>
                            <span className="qa-icon">✉️</span><span className="qa-label">Send SMS</span>
                        </a>
                        <div className="qa-btn statement" onClick={handleDownloadStatement}>
                            <span className="qa-icon">📄</span><span className="qa-label">Statement</span>
                        </div>
                    </div>

                    <div className="card" style={{ animationDelay: ".1s" }}>
                        <div className="card-title">
                            Basic Information
                            <span className="card-title-sub">Customer profile</span>
                        </div>
                        <div className="info-row">
                            <div className="info-icon" style={{ background: "#eff6ff" }}>📱</div>
                            <div><div className="info-key">Phone</div><div className="info-val">{customer.phone}</div></div>
                        </div>
                        <div className="info-row">
                            <div className="info-icon" style={{ background: "#f0fdf4" }}>✉️</div>
                            <div><div className="info-key">Email</div><div className="info-val" style={{ fontFamily: "'Sora',sans-serif", fontSize: "13px" }}>{customer.email || 'customer@email.com'}</div></div>
                        </div>
                        <div className="info-row">
                            <div className="info-icon" style={{ background: "#faf5ff" }}>🏢</div>
                            <div><div className="info-key">GSTIN</div><div className="info-val">{customer.gstin || '—'}</div></div>
                        </div>
                        <div className="info-row">
                            <div className="info-icon" style={{ background: "#fff7ed" }}>📍</div>
                            <div><div className="info-key">Address</div><div className="info-val" style={{ fontFamily: "'Sora',sans-serif", fontSize: "12.5px", fontWeight: 600 }}>{customer.address || "—"}</div></div>
                        </div>
                        <div className="tags-row">
                            {customer.tag && customer.tag.toLowerCase().includes('vip') ? <span className="tag vip">⭐ VIP</span> : <span className="tag regular">🔁 Regular</span>}
                            <span className="tag new">🆕 2024 Customer</span>
                        </div>
                    </div>

                    <div className="card" style={{ animationDelay: ".15s" }}>
                        <div className="card-title">Payment Commitment</div>
                        <div className="commitment-box" onClick={() => setShowPromiseModal(true)}>
                            <div className="comm-left">
                                <span className="comm-icon">📅</span>
                                <div>
                                    <div className="comm-title">Next Payment Promise</div>
                                    <div className="comm-date">{commitDateStr}</div>
                                </div>
                            </div>
                            <button className="set-date-btn">📌 Set Date</button>
                        </div>
                    </div>

                    <div className="card" style={{ animationDelay: ".2s" }}>
                        <div className="card-title">
                            Payment Trend
                            <span className="see-all" onClick={() => toast('Full chart view open!')}>6 months →</span>
                        </div>
                        <div style={{ position: 'relative', height: '180px', width: '100%' }}>
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>

                    <div className="card" style={{ animationDelay: ".25s" }}>
                        <div className="card-title">
                            Invoice History
                            <span className="see-all" onClick={() => toast('All invoices dekh rahe hain…')}>See All →</span>
                        </div>
                        <div className="inv-head">
                            <span>Date</span><span>Invoice No.</span><span>Status</span><span style={{ textAlign: "right" }}>Amount</span>
                        </div>
                        <div>
                            {customerInvoices.slice(0, 5).map((inv: any) => (
                                <div className="inv-row" key={inv.id} onClick={() => router.push(`/dashboard/invoices?search=${inv.invoice_number}`)}>
                                    <div className="inv-date">{new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                    <div className="inv-no">{inv.invoice_number}</div>
                                    <div>
                                        <span className={`inv-status ${inv.status === 'PAID' ? 'paid' : inv.status === 'PARTIAL' ? 'partial' : 'pending'}`}>
                                            {inv.status === 'PAID' ? '✓ Paid' : inv.status === 'PARTIAL' ? '◑ Partial' : '⚠ Pending'}
                                        </span>
                                    </div>
                                    <div className="inv-amt">₹{Number(inv.total_amount).toLocaleString('en-IN')}</div>
                                </div>
                            ))}
                            {customerInvoices.length === 0 && <div className="p-4 text-center text-xs font-bold text-slate-400">No invoices yet</div>}
                        </div>
                    </div>

                    <div className="card" style={{ animationDelay: ".3s" }}>
                        <div className="card-title">Recent Payments</div>
                        <div>
                            {combinedPayments.length === 0 && <div className="p-4 text-center text-xs font-bold text-slate-400">No recent payments</div>}
                            {combinedPayments.map((p: any, i: number) => (
                                <div className="info-row" key={i}>
                                    <div className="info-icon" style={{ background: "var(--green-soft)" }}>💚</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>{p.amt}</div>
                                        <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 500 }}>{p.mode} · {p.date}{p.note ? ' · ' + p.note : ''}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="bottom-bar" onClick={() => setShowPaymentModal(true)}>
                    <span className="pay-icon">💳</span>
                    <span className="pay-text">Receive Payment</span>
                    <span className="pay-amt">₹{totalDue.toLocaleString('en-IN')}</span>
                </div>
            </div>

            <div className={`modal-overlay ${showPaymentModal ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}>
                <div className="modal">
                    <div className="modal-handle"></div>
                    <div className="modal-title">💳 Receive Payment</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "var(--muted)", marginBottom: "7px" }}>Amount (₹)</div>
                    <input className="modal-input" type="number" placeholder="Enter amount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                    <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "var(--muted)", marginBottom: "7px" }}>Payment Mode</div>
                    <select className="modal-input" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                        <option>Cash</option><option>UPI / GPay</option><option>Bank Transfer</option><option>Cheque</option>
                    </select>
                    <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "var(--muted)", marginBottom: "7px" }}>Note (Optional)</div>
                    <input className="modal-input" type="text" placeholder="Add a note…" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} />
                    <div className="modal-actions">
                        <button className="modal-btn cancel" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                        <button className="modal-btn confirm" onClick={handlePayment}>✓ Confirm</button>
                    </div>
                </div>
            </div>

            <div className={`modal-overlay ${showPromiseModal ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowPromiseModal(false); }}>
                <div className="modal">
                    <div className="modal-handle"></div>
                    <div className="modal-title">📅 Set Payment Date</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "var(--muted)", marginBottom: "7px" }}>Promise Date</div>
                    <input className="modal-input" type="date" value={promiseDate} onChange={(e) => setPromiseDate(e.target.value)} />
                    <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "var(--muted)", marginBottom: "7px" }}>Note</div>
                    <input className="modal-input" type="text" placeholder="Customer ne kab bolaya…" value={promiseNote} onChange={(e) => setPromiseNote(e.target.value)} />
                    <div className="modal-actions">
                        <button className="modal-btn cancel" onClick={() => setShowPromiseModal(false)}>Cancel</button>
                        <button className="modal-btn confirm" onClick={setCommitment}>✓ Set Date</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

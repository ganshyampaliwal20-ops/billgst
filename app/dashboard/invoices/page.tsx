"use client";

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../../lib/store';
import { generateInvoicePDF } from '../../../lib/pdf-generator';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../../lib/utils';
import { getVisitingCardText } from '../../../lib/whatsapp-utils';
import { translations } from '../../../lib/translations';
import { useRouter } from 'next/navigation';
import {
    FaFilePdf, FaWhatsapp, FaTrash, FaCopy, FaEye
} from 'react-icons/fa';

export default function InvoicesPage() {
    const router = useRouter();

    // Global Store
    const invoices = useStore((state: any) => state.invoices) || [];
    const deleteInvoice = useStore((state: any) => state.deleteInvoice);
    const businessProfile = useStore((state: any) => state.businessProfile) || {};
    const fetchInvoices = useStore((state: any) => state.fetchInvoices);
    const settings = useStore((state: any) => state.settings) || { language: 'en' };
    
    const t = (translations as any)[settings?.language || 'en'] || translations.en;
    const isHi = settings?.language === 'hi';

    // Local State
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
    const [isScrolled, setIsScrolled] = useState(false);
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // Payment Recording State
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (fetchInvoices) fetchInvoices(false, 1);

        const handleScroll = () => {
            if (window.scrollY > 120) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [fetchInvoices]);

    const safeInvoices = Array.isArray(invoices) ? invoices.filter(i => i && typeof i === 'object') : [];
    
    // Filtering & Sorting Logic
    const filteredInvoices = safeInvoices.filter((inv: any) => {
        const customerName = (inv?.customer?.name || '').toLowerCase();
        const invoiceNumber = (inv?.invoice_number || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        const matchesSearch = customerName.includes(term) || invoiceNumber.includes(term);

        if (!matchesSearch) return false;
        if (activeTab === 'u' && (inv.status || 'UNPAID').toUpperCase() !== 'UNPAID') return false;
        if (activeTab === 'p' && (inv.status || '').toUpperCase() !== 'PARTIAL') return false;
        if (activeTab === 'd' && (inv.status || '').toUpperCase() !== 'PAID') return false;

        return true;
    }).sort((a: any, b: any) => {
        if (sortOrder === 'amount-high') return Number(b.total_amount) - Number(a.total_amount);
        if (sortOrder === 'amount-low') return Number(a.total_amount) - Number(b.total_amount);
        if (sortOrder === 'name') return (a.customer?.name || '').localeCompare(b.customer?.name || '');
        // default newest
        const dateA = new Date(a.created_at || a.invoice_date).getTime();
        const dateB = new Date(b.created_at || b.invoice_date).getTime();
        return dateB - dateA;
    });

    const groupedInvoices = useMemo(() => {
        return Object.values(
            filteredInvoices.reduce((acc: any, inv: any) => {
                const key = inv.customer?.phone || inv.customer?.name || 'Local Sale';
                if (!acc[key]) {
                    acc[key] = {
                        customer: inv.customer,
                        invoices: [],
                        totalAmount: 0,
                        dueAmount: 0,
                        statusCount: { paid: 0, unpaid: 0, partial: 0 }
                    };
                }
                acc[key].invoices.push(inv);
                acc[key].totalAmount += Number(inv.total_amount || 0);
                const pAmount = Number(inv.paid_amount || 0);
                acc[key].dueAmount += (Number(inv.total_amount || 0) - pAmount);
                
                const st = (inv.status || 'UNPAID').toLowerCase();
                if (st === 'paid') acc[key].statusCount.paid++;
                else if (st === 'partial') acc[key].statusCount.partial++;
                else acc[key].statusCount.unpaid++;
                
                return acc;
            }, {})
        );
    }, [filteredInvoices]);

    const toggleCustomer = (key: string) => {
        setExpandedCustomers(prev => ({...prev, [key]: !prev[key]}));
    };

    // KPI Counters
    const kpiData = {
        total: safeInvoices.length,
        paid: safeInvoices.filter(i => (i.status || '').toUpperCase() === 'PAID').length,
        unpaid: safeInvoices.filter(i => (i.status || 'UNPAID').toUpperCase() === 'UNPAID').length,
        partial: safeInvoices.filter(i => (i.status || '').toUpperCase() === 'PARTIAL').length,
        receivable: safeInvoices.reduce((acc, i) => acc + (Number(i.total_amount) - Number(i.paid_amount || 0)), 0),
        totalBilled: safeInvoices.reduce((acc, i) => acc + Number(i.total_amount), 0)
    };

    const collectionRate = kpiData.totalBilled > 0 ? Math.round(((kpiData.totalBilled - kpiData.receivable) / kpiData.totalBilled) * 100) : 0;
    const uniqueCustomers = new Set(safeInvoices.map(i => i.customer?.phone || i.customer?.name)).size;
    const avgInvoice = kpiData.total > 0 ? Math.round(kpiData.totalBilled / kpiData.total) : 0;

    // Handlers
    const handleDelete = async (invoice: any) => {
        if (window.confirm(`Delete Invoice #${invoice.invoice_number}?`)) {
            try {
                await deleteInvoice(invoice.id);
                toast.success('Invoice deleted');
                setSelectedInvoice(null);
            } catch (err) { toast.error('Delete failed'); }
        }
    };

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        try {
            await fetchInvoices(true, nextPage);
            setPage(nextPage);
        } catch(e) {
            console.error(e);
        }
        setIsLoadingMore(false);
    };

    const handleDownload = async (invoice: any) => {
        const toastId = toast.loading('Generating PDF...');
        try {
            await generateInvoicePDF(invoice, businessProfile);
            toast.success('PDF Downloaded', { id: toastId });
        } catch (error) { toast.error('PDF Error', { id: toastId }); }
    };

    const handleWhatsApp = async (invoice: any, e: any) => {
        if(e) e.stopPropagation();
        const phone = (invoice.customer?.phone || '').replace(/\D/g, '');
        if (!phone) {
            toast.error('Pahle customer ka mobile number add karein.', { icon: '📱' });
            return;
        }

        const toastId = toast.loading('WhatsApp ke liye PDF ban raha hai...');
        try {
            const doc = await generateInvoicePDF(invoice, businessProfile, false);
            if (!doc) {
                toast.error('PDF Generate fail!', { id: toastId });
                return;
            }

            const pdfBlob = doc.output('blob');
            const fileName = `Invoice_${invoice.invoice_number || '001'}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
            
            let text = `Hi ${invoice.customer?.name || 'Customer'},\n\nYour invoice *#${invoice.invoice_number}* for *${formatCurrency(invoice.total_amount)}* is ready.\n\nRegards,\n${businessProfile.name}`;
            text += getVisitingCardText(businessProfile);
            
            if (navigator.canShare && navigator.canShare({ files: [file] }) && /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                try {
                    await navigator.share({
                        files: [file],
                        title: fileName,
                        text: text
                    });
                    toast.success('WhatsApp par share open ho gaya!', { id: toastId });
                    return;
                } catch (e) {
                    console.log('Share cancelled', e);
                }
            }

            const formData = new FormData();
            formData.append('phone', phone);
            formData.append('message', text);
            formData.append('file', file);

            const res = await fetch('/api/whatsapp/send-media', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                toast.success('WhatsApp Bot ne PDF bhej diya! ✅', { id: toastId });
            } else {
                toast.dismiss(toastId);
                window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank');
            }
        } catch (error) {
            toast.error('WhatsApp Share Error', { id: toastId });
        }
    };

    const handleRecordPayment = async () => {
        if(!paymentAmount || isNaN(Number(paymentAmount))) return;
        const amountToAdd = Number(paymentAmount);
        if(amountToAdd <= 0) return;
        
        setIsSubmittingPayment(true);
        const currentPaid = Number(selectedInvoice.paid_amount || 0);
        const totalAmount = Number(selectedInvoice.total_amount);
        let newPaid = currentPaid + amountToAdd;
        if(newPaid > totalAmount) newPaid = totalAmount;
        
        let newStatus = 'PARTIAL';
        if(newPaid >= totalAmount) newStatus = 'PAID';
        
        const toastId = toast.loading('Recording payment...');
        try {
            const payload = {
                id: selectedInvoice.id,
                paid_amount: newPaid,
                status: newStatus
            };
            const res = await fetch('/api/invoices', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if(res.ok) {
                toast.success('Payment recorded successfully', { id: toastId });
                if(fetchInvoices) fetchInvoices(true);
                setSelectedInvoice(null);
                setPaymentAmount('');
            } else {
                toast.error('Failed to record payment', { id: toastId });
            }
        } catch(e) {
            toast.error('Error recording payment', { id: toastId });
        }
        setIsSubmittingPayment(false);
    };

    const handleBulkReminder = async () => {
        const dueInvoices = filteredInvoices.filter((i:any) => ['unpaid', 'partial'].includes((i.status || 'unpaid').toLowerCase()));
        
        if(dueInvoices.length === 0) {
            toast.error('Koi pending invoice nahi hai!');
            return;
        }
        
        const toastId = toast.loading('Sending bulk reminders...');
        
        // Group by customer to send only ONE message per customer
        const customerDues: Record<string, { name: string, phone: string, invoices: string[], totalDue: number }> = {};
        
        for (const inv of dueInvoices) {
            const phone = (inv.customer?.phone || '').replace(/\D/g, '');
            if (!phone || phone.length < 10) continue;
            
            const dueAmount = Number(inv.total_amount) - Number(inv.paid_amount || 0);
            if (dueAmount <= 0) continue;
            
            if (!customerDues[phone]) {
                customerDues[phone] = {
                    name: inv.customer?.name || 'Customer',
                    phone: phone,
                    invoices: [],
                    totalDue: 0
                };
            }
            customerDues[phone].invoices.push(inv.invoice_number);
            customerDues[phone].totalDue += dueAmount;
        }
        
        const customersToRemind = Object.values(customerDues);
        if (customersToRemind.length === 0) {
            toast.dismiss(toastId);
            toast.error('Koi valid phone number nahi mila!');
            return;
        }

        let success = 0;
        for (const cust of customersToRemind) {
            const invList = cust.invoices.join(', #');
            let text = `Namaste ${cust.name},\n\nAapke Invoices (#${invList}) ka total balance *${formatCurrency(cust.totalDue)}* due hai. Kripya samay par pay karein.\n\nRegards,\n${businessProfile?.name || 'BillGST'}`;
            
            const formData = new FormData();
            formData.append('phone', cust.phone);
            formData.append('message', text);
            
            try {
                const res = await fetch('/api/whatsapp/send-media', {
                    method: 'POST',
                    body: formData
                });
                if(res.ok) success++;
            } catch(e) { }
        }
        
        toast.success(`${success} customers ko reminder bhej diya!`, { id: toastId });
    };

    const handleExportExcel = async () => {
        try {
            const toastId = toast.loading('Generating Excel file...');
            const XLSX = await import('xlsx');
            const data = filteredInvoices.map((inv: any) => ({
                'Invoice No': inv.invoice_number,
                'Date': new Date(inv.invoice_date || inv.created_at).toLocaleDateString(),
                'Customer Name': inv.customer?.name || 'Local Sale',
                'Customer Phone': inv.customer?.phone || '',
                'Total Amount (Rs)': Number(inv.total_amount),
                'Paid Amount (Rs)': Number(inv.paid_amount || 0),
                'Balance Due (Rs)': Number(inv.total_amount) - Number(inv.paid_amount || 0),
                'Status': inv.status || 'UNPAID'
            }));
            
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
            XLSX.writeFile(workbook, "Invoices_Export.xlsx");
            toast.success("Excel file downloaded!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to export Excel");
        }
    };

    if (!isClient) return <div style={{ background: '#f5f6fa', minHeight: '100vh' }} />;

    return (
        <div className="new-invoice-page">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                
                .new-invoice-page {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background: #f5f6fa;
                    color: #111827;
                    min-height: 100vh;
                    font-size: 14px;
                    padding-bottom: 80px;
                }

                .topbar {
                    background: #4338ca;
                    padding: 10px 24px;
                    min-height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .topbar-left { display: flex; align-items: center; gap: 12px; }
                .topbar-logo { width: 34px; height: 34px; border-radius: 9px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px; }
                .topbar-name { color: #fff; font-size: 15px; font-weight: 600; }
                .topbar-tag { color: rgba(255,255,255,0.65); font-size: 11px; background: rgba(255,255,255,0.12); padding: 2px 8px; border-radius: 20px; }
                .topbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
                .tb-btn { background: rgba(255,255,255,0.13); border: none; border-radius: 8px; color: #fff; padding: 7px 13px; font-size: 13px; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s; }
                .tb-btn:hover { background: rgba(255,255,255,0.22); }
                .tb-btn.primary { background: #fff; color: #4338ca; font-weight: 600; }
                .tb-btn.primary:hover { background: #eef2ff; }
                
                .content { padding: 24px; max-width: 100%; }

                .page-header { display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px; text-align: center; }
                .page-title { font-size: 20px; font-weight: 600; }
                .page-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
                .reminder-btn { background: #25d366; border: none; border-radius: 8px; color: #fff; padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: background 0.15s; }
                .reminder-btn:hover { background: #1ebe5d; }

                .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
                .stat-card { background: #ffffff; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08); padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all 0.2s; }
                .stat-card.active-card { border-color: #4338ca; background: #eef2ff; box-shadow: 0 4px 6px rgba(67,56,202,0.1); transform: translateY(-2px); }
                .stat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
                .stat-icon.blue { background: #eef2ff; color: #4338ca; }
                .stat-icon.green { background: #f0fdf4; color: #16a34a; }
                .stat-icon.red { background: #fef2f2; color: #dc2626; }
                .stat-icon.amber { background: #fffbeb; color: #d97706; }
                .stat-label { font-size: 11px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
                .stat-val { font-size: 28px; font-weight: 600; line-height: 1; }
                .stat-val.blue { color: #4338ca; }
                .stat-val.green { color: #16a34a; }
                .stat-val.red { color: #dc2626; }
                .stat-val.amber { color: #d97706; }
                .stat-footer { font-size: 11px; color: #9ca3af; margin-top: 5px; }

                .recv-banner { background: #4338ca; border-radius: 12px; padding: 18px 22px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
                .recv-label { color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .recv-val { color: #fff; font-size: 32px; font-weight: 700; line-height: 1; }
                .recv-sub { color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px; }
                .recv-pills { display: flex; gap: 10px; flex-wrap: wrap; }
                .recv-pill { background: rgba(255,255,255,0.13); border-radius: 8px; padding: 8px 16px; text-align: center; }
                .recv-pill-val { color: #fff; font-size: 18px; font-weight: 600; line-height: 1; }
                .recv-pill-label { color: rgba(255,255,255,0.65); font-size: 11px; margin-top: 3px; }

                .toolbar { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
                .search-sort-row { display: flex; gap: 10px; width: 100%; align-items: center; }
                .search-wrap { flex: 1; position: relative; }
                .search-wrap input { width: 100%; padding: 8px 10px 8px 16px; border: 1px solid rgba(0,0,0,0.13); border-radius: 8px; font-size: 13px; font-family: inherit; background: #f8f9fc; color: #111827; outline: none; }
                .search-wrap input:focus { border-color: #4338ca; background: #fff; }
                .sort-select { padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.13); background: #f8f9fc; font-size: 13px; color: #6b7280; outline: none; cursor: pointer; flex-shrink: 0; }
                
                .filter-tabs { display: flex; flex-wrap: wrap; gap: 4px; width: 100%; }
                .tab { padding: 7px 13px; border-radius: 8px; font-size: 13px; cursor: pointer; border: 1px solid rgba(0,0,0,0.13); background: #f8f9fc; color: #6b7280; font-weight: 500; transition: all 0.12s; white-space: nowrap; }
                .tab:hover:not(.active) { background: #f5f6fa; color: #111827; }
                .tab.active { background: #4338ca; color: #fff; border-color: #4338ca; }

                .invoice-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
                
                .customer-group { border-bottom: 1px solid rgba(0,0,0,0.08); }
                .customer-group:last-child { border-bottom: none; }
                .customer-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; cursor: pointer; transition: background 0.1s; gap: 10px; }
                .customer-row:hover { background: #fafbff; }
                .cust-left { display: flex; align-items: center; gap: 10px; flex: 1; }
                .cust-right { display: flex; align-items: center; gap: 16px; text-align: right; }
                
                .invoices-container { background: #f8f9fc; padding: 0; border-top: 1px solid rgba(0,0,0,0.05); }
                .table-header { display: grid; grid-template-columns: 1.5fr 1fr 1fr 90px; gap: 8px; padding: 10px 16px; border-bottom: 1px solid rgba(0,0,0,0.08); font-size: 11px; font-weight: 600; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; }
                .invoice-row { display: grid; grid-template-columns: 1.5fr 1fr 1fr 90px; gap: 8px; padding: 13px 16px; border-bottom: 1px solid rgba(0,0,0,0.08); align-items: center; cursor: pointer; transition: background 0.1s; }
                .invoice-row:last-child { border-bottom: none; }
                .invoice-row:hover { background: #eef2ff; }

                .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
                .av-1 { background: #ede9fe; color: #5b21b6; }
                .av-2 { background: #dbeafe; color: #1d4ed8; }
                .av-3 { background: #dcfce7; color: #15803d; }
                .av-4 { background: #fef3c7; color: #b45309; }
                .av-5 { background: #fce7f3; color: #9d174d; }
                .cust-name { font-size: 14px; font-weight: 600; color: #111827; }
                .cust-phone { font-size: 12px; color: #6b7280; }

                .inv-count { font-size: 13px; color: #6b7280; font-weight: 500; }
                .amount-val { font-size: 14px; font-weight: 600; color: #111827; }
                .amount-due { font-size: 11px; color: #9ca3af; margin-top: 2px; }

                .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
                .badge-unpaid { background: #fef2f2; color: #dc2626; }
                .badge-paid { background: #f0fdf4; color: #16a34a; }
                .badge-partial { background: #fffbeb; color: #d97706; }

                .row-actions { display: flex; gap: 6px; }
                .act-btn { width: 30px; height: 30px; border-radius: 7px; border: 1px solid rgba(0,0,0,0.13); background: #ffffff; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.12s; }
                .act-btn:hover { background: #eef2ff; color: #4338ca; border-color: #4338ca; }
                .act-btn svg { width: 14px; height: 14px; }
                .act-btn.wa:hover { background: #f0fdf4; color: #16a34a; border-color: #16a34a; }

                .table-footer { padding: 12px 16px; background: #f8f9fc; border-top: 1px solid rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #6b7280; flex-wrap: wrap; gap: 8px; }
                .export-btn { background: none; border: 1px solid rgba(0,0,0,0.13); border-radius: 8px; padding: 5px 12px; font-size: 12px; color: #4338ca; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.12s; }
                .export-btn:hover { background: #eef2ff; }

                .modal-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: flex-end; }
                .modal-sheet { background: #ffffff; width: 100%; border-radius: 24px 24px 0 0; padding: 2rem 1.25rem; transform: translateY(0); animation: slideUp 0.3s ease; max-height: 90vh; overflow-y: auto;}
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .btn-action { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px; border-radius: 12px; background: #f8f9fc; border: 1px solid rgba(0,0,0,0.08); color: #111827; cursor: pointer; font-size: 11px; font-weight: 600; }
                .btn-action:hover { background: rgba(0,0,0,0.04); }

                .plus-btn {
                    background: #4338ca; color: #fff; border: none; border-radius: 8px; width: 34px; height: 34px; 
                    font-size: 24px; font-weight: 500; display: flex; align-items: center; justify-content: center; 
                    cursor: pointer; flex-shrink: 0; line-height: 1; transition: background 0.2s;
                }
                .plus-btn:hover { background: #3730a3; }

                .fab-animated {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%) translateY(150px);
                    background: #4338ca;
                    color: #fff;
                    padding: 14px 32px;
                    border-radius: 30px;
                    font-size: 16px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 6px 16px rgba(67,56,202,0.4);
                    z-index: 1000;
                    cursor: pointer;
                    border: none;
                    width: max-content;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .fab-animated.show {
                    transform: translateX(-50%) translateY(0);
                }

                @media (max-width: 700px) {
                    .topbar { padding: 10px 16px; }
                    .tb-btn { display: none; } /* Hide right topbar btn */
                    .topbar-name { font-size: 14px; }
                    .topbar-tag { display: none; }

                    .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 6px; }
                    .stat-card { padding: 8px 4px; border-radius: 8px; }
                    .stat-icon { width: 24px; height: 24px; margin: 0 auto 4px; border-radius: 6px; }
                    .stat-icon svg { width: 14px; height: 14px; }
                    .stat-label { font-size: 9px; text-align: center; margin-bottom: 2px; letter-spacing: 0; }
                    .stat-val { font-size: 16px; text-align: center; }
                    .stat-footer { display: none; }
                    
                    .recv-pills { display: none; }
                    .content { padding: 12px; padding-bottom: 80px; }

                    .search-sort-row { flex-wrap: nowrap; gap: 6px; width: 100%; display: flex; align-items: center; }
                    .search-wrap { flex: 1; min-width: 0; }
                    .search-wrap input { font-size: 12px; padding: 6px 10px; width: 100%; min-width: 0; }
                    .sort-select { font-size: 11px; padding: 6px 8px; max-width: 90px; flex-shrink: 0; }
                    .plus-btn { width: 32px; height: 32px; font-size: 20px; flex-shrink: 0; }

                    .filter-tabs { flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 4px; gap: 4px; }
                    .filter-tabs::-webkit-scrollbar { display: none; }
                    .tab { padding: 5px 8px; font-size: 11px; flex-shrink: 0; }
                    
                    .cust-right > div:first-child { display: none; }
                    .table-header, .invoice-row { grid-template-columns: 1fr 1fr 80px; }
                    .table-header span:nth-child(3), .invoice-row > div:nth-child(3) { display: none; }
                }
            ` }} />



            <div className="content">
                {/* PAGE HEADER */}
                <div className="page-header">
                    <div>
                        <div className="page-title">{t.manageInvoices || 'Manage Invoices'}</div>
                        <div className="page-sub">{t.invoiceSubtext || 'Track payments · Reminders · Analytics'}</div>
                    </div>
                </div>

                {/* STATS */}
                <div className="stats-grid">
                    <div className={`stat-card ${activeTab === 'all' ? 'active-card' : ''}`} onClick={() => setActiveTab('all')} style={{cursor: 'pointer'}}>
                        <div className="stat-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
                        <div className="stat-label">{t.totalInvoices || 'Total Invoices'}</div>
                        <div className="stat-val blue">{kpiData.total}</div>
                        <div className="stat-footer">{isHi ? 'Is mahine' : 'This month'}</div>
                    </div>
                    <div className={`stat-card ${activeTab === 'd' ? 'active-card' : ''}`} onClick={() => setActiveTab('d')} style={{cursor: 'pointer'}}>
                        <div className="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div>
                        <div className="stat-label">{t.amountReceived || 'Paid Full'}</div>
                        <div className="stat-val green">{kpiData.paid}</div>
                        <div className="stat-footer">{formatCurrency(kpiData.totalBilled - kpiData.receivable)} {isHi ? 'Jama hua' : 'Collected'}</div>
                    </div>
                    <div className={`stat-card ${activeTab === 'u' ? 'active-card' : ''}`} onClick={() => setActiveTab('u')} style={{cursor: 'pointer'}}>
                        <div className="stat-icon red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                        <div className="stat-label">{t.due || 'Unpaid'}</div>
                        <div className="stat-val red">{kpiData.unpaid}</div>
                        <div className="stat-footer">{isHi ? 'Follow up karo' : 'Follow up'}</div>
                    </div>
                    <div className={`stat-card ${activeTab === 'p' ? 'active-card' : ''}`} onClick={() => setActiveTab('p')} style={{cursor: 'pointer'}}>
                        <div className="stat-icon amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                        <div className="stat-label">{isHi ? 'Aadha Jama' : 'Partial'}</div>
                        <div className="stat-val amber">{kpiData.partial}</div>
                        <div className="stat-footer">{t.balanceAmount || 'Balance baaki'}</div>
                    </div>
                </div>

                {/* RECEIVABLE BANNER */}
                <div className="recv-banner">
                    <div>
                        <div className="recv-label">💰 {t.totalDueLabel || 'Total Receivable'}</div>
                        <div className="recv-val">{formatCurrency(kpiData.receivable)}</div>
                        <div className="recv-sub">{kpiData.unpaid + kpiData.partial} {isHi ? 'invoices pending · Abhi update hua' : 'invoices pending · Just updated'}</div>
                    </div>
                    <div className="recv-pills">
                        <div className="recv-pill">
                            <div className="recv-pill-val">{collectionRate}%</div>
                            <div className="recv-pill-label">{isHi ? 'Vasuli Dar' : 'Collection Rate'}</div>
                        </div>
                        <div className="recv-pill">
                            <div className="recv-pill-val">{uniqueCustomers}</div>
                            <div className="recv-pill-label">{t.customers || 'Customers'}</div>
                        </div>
                        <div className="recv-pill">
                            <div className="recv-pill-val">{formatCurrency(avgInvoice)}</div>
                            <div className="recv-pill-label">{isHi ? 'Ausat Bill' : 'Avg Invoice'}</div>
                        </div>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="toolbar">
                    <div className="search-sort-row">
                        <div className="search-wrap">
                            <input 
                                type="text" 
                                placeholder={isHi ? 'Search karein...' : 'Search customer or invoice...'} 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select className="sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="newest">{isHi ? 'Naya pehle' : 'Newest'}</option>
                            <option value="amount-high">{isHi ? 'Zyada amount' : 'High Amount'}</option>
                            <option value="amount-low">{isHi ? 'Kam amount' : 'Low Amount'}</option>
                            <option value="name">{isHi ? 'Naam A–Z' : 'Name A–Z'}</option>
                        </select>
                        <button className="plus-btn" onClick={() => router.push('/dashboard/invoices/new')}>+</button>
                    </div>
                    <div className="filter-tabs">
                        <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>{t.all || 'All'} ({kpiData.total})</div>
                        <div className={`tab ${activeTab === 'u' ? 'active' : ''}`} onClick={() => setActiveTab('u')}>{t.due || 'Unpaid'} ({kpiData.unpaid})</div>
                        <div className={`tab ${activeTab === 'p' ? 'active' : ''}`} onClick={() => setActiveTab('p')}>{isHi ? 'Aadha' : 'Partial'} ({kpiData.partial})</div>
                        <div className={`tab ${activeTab === 'd' ? 'active' : ''}`} onClick={() => setActiveTab('d')}>{t.amountReceived || 'Paid'} ({kpiData.paid})</div>
                    </div>
                </div>

                {/* INVOICE TABLE GROUPED BY CUSTOMER */}
                <div className="invoice-card">
                    {groupedInvoices.map((group: any, idx: number) => {
                        const key = group.customer?.phone || group.customer?.name || `local-${idx}`;
                        const isExpanded = expandedCustomers[key];
                        const avatarClass = `av-${(idx % 5) + 1}`;
                        const firstChar = group.customer?.name ? group.customer.name.charAt(0).toUpperCase() : '#';
                        
                        return (
                            <div key={key} className="customer-group">
                                <div className="customer-row" onClick={() => toggleCustomer(key)}>
                                    <div className="cust-left">
                                        <div className={`avatar ${avatarClass}`}>{firstChar}</div>
                                        <div>
                                            <div className="cust-name">{group.customer?.name || 'Local Sale'}</div>
                                            <div className="cust-phone" style={{ color: !group.customer?.phone ? '#9ca3af' : '' }}>
                                                {group.customer?.phone ? `📞 ${group.customer.phone}` : 'No phone'} &middot; {group.invoices.length} invoices
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cust-right">
                                        <div>
                                            <div className="amount-val">{formatCurrency(group.totalAmount)}</div>
                                            <div className="amount-due" style={{ color: group.dueAmount > 0 ? '#dc2626' : '#16a34a', fontWeight: group.dueAmount > 0 ? 600 : 'normal' }}>
                                                {group.dueAmount > 0 ? `Due: ${formatCurrency(group.dueAmount)}` : 'All Paid'}
                                            </div>
                                        </div>
                                        <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#6b7280' }}>
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                                        </div>
                                    </div>
                                </div>
                                
                                {isExpanded && (
                                    <div className="invoices-container">
                                        <div className="table-header">
                                            <span>Bill No</span>
                                            <span>Amount</span>
                                            <span>Status</span>
                                            <span>Actions</span>
                                        </div>
                                        {group.invoices.map((inv: any) => {
                                            const status = (inv.status || 'UNPAID').toLowerCase();
                                            let badgeClass = 'badge-unpaid';
                                            let statusText = t.due || 'Unpaid';
                                            if (status === 'paid') { badgeClass = 'badge-paid'; statusText = t.amountReceived || 'Paid'; }
                                            if (status === 'partial') { badgeClass = 'badge-partial'; statusText = isHi ? 'Aadha' : 'Partial'; }
                                            
                                            return (
                                                <div className="invoice-row" key={inv.id} onClick={() => setSelectedInvoice(inv)}>
                                                    <div className="inv-count">#{inv.invoice_number}</div>
                                                    <div>
                                                        <div className="amount-val">{formatCurrency(inv.total_amount)}</div>
                                                    </div>
                                                    <div><span className={`badge ${badgeClass}`}>{statusText}</span></div>
                                                    <div className="row-actions" onClick={e => e.stopPropagation()}>
                                                        <button className="act-btn wa" title="WhatsApp reminder" onClick={(e) => handleWhatsApp(inv, e)}>
                                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                                        </button>
                                                        <button className="act-btn" title="View invoice" onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); }}>
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {groupedInvoices.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                            Koi invoice nahi mila.
                        </div>
                    )}

                    <div className="table-footer">
                        <span>{filteredInvoices.length} invoices &middot; {formatCurrency(kpiData.receivable)} total pending</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button className="reminder-btn" onClick={handleBulkReminder} style={{ padding: '5px 12px', fontSize: '12px' }}>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                Bulk Reminder
                            </button>
                            <button className="export-btn" onClick={handleExportExcel}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
                                Excel Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Centered Load More Button */}
                {safeInvoices.length >= 20 && safeInvoices.length % 20 === 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <button 
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            style={{ 
                                padding: '10px 24px', fontSize: '14px', fontWeight: 600, 
                                borderRadius: '8px', background: '#eef2ff', color: '#4338ca', 
                                border: '1px solid rgba(67,56,202,0.2)', cursor: isLoadingMore ? 'not-allowed' : 'pointer', transition: 'background 0.2s'
                            }}
                        >
                            {isLoadingMore ? (isHi ? 'Load ho raha hai...' : 'Loading...') : (isHi ? 'Aur Invoices Dekhein' : 'Load More Old Invoices')}
                        </button>
                    </div>
                )}

                {/* Centered New Invoice Button below Table Footer */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', paddingBottom: '20px' }}>
                    <button 
                        onClick={() => router.push('/dashboard/invoices/new')} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            padding: '16px 36px', fontSize: '16px', fontWeight: 600, 
                            borderRadius: '30px', background: '#4338ca', color: '#fff', 
                            border: 'none', cursor: 'pointer', boxShadow: '0 6px 16px rgba(67,56,202,0.3)' 
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        {t.newInvoice || 'Create New Invoice'}
                    </button>
                </div>
            </div>

            {selectedInvoice && (
                <div className="modal-ov" onClick={() => setSelectedInvoice(null)}>
                    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                        <div style={{ width: '40px', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', margin: '0 auto 1.5rem' }} />
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Invoice #{selectedInvoice.invoice_number}</div>
                            <div style={{ fontSize: '24px', fontWeight: 800 }}>{formatCurrency(selectedInvoice.total_amount)}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>{selectedInvoice.customer?.name}</div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="btn-action" onClick={(e) => handleWhatsApp(selectedInvoice, e)}>
                                <FaWhatsapp size={20} color="#16a34a" />
                                WhatsApp
                            </button>
                            <button className="btn-action" onClick={() => handleDownload(selectedInvoice)}>
                                <FaFilePdf size={20} color="#dc2626" />
                                Download PDF
                            </button>
                            <button className="btn-action" onClick={() => setIsPreviewing(true)}>
                                <FaEye size={20} color="#3b82f6" />
                                Preview
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button className="btn-action" onClick={() => router.push(`/dashboard/invoices/new?duplicateId=${selectedInvoice.id}`)}>
                                <FaCopy size={20} color="#4338ca" />
                                Duplicate
                            </button>
                            <button className="btn-action" onClick={() => handleDelete(selectedInvoice)}>
                                <FaTrash size={20} color="#6b7280" />
                                Delete
                            </button>
                        </div>
                        
                        {/* RECORD PAYMENT SECTION */}
                        {((selectedInvoice.status || 'UNPAID').toLowerCase() !== 'paid') && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fc', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Record Payment</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input 
                                        type="number" 
                                        placeholder="Amount received (₹)" 
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.13)', outline: 'none' }}
                                    />
                                    <button 
                                        onClick={handleRecordPayment}
                                        disabled={isSubmittingPayment}
                                        style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        {isSubmittingPayment ? 'Saving...' : 'Add'}
                                    </button>
                                </div>
                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                                    Balance Due: {formatCurrency(Number(selectedInvoice.total_amount) - Number(selectedInvoice.paid_amount || 0))}
                                </div>
                            </div>
                        )}
                        
                        <button 
                            style={{ width: '100%', marginTop: '1.5rem', height: '50px', background: '#4338ca', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => setSelectedInvoice(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* HTML PREVIEW MODAL */}
            {isPreviewing && selectedInvoice && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', background: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', flexShrink: 0 }}>
                        <span style={{ fontWeight: 800, fontSize: '16px' }}>Invoice Preview</span>
                        <button onClick={() => setIsPreviewing(false)} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: '8px', color: '#f87171', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>✕ Close</button>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', fontFamily: 'Arial, sans-serif' }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
                                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 5px 0', textTransform: 'uppercase' }}>{businessProfile?.name || 'Your Business'}</h1>
                                {businessProfile?.address && <p style={{ margin: '0', color: '#475569', fontSize: '14px' }}>{businessProfile.address}</p>}
                                {businessProfile?.phone && <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '14px' }}>Phone: {businessProfile.phone}</p>}
                                {businessProfile?.gstin && <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '14px', fontWeight: 'bold' }}>GSTIN: {businessProfile.gstin}</p>}
                            </div>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '20px', marginBottom: '30px' }}>
                                <div style={{ flex: '1 1 200px' }}>
                                    <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 10px 0', fontWeight: 800 }}>Billed To:</h3>
                                    <h2 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 5px 0', fontWeight: 700 }}>{selectedInvoice.customer?.name}</h2>
                                    {selectedInvoice.customer?.phone && <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '14px' }}>Phone: {selectedInvoice.customer.phone}</p>}
                                    {selectedInvoice.customer?.address && <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '14px' }}>{selectedInvoice.customer.address}</p>}
                                    {selectedInvoice.customer?.gstin && <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '14px' }}>GSTIN: {selectedInvoice.customer.gstin}</p>}
                                </div>
                                <div style={{ textAlign: 'right', flex: '1 1 200px' }}>
                                    <h1 style={{ fontSize: 'clamp(18px, 5vw, 24px)', color: '#3b82f6', margin: '0 0 15px 0', fontWeight: 900, textTransform: 'uppercase' }}>{(selectedInvoice.type || 'TAX_INVOICE').replace('_', ' ')}</h1>
                                    <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '14px' }}><strong>Invoice No:</strong> {selectedInvoice.invoice_number}</p>
                                    <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '14px' }}><strong>Date:</strong> {selectedInvoice.invoice_date}</p>
                                    {selectedInvoice.due_date && <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '14px' }}><strong>Due Date:</strong> {selectedInvoice.due_date}</p>}
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto', width: '100%', marginBottom: '30px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '450px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontSize: '13px', width: '5%' }}>#</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#0f172a', fontSize: '13px', width: '45%' }}>Item Description</th>
                                            <th style={{ padding: '12px', textAlign: 'center', color: '#0f172a', fontSize: '13px', width: '15%' }}>Qty</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#0f172a', fontSize: '13px', width: '15%' }}>Rate</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#0f172a', fontSize: '13px', width: '20%' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedInvoice.items || []).map((item: any, idx: number) => {
                                            const qty = Number(item.quantity) || 1;
                                            const rate = Number(item.unit_price) || 0;
                                            const amt = qty * rate;
                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ padding: '12px', color: '#475569', fontSize: '14px' }}>{idx + 1}</td>
                                                    <td style={{ padding: '12px', color: '#0f172a', fontSize: '14px', fontWeight: 600 }}>{item.product_name}</td>
                                                    <td style={{ padding: '12px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>{qty} {item.unit || 'PCS'}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', color: '#475569', fontSize: '14px' }}>₹{rate.toFixed(2)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>₹{amt.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ width: '300px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '14px' }}>
                                        <span>Subtotal:</span>
                                        <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{Number(selectedInvoice.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                    {(Number(selectedInvoice.cgst_amount) > 0 || Number(selectedInvoice.igst_amount) > 0) && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '14px' }}>
                                            <span>Tax Amount (GST):</span>
                                            <span style={{ fontWeight: 600, color: '#0f172a' }}>+ ₹{(Number(selectedInvoice.cgst_amount || 0) + Number(selectedInvoice.sgst_amount || 0) + Number(selectedInvoice.igst_amount || 0)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {Number(selectedInvoice.discount_pct || 0) > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', color: '#ef4444', fontSize: '14px' }}>
                                            <span>Discount ({selectedInvoice.discount_pct}%):</span>
                                            <span style={{ fontWeight: 600 }}>- ₹{(Number(selectedInvoice.subtotal || 0) * (Number(selectedInvoice.discount_pct) / 100)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', color: '#0f172a', fontSize: '20px', fontWeight: 900 }}>
                                        <span>Total:</span>
                                        <span style={{ color: '#3b82f6' }}>₹{Number(selectedInvoice.total_amount || 0).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#16a34a', fontSize: '14px', fontWeight: 700 }}>
                                        <span>Paid:</span>
                                        <span>₹{Number(selectedInvoice.paid_amount || 0).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#ef4444', fontSize: '14px', fontWeight: 700 }}>
                                        <span>Balance:</span>
                                        <span>₹{(Number(selectedInvoice.total_amount || 0) - Number(selectedInvoice.paid_amount || 0)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {selectedInvoice.notes && (
                                <div style={{ marginTop: '30px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Notes / Terms</h4>
                                    <p style={{ margin: '0', fontSize: '13px', color: '#334155', whiteSpace: 'pre-wrap' }}>{selectedInvoice.notes}</p>
                                </div>
                            )}

                            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                                <button onClick={() => setIsPreviewing(false)} style={{ background: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '12px', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                    ✕ Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Animated Bottom FAB */}
            <button className={`fab-animated ${isScrolled ? 'show' : ''}`} onClick={() => router.push('/dashboard/invoices/new')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {t.newInvoice || 'New Invoice'}
            </button>
        </div>
    );
}

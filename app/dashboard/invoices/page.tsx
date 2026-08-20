"use client";

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../../lib/store';
import { getTranslations } from '../../../lib/translations';
import { generateInvoicePDF } from '../../../lib/pdf-generator';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../../lib/utils';
import { getVisitingCardText, openWhatsAppChat } from '../../../lib/whatsapp-utils';
import { translations } from '../../../lib/translations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FaFilePdf, FaWhatsapp, FaTrash, FaCopy, FaEye, FaPrint, FaBox
} from 'react-icons/fa';

export default function InvoicesPage() {
    const router = useRouter();

    // Global Store
    const invoices = useStore((state: any) => state.invoices) || [];
    const deleteInvoice = useStore((state: any) => state.deleteInvoice);
    const businessProfile = useStore((state: any) => state.businessProfile) || {};
    const fetchInvoices = useStore((state: any) => state.fetchInvoices);
    const settings = useStore((state: any) => state.settings) || { language: 'en' };
    const t = getTranslations(settings?.language || 'en');
    
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
        
    // Hardware back button modal close
    useEffect(() => {
        const handlePopState = () => {
            if (selectedInvoice) {
                setSelectedInvoice(null);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedInvoice]);

    // Push hash to history when opening
    useEffect(() => {
        if (selectedInvoice) {
            window.history.pushState({ modal: 'invoice' }, '', window.location.pathname + '#invoice');
        } else {
            // cleanup hash if closed without back button
            if (window.location.hash === '#invoice') {
                window.history.back();
            }
        }
    }, [selectedInvoice]);

    return () => window.removeEventListener('scroll', handleScroll);
    }, [fetchInvoices]);

    const safeInvoices = useMemo(() => Array.isArray(invoices) ? invoices.filter(i => i && typeof i === 'object') : [], [invoices]);
    
    // Filtering & Sorting Logic
    const filteredInvoices = useMemo(() => {
        return safeInvoices.filter((inv: any) => {
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
    }, [safeInvoices, searchTerm, activeTab, sortOrder]);

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
    const kpiData = useMemo(() => ({
        total: safeInvoices.length,
        paid: safeInvoices.filter(i => (i.status || 'UNPAID') === 'PAID').length,
        unpaid: safeInvoices.filter(i => (i.status || 'UNPAID') === 'UNPAID').length,
        partial: safeInvoices.filter(i => (i.status || '').toUpperCase() === 'PARTIAL').length,
        receivable: safeInvoices.reduce((acc, i) => acc + ((Number(i.total_amount) || Number(i.subtotal) || 0) - Number(i.paid_amount || 0)), 0),
        totalBilled: safeInvoices.reduce((acc, i) => acc + (Number(i.total_amount) || Number(i.subtotal) || 0), 0)
    }), [safeInvoices]);

    const collectionRate = useMemo(() => kpiData.totalBilled > 0 ? Math.round(((kpiData.totalBilled - kpiData.receivable) / kpiData.totalBilled) * 100) : 0, [kpiData]);
    const uniqueCustomers = useMemo(() => new Set(safeInvoices.map(i => i.customer?.phone || i.customer?.name)).size, [safeInvoices]);
    const avgInvoice = useMemo(() => kpiData.total > 0 ? Math.round(kpiData.totalBilled / kpiData.total) : 0, [kpiData]);

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
        const toastId = toast.loading('Downloading PDF...');
        try {
            await generateInvoicePDF(invoice, businessProfile, true, 'download');
            toast.dismiss(toastId);
            toast.success('PDF saved to Documents folder!', { duration: 4000, icon: '✅' });
        } catch (error) { toast.error('PDF Error', { id: toastId }); }
    };

    const handleViewPdf = async (invoice: any) => {
        const toastId = toast.loading('Opening PDF...');
        try {
            await generateInvoicePDF(invoice, businessProfile, true, 'view');
            toast.dismiss(toastId);
        } catch (error) { toast.error('PDF Error', { id: toastId }); }
    };

    const handleSharePdf = async (invoice: any) => {
        const toastId = toast.loading('Generating PDF for Share...');
        try {
            await generateInvoicePDF(invoice, businessProfile, true, 'share');
            toast.dismiss(toastId);
        } catch (error) { toast.error('PDF Error', { id: toastId }); }
    };

    const handlePrint = async (invoice: any) => {
        const toastId = toast.loading('Preparing print...');
        try {
            const doc = await generateInvoicePDF(invoice, businessProfile, false);
            if (doc) {
                toast.dismiss(toastId);
                doc.autoPrint();
                window.open(doc.output('bloburl'), '_blank');
            } else {
                toast.error('Print Error', { id: toastId });
            }
        } catch (error) { toast.error('Print Error', { id: toastId }); }
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
            
            const invoiceLink = `${window.location.origin}/i/${invoice.id}`;
            let text = `Hi ${invoice.customer?.name || 'Customer'},\n\nYour invoice *#${invoice.invoice_number}* for *${formatCurrency(invoice.total_amount)}* is ready.\n\n📄 *View Invoice & Pay Online*:\n${invoiceLink}\n\nRegards,\n${businessProfile.name}`;
            text += getVisitingCardText(businessProfile);
            
            if (typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.isNativePlatform && (window as any).Capacitor.isNativePlatform()) {
                try {
                    let Filesystem;
                    let Share;
                    if ((window as any).Capacitor.Plugins) {
                        Filesystem = (window as any).Capacitor.Plugins.Filesystem;
                        Share = (window as any).Capacitor.Plugins.Share;
                    }
                    if (!Filesystem) { const mod = await import('@capacitor/filesystem'); Filesystem = mod.Filesystem; }
                    if (!Share) { const mod = await import('@capacitor/share'); Share = mod.Share; }

                    if (Filesystem && Share) {
                        const base64Data = doc.output('datauristring').split(',')[1];
                        const savedFile = await Filesystem.writeFile({
                            path: fileName,
                            data: base64Data,
                            directory: 'DOCUMENTS',
                        });
                        
                        await Share.share({
                            title: fileName,
                            text: text,
                            url: savedFile.uri,
                            dialogTitle: 'Share on WhatsApp'
                        });
                        toast.success('WhatsApp par share open ho gaya!', { id: toastId });
                        return;
                    }
                } catch(err) {
                    console.error('Native share error', err);
                    toast.dismiss(toastId);
                    return;
                }
            }

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
                    // User cancelled the share dialog, so we should abort the process
                    toast.dismiss(toastId);
                    return;
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

            openWhatsAppChat(phone, text);
            toast.success('Opening WhatsApp... ✅', { id: toastId });
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
            const text = `Namaste ${cust.name},\n\nAapke Invoices (#${invList}) ka total balance *${formatCurrency(cust.totalDue)}* due hai. Kripya samay par pay karein.\n\nRegards,\n${businessProfile?.name || 'BillGST'}`;
            
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
            
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
            const fileName = "Invoices_Export.xlsx";
            
            const { downloadAndShareFile } = await import('@/lib/utils');
            await downloadAndShareFile(excelBuffer, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            
            toast.success("Excel file downloaded!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to export Excel");
        }
    };

    const handleDownloadEwayJSON = async (invoice: any) => {
        try {
            const isInterState = invoice.igst_amount > 0;
            
            const totalValue = Number(invoice.total_amount || 0);
            const cgstValue = Number(invoice.cgst_amount || 0);
            const sgstValue = Number(invoice.sgst_amount || 0);
            const igstValue = Number(invoice.igst_amount || 0);
            const subtotal = Number(invoice.subtotal || 0);

            const itemList = (invoice.items || []).map((item: any) => {
                const qty = Number(item.quantity) || 1;
                const rate = Number(item.unit_price) || 0;
                const taxable = qty * rate;
                return {
                    "productName": item.product_name,
                    "productDesc": item.product_name,
                    "hsnCode": parseInt(item.hsn_code) || 1234,
                    "quantity": qty,
                    "qtyUnit": item.unit || "NOS",
                    "taxableAmount": taxable,
                    "sgstRate": isInterState ? 0 : Number(item.gst_rate || 18) / 2,
                    "cgstRate": isInterState ? 0 : Number(item.gst_rate || 18) / 2,
                    "igstRate": isInterState ? Number(item.gst_rate || 18) : 0,
                    "cessRate": 0
                };
            });

            let docDate = "";
            if (invoice.invoice_date) {
                const parts = invoice.invoice_date.split("-");
                if (parts.length === 3) {
                    docDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            const jsonBody = {
                "version": "1.0.0121",
                "billLists": [
                    {
                        "userGstin": businessProfile?.gstin || "URP",
                        "supplyType": "O",
                        "subSupplyType": 1,
                        "docType": "INV",
                        "docNo": invoice.invoice_number,
                        "docDate": docDate,
                        "fromGstin": businessProfile?.gstin || "URP",
                        "fromTrdName": businessProfile?.name || "Business",
                        "fromAddr1": businessProfile?.address || "Address",
                        "fromAddr2": "",
                        "fromPlace": businessProfile?.city || "City",
                        "fromPincode": parseInt(businessProfile?.pincode) || 111111,
                        "fromStateCode": parseInt((businessProfile?.gstin || "").substring(0, 2)) || 24,
                        "toGstin": invoice.customer?.gstin || "URP",
                        "toTrdName": invoice.customer?.name || "Customer",
                        "toAddr1": invoice.customer?.address || "Address",
                        "toAddr2": "",
                        "toPlace": invoice.customer?.city || "City",
                        "toPincode": parseInt(invoice.customer?.pincode) || 111111,
                        "toStateCode": parseInt((invoice.customer?.gstin || "").substring(0, 2)) || parseInt((businessProfile?.gstin || "").substring(0, 2)) || 24,
                        "totalValue": subtotal,
                        "cgstValue": cgstValue,
                        "sgstValue": sgstValue,
                        "igstValue": igstValue,
                        "cessValue": 0.0,
                        "transporterId": invoice.transporter_id || "",
                        "transporterName": invoice.transporter_name || "",
                        "transDocNo": invoice.trans_doc_no || "",
                        "transMode": parseInt(invoice.trans_mode) || 1,
                        "transDistance": parseInt(invoice.distance) || 0,
                        "transDocDate": "",
                        "vehicleNo": invoice.vehicle_no || "",
                        "vehicleType": "R",
                        "totInvValue": totalValue,
                        "itemList": itemList
                    }
                ]
            };

            const jsonString = JSON.stringify(jsonBody, null, 2);
            const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
            const fileName = `EWayBill_${invoice.invoice_number}.json`;
            
            const { downloadAndShareFile } = await import('@/lib/utils');
            await downloadAndShareFile(base64Data, fileName, 'application/json', 'download');
            
            toast.success("E-Way Bill JSON Downloaded to Documents!");
        } catch (error) {
            console.error("Error generating E-Way JSON:", error);
            toast.error("Failed to generate JSON");
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

                .modal-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
                .modal-sheet { background: #ffffff; width: 100%; max-width: 500px; border-radius: 24px 24px 0 0; padding: 2rem 1.25rem; transform: translateY(0); animation: slideUp 0.3s ease; max-height: 90vh; overflow-y: auto;}
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @media (min-width: 640px) {
                    .modal-ov { align-items: center; }
                    .modal-sheet { border-radius: 24px; animation: scaleUp 0.2s ease; max-height: 85vh; }
                }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .btn-action { flex: 1; min-width: 60px; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px; border-radius: 12px; background: #f8f9fc; border: 1px solid rgba(0,0,0,0.08); color: #111827; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s; }
                .btn-action:hover { background: rgba(0,0,0,0.04); }
                .btn-action.solid-whatsapp { background: linear-gradient(135deg, #25D366, #128C7E); color: white; border: none; flex-direction: row; justify-content: center; font-size: 13px; padding: 14px; grid-column: span 2; border-radius: 14px; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3); font-weight: 700; transition: transform 0.2s, box-shadow 0.2s; gap: 10px; }
                .btn-action.solid-whatsapp:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4); }
                .btn-action.solid-share { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; flex-direction: row; justify-content: center; font-size: 13px; padding: 14px; grid-column: span 2; border-radius: 14px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3); font-weight: 700; transition: transform 0.2s, box-shadow 0.2s; gap: 10px; }
                .btn-action.solid-share:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); }

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
            



@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

.ns-wrapper {
    --ink:#12182A; --ink-soft:#3A4356; --muted:#7C8399; --hairline:#E7E3D8; --paper:#FBF9F4; --paper-2:#F3EFE3; --page:#EDE9DC; --brass:#A9803F; --brass-dark:#7C5C29; --brass-tint:#F3E6CC; --green:#1E7A5F; --green-tint:#DEEFE7; --red:#B23B34; --red-tint:#F7E3E0; --navy:#0E1526; --radius-lg:20px; --radius-md:12px;
}
.ns-wrapper, .ns-wrapper * {
    box-sizing: border-box;
}
.ns-phone {
    width: 390px;
    max-width: 100%;
    margin: 0 auto;
    animation: scaleUp 0.2s ease;
    font-family: 'Inter', sans-serif;
    position: relative;
    box-sizing: border-box;
}
.ns-sheet {
    background: var(--paper);
    border-radius: 18px;
    padding: 0 0 24px;
    position: relative;
    box-shadow: 0 30px 60px -20px rgba(14,21,38,0.35);
    max-height: 90vh;
    overflow-y: auto;
}
.ns-head { padding: 22px 24px 20px; border-bottom: 1px dashed var(--hairline); position: relative; }
.ns-eyebrow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.ns-inv-no { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; letter-spacing: 0.06em; color: var(--muted); text-transform: uppercase; }
.ns-status-pill { font-size: 11px; font-weight: 600; letter-spacing: 0.02em; color: var(--red); background: var(--red-tint); padding: 4px 10px; border-radius: 99px; }
.ns-status-paid { color: var(--green); background: var(--green-tint); }
.ns-amount-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
.ns-amount { font-family: 'Fraunces', serif; font-weight: 500; font-size: 42px; color: var(--ink); letter-spacing: -0.01em; }
.ns-amount-currency { font-family: 'Fraunces', serif; font-size: 22px; color: var(--ink-soft); }
.ns-type-tag { font-size: 13px; color: var(--ink-soft); font-weight: 500; }
.ns-type-tag span { color: var(--muted); font-weight: 400; }
.ns-punch { position: absolute; left: -11px; right: -11px; bottom: -11px; height: 22px; background: radial-gradient(circle at 11px 11px, rgba(0,0,0,0.5) 11px, transparent 11.5px) repeat-x; background-size: 22px 22px; }
.ns-body-pad { padding: 20px 24px 0; }
.ns-section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin: 22px 0 10px; }
.ns-section-label:first-of-type { margin-top: 20px; }
.ns-primary-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ns-btn { border: none; border-radius: var(--radius-md); padding: 15px 14px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: transform .12s ease, filter .12s ease; }
.ns-btn:active { transform: scale(0.97); }
.ns-btn-whatsapp { background: var(--green); color: #F3FAF7; }
.ns-btn-whatsapp:hover { filter: brightness(1.06); }
.ns-btn-pdf { background: var(--paper); color: var(--ink); border: 1px solid var(--hairline); }
.ns-btn-pdf:hover { border-color: var(--brass); }
.ns-btn-icon { width: 19px; height: 19px; flex-shrink: 0; }
.ns-secondary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ns-tile { background: var(--paper); border: 1px solid var(--hairline); border-radius: var(--radius-md); padding: 16px 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: border-color .12s ease, background .12s ease; }
.ns-tile:hover { border-color: var(--brass); background: var(--brass-tint); }
.ns-tile-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
.ns-tile-label { font-size: 12.5px; font-weight: 600; color: var(--ink); text-align: center; }
.ns-full { grid-column: 1 / -1; flex-direction: row; justify-content: flex-start; padding: 14px 16px; }
.ns-full .ns-tile-icon { margin-right: 2px; }
.ns-tile-danger:hover { border-color: var(--red); background: var(--red-tint); }
.ns-tile-danger .ns-tile-label { color: var(--red); }
.ns-payment-card { margin-top: 22px; background: var(--paper-2); border: 1px solid var(--hairline); border-radius: var(--radius-lg); padding: 18px; }
.ns-payment-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ns-payment-title { font-size: 13.5px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px; }
.ns-payment-row { display: flex; gap: 8px; width: 100%; box-sizing: border-box; }
.ns-amt-input { min-width: 0; flex: 1; border: 1px solid var(--hairline); background: var(--paper); border-radius: 10px; padding: 0 14px; height: 44px; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink); outline: none; box-sizing: border-box; }
.ns-amt-input:focus { border-color: var(--brass); }
.ns-amt-input::placeholder { color: var(--muted); }
.ns-add-btn { background: var(--green); color: #F3FAF7; border: none; border-radius: 10px; padding: 0 20px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
.ns-add-btn:active { transform: scale(0.97); }
.ns-add-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.ns-balance-line { margin-top: 12px; display: flex; justify-content: space-between; align-items: baseline; font-size: 12.5px; }
.ns-balance-line .ns-label { color: var(--muted); }
.ns-balance-line .ns-val { font-weight: 700; color: var(--red); font-family: 'JetBrains Mono', monospace; }
.ns-progress { margin-top: 10px; height: 5px; background: var(--hairline); border-radius: 99px; overflow: hidden; }
.ns-progress-fill { height: 100%; background: var(--brass); border-radius: 99px; transition: width .3s ease; }
.ns-close-btn { margin: 22px 24px 0; background: var(--ink); color: #F4F1E8; border: none; border-radius: var(--radius-md); padding: 16px; width: calc(100% - 48px); font-weight: 600; font-size: 14.5px; letter-spacing: 0.01em; cursor: pointer; transition: transform 0.12s; }
.ns-close-btn:active { transform: scale(0.985); }

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
                        <div className="stat-footer">{t.thisMonth || 'This month'}</div>
                    </div>
                    <div className={`stat-card ${activeTab === 'd' ? 'active-card' : ''}`} onClick={() => setActiveTab('d')} style={{cursor: 'pointer'}}>
                        <div className="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div>
                        <div className="stat-label">{t.amountReceived || 'Paid Full'}</div>
                        <div className="stat-val green">{kpiData.paid}</div>
                        <div className="stat-footer">{formatCurrency(kpiData.totalBilled - kpiData.receivable)} {t.collected || 'Collected'}</div>
                    </div>
                    <div className={`stat-card ${activeTab === 'u' ? 'active-card' : ''}`} onClick={() => setActiveTab('u')} style={{cursor: 'pointer'}}>
                        <div className="stat-icon red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                        <div className="stat-label">{t.due || 'Unpaid'}</div>
                        <div className="stat-val red">{kpiData.unpaid}</div>
                        <div className="stat-footer">{t.followUp || 'Follow up'}</div>
                    </div>
                    <div className={`stat-card ${activeTab === 'p' ? 'active-card' : ''}`} onClick={() => setActiveTab('p')} style={{cursor: 'pointer'}}>
                        <div className="stat-icon amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                        <div className="stat-label">{t.partial || 'Partial'}</div>
                        <div className="stat-val amber">{kpiData.partial}</div>
                        <div className="stat-footer">{t.balanceAmount || 'Balance baaki'}</div>
                    </div>
                </div>

                {/* RECEIVABLE BANNER */}
                <div className="recv-banner">
                    <div>
                        <div className="recv-label">💰 {t.totalDueLabel || 'Total Receivable'}</div>
                        <div className="recv-val">{formatCurrency(kpiData.receivable)}</div>
                        <div className="recv-sub">{kpiData.unpaid + kpiData.partial} {t.invoicesPendingJustUpdated || 'invoices pending · Just updated'}</div>
                    </div>
                    <div className="recv-pills">
                        <div className="recv-pill">
                            <div className="recv-pill-val">{collectionRate}%</div>
                            <div className="recv-pill-label">{t.collectionRate || 'Collection Rate'}</div>
                        </div>
                        <div className="recv-pill">
                            <div className="recv-pill-val">{uniqueCustomers}</div>
                            <div className="recv-pill-label">{t.customers || 'Customers'}</div>
                        </div>
                        <div className="recv-pill">
                            <div className="recv-pill-val">{formatCurrency(avgInvoice)}</div>
                            <div className="recv-pill-label">{t.avgInvoice || 'Avg Invoice'}</div>
                        </div>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="toolbar">
                    <div className="search-sort-row">
                        <div className="search-wrap">
                            <input 
                                type="text" 
                                placeholder={t.searchCustomerInvoice || 'Search customer or invoice...'} 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select className="sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="newest">{t.newest || 'Newest'}</option>
                            <option value="amount-high">{t.highAmount || 'High Amount'}</option>
                            <option value="amount-low">{t.lowAmount || 'Low Amount'}</option>
                            <option value="name">{t.nameAZ || 'Name A–Z'}</option>
                        </select>
                        <Link href="/dashboard/invoices/new" className="plus-btn" style={{ textDecoration: 'none', color: '#fff' }}>+</Link>
                    </div>
                    <div className="filter-tabs">
                        <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>{t.all || 'All'} ({kpiData.total})</div>
                        <div className={`tab ${activeTab === 'u' ? 'active' : ''}`} onClick={() => setActiveTab('u')}>{t.due || 'Unpaid'} ({kpiData.unpaid})</div>
                        <div className={`tab ${activeTab === 'p' ? 'active' : ''}`} onClick={() => setActiveTab('p')}>{t.partialTab || 'Partial'} ({kpiData.partial})</div>
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
                                            if (status === 'partial') { badgeClass = 'badge-partial'; statusText = t.partialTab || 'Partial'; }
                                            
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
                            {isLoadingMore ? (t.loading || 'Loading...') : (t.loadMoreOldInvoices || 'Load More Old Invoices')}
                        </button>
                    </div>
                )}

                {/* Centered New Invoice Button below Table Footer */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', paddingBottom: '20px' }}>
                    <Link 
                        href="/dashboard/invoices/new" 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            padding: '16px 36px', fontSize: '16px', fontWeight: 600, 
                            borderRadius: '30px', background: '#4338ca', color: '#fff', 
                            textDecoration: 'none', cursor: 'pointer', boxShadow: '0 6px 16px rgba(67,56,202,0.3)' 
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        {t.newInvoice || 'Create New Invoice'}
                    </Link>
                </div>
            </div>

            
            
            
            {selectedInvoice && (
                <div className="modal-ov ns-wrapper" onClick={() => { window.history.back(); }}>
                    <div className="ns-phone" onClick={e => e.stopPropagation()}>
                        <div className="ns-sheet">
                            <div className="ns-head">
                                <div className="ns-eyebrow">
                                    <span className="ns-inv-no">Invoice #{selectedInvoice.invoice_number}</span>
                                    {((selectedInvoice.status || 'UNPAID').toLowerCase() === 'paid' || 
                                    Number(selectedInvoice.total_amount) <= Number(selectedInvoice.paid_amount || 0)) ? (
                                        <span className="ns-status-pill ns-status-paid">Paid in full</span>
                                    ) : (
                                        <span className="ns-status-pill">Balance due</span>
                                    )}
                                </div>
                                <div className="ns-amount-row">
                                    <span className="ns-amount-currency">₹</span>
                                    <span className="ns-amount">
                                        {Number(selectedInvoice.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="ns-type-tag">
                                    {selectedInvoice.type === 'QUOTATION' ? 'Quotation' : 'Cash sale'} 
                                    <span> &middot; {new Date(selectedInvoice.invoice_date || selectedInvoice.created_at).toLocaleDateString('en-IN')}</span>
                                </div>
                                <div className="ns-punch"></div>
                            </div>

                            <div className="ns-body-pad">
                                <div className="ns-section-label">Share invoice</div>
                                <div className="ns-primary-actions">
                                    <button className="ns-btn ns-btn-whatsapp" onClick={(e) => handleWhatsApp(selectedInvoice, e)}>
                                        <svg className="ns-btn-icon" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.48 3.53 1.32 5.01L2 22l5.12-1.28A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Z" stroke="#F3FAF7" strokeWidth="1.4"/><path d="M8.7 8.4c.2-.5.4-.5.6-.5h.5c.16 0 .38 0 .55.42.2.5.68 1.72.74 1.85.06.13.1.28.02.44-.08.16-.13.26-.26.4-.13.14-.27.32-.39.43-.13.13-.26.26-.12.5.14.25.63 1.03 1.36 1.67.94.83 1.72 1.09 1.97 1.21.25.13.4.11.55-.06.16-.18.65-.75.82-1.02.17-.25.34-.2.56-.12.23.08 1.44.68 1.68.8.25.13.4.19.47.3.06.13.06.7-.18 1.37-.24.66-1.4 1.28-1.94 1.36-.5.08-1.12.11-1.8-.11-.42-.14-.95-.32-1.64-.62-2.9-1.25-4.79-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.13 1.02-2.42Z" fill="#F3FAF7"/></svg>
                                        Send on WhatsApp
                                    </button>
                                    <button className="ns-btn ns-btn-pdf" onClick={() => handleViewPdf(selectedInvoice)}>
                                        <svg className="ns-btn-icon" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="#12182A" strokeWidth="1.4"/><path d="M14 3v5h5" stroke="#12182A" strokeWidth="1.4"/><text x="8" y="17" fontFamily="Inter" fontSize="6.5" fontWeight="700" fill="#12182A">PDF</text></svg>
                                        Download PDF
                                    </button>
                                </div>

                                <div className="ns-section-label">More actions</div>
                                <div className="ns-secondary-grid">
                                    <div className="ns-tile" onClick={() => handleDownloadEwayJSON(selectedInvoice)}>
                                        <div className="ns-tile-icon" style={{background: 'var(--brass-tint)'}}>
                                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M21 8 12 3 3 8l9 5 9-5Z" stroke="var(--brass-dark)" strokeWidth="1.4" strokeLinejoin="round"/><path d="M3 8v8l9 5 9-5V8" stroke="var(--brass-dark)" strokeWidth="1.4" strokeLinejoin="round"/><path d="M12 13v8" stroke="var(--brass-dark)" strokeWidth="1.4"/></svg>
                                        </div>
                                        <div className="ns-tile-label">E-Way JSON</div>
                                    </div>
                                    <Link href={`/dashboard/invoices/new?duplicateId=${selectedInvoice.id}`} style={{textDecoration: 'none', display: 'contents'}}>
                                        <div className="ns-tile">
                                            <div className="ns-tile-icon" style={{background: 'var(--brass-tint)'}}>
                                                <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="12" height="12" rx="2" stroke="var(--brass-dark)" strokeWidth="1.4"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="var(--brass-dark)" strokeWidth="1.4"/></svg>
                                            </div>
                                            <div className="ns-tile-label">Duplicate</div>
                                        </div>
                                    </Link>
                                    <div className="ns-tile ns-full ns-tile-danger" onClick={() => handleDelete(selectedInvoice)}>
                                        <div className="ns-tile-icon" style={{background: 'var(--red-tint)'}}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12Z" stroke="var(--red)" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                                        </div>
                                        <div className="ns-tile-label">Delete invoice</div>
                                    </div>
                                </div>

                                <div className="ns-payment-card">
                                    <div className="ns-payment-head">
                                        <div className="ns-payment-title">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="12" rx="2" stroke="var(--brass-dark)" strokeWidth="1.4"/><path d="M2 10h20" stroke="var(--brass-dark)" strokeWidth="1.4"/></svg>
                                            Record payment
                                        </div>
                                    </div>
                                    <div className="ns-payment-row">
                                        <input 
                                            className="ns-amt-input" 
                                            type="number" 
                                            placeholder="Amount received (₹)" 
                                            value={paymentAmount} 
                                            onChange={e => setPaymentAmount(e.target.value)} 
                                            disabled={isSubmittingPayment} 
                                        />
                                        <button 
                                            className="ns-add-btn" 
                                            onClick={handleRecordPayment} 
                                            disabled={isSubmittingPayment}
                                        >
                                            {isSubmittingPayment ? '...' : 'Add'}
                                        </button>
                                    </div>
                                    <div className="ns-balance-line">
                                        <span className="ns-label">Balance due</span>
                                        <span className="ns-val" style={{ color: Number(Math.max(Number(selectedInvoice.total_amount || 0) - Number(selectedInvoice.paid_amount || 0), 0)) <= 0 ? 'var(--green)' : 'var(--red)' }}>
                                            ₹{Number(Math.max(Number(selectedInvoice.total_amount || 0) - Number(selectedInvoice.paid_amount || 0), 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="ns-progress">
                                        <div 
                                            className="ns-progress-fill" 
                                            style={{ width: `${Math.min((Number(selectedInvoice.paid_amount || 0) / Number(selectedInvoice.total_amount || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <button className="ns-close-btn" onClick={() => { window.history.back(); }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animated Bottom FAB */}
            <Link href="/dashboard/invoices/new" className={`fab-animated ${isScrolled ? 'show' : ''}`} style={{ textDecoration: 'none' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {t.newInvoice || 'New Invoice'}
            </Link>
        </div>
    );
}

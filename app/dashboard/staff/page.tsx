'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { normalizeRole, isOwnerRole } from '@/lib/role-utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { drawFreeBranding } from '../../../lib/pdf-generator';

export default function SmartAttendance() {
    const router = useRouter();
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role || 'USER';
    const isOwnerOrAccountant = userRole === 'USER' || userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'ACCOUNTANT';
    const { staff, attendance, businessProfile, fetchStaff, fetchAttendance, addStaff, updateStaff, markAttendance, deleteStaff, aiDraftData, setAiDraftData } = useStore();
    const [isClient, setIsClient] = useState(false);

    const getLocalISODate = (d: Date = new Date()) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };
    // State for dates
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(getLocalISODate());
    const [isSaving, setIsSaving] = useState(false);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('workers');
    const currentUserRole = normalizeRole(session?.user?.role);
    const canAccessRoleAdmin = isOwnerRole(currentUserRole) || ['gpaliwal59@gmail.com', 'ganshyampaliwal20@gmail.com'].includes(session?.user?.email || '');
    const [sheet, setSheet] = useState<'none'|'detail'|'add'>('none');
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [isEditingStaff, setIsEditingStaff] = useState(false);
    const [editStaffData, setEditStaffData] = useState({ daily_wage: 0, advance: 0, role: '', salary_type: 'daily', monthly_salary: 0 });
    const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Worker',
        daily_wage: '',
        salary_type: 'daily',
        monthly_salary: ''
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
        if (fetchStaff) fetchStaff(false, 1);
        fetchAttendance();
        
        // Scroll to today if available
        if (scrollRef.current) {
            setTimeout(() => {
                const todayEl = scrollRef.current?.querySelector('.today');
                if (todayEl) {
                    todayEl.scrollIntoView({ behavior: 'smooth', inline: 'center' });
                }
            }, 100);
        }

        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            router.push('/dashboard');
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [fetchStaff, fetchAttendance, router]);

    // --- AI Draft Data Processing ---
    useEffect(() => {
        if (!isClient) return;
        if (aiDraftData && aiDraftData.type === 'ATTENDANCE') {
            // Wait 1.5s to ensure staff data is loaded from API before checking
            const timer = setTimeout(() => {
                const { staffName, status } = aiDraftData;
                
                if (staffName && staff && staff.length > 0) {
                    const foundStaff = staff.find((s: any) => s.name.toLowerCase().includes(staffName.toLowerCase()));
                    if (foundStaff) {
                        const attendanceStatus = status === 'ABSENT' ? 'ABSENT' : 'PRESENT';
                        markAttendance(foundStaff.id, selectedDate, attendanceStatus).then(() => {
                            toast.success(`✅ AI ne ${foundStaff.name} ki attendance laga di hai!`);
                        }).catch(console.error);
                    } else {
                        setFormData(prev => ({ ...prev, name: staffName }));
                        setSheet('add');
                        toast.success(`⚠️ AI ko ${staffName} nahi mila. Naya staff add karein.`);
                    }
                } else if (staffName) {
                    setFormData(prev => ({ ...prev, name: staffName }));
                    setSheet('add');
                    toast.success(`⚠️ Koi staff nahi mila. Naya staff add karein.`);
                }
                setAiDraftData(null); // Clear after processing
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [aiDraftData, staff, selectedDate, markAttendance, setAiDraftData, isClient]);

    if (!isClient) return null;

    // --- Date Logic ---
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
        return {
            date: d,
            dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            dayNum: d.getDate(),
            dayName: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
            isSun: d.getDay() === 0,
            isToday: d.toDateString() === new Date().toDateString()
        };
    });

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDate(getLocalISODate(today));
    };

    // --- Data Processing ---
    const filteredStaff = (staff || []).filter((s: any) => {
        const matchName = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchDept = deptFilter === 'all' || s.role?.toLowerCase().includes(deptFilter) || (deptFilter === 'worker' && s.role === 'Kaamgaar');
        return matchName && matchDept;
    });

    const getStatus = (staffId: string, dStr: string) => {
        const rec = attendance?.find((a: any) => a.staff_id === staffId && a.date === dStr);
        return rec ? rec.status : null;
    };

    const getTimeFields = (staffId: string, dStr: string) => {
        const rec = attendance?.find((a: any) => a.staff_id === staffId && a.date === dStr);
        return { in_time: rec?.in_time || '', out_time: rec?.out_time || '', note: rec?.note || '' };
    };

    const handleSetAtt = async (id: string, status: string, in_time?: string | null, out_time?: string | null, note?: string | null) => {
        // Do not block with isSaving, allow rapid fire clicks
        try {
            await markAttendance(id, selectedDate, status, in_time, out_time, note);
            // Removed toast.success to prevent spam during rapid clicks. store.js handles error toasts.
        } catch (e) {
            console.error(e);
        }
    };

    const markAllPresent = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            for (const s of filteredStaff) {
                if (!getStatus(s.id, selectedDate)) {
                    await markAttendance(s.id, selectedDate, 'PRESENT');
                }
            }
            toast.success('Marked all as present ✓');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveWorker = async () => {
        if (!formData.name) return toast.error('Name required');
        if (isSaving) return;
        setIsSaving(true);
        try {
            await addStaff(formData);
            setSheet('none');
            setFormData({ name: '', email: '', phone: '', role: 'Worker', daily_wage: '', salary_type: 'daily', monthly_salary: '' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        try {
            if (fetchStaff) await fetchStaff(true, nextPage);
            setPage(nextPage);
        } catch(e) {
            console.error(e);
        }
        setIsLoadingMore(false);
    };

    // Calculate Stats for Selected Date
    const todayStats = { P: 0, H: 0, A: 0, L: 0 };
    filteredStaff.forEach((s: any) => {
        const st = getStatus(s.id, selectedDate);
        if (st === 'PRESENT') todayStats.P++;
        else if (st === 'HALF_DAY') todayStats.H++;
        else if (st === 'ABSENT') todayStats.A++;
        else if (st === 'LEAVE') todayStats.L++;
    });

    // Calculate details for Sheet
    const ds = { p: 0, a: 0, h: 0, l: 0, gross: 0, deduct: 0, net: 0, rate: 0 };
    if (selectedStaff) {
        ds.rate = selectedStaff.salary_type === 'monthly' ? (Number(selectedStaff.monthly_salary) / daysInMonth) : (Number(selectedStaff.daily_wage) || 0);
        // Check current month records
        const currentMonthRecords = attendance?.filter((a: any) => 
            a.staff_id === selectedStaff.id && 
            a.date.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}`)
        ) || [];
        
        let calculatedGross = 0;
        let presentDays = 0;
        
        currentMonthRecords.forEach((r: any) => {
            if (r.status === 'PRESENT' || r.status === 'HALF_DAY' || r.status === 'LEAVE') {
                if (r.in_time && r.out_time && r.status !== 'LEAVE') {
                    const inDate = new Date(`1970-01-01T${r.in_time}Z`);
                    const outDate = new Date(`1970-01-01T${r.out_time}Z`);
                    let diffMs = outDate.getTime() - inDate.getTime();
                    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
                    const hours = diffMs / (1000 * 60 * 60);
                    calculatedGross += (ds.rate / 8) * hours;
                    presentDays += (hours / 8); // approximate days based on 8hr
                } else {
                    calculatedGross += (r.status === 'PRESENT' || r.status === 'LEAVE' ? ds.rate : (ds.rate * 0.5));
                    presentDays += (r.status === 'PRESENT' || r.status === 'LEAVE' ? 1 : 0.5);
                }
            }
            if (r.status === 'PRESENT') ds.p++;
            if (r.status === 'HALF_DAY') ds.h++;
            if (r.status === 'ABSENT') ds.a++;
            if (r.status === 'LEAVE') ds.l++;
        });

        ds.gross = Math.round(calculatedGross);
        // Note: ds.p and ds.h are just counts. We use a base deduction logic if simple
        ds.deduct = 0;
        const advance = Number(selectedStaff.advance) || 0;
        ds.net = ds.gross - ds.deduct - advance;
    }

    
    // Calculate unique roles for filter
    const uniqueRoles = Array.from(new Set((staff || []).map((s: any) => s.role || 'Worker'))).filter(Boolean);

    const handleUpdateStaffInfo = async () => {
        if (!selectedStaff) return;
        await updateStaff(selectedStaff.id, { 
            ...selectedStaff,
            daily_wage: editStaffData.daily_wage,
            advance: editStaffData.advance,
            role: editStaffData.role,
            salary_type: editStaffData.salary_type,
            monthly_salary: editStaffData.monthly_salary
        });
        setIsEditingStaff(false);
        // Refresh local selectedStaff so UI updates immediately
        setSelectedStaff({
            ...selectedStaff, 
            daily_wage: editStaffData.daily_wage,
            advance: editStaffData.advance,
            role: editStaffData.role,
            salary_type: editStaffData.salary_type,
            monthly_salary: editStaffData.monthly_salary
        });
        toast.success('Staff Details Updated!');
    };

    const generateSalarySlipPDF = async () => {
        if (!selectedStaff) return;
        const doc = new jsPDF();
        
        // Add Border
        const margin = 8;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

        // Add Business Logo
        if (businessProfile?.logo) {
            try {
                doc.addImage(businessProfile.logo, 'PNG', 170, 10, 24, 24);
            } catch (e) {
                console.error('Failed to add logo to PDF:', e);
            }
        }
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Indigo
        doc.text('Salary Slip', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Report Month: ${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`, 14, 35);
        
        // Staff Info
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Staff Details', 14, 50);
        
        autoTable(doc, {
            startY: 55,
            theme: 'plain',
            body: [
                ['Name', selectedStaff.name],
                ['Role', selectedStaff.role || 'Worker'],
                ['Phone', selectedStaff.phone || '-'],
                ['Salary Type', selectedStaff.salary_type === 'monthly' ? 'Monthly' : 'Daily'],
                [selectedStaff.salary_type === 'monthly' ? 'Monthly Salary' : 'Daily Wage', selectedStaff.salary_type === 'monthly' ? `Rs. ${selectedStaff.monthly_salary}` : `Rs. ${ds.rate}`],
            ],
            styles: { fontSize: 11, cellPadding: 2 }
        });

        // Attendance Info
        const finalY = (doc as any).lastAutoTable.finalY || 85;
        doc.setFontSize(14);
        doc.text('Attendance Summary', 14, finalY + 15);
        
        autoTable(doc, {
            startY: finalY + 20,
            head: [['Present', 'Absent', 'Half Day', 'Leave', 'Total Payable Days']],
            body: [
                [ds.p, ds.a, ds.h, ds.l, `${ds.p + (ds.h * 0.5) + ds.l} days`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }
        });

        // Salary Calculation
        const calcY = (doc as any).lastAutoTable.finalY || 135;
        doc.setFontSize(14);
        doc.text('Salary Calculation', 14, calcY + 15);
        
        autoTable(doc, {
            startY: calcY + 20,
            theme: 'grid',
            body: [
                ['Gross Salary (Present + Half Days + Leave)', `Rs. ${ds.gross}`],
                ['Advance Deducted', `Rs. ${Number(selectedStaff.advance) || 0}`],
                ['Net Payable Salary', `Rs. ${ds.net}`],
            ],
            didParseCell: function(data) {
                if (data.row.index === 2) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = [16, 185, 129]; // Green
                }
            }
        });

        // Add daily breakdown
        const dailyY = (doc as any).lastAutoTable.finalY || 195;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Daily Attendance Breakdown', 14, dailyY + 15);

        const currentMonthRecords = attendance?.filter((a: any) => 
            a.staff_id === selectedStaff.id && 
            a.date.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}`)
        ) || [];

        const breakdownBody: any[] = [];
        
        const sortedRecords = [...currentMonthRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        sortedRecords.forEach((rec: any) => {
            const dateObj = new Date(rec.date);
            const dateDisplay = `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
            let statusText = rec.status.replace('_', ' ');
            if (rec.in_time && rec.out_time) {
                statusText += ` (${rec.in_time} - ${rec.out_time})`;
            }
            breakdownBody.push([dateDisplay, statusText]);
        });

        autoTable(doc, {
            startY: dailyY + 20,
            head: [['Date', 'Status']],
            body: breakdownBody,
            theme: 'grid',
            headStyles: { fillColor: [50, 50, 50] },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 1) {
                    const st = data.cell.raw as string;
                    if (st === 'PRESENT') data.cell.styles.textColor = [16, 185, 129];
                    else if (st === 'ABSENT') data.cell.styles.textColor = [239, 68, 68];
                    else if (st === 'HALF DAY') data.cell.styles.textColor = [245, 158, 11];
                    else if (st === 'LEAVE') data.cell.styles.textColor = [59, 130, 246];
                }
            }
        });

        const isPremium = businessProfile?.subscription_plan === 'PREMIUM' || businessProfile?.subscription_plan === 'ENTERPRISE' || ['BASIC_30', 'PREMIUM_99', 'YEARLY_299', 'LIFETIME'].includes(businessProfile?.plan_type);
        if (!isPremium) {
            await drawFreeBranding(doc, false, pageWidth, pageHeight, pageHeight - 20);
        } else {
            const footerText = 'Generated securely via BillGST.in';
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(footerText, 14, pageHeight - 10);
        }

        const filename = `${selectedStaff.name.replace(/\s+/g, '_')}_Salary_${currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}.pdf`;
        try {
            const base64Data = doc.output('datauristring').split(',')[1];
            const { downloadAndShareFile } = await import('@/lib/utils');
            await downloadAndShareFile(base64Data, filename, 'application/pdf');
            toast.success('Salary Slip Downloaded/Shared!', { duration: 5000 });
        } catch (err) {
            console.error('PDF Save error:', err);
            toast.error('Failed to save PDF');
        }
    };

    const generateMasterReportPDF = async (action: 'view' | 'share' = 'view') => {
        const doc = new jsPDF();
        
        // Add Border
        const margin = 8;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

        // Add Business Logo
        if (businessProfile?.logo) {
            try {
                doc.addImage(businessProfile.logo, 'PNG', 170, 10, 24, 24);
            } catch (e) {
                console.error('Failed to add logo to PDF:', e);
            }
        }

        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229);
        doc.text('Monthly Attendance & Salary Report', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Month: ${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`, 14, 35);

        const tableBody: any[] = [];
        let grandTotalNet = 0;
        let grandTotalPresent = 0;

        filteredStaff.forEach((member: any) => {
            const rate = member.salary_type === 'monthly' ? (Number(member.monthly_salary) / daysInMonth) : (Number(member.daily_wage) || 0);
            const currentMonthRecords = attendance?.filter((a: any) => 
                a.staff_id === member.id && 
                a.date.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}`)
            ) || [];
            
            let p = 0, a = 0, h = 0, l = 0;
            currentMonthRecords.forEach((r: any) => {
                if (r.status === 'PRESENT') p++;
                if (r.status === 'HALF_DAY') h++;
                if (r.status === 'ABSENT') a++;
                if (r.status === 'LEAVE') l++;
            });

            const gross = Math.round((p * rate) + (h * rate * 0.5) + (l * rate));
            const deduct = 0;
            const net = gross - deduct;

            grandTotalNet += net;
            grandTotalPresent += p + (h * 0.5) + l;

            tableBody.push([
                member.name,
                member.role || 'Worker',
                `${p + (h*0.5) + l} days`,
                member.salary_type === 'monthly' ? `Rs. ${member.monthly_salary} /mo` : `Rs. ${rate} /day`,
                `Rs. ${net}`
            ]);
        });

        autoTable(doc, {
            startY: 45,
            head: [['Staff Name', 'Role', 'Total Presence', 'Daily Wage', 'Net Salary']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }
        });

        const finalY = (doc as any).lastAutoTable.finalY || 150;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Grand Totals', 14, finalY + 15);

        autoTable(doc, {
            startY: finalY + 20,
            theme: 'plain',
            body: [
                ['Total Payable Days (All Staff):', `${grandTotalPresent} days`],
                ['Total Payout Amount:', `Rs. ${grandTotalNet}`]
            ],
            styles: { fontSize: 13, fontStyle: 'bold', textColor: [16, 185, 129] }
        });

        const isPremium = businessProfile?.subscription_plan === 'PREMIUM' || businessProfile?.subscription_plan === 'ENTERPRISE' || ['BASIC_30', 'PREMIUM_99', 'YEARLY_299', 'LIFETIME'].includes(businessProfile?.plan_type);
        if (!isPremium) {
            await drawFreeBranding(doc, false, pageWidth, pageHeight, pageHeight - 20);
        } else {
            const footerText = 'Generated securely via BillGST.in';
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(footerText, 14, pageHeight - 10);
        }

        const filename = `Master_Report_${currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}.pdf`;
        try {
            const base64Data = doc.output('datauristring').split(',')[1];
            const { downloadAndShareFile } = await import('@/lib/utils');
            await downloadAndShareFile(base64Data, filename, 'application/pdf', action);
            toast.success(action === 'share' ? 'Opening Share...' : 'Master Report Downloaded/Viewed!', { duration: 5000 });
        } catch (err) {
            console.error('PDF Save error:', err);
            toast.error('Failed to save PDF');
        }
    };

    // Avatar Color Gen
    const getAvatarColor = (name: string) => {
        const colors = [
            'linear-gradient(135deg,#4f46e5,#7c3aed)',
            'linear-gradient(135deg,#ef4444,#dc2626)',
            'linear-gradient(135deg,#f59e0b,#d97706)',
            'linear-gradient(135deg,#10b981,#059669)',
            'linear-gradient(135deg,#3b82f6,#2563eb)'
        ];
        return colors[name.charCodeAt(0) % colors.length];
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
            :root{
                --bg:#f4f7fb;--white:rgba(255,255,255,0.85);--ink:#0f172a;--ink2:#334155;--ink3:#64748b;--ink4:#94a3b8;
                --border:rgba(255,255,255,0.6);--green:#10b981;--green-lt:#ecfdf5;--green-dk:#059669;
                --red:#ef4444;--red-lt:#fef2f2;--amber:#f59e0b;--amber-lt:#fffbeb;
                --blue:#3b82f6;--blue-lt:#eff6ff;--indigo:#4f46e5;--indigo-lt:#eef2ff;
                --purple:#8b5cf6;--purple-lt:#f5f3ff;
                --r:18px;--rsm:12px;--rxs:8px;
                --sh:0 10px 30px rgba(0,0,0,.03);--shmd:0 15px 40px rgba(0,0,0,.06);
            }
            .sa-container {
                font-family: 'Inter', 'Nunito', sans-serif;
                background: #ffffff;
                max-width: 650px; margin: 0 auto;
                min-height: calc(100vh - 120px); color: var(--ink);
                -webkit-font-smoothing: antialiased;
                position: relative;
                padding-bottom: 20px;
                overflow: hidden;
                box-shadow: var(--shmd);
                border-left: 1px solid rgba(0,0,0,0.05);
                border-right: 1px solid rgba(0,0,0,0.05);
            }
            .sa-container *{scrollbar-width:none;}
            .sa-container *::-webkit-scrollbar{display:none;}
            
            .topbar{background:rgba(255,255,255,0.6);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);padding:20px 20px 0;position:sticky;top:0;z-index:100;border-bottom:1px solid rgba(255,255,255,0.5);}
            .tb1{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
            .logo-box{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.5);border:1px solid #fff;border-radius:12px;padding:8px 14px 8px 10px;box-shadow:0 4px 15px rgba(0,0,0,0.02);}
            .logo-sq{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--indigo),var(--purple));display:flex;align-items:center;justify-content:center;color:#fff;}
            .logo-nm{font-size:14px;font-weight:900;color:var(--ink);}
            .tb-title{flex:1;font-size:20px;font-weight:900;color:var(--ink);letter-spacing:-.5px;}
            .tb-icons{display:flex;gap:8px;}
            .tbi{width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.6);border:1px solid #fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink3);box-shadow:0 2px 10px rgba(0,0,0,0.02);transition:all 0.2s;}
            .tbi:hover{background:#fff;color:var(--indigo);transform:translateY(-1px);}
            
            .page-tabs{display:flex;gap:8px;justify-content:space-between;padding-bottom:2px;}
            .ptab{flex:1;padding:12px 8px;text-align:center;font-size:13px;font-weight:800;color:var(--ink4);border-bottom:3px solid transparent;cursor:pointer;transition:all 0.2s;}
            .ptab.on{color:var(--indigo);border-bottom-color:var(--indigo);}
            
            .date-strip{background:rgba(255,255,255,0.4);padding:16px 20px;border-bottom:1px solid var(--border);}
            .date-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
            .date-nav-btn{width:36px;height:36px;border-radius:10px;background:#fff;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.02);color:var(--ink3);transition:all 0.2s;}
            .date-nav-btn:hover{background:var(--indigo-lt);color:var(--indigo);border-color:var(--indigo-lt);}
            .date-center{text-align:center;}
            .date-month{font-size:17px;font-weight:900;color:var(--ink);}
            .date-year{font-size:12px;color:var(--ink3);font-weight:700;}
            .today-btn{font-size:12px;font-weight:800;color:var(--indigo);background:var(--indigo-lt);border:none;border-radius:8px;padding:6px 14px;cursor:pointer;transition:all 0.2s;}
            .today-btn:hover{background:var(--indigo);color:#fff;}
            
            .days-scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;scroll-behavior: smooth;}
            .day-chip{display:flex;flex-direction:column;align-items:center;min-width:48px;padding:10px 6px;border-radius:14px;cursor:pointer;flex-shrink:0;border:1.5px solid transparent;background:rgba(255,255,255,0.5);transition:all 0.2s;}
            .day-chip.today{background:linear-gradient(135deg,var(--indigo),var(--purple));border-color:transparent;box-shadow:0 6px 15px rgba(79,70,229,0.3);}
            .day-chip.has-data{border-color:rgba(0,0,0,0.05);background:#fff;}
            .day-chip.sunday{background:var(--red-lt);color:var(--red);}
            .day-chip.selected{border-color:var(--indigo); background:#fff; box-shadow:0 4px 12px rgba(79,70,229,0.15);}
            .day-chip-name{font-size:10px;font-weight:800;text-transform:uppercase;color:var(--ink3);}
            .day-chip.today .day-chip-name{color:rgba(255,255,255,.8);}
            .day-chip-num{font-size:17px;font-weight:900;line-height:1.2;color:var(--ink);}
            .day-chip.today .day-chip-num{color:#fff;}
            .day-chip.sunday .day-chip-num{color:var(--red);}
            
            .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:20px;background:transparent;}
            .stat-box{padding:16px 8px;text-align:center;background:rgba(255,255,255,0.7);backdrop-filter:blur(10px);border:1px solid #fff;border-radius:18px;box-shadow:0 8px 25px rgba(0,0,0,0.03);transition:transform 0.2s,box-shadow 0.2s;}
            .stat-box:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(0,0,0,0.05);}
            .stat-num{font-size:24px;font-weight:900;line-height:1;}
            .stat-lbl{font-size:10px;font-weight:800;text-transform:uppercase;margin-top:6px;letter-spacing:0.5px;}
            .sn-g{color:var(--green);} .sn-r{color:var(--red);} .sn-a{color:var(--amber);} .sn-b{color:var(--blue);}
            
            .controls{padding:0 16px 16px;display:flex;gap:8px;align-items:center;position:relative;z-index:90;}
            .sbox{flex:1;display:flex;align-items:center;gap:8px;background:#fff;border:1px solid rgba(0,0,0,0.05);border-radius:12px;padding:0 12px;height:42px;box-shadow:0 4px 15px rgba(0,0,0,0.02);transition:all 0.2s;min-width:0;}
            .sbox:focus-within{border-color:var(--indigo);box-shadow:0 4px 20px rgba(79,70,229,0.1);}
            .sbox svg{width:16px;height:16px;color:var(--ink3);flex-shrink:0;}
            .sbox input{flex:1;border:none;outline:none;background:none;font-size:13px;color:var(--ink);font-weight:600;min-width:0;}
            .mark-all-btn{flex-shrink:0;height:42px;padding:0 12px;display:flex;align-items:center;justify-content:center;gap:4px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;font-size:12px;font-weight:800;white-space:nowrap;box-shadow:0 6px 15px rgba(16,185,129,0.3);cursor:pointer;transition:all 0.2s;}
            .mark-all-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(16,185,129,0.4);}
            .mark-all-btn svg{width:16px;height:16px;}
            
            .dept-tabs{padding:0 20px 16px;display:flex;gap:8px;overflow-x:auto;}
            .dtab{padding:8px 16px;border-radius:99px;font-size:12px;font-weight:800;border:1px solid rgba(0,0,0,0.05);background:#fff;color:var(--ink3);white-space:nowrap;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,0.02);cursor:pointer;transition:all 0.2s;}
            .dtab.on{background:var(--ink);border-color:var(--ink);color:#fff;box-shadow:0 4px 15px rgba(0,0,0,0.1);}
            .dtab:hover:not(.on){background:var(--bg);color:var(--ink);}
            .custom-role-filter{flex-shrink:0;background:#fff;border:1px solid rgba(0,0,0,0.05);border-radius:99px;padding:0 14px;display:flex;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.02);}
            .custom-role-filter input{border:none;outline:none;background:none;font-size:12px;font-weight:800;color:var(--ink);width:100px;}
            
            .workers{padding:0 20px 100px;display:flex;flex-direction:column;gap:14px;}
            .wcard{background:linear-gradient(135deg, #ffffff, #eef2ff, #ffffff);background-size:200% 200%;animation:gradientAnim 4s ease infinite;border-radius:16px;border:1px solid #fff;box-shadow:var(--sh);overflow:hidden;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);}
            .wcard:hover{transform:translateY(-2px);box-shadow:var(--shmd);}
            .wcard-top{display:flex;align-items:center;gap:10px;padding:10px 14px;}
            .wavt{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff;position:relative;flex-shrink:0;box-shadow:0 4px 15px rgba(0,0,0,0.1);}
            .online-ring{position:absolute;bottom:-3px;right:-3px;width:16px;height:16px;border-radius:50%;border:3px solid #fff;}
            .or-green{background:var(--green);} .or-red{background:var(--red);} .or-amber{background:var(--amber);} .or-blue{background:var(--blue);}
            .winfo{flex:1;min-width:0;}
            .wname{font-size:16px;font-weight:900;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--ink);}
            .wmeta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
            .wrole{font-size:10px;font-weight:900;text-transform:uppercase;padding:3px 8px;border-radius:6px;letter-spacing:0.5px;}
            .wsalary{font-family:'DM Mono',monospace;font-size:12px;color:var(--ink3);font-weight:700;background:rgba(0,0,0,0.03);padding:3px 8px;border-radius:6px;}
            
            @keyframes gradientAnim { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            .att-btn-new{flex:1;padding:8px 2px;border-radius:10px;border:1px solid rgba(0,0,0,0.04);background:rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;cursor:pointer;font-weight:800;font-size:11px;transition:all 0.2s cubic-bezier(0.4,0,0.2,1);gap:2px;color:var(--ink3);box-shadow:0 2px 8px rgba(0,0,0,0.02);}
            .att-btn-new:hover{transform:translateY(-2px);box-shadow:0 6px 15px rgba(0,0,0,0.05);background:#fff;}
            .att-btn-new.active-p{background:linear-gradient(135deg,var(--green),var(--green-dk),var(--green));background-size:200% 200%;animation:gradientAnim 3s ease infinite;border-color:transparent;color:#fff;box-shadow:0 6px 15px rgba(16,185,129,0.3);}
            .att-btn-new.active-a{background:linear-gradient(135deg,var(--red),#be123c,var(--red));background-size:200% 200%;animation:gradientAnim 3s ease infinite;border-color:transparent;color:#fff;box-shadow:0 6px 15px rgba(239,68,68,0.3);}
            .att-btn-new.active-h{background:linear-gradient(135deg,var(--amber),#d97706,var(--amber));background-size:200% 200%;animation:gradientAnim 3s ease infinite;border-color:transparent;color:#fff;box-shadow:0 6px 15px rgba(245,158,11,0.3);}
            .att-btn-new.active-l{background:linear-gradient(135deg,var(--blue),#2563eb,var(--blue));background-size:200% 200%;animation:gradientAnim 3s ease infinite;border-color:transparent;color:#fff;box-shadow:0 6px 15px rgba(59,130,246,0.3);}
            .delete-btn{padding:8px;border-radius:12px;border:1px solid #fecdd3;background:#fff1f2;color:#e11d48;display:flex;align-items:center;justify-content:center;cursor:pointer;font-weight:800;font-size:14px;transition:all 0.2s;box-shadow:0 2px 8px rgba(225,29,72,0.1);}
            .delete-btn:hover{background:#ffe4e6;transform:translateY(-1px);box-shadow:0 4px 12px rgba(225,29,72,0.2);}
            
            .salary-row{padding:12px 18px;background:rgba(255,255,255,0.5);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:background 0.2s;}
            .salary-row:hover{background:rgba(255,255,255,0.9);}
            .sal-label{font-size:12px;color:var(--ink3);font-weight:800;margin-bottom:2px;}
            .sal-amt{font-size:15px;font-weight:900;color:var(--green);}
            .pay-btn{font-size:12px;font-weight:800;color:var(--indigo);background:var(--indigo-lt);border:none;border-radius:8px;padding:8px 16px;cursor:pointer;transition:all 0.2s;}
            .pay-btn:hover{background:var(--indigo);color:#fff;}
            
            .fab{position:fixed;bottom:30px;right:calc(50% - 280px);width:60px;height:60px;border-radius:20px;background:linear-gradient(135deg,var(--indigo),var(--purple));border:none;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 25px rgba(79,70,229,.5);color:white;z-index:150;cursor:pointer;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);}
            @media(max-width: 650px) { .fab { right: 20px; } }
            .fab:hover{transform:translateY(-4px) scale(1.05);box-shadow:0 15px 35px rgba(79,70,229,.6);}
            
            .ov{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.3s ease-out;}
            @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
            .bsheet{background:#fff;border-radius:32px 32px 0 0;width:100%;max-width:650px;padding:0 24px 40px;max-height:92vh;overflow-y:auto;box-shadow:0 -20px 50px rgba(0,0,0,0.15);animation:slideUp 0.4s cubic-bezier(0.4,0,0.2,1);}
            @keyframes slideUp { from{transform:translateY(100%);} to{transform:translateY(0);} }
            .bsh-handle{width:48px;height:6px;border-radius:3px;background:rgba(0,0,0,0.1);margin:16px auto 24px;}
            
            .aw-field{display:flex;align-items:center;gap:12px;background:#f8fafc;border:1px solid rgba(0,0,0,0.05);border-radius:16px;padding:14px 18px;margin-bottom:12px;transition:all 0.2s;}
            .aw-field:focus-within{border-color:var(--indigo);background:#fff;box-shadow:0 4px 15px rgba(79,70,229,0.08);}
            .aw-field-icon{width:36px;height:36px;border-radius:10px;background:var(--indigo-lt);display:flex;align-items:center;justify-content:center;color:var(--indigo);}
            .aw-field-icon svg{width:20px;height:20px;}
            .aw-inner{flex:1;position:relative;}
            .aw-lbl{font-size:11px;font-weight:900;color:var(--ink3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;}
            .aw-inner input,.aw-inner select{width:100%;border:none;outline:none;background:none;font-size:15px;font-weight:700;color:var(--ink);}
            .aw-save{width:100%;padding:18px;border-radius:16px;background:linear-gradient(135deg,var(--indigo),var(--purple));border:none;color:#fff;font-size:16px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 25px rgba(79,70,229,0.4);cursor:pointer;transition:all 0.3s;}
            .aw-save:hover{transform:translateY(-2px);box-shadow:0 12px 35px rgba(79,70,229,0.5);}
            .aw-save svg{width:22px;height:22px;}
            
            .sal-card{background:#f8fafc;border-radius:20px;padding:18px;margin-bottom:18px;border:1px solid rgba(0,0,0,0.03);}
            .sal-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed rgba(0,0,0,0.06);}
            .sal-row:last-child{border-bottom:none;}
            .sal-lbl{font-size:14px;color:var(--ink3);font-weight:600;}
            .sal-val{font-size:15px;font-weight:800;}
            
            @media (max-width: 500px) {
                .att-btn-new {
                    padding: 6px 1px;
                    font-size: 9.5px;
                    gap: 1px;
                }
            }
            `}} />

            <div className="sa-container">
                {/* TOPBAR */}
                <div className="topbar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '16px', gap: '16px' }}>
                    <span className="tb-title" style={{ fontSize: '16px', fontWeight: 900, color: 'white', letterSpacing: '1px', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--indigo), var(--purple))', padding: '10px 16px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(79,70,229,0.3)', textAlign: 'center', flex: 'none' }}>
                        ATTENDANCE
                    </span>
                    <div style={{ width: '100%', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if(val) {
                                    setSelectedDate(val);
                                    setCurrentMonth(new Date(val));
                                }
                            }} 
                            style={{ flex: 1, height: '46px', padding: '8px 12px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: '14px', fontWeight: 800, color: 'var(--indigo)', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', cursor: 'pointer' }}
                        />
                        <button 
                            onClick={() => generateMasterReportPDF('view')} 
                            style={{ flex: 1, height: '46px', borderRadius: '14px', background: '#fff', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', color: '#dc2626', fontWeight: 800, fontSize: '14px' }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>
                            PDF
                        </button>
                    </div>
                    {/* CONTROLS (Search & Mark All) - Moved inside sticky topbar */}
                    <div style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div className="sbox" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '0 12px', height: '42px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', color: 'var(--ink3)' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                            <input type="text" placeholder="Search name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontSize: '13px', color: 'var(--ink)', fontWeight: 600, minWidth: 0 }} />
                        </div>
                        <button className="mark-all-btn" onClick={markAllPresent}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                            All Present
                        </button>
                    </div>
                </div>

                {/* STATS */}
                <div className="stats-row" style={{ gap: '8px', padding: '0 10px', marginBottom: '20px' }}>
                    <div className="stat-box" style={{ borderLeft: '3px solid #10b981', background: '#f0fdf4', borderRadius: '10px', padding: '10px 4px', flex: 1, boxShadow: '0 2px 8px rgba(16,185,129,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div className="stat-num sn-g" style={{ fontSize: '18px', fontWeight: 900, color: '#065f46' }}>{todayStats.P}</div><div className="stat-lbl sl" style={{ color: '#047857', fontWeight: 700, fontSize: '9px' }}>Present</div></div>
                    <div className="stat-box" style={{ borderLeft: '3px solid #ef4444', background: '#fef2f2', borderRadius: '10px', padding: '10px 4px', flex: 1, boxShadow: '0 2px 8px rgba(239,68,68,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div className="stat-num sn-r" style={{ fontSize: '18px', fontWeight: 900, color: '#991b1b' }}>{todayStats.A}</div><div className="stat-lbl sl" style={{ color: '#b91c1c', fontWeight: 700, fontSize: '9px' }}>Absent</div></div>
                    <div className="stat-box" style={{ borderLeft: '3px solid #f59e0b', background: '#fffbeb', borderRadius: '10px', padding: '10px 4px', flex: 1, boxShadow: '0 2px 8px rgba(245,158,11,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div className="stat-num sn-a" style={{ fontSize: '18px', fontWeight: 900, color: '#92400e' }}>{todayStats.H}</div><div className="stat-lbl sl" style={{ color: '#b45309', fontWeight: 700, fontSize: '9px' }}>Half Day</div></div>
                    <div className="stat-box" style={{ borderLeft: '3px solid #3b82f6', background: '#eff6ff', borderRadius: '10px', padding: '10px 4px', flex: 1, boxShadow: '0 2px 8px rgba(59,130,246,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div className="stat-num sn-b" style={{ fontSize: '18px', fontWeight: 900, color: '#1e40af' }}>{todayStats.L}</div><div className="stat-lbl sl" style={{ color: '#1d4ed8', fontWeight: 700, fontSize: '9px' }}>Leave</div></div>
                </div>

                {/* DEPT TABS */}
                <div className="dept-tabs">
                    <button className={`dtab ${deptFilter === 'all' ? 'on' : ''}`} onClick={() => setDeptFilter('all')}>All</button>
                    {uniqueRoles.map((role: any) => (
                        <button key={role} className={`dtab ${deptFilter === role.toLowerCase() ? 'on' : ''}`} onClick={() => setDeptFilter(role.toLowerCase())}>{role}</button>
                    ))}
                </div>

                {/* WORKERS LIST */}
                <div className="workers">
                    {filteredStaff.length === 0 && (
                        <div className="text-center mt-10 text-[#7b7fa0] font-bold flex flex-col items-center">
                            <div style={{ marginBottom: '15px' }}>No staff found</div>
                            <button onClick={() => setSheet('add')} style={{ padding: '12px 24px', background: '#4f46e5', color: 'white', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                                + Add New Staff
                            </button>
                        </div>
                    )}
                    
                    {filteredStaff.map((member: any) => {
                        const status = getStatus(member.id, selectedDate);
                        const times = getTimeFields(member.id, selectedDate);
                        const roleColor = member.role === 'Driver' ? { bg: '#fff0f0', text: '#ef4444' } : 
                                          member.role === 'Chowkidar' ? { bg: '#e8faf3', text: '#10b981' } : 
                                          member.role === 'Safai' ? { bg: '#eff6ff', text: '#3b82f6' } : 
                                          { bg: '#eef0ff', text: '#4f46e5' };
                        
                        // Calculate stats for this month
                        const memberMonthRecords = attendance?.filter((a: any) => 
                            a.staff_id === member.id && 
                            a.date.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}`)
                        ) || [];
                        let cp=0, ca=0, cl=0, ch=0;
                        memberMonthRecords.forEach((r: any) => {
                            if(r.status==='PRESENT') cp++;
                            if(r.status==='ABSENT') ca++;
                            if(r.status==='LEAVE') cl++;
                            if(r.status==='HALF_DAY') ch++;
                        });
                                          
                        const ringColor = status === 'PRESENT' ? 'or-green' : 
                                          status === 'ABSENT' ? 'or-red' : 
                                          status === 'HALF_DAY' ? 'or-amber' : 
                                          status === 'LEAVE' ? 'or-blue' : '';
                                          
                        return (
                            <div key={member.id} className="wcard">
                                <div className="wcard-top">
                                    <div className="wavt" style={{ background: getAvatarColor(member.name) }}>
                                        {member.name.charAt(0).toUpperCase()}
                                        {status && <div className={`online-ring ${ringColor}`}></div>}
                                    </div>
                                    <div className="winfo">
                                        <div className="wname">{member.name}</div>
                                        <div style={{ marginTop: '2px', fontSize: '11px', display: 'flex', gap: '8px' }}>
                                            <span style={{color:'#10b981', fontWeight: 700}}>P: {cp}</span>
                                            <span style={{color:'#ef4444', fontWeight: 700}}>A: {ca}</span>
                                            <span style={{color:'#f59e0b', fontWeight: 700}}>H: {ch}</span>
                                            <span style={{color:'#3b82f6', fontWeight: 700}}>L: {cl}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ padding: '0 8px 12px 8px', display: 'flex', gap: '4px' }}>
                                    <button className={`att-btn-new ${status === 'PRESENT' ? 'active-p' : ''}`} onClick={() => handleSetAtt(member.id, 'PRESENT')}>✓ Present</button>
                                    <button className={`att-btn-new ${status === 'ABSENT' ? 'active-a' : ''}`} onClick={() => handleSetAtt(member.id, 'ABSENT')}>✕ Absent</button>
                                    <button className={`att-btn-new ${status === 'HALF_DAY' ? 'active-h' : ''}`} onClick={() => handleSetAtt(member.id, 'HALF_DAY')}>½ Half Day</button>
                                    <button className={`att-btn-new ${status === 'LEAVE' ? 'active-l' : ''}`} onClick={() => handleSetAtt(member.id, 'LEAVE')}>🏖 Leave</button>
                                </div>

                                <div className="att-btns" style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', padding: '0 14px 10px 14px' }}>
                                    {deleteStaff && (
                                        <button className="delete-btn" style={{flex:1, padding:'6px 8px'}} onClick={async () => {
                                            if (window.confirm(`Delete ${member.name}?`)) {
                                                await deleteStaff(member.id);
                                                fetchStaff();
                                                toast.success('Staff removed');
                                            }
                                        }} title="Delete Staff">🗑 Delete</button>
                                    )}
                                    <button 
                                        onClick={() => setExpandedStaffId(expandedStaffId === member.id ? null : member.id)}
                                        style={{
                                            flex:1, padding: '6px 8px', background: expandedStaffId === member.id ? '#eef2ff' : '#f8fafc',
                                            border: `1px solid ${expandedStaffId === member.id ? '#4f46e5' : 'rgba(0,0,0,0.08)'}`,
                                            borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: expandedStaffId === member.id ? '#4f46e5' : '#64748b',
                                            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center'
                                        }}
                                    >
                                        {expandedStaffId === member.id ? 'Close' : 'Details ⬇'}
                                    </button>
                                </div>

                                {expandedStaffId === member.id && (
                                    <div style={{ animation: 'slideDown 0.3s ease-out' }}>
                                        {(status === 'PRESENT' || status === 'HALF_DAY') && (
                                            <div style={{ padding: '8px 14px', background: '#fafbff', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase' }}>In Time</label>
                                                        <input type="time" value={times.in_time} onChange={(e) => handleSetAtt(member.id, status, e.target.value, times.out_time, times.note)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px' }} />
                                                    </div>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase' }}>Out Time</label>
                                                        <input type="time" value={times.out_time} onChange={(e) => handleSetAtt(member.id, status, times.in_time, e.target.value, times.note)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px' }} />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase' }}>Note / Remark (Optional)</label>
                                                    <input type="text" placeholder="Example: 1 hour late..." defaultValue={times.note} onBlur={(e) => { if(e.target.value !== times.note) handleSetAtt(member.id, status, times.in_time, times.out_time, e.target.value) }} style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px', width: '100%' }} />
                                                </div>
                                            </div>
                                        )}
                                        {isOwnerOrAccountant && (
                                            <div className="salary-row" onClick={() => { setSelectedStaff(member); setEditStaffData({ daily_wage: member.daily_wage || 0, advance: member.advance || 0, role: member.role || 'Worker', salary_type: member.salary_type || 'daily', monthly_salary: member.monthly_salary || 0 }); setIsEditingStaff(false); setSheet('detail'); }}>
                                                <div className="sal-info">
                                                    <div>
                                                        <div className="sal-label">Rate / Details</div>
                                                        <div className="sal-amt">₹{member.daily_wage || 0} / day</div>
                                                    </div>
                                                </div>
                                                <button className="pay-btn">View Salary →</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Centered Load More Button */}
                {filteredStaff?.length >= 20 && filteredStaff.length % 20 === 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '10px' }}>
                        <button 
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            style={{ 
                                padding: '10px 24px', fontSize: '14px', fontWeight: 600, 
                                borderRadius: '12px', background: 'var(--indigo-lt)', color: 'var(--indigo)', 
                                border: '1px solid var(--indigo)', cursor: isLoadingMore ? 'not-allowed' : 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(79,70,229,0.1)'
                            }}
                        >
                            {isLoadingMore ? 'Loading...' : 'Load More Staff'}
                        </button>
                    </div>
                )}

                <div style={{ paddingBottom: '20px' }}></div>

                {/* DETAIL SHEET */}
                {sheet === 'detail' && selectedStaff && (
                    <div className="ov" onClick={() => setSheet('none')}>
                        <div className="bsheet" onClick={e => e.stopPropagation()}>
                            <div className="bsh-handle"></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                                <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: getAvatarColor(selectedStaff.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: 900 }}>
                                    {selectedStaff.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0d0f1c' }}>{selectedStaff.name}</div>
                                    <div style={{ fontSize: '12px', color: '#7b7fa0' }}>{selectedStaff.role}{isOwnerOrAccountant ? ` · ₹${selectedStaff.daily_wage}/day` : ''}</div>
                                    {selectedStaff.email && (
                                        <div style={{ fontSize: '11px', color: '#7b7fa0', marginTop: '4px' }}>{selectedStaff.email}</div>
                                    )}
                                </div>
                                <button onClick={() => setSheet('none')} style={{ marginLeft: 'auto', width: '32px', height: '32px', borderRadius: '50%', background: '#f0f2f8', border: '1px solid #e0e3f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Mark Attendance within Detail Sheet */}
                            <div style={{ background: '#fafbff', padding: '12px', borderRadius: '12px', border: '1px solid #e0e3f0', marginBottom: '18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0d0f1c' }}>Edit Attendance</div>
                                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', fontWeight: 800, color: '#4f46e5' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '10px' }}>
                                    <button onClick={() => handleSetAtt(selectedStaff.id, 'PRESENT')} style={{ background: getStatus(selectedStaff.id, selectedDate) === 'PRESENT' ? '#10b981' : '#f0fdf4', color: getStatus(selectedStaff.id, selectedDate) === 'PRESENT' ? '#fff' : '#10b981', border: '1px solid #10b981', padding: '8px 0', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>Present</button>
                                    <button onClick={() => handleSetAtt(selectedStaff.id, 'HALF_DAY')} style={{ background: getStatus(selectedStaff.id, selectedDate) === 'HALF_DAY' ? '#f59e0b' : '#fffbeb', color: getStatus(selectedStaff.id, selectedDate) === 'HALF_DAY' ? '#fff' : '#f59e0b', border: '1px solid #f59e0b', padding: '8px 0', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>Half</button>
                                    <button onClick={() => handleSetAtt(selectedStaff.id, 'ABSENT')} style={{ background: getStatus(selectedStaff.id, selectedDate) === 'ABSENT' ? '#ef4444' : '#fef2f2', color: getStatus(selectedStaff.id, selectedDate) === 'ABSENT' ? '#fff' : '#ef4444', border: '1px solid #ef4444', padding: '8px 0', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>Absent</button>
                                    <button onClick={() => handleSetAtt(selectedStaff.id, 'LEAVE')} style={{ background: getStatus(selectedStaff.id, selectedDate) === 'LEAVE' ? '#3b82f6' : '#eff6ff', color: getStatus(selectedStaff.id, selectedDate) === 'LEAVE' ? '#fff' : '#3b82f6', border: '1px solid #3b82f6', padding: '8px 0', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>Leave</button>
                                </div>
                                {(getStatus(selectedStaff.id, selectedDate) === 'PRESENT' || getStatus(selectedStaff.id, selectedDate) === 'HALF_DAY') && (() => {
                                    const times = getTimeFields(selectedStaff.id, selectedDate);
                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink3)' }}>IN TIME</label>
                                                    <input type="time" value={times.in_time} onChange={(e) => handleSetAtt(selectedStaff.id, getStatus(selectedStaff.id, selectedDate), e.target.value, times.out_time, times.note)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px' }} />
                                                </div>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink3)' }}>OUT TIME</label>
                                                    <input type="time" value={times.out_time} onChange={(e) => handleSetAtt(selectedStaff.id, getStatus(selectedStaff.id, selectedDate), times.in_time, e.target.value, times.note)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px' }} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink3)' }}>NOTE / REMARK</label>
                                                <input type="text" placeholder="Jaise: 1 ghanta late aaya..." defaultValue={times.note} onBlur={(e) => { if(e.target.value !== times.note) handleSetAtt(selectedStaff.id, getStatus(selectedStaff.id, selectedDate), times.in_time, times.out_time, e.target.value) }} style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px' }} />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '18px' }}>
                                <div style={{ background: '#f0f2f8', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#10b981' }}>{ds.p}</div><div style={{ fontSize: '9px', fontWeight: 700, color: '#b8bbd0' }}>Present</div>
                                </div>
                                <div style={{ background: '#f0f2f8', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#ef4444' }}>{ds.a}</div><div style={{ fontSize: '9px', fontWeight: 700, color: '#b8bbd0' }}>Absent</div>
                                </div>
                                <div style={{ background: '#f0f2f8', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#f59e0b' }}>{ds.h}</div><div style={{ fontSize: '9px', fontWeight: 700, color: '#b8bbd0' }}>Half Day</div>
                                </div>
                                <div style={{ background: '#f0f2f8', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#3b82f6' }}>{ds.l}</div><div style={{ fontSize: '9px', fontWeight: 700, color: '#b8bbd0' }}>Leave</div>
                                </div>
                            </div>

                            {isOwnerOrAccountant && (
                                <div className="sal-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#b8bbd0', textTransform: 'uppercase' }}>Salary Calculation — {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</div>
                                    <button onClick={() => setIsEditingStaff(!isEditingStaff)} style={{ fontSize: '11px', fontWeight: 800, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        {isEditingStaff ? 'Cancel' : 'Edit Salary/Advance ✎'}
                                    </button>
                                </div>
                                
                                {isEditingStaff ? (
                                    <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #e0e3f0' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 800, color: '#7b7fa0', display: 'block', marginBottom: '2px' }}>Role</label>
                                            <input type="text" list="role-options" value={editStaffData.role || ''} onChange={e => setEditStaffData({...editStaffData, role: e.target.value})} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e0e3f0', outline: 'none', fontSize: '13px' }} placeholder="Example: Driver, Cleaner..." />
                                        </div>
                                        <div style={{ marginBottom: '8px' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 800, color: '#7b7fa0', display: 'block', marginBottom: '2px' }}>Salary Type</label>
                                            <select value={editStaffData.salary_type} onChange={e => setEditStaffData({...editStaffData, salary_type: e.target.value})} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e0e3f0', outline: 'none', fontSize: '13px' }}>
                                                <option value="daily">Daily Wage</option>
                                                <option value="monthly">Fixed Monthly Salary</option>
                                            </select>
                                        </div>
                                        {editStaffData.salary_type === 'monthly' ? (
                                            <div style={{ marginBottom: '8px' }}>
                                                <label style={{ fontSize: '10px', fontWeight: 800, color: '#7b7fa0', display: 'block', marginBottom: '2px' }}>Monthly Salary (₹)</label>
                                                <input type="number" value={editStaffData.monthly_salary} onChange={e => setEditStaffData({...editStaffData, monthly_salary: Number(e.target.value)})} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e0e3f0', outline: 'none', fontSize: '13px' }} />
                                            </div>
                                        ) : (
                                            <div style={{ marginBottom: '8px' }}>
                                                <label style={{ fontSize: '10px', fontWeight: 800, color: '#7b7fa0', display: 'block', marginBottom: '2px' }}>Daily Wage (₹)</label>
                                                <input type="number" value={editStaffData.daily_wage} onChange={e => setEditStaffData({...editStaffData, daily_wage: Number(e.target.value)})} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e0e3f0', outline: 'none', fontSize: '13px' }} />
                                            </div>
                                        )}
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 800, color: '#7b7fa0', display: 'block', marginBottom: '2px' }}>Advance Given (₹)</label>
                                            <input type="number" value={editStaffData.advance} onChange={e => setEditStaffData({...editStaffData, advance: Number(e.target.value)})} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e0e3f0', outline: 'none', fontSize: '13px' }} />
                                        </div>
                                        <button onClick={handleUpdateStaffInfo} style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>Save Updates</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="sal-row"><span className="sal-lbl">{selectedStaff.salary_type === 'monthly' ? 'Monthly Salary' : 'Daily wage'}</span><span className="sal-val">₹{selectedStaff.salary_type === 'monthly' ? selectedStaff.monthly_salary : ds.rate}</span></div>
                                        <div className="sal-row"><span className="sal-lbl">Paid days (Incl. Leave)</span><span className="sal-val" style={{ color: '#10b981' }}>{ds.p + (ds.h * 0.5) + ds.l} days</span></div>
                                        <div className="sal-row"><span className="sal-lbl">Gross salary</span><span className="sal-val">₹{ds.gross}</span></div>
                                        <div className="sal-row"><span className="sal-lbl">Advance Taken</span><span className="sal-val" style={{ color: '#f59e0b' }}>-₹{selectedStaff.advance || 0}</span></div>
                                        <div className="sal-row" style={{ borderTop: '2px dashed #e0e3f0', marginTop: '5px', paddingTop: '10px' }}><span className="sal-lbl" style={{ fontWeight: 800, color: '#0d0f1c' }}>Net Salary</span><span className="sal-val" style={{ color: '#4f46e5', fontSize: '15px' }}>₹{ds.net}</span></div>
                                    </>
                                )}
                            </div>
                            )}

                            {isOwnerOrAccountant && (
                                <button onClick={generateSalarySlipPDF} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#eef0ff', color: '#4f46e5', fontSize: '15px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>
                                    PDF
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ADD WORKER SHEET */}
                {sheet === 'add' && (
                    <div className="ov" onClick={() => setSheet('none')}>
                        <div className="bsheet" onClick={e => e.stopPropagation()}>
                            <div className="bsh-handle"></div>
                            <div style={{ fontSize: '19px', fontWeight: 900, color: '#0d0f1c', marginBottom: '6px' }}>➕ Add New Staff</div>
                            <div style={{ fontSize: '12px', color: '#b8bbd0', marginBottom: '18px', fontWeight: 600 }}>Fill and save staff details</div>

                            <div className="aw-field">
                                <div className="aw-field-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                                <div className="aw-inner" style={{ position: 'relative' }}>
                                    <div className="aw-lbl">Full Name *</div>
                                    <input type="text" placeholder="Example: John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    {formData.name && (
                                        <button type="button" onClick={() => setFormData({ ...formData, name: '' })} style={{ position: 'absolute', right: '10px', top: '45px', border: 'none', background: 'transparent', color: '#7b7fa0', cursor: 'pointer', fontSize: '16px' }} aria-label="Clear name field">×</button>
                                    )}
                                </div>
                            </div>


                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div className="aw-field" style={{ marginBottom: 0 }}>
                                    <div className="aw-field-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" /></svg></div>
                                    <div className="aw-inner" style={{ position: 'relative' }}>
                                        <div className="aw-lbl">Role</div>
                                        <input type="text" list="rolesList" placeholder="e.g. Manager" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }} />
                                        <datalist id="rolesList">
                                            <option value="Worker" />
                                            <option value="Driver" />
                                            <option value="Guard" />
                                            <option value="Cleaner" />
                                            <option value="Manager" />
                                            <option value="Student" />
                                        </datalist>
                                    </div>
                                </div>
                                <div className="aw-field" style={{ marginBottom: 0 }}>
                                    <div className="aw-field-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg></div>
                                    <div className="aw-inner" style={{ position: 'relative' }}>
                                        <div className="aw-lbl">Salary Type</div>
                                        <select value={formData.salary_type} onChange={e => setFormData({ ...formData, salary_type: e.target.value })} style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                                            <option value="daily">Daily Wage</option>
                                            <option value="monthly">Fixed Monthly Salary</option>
                                        </select>
                                    </div>
                                </div>
                                {formData.salary_type === 'monthly' ? (
                                    <div className="aw-field" style={{ marginBottom: 0 }}>
                                        <div className="aw-field-icon" style={{ fontSize: '20px', fontWeight: 900 }}>₹</div>
                                        <div className="aw-inner">
                                            <div className="aw-lbl">Monthly Salary</div>
                                            <input type="number" placeholder="15000" value={formData.monthly_salary} onChange={e => setFormData({ ...formData, monthly_salary: e.target.value })} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aw-field" style={{ marginBottom: 0 }}>
                                        <div className="aw-field-icon" style={{ fontSize: '20px', fontWeight: 900 }}>₹</div>
                                        <div className="aw-inner">
                                            <div className="aw-lbl">Daily Wage</div>
                                            <input type="number" placeholder="400" value={formData.daily_wage} onChange={e => setFormData({ ...formData, daily_wage: e.target.value })} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button className="aw-save" onClick={handleSaveWorker} style={{ marginTop: '20px' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>
                                Save Staff
                            </button>
                        </div>
                    </div>
                )}

                {/* Floating Add Staff Button */}
                <button className="fab" onClick={() => setSheet('add')} title="Add New Staff">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="28" height="28"><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
            </div>
        </>
    );
}

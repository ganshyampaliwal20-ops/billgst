'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { normalizeRole, isOwnerRole } from '@/lib/role-utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SmartAttendance() {
    const { data: session } = useSession();
    const { staff, attendance, businessProfile, fetchStaff, fetchAttendance, addStaff, updateStaff, markAttendance, deleteStaff } = useStore();
    const [isClient, setIsClient] = useState(false);

    const getLocalISODate = (d: Date = new Date()) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };
    // State for dates
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(getLocalISODate());
    const [isSaving, setIsSaving] = useState(false);
    
    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('workers');
    const currentUserRole = normalizeRole(session?.user?.role);
    const canAccessRoleAdmin = isOwnerRole(currentUserRole) || ['gpaliwal59@gmail.com', 'ganshyampaliwal20@gmail.com'].includes(session?.user?.email || '');
    const [sheet, setSheet] = useState<'none'|'detail'|'add'>('none');
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [isEditingStaff, setIsEditingStaff] = useState(false);
    const [editStaffData, setEditStaffData] = useState({ daily_wage: 0, advance: 0 });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Kaamgaar',
        daily_wage: ''
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
        fetchStaff();
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
    }, [fetchStaff, fetchAttendance]);

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
        return { in_time: rec?.in_time || '', out_time: rec?.out_time || '' };
    };

    const handleSetAtt = async (id: string, status: string, in_time = null, out_time = null) => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await markAttendance(id, selectedDate, status, in_time, out_time);
            toast.success(
                status === 'PRESENT' ? 'Haazir mark kiya ✓' :
                status === 'HALF_DAY' ? 'Adha din mark kiya' :
                status === 'ABSENT' ? 'Gair-haazir mark kiya ✕' : 'Chhutii mark ki 🏖'
            );
        } finally {
            setIsSaving(false);
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
            toast.success('Sabko haazir mark kar diya ✓');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveWorker = async () => {
        if (!formData.name || !formData.phone) return toast.error('Name & Phone required');
        if (isSaving) return;
        setIsSaving(true);
        try {
            await addStaff(formData);
            setSheet('none');
            setFormData({ name: '', email: '', phone: '', role: 'Kaamgaar', daily_wage: '' });
        } finally {
            setIsSaving(false);
        }
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
    let ds = { p: 0, a: 0, h: 0, l: 0, gross: 0, deduct: 0, net: 0, rate: 0 };
    if (selectedStaff) {
        ds.rate = Number(selectedStaff.daily_wage) || 0;
        // Check current month records
        const currentMonthRecords = attendance?.filter((a: any) => 
            a.staff_id === selectedStaff.id && 
            a.date.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}`)
        ) || [];
        
        currentMonthRecords.forEach((r: any) => {
            if (r.status === 'PRESENT') ds.p++;
            if (r.status === 'HALF_DAY') ds.h++;
            if (r.status === 'ABSENT') ds.a++;
            if (r.status === 'LEAVE') ds.l++;
        });

        ds.gross = (ds.p * ds.rate) + (ds.h * ds.rate * 0.5);
        ds.deduct = ds.a * ds.rate;
        const advance = Number(selectedStaff.advance) || 0;
        ds.net = ds.gross - ds.deduct - advance;
    }

    const handleUpdateStaffInfo = async () => {
        if (!selectedStaff) return;
        await updateStaff(selectedStaff.id, { 
            daily_wage: editStaffData.daily_wage,
            advance: editStaffData.advance 
        });
        setIsEditingStaff(false);
        // Refresh local selectedStaff so UI updates immediately
        setSelectedStaff({
            ...selectedStaff, 
            daily_wage: editStaffData.daily_wage,
            advance: editStaffData.advance
        });
        toast.success('Staff Details Updated!');
    };

    const generateSalarySlipPDF = () => {
        if (!selectedStaff) return;
        const doc = new jsPDF();
        
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
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Month: ${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`, 14, 35);
        
        // Staff Info
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Staff Details', 14, 50);
        
        autoTable(doc, {
            startY: 55,
            theme: 'plain',
            body: [
                ['Name', selectedStaff.name],
                ['Role', selectedStaff.role || 'Kaamgaar'],
                ['Phone', selectedStaff.phone || '-'],
                ['Daily Wage', `Rs. ${ds.rate}`],
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
                [ds.p, ds.a, ds.h, ds.l, `${ds.p + (ds.h * 0.5)} days`]
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
                ['Gross Salary (Present + Half Days)', `Rs. ${ds.gross}`],
                ['Deductions (Absents)', `Rs. ${ds.deduct}`],
                ['Advance Deducted', `Rs. ${Number(selectedStaff.advance) || 0}`],
                ['Net Payable Salary', `Rs. ${ds.net}`],
            ],
            didParseCell: function(data) {
                if (data.row.index === 3) {
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

        const breakdownBody = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            const rec = currentMonthRecords.find((a: any) => a.date === dStr);
            const status = rec ? rec.status : 'NOT MARKED';
            const dateDisplay = `${i} ${currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
            breakdownBody.push([dateDisplay, status.replace('_', ' ')]);
        }

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

        const footerText = businessProfile?.name || 'BillGST';
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(footerText, 14, pageHeight - 10);

        doc.save(`${selectedStaff.name.replace(/\s+/g, '_')}_Salary_${currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}.pdf`);
        toast.success('Salary Slip PDF Downloaded!');
    };

    const generateMasterReportPDF = () => {
        const doc = new jsPDF();
        
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
            const rate = Number(member.daily_wage) || 0;
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

            const gross = (p * rate) + (h * rate * 0.5);
            const deduct = a * rate;
            const net = gross - deduct;

            grandTotalNet += net;
            grandTotalPresent += p + (h * 0.5);

            tableBody.push([
                member.name,
                member.role || 'Kaamgaar',
                `${p + (h*0.5)} days`,
                `Rs. ${rate}`,
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

        const footerText = businessProfile?.name || 'BillGST';
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(footerText, 14, pageHeight - 10);

        const filename = `Master_Report_${currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}.pdf`;
        try {
            // Use Blob URL approach for better mobile/TWA compatibility
            const pdfBlob = doc.output('blob');
            const blobUrl = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            toast.success('Master Report Downloaded!');
        } catch (err) {
            console.error('PDF Save error:', err);
            // Fallback
            doc.save(filename);
            toast.success('Master Report Downloaded (Fallback)!');
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
                --bg:#f0f2f8;--white:#fff;--ink:#0d0f1c;--ink2:#3a3d58;--ink3:#7b7fa0;--ink4:#b8bbd0;
                --border:#e0e3f0;--green:#10b981;--green-lt:#e8faf3;--green-dk:#059669;
                --red:#ef4444;--red-lt:#fff0f0;--amber:#f59e0b;--amber-lt:#fffbeb;
                --blue:#3b82f6;--blue-lt:#eff6ff;--indigo:#4f46e5;--indigo-lt:#eef0ff;
                --purple:#8b5cf6;--purple-lt:#f5f3ff;
                --r:14px;--rsm:10px;--rxs:7px;
                --sh:0 2px 12px rgba(13,15,28,.07);--shmd:0 8px 32px rgba(13,15,28,.12);
            }
            .sa-container {
                font-family: 'Nunito', sans-serif;
                background: var(--bg);
                max-width: 600px; margin: 20px auto; /* Centered with top margin instead of squished to edges */
                min-height: calc(100vh - 100px); color: var(--ink);
                -webkit-font-smoothing: antialiased;
                position: relative;
                padding-bottom: 20px;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: var(--shmd);
            }
            .sa-container *{scrollbar-width:none;}
            .sa-container *::-webkit-scrollbar{display:none;}
            
            .topbar{background:linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4f46e5 100%);padding:14px 16px 0;position:relative;z-index:100;}
            .tb1{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
            .logo-box{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:9px;padding:6px 11px 6px 8px;}
            .logo-sq{width:22px;height:22px;border-radius:5px;background:linear-gradient(135deg,#fff,rgba(255,255,255,.7));display:flex;align-items:center;justify-content:center;}
            .logo-nm{font-size:12px;font-weight:900;color:#fff;}
            .tb-title{flex:1;font-size:17px;font-weight:900;color:#fff;letter-spacing:-.3px;}
            .tb-icons{display:flex;gap:6px;}
            .tbi{width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;cursor:pointer;}
            
            .page-tabs{display:flex;gap:6px;justify-content:space-between;}
            .ptab{flex:1;min-width:110px;padding:10px 8px;text-align:center;font-size:12px;font-weight:800;color:rgba(255,255,255,.5);border-bottom:2px solid transparent;cursor:pointer;}
            .ptab.on{color:#fff;border-bottom-color:#fff;}
            
            .date-strip{background:var(--white);padding:14px 16px;border-bottom:1px solid var(--border);}
            .date-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
            .date-nav-btn{width:32px;height:32px;border-radius:8px;background:var(--bg);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;}
            .date-center{text-align:center;}
            .date-month{font-size:15px;font-weight:900;}
            .date-year{font-size:11px;color:var(--ink4);font-weight:700;}
            .today-btn{font-size:11px;font-weight:800;color:var(--indigo);background:var(--indigo-lt);border:none;border-radius:6px;padding:5px 12px;cursor:pointer;}
            
            .days-scroll{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scroll-behavior: smooth;}
            .day-chip{display:flex;flex-direction:column;align-items:center;min-width:44px;padding:8px 6px;border-radius:12px;cursor:pointer;flex-shrink:0;border:1.5px solid transparent;}
            .day-chip.today{background:var(--indigo);border-color:var(--indigo);}
            .day-chip.has-data{border-color:var(--border);}
            .day-chip.sunday{background:var(--red-lt);}
            .day-chip.selected{border-color:var(--indigo); background:var(--indigo-lt);}
            .day-chip-name{font-size:9px;font-weight:800;text-transform:uppercase;color:var(--ink4);}
            .day-chip.today .day-chip-name{color:rgba(255,255,255,.7);}
            .day-chip-num{font-size:16px;font-weight:900;line-height:1.2;}
            .day-chip.today .day-chip-num{color:#fff;}
            .day-chip.sunday .day-chip-num{color:var(--red);}
            
            .stats-row{display:grid;grid-template-columns:repeat(4,1fr);background:var(--white);border-bottom:1px solid var(--border);}
            .stat-box{padding:12px 6px;text-align:center;border-right:1px solid var(--border);}
            .stat-num{font-size:20px;font-weight:900;line-height:1;}
            .stat-lbl{font-size:9px;font-weight:700;text-transform:uppercase;margin-top:3px;}
            .sn-g{color:var(--green);} .sn-r{color:var(--red);} .sn-a{color:var(--amber);} .sn-b{color:var(--blue);}
            
            .controls{background:var(--white);padding:10px 14px;display:flex;gap:8px;border-bottom:1px solid var(--border);position:relative;z-index:100;}
            .sbox{flex:1;display:flex;align-items:center;gap:8px;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--rsm);padding:8px 11px;}
            .sbox svg{width:16px;height:16px;color:var(--ink4);}
            .sbox input{flex:1;border:none;outline:none;background:none;font-size:13px;color:var(--ink);}
            .mark-all-btn{display:flex;align-items:center;gap:5px;background:var(--green);color:#fff;border:none;border-radius:var(--rsm);padding:8px 13px;font-size:12px;font-weight:800;}
            
            .dept-tabs{background:var(--white);padding:8px 14px 10px;display:flex;gap:6px;overflow-x:auto;border-bottom:1px solid var(--border);}
            .dtab{padding:5px 13px;border-radius:99px;font-size:11px;font-weight:800;border:1.5px solid var(--border);background:transparent;color:var(--ink3);white-space:nowrap;flex-shrink:0;}
            .dtab.on{background:var(--ink);border-color:var(--ink);color:#fff;}
            
            .workers{padding:10px 12px 100px;display:flex;flex-direction:column;gap:8px;}
            .wcard{background:var(--white);border-radius:var(--r);border:1px solid var(--border);box-shadow:var(--sh);overflow:hidden;}
            .wcard-top{display:flex;align-items:center;gap:11px;padding:12px 14px;}
            .wavt{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:900;color:#fff;position:relative;flex-shrink:0;}
            .online-ring{position:absolute;bottom:-1px;right:-1px;width:13px;height:13px;border-radius:50%;border:2px solid #fff;}
            .or-green{background:var(--green);} .or-red{background:var(--red);} .or-amber{background:var(--amber);} .or-blue{background:var(--blue);}
            .winfo{flex:1;min-width:0;}
            .wname{font-size:14px;font-weight:900;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
            .wmeta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
            .wrole{font-size:10px;font-weight:800;text-transform:uppercase;padding:2px 7px;border-radius:5px;}
            .wsalary{font-family:'DM Mono',monospace;font-size:11px;color:var(--ink3);font-weight:500;}
            .att-btns{display:flex;gap:4px;flex-shrink:0;}
            .att-btn{width:28px;height:28px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg);display:flex;align-items:center;justify-content:center;cursor:pointer;font-weight:800;font-size:12px;transition:all 0.15s;}
            .att-btn:hover{transform:scale(1.05);}
            .att-btn.present{background:var(--green-lt);border-color:var(--green);color:var(--green);}
            .att-btn.absent{background:var(--red-lt);border-color:var(--red);color:var(--red);}
            .att-btn.half{background:var(--amber-lt);border-color:var(--amber);color:var(--amber);}
            .att-btn.leave{background:var(--blue-lt);border-color:var(--blue);color:var(--blue);}
            .delete-btn{width:28px;height:28px;border-radius:8px;border:1.5px solid #ef4444;background:#fff5f5;color:#ef4444;display:flex;align-items:center;justify-content:center;cursor:pointer;font-weight:800;font-size:14px;transition:all 0.15s;}
            .delete-btn:hover{background:#fee2e2;}
            
            .salary-row{padding:9px 14px;background:#fafbff;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;cursor:pointer;}
            .sal-label{font-size:11px;color:var(--ink4);font-weight:700;}
            .sal-amt{font-size:13px;font-weight:600;color:var(--green);}
            .pay-btn{font-size:11px;font-weight:800;color:var(--indigo);background:var(--indigo-lt);border:none;border-radius:6px;padding:5px 12px;cursor:pointer;}
            
            .fab{position:absolute;bottom:20px;right:20px;width:52px;height:52px;border-radius:16px;background:var(--indigo);border:none;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(79,70,229,.4);color:white;z-index:150;cursor:pointer;}
            
            .ov{position:fixed;inset:0;z-index:9999;background:rgba(13,15,28,.5);backdrop-filter:blur(7px);display:flex;align-items:flex-end;justify-content:center;}
            .bsheet{background:var(--white);border-radius:24px 24px 0 0;width:100%;max-width:600px;padding:0 18px 36px;max-height:90vh;overflow-y:auto;box-shadow:0 -10px 40px rgba(0,0,0,0.1);}
            .bsh-handle{width:36px;height:4px;border-radius:2px;background:var(--border);margin:14px auto 18px;}
            
            .aw-field{display:flex;align-items:center;gap:10px;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r);padding:12px 14px;margin-bottom:10px;}
            .aw-field-icon{width:32px;height:32px;border-radius:9px;background:var(--indigo-lt);display:flex;align-items:center;justify-content:center;}
            .aw-field-icon svg{width:18px;height:18px;}
            .aw-inner{flex:1;position:relative;}
            .aw-lbl{font-size:10px;font-weight:800;color:var(--ink3);text-transform:uppercase;}
            .aw-inner input,.aw-inner select{width:100%;border:none;outline:none;background:none;font-size:14px;font-weight:700;color:var(--ink);}
            .aw-save{width:100%;padding:14px;border-radius:var(--r);background:linear-gradient(135deg,var(--indigo),var(--purple));border:none;color:#fff;font-size:15px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:8px;}
            .aw-save svg{width:20px;height:20px;}
            
            .sal-card{background:var(--bg);border-radius:var(--r);padding:14px;margin-bottom:14px;}
            .sal-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);}
            .sal-lbl{font-size:13px;color:var(--ink3);}
            .sal-val{font-size:13px;font-weight:600;}
            `}} />

            <div className="sa-container">
                {/* TOPBAR */}
                <div className="topbar">
                    <div className="tb1">
                        <div className="logo-box">
                            <div className="logo-sq" style={{ padding: businessProfile?.logo ? '0' : '6px' }}>
                                {businessProfile?.logo ? (
                                    <img src={businessProfile.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '5px' }} />
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" /><rect x="13" y="3" width="8" height="5" rx="2" fill="currentColor" opacity=".6" /><rect x="3" y="13" width="8" height="5" rx="2" fill="currentColor" opacity=".6" /><rect x="13" y="11" width="8" height="8" rx="2" fill="currentColor" /></svg>
                                )}
                            </div>
                            <span className="logo-nm">{businessProfile?.name || 'BillGST'}</span>
                        </div>
                        <span className="tb-title">Smart Attendance</span>
                        <div className="tb-icons">
                            <button className="tbi" onClick={() => toast.success('Report dekhein')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8" /></svg>
                            </button>
                        </div>
                    </div>
                    <div className="page-tabs">
                        <div className={`ptab ${activeTab === 'workers' ? 'on' : ''}`} onClick={() => setActiveTab('workers')}>👷 Kaamgaar</div>
                        <div className={`ptab ${activeTab === 'school' ? 'on' : ''}`} onClick={() => setActiveTab('school')}>🎓 Vidyarthi</div>
                        <div className={`ptab ${activeTab === 'salary' ? 'on' : ''}`} onClick={() => setActiveTab('salary')}>💰 Vetan</div>
                        <div className={`ptab ${activeTab === 'report' ? 'on' : ''}`} onClick={generateMasterReportPDF}>📊 Report PDF</div>
                    </div>
                </div>

                {/* DATE STRIP */}
                <div className="date-strip">
                    <div className="date-nav">
                        <button className="date-nav-btn" onClick={prevMonth}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <div className="date-center">
                            <div className="date-month">{currentMonth.toLocaleString('default', { month: 'short' })} {currentMonth.getFullYear()}</div>
                            <div className="date-year">Aaj: {new Date().getDate()} {new Date().toLocaleString('default', { month: 'short' })}</div>
                        </div>
                        <button className="today-btn" onClick={goToToday}>Aaj</button>
                        <button className="date-nav-btn" onClick={nextMonth}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>

                    <div className="days-scroll" ref={scrollRef}>
                        {daysArray.map(d => (
                            <div 
                                key={d.dateStr}
                                onClick={() => setSelectedDate(d.dateStr)}
                                className={`day-chip ${d.isSun ? 'sunday' : 'has-data'} ${d.isToday ? 'today' : ''} ${selectedDate === d.dateStr ? 'selected' : ''}`}
                            >
                                <div className="day-chip-name">{d.dayName}</div>
                                <div className="day-chip-num">{d.dayNum}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* STATS */}
                <div className="stats-row">
                    <div className="stat-box"><div className="stat-num sn-g">{todayStats.P}</div><div className="stat-lbl sl">Aaya</div></div>
                    <div className="stat-box"><div className="stat-num sn-r">{todayStats.A}</div><div className="stat-lbl sl">Nahi Aaya</div></div>
                    <div className="stat-box"><div className="stat-num sn-a">{todayStats.H}</div><div className="stat-lbl sl">Adha Din</div></div>
                    <div className="stat-box"><div className="stat-num sn-b">{todayStats.L}</div><div className="stat-lbl sl">Chhutii</div></div>
                </div>

                {/* CONTROLS */}
                <div className="controls">
                    <div className="sbox">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <input type="text" placeholder="Naam dhundho..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <button className="mark-all-btn" onClick={markAllPresent}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                        Sabko Haazir
                    </button>
                </div>

                {/* DEPT TABS */}
                <div className="dept-tabs">
                    <button className={`dtab ${deptFilter === 'all' ? 'on' : ''}`} onClick={() => setDeptFilter('all')}>Sab</button>
                    <button className={`dtab ${deptFilter === 'worker' ? 'on' : ''}`} onClick={() => setDeptFilter('worker')}>Kaamgaar</button>
                    <button className={`dtab ${deptFilter === 'driver' ? 'on' : ''}`} onClick={() => setDeptFilter('driver')}>Driver</button>
                    <button className={`dtab ${deptFilter === 'guard' ? 'on' : ''}`} onClick={() => setDeptFilter('guard')}>Chowkidar</button>
                    <button className={`dtab ${deptFilter === 'cleaner' ? 'on' : ''}`} onClick={() => setDeptFilter('cleaner')}>Safai</button>
                </div>

                {canAccessRoleAdmin && (
                    <div className="admin-shortcut-card" style={{ marginTop: '18px', padding: '18px', borderRadius: '18px', background: '#eef2ff', border: '1px solid #c7d2fe', color: '#1e3a8a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: 800 }}>Owner/Admin ke liye</div>
                                <div style={{ fontSize: '13px', color: '#334155', marginTop: '6px' }}>
                                    Yahan se staff ke roles assign karne ka page khol sakte ho. Sirf owner/admin login wale dekh sakte hain.
                                </div>
                            </div>
                            <Link href="/dashboard/admin" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition">
                                Admin Panel Kholen
                            </Link>
                        </div>
                    </div>
                )}

                {/* WORKERS LIST */}
                <div className="workers">
                    {filteredStaff.length === 0 && (
                        <div className="text-center mt-10 text-[#7b7fa0] font-bold flex flex-col items-center">
                            <div style={{ marginBottom: '15px' }}>Koi kaamgaar nahi mila</div>
                            <button onClick={() => setSheet('add')} style={{ padding: '12px 24px', background: '#4f46e5', color: 'white', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                                + Naya Staff Add Karein
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
                                        <div className="wmeta">
                                            <span className="wrole" style={{ background: roleColor.bg, color: roleColor.text }}>{member.role || 'Kaamgaar'}</span>
                                            <span className="wsalary">₹{member.daily_wage || 0}/din</span>
                                        </div>
                                    </div>
                                    <div className="att-btns">
                                        <button className={`att-btn ${status === 'PRESENT' ? 'present' : ''}`} onClick={() => handleSetAtt(member.id, 'PRESENT')} title="Present">✓</button>
                                        <button className={`att-btn ${status === 'HALF_DAY' ? 'half' : ''}`} onClick={() => handleSetAtt(member.id, 'HALF_DAY')} title="Half Day">½</button>
                                        <button className={`att-btn ${status === 'ABSENT' ? 'absent' : ''}`} onClick={() => handleSetAtt(member.id, 'ABSENT')} title="Absent">✕</button>
                                        <button className={`att-btn ${status === 'LEAVE' ? 'leave' : ''}`} onClick={() => handleSetAtt(member.id, 'LEAVE')} title="Leave">🏖</button>
                                    {deleteStaff && (
                                        <button className="delete-btn" onClick={async () => {
                                            if (window.confirm(`Delete ${member.name}?`)) {
                                                await deleteStaff(member.id);
                                                fetchStaff();
                                                toast.success('Staff removed');
                                            }
                                        }} title="Delete Staff">🗑</button>
                                    )}
                                    </div>
                                </div>
                                
                                {(status === 'PRESENT' || status === 'HALF_DAY') && (
                                    <div style={{ padding: '8px 14px', background: '#fafbff', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase' }}>In Time (Optional)</label>
                                            <input type="time" value={times.in_time} onChange={(e) => handleSetAtt(member.id, status, e.target.value, times.out_time)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px' }} />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase' }}>Out Time (Optional)</label>
                                            <input type="time" value={times.out_time} onChange={(e) => handleSetAtt(member.id, status, times.in_time, e.target.value)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px' }} />
                                        </div>
                                    </div>
                                )}

                                <div className="salary-row" onClick={() => { setSelectedStaff(member); setEditStaffData({ daily_wage: member.daily_wage || 0, advance: member.advance || 0 }); setIsEditingStaff(false); setSheet('detail'); }}>
                                    <div className="sal-info">
                                        <div>
                                            <div className="sal-label">Rate / Details</div>
                                            <div className="sal-amt">₹{member.daily_wage || 0} / din</div>
                                        </div>
                                    </div>
                                    <button className="pay-btn">Vetan Dekho →</button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FAB */}
                <button className="fab" onClick={() => setSheet('add')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                </button>

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
                                    <div style={{ fontSize: '12px', color: '#7b7fa0' }}>{selectedStaff.role} · ₹{selectedStaff.daily_wage}/din</div>
                                    {selectedStaff.email && (
                                        <div style={{ fontSize: '11px', color: '#7b7fa0', marginTop: '4px' }}>{selectedStaff.email}</div>
                                    )}
                                </div>
                                <button onClick={() => setSheet('none')} style={{ marginLeft: 'auto', width: '32px', height: '32px', borderRadius: '50%', background: '#f0f2f8', border: '1px solid #e0e3f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '18px' }}>
                                <div style={{ background: '#f0f2f8', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#10b981' }}>{ds.p}</div><div style={{ fontSize: '9px', fontWeight: 700, color: '#b8bbd0' }}>Aaya</div>
                                </div>
                                <div style={{ background: '#f0f2f8', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#ef4444' }}>{ds.a}</div><div style={{ fontSize: '9px', fontWeight: 700, color: '#b8bbd0' }}>Nahi Aaya</div>
                                </div>
                                <div style={{ background: '#f0f2f8', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#f59e0b' }}>{ds.h}</div><div style={{ fontSize: '9px', fontWeight: 700, color: '#b8bbd0' }}>Adha</div>
                                </div>
                                <div style={{ background: '#f0f2f8', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#3b82f6' }}>{ds.l}</div><div style={{ fontSize: '9px', fontWeight: 700, color: '#b8bbd0' }}>Chhutii</div>
                                </div>
                            </div>

                            <div className="sal-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#b8bbd0', textTransform: 'uppercase' }}>Vetan Hisaab — {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</div>
                                    <button onClick={() => setIsEditingStaff(!isEditingStaff)} style={{ fontSize: '11px', fontWeight: 800, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        {isEditingStaff ? 'Cancel' : 'Edit Pagar/Advance ✎'}
                                    </button>
                                </div>
                                
                                {isEditingStaff ? (
                                    <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #e0e3f0' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 800, color: '#7b7fa0', display: 'block', marginBottom: '2px' }}>Roz Ka Vetan (₹)</label>
                                            <input type="number" value={editStaffData.daily_wage} onChange={e => setEditStaffData({...editStaffData, daily_wage: Number(e.target.value)})} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e0e3f0', outline: 'none', fontSize: '13px' }} />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 800, color: '#7b7fa0', display: 'block', marginBottom: '2px' }}>Advance Diya (₹)</label>
                                            <input type="number" value={editStaffData.advance} onChange={e => setEditStaffData({...editStaffData, advance: Number(e.target.value)})} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e0e3f0', outline: 'none', fontSize: '13px' }} />
                                        </div>
                                        <button onClick={handleUpdateStaffInfo} style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>Save Updates</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="sal-row"><span className="sal-lbl">Roz ka vetan</span><span className="sal-val">₹{ds.rate}</span></div>
                                        <div className="sal-row"><span className="sal-lbl">Haazir din</span><span className="sal-val" style={{ color: '#10b981' }}>{ds.p + (ds.h * 0.5)} din</span></div>
                                        <div className="sal-row"><span className="sal-lbl">Kul vetan</span><span className="sal-val">₹{ds.gross}</span></div>
                                        <div className="sal-row"><span className="sal-lbl">Katauti (Gairahaaziri)</span><span className="sal-val" style={{ color: '#ef4444' }}>-₹{ds.deduct}</span></div>
                                        <div className="sal-row"><span className="sal-lbl">Advance Liya</span><span className="sal-val" style={{ color: '#f59e0b' }}>-₹{selectedStaff.advance || 0}</span></div>
                                        <div className="sal-row" style={{ borderTop: '2px dashed #e0e3f0', marginTop: '5px', paddingTop: '10px' }}><span className="sal-lbl" style={{ fontWeight: 800, color: '#0d0f1c' }}>Net Vetan</span><span className="sal-val" style={{ color: '#4f46e5', fontSize: '15px' }}>₹{ds.net}</span></div>
                                    </>
                                )}
                            </div>

                            <button onClick={generateSalarySlipPDF} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#eef0ff', color: '#4f46e5', fontSize: '15px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>
                                Salary PDF Download Karein
                            </button>
                        </div>
                    </div>
                )}

                {/* ADD WORKER SHEET */}
                {sheet === 'add' && (
                    <div className="ov" onClick={() => setSheet('none')}>
                        <div className="bsheet" onClick={e => e.stopPropagation()}>
                            <div className="bsh-handle"></div>
                            <div style={{ fontSize: '19px', fontWeight: 900, color: '#0d0f1c', marginBottom: '6px' }}>➕ Naya Kaamgaar Jodo</div>
                            <div style={{ fontSize: '12px', color: '#b8bbd0', marginBottom: '18px', fontWeight: 600 }}>Kaamgaar ki jaankari bhari aur save karo</div>

                            <div className="aw-field">
                                <div className="aw-field-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                                <div className="aw-inner" style={{ position: 'relative' }}>
                                    <div className="aw-lbl">Poora Naam *</div>
                                    <input type="text" placeholder="Jaise: Ramesh Kumar" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    {formData.name && (
                                        <button type="button" onClick={() => setFormData({ ...formData, name: '' })} style={{ position: 'absolute', right: '10px', top: '45px', border: 'none', background: 'transparent', color: '#7b7fa0', cursor: 'pointer', fontSize: '16px' }} aria-label="Clear name field">×</button>
                                    )}
                                </div>
                            </div>

                            <div className="aw-field">
                                <div className="aw-field-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16z" /></svg></div>
                                <div className="aw-inner">
                                    <div className="aw-lbl">Email (optional)</div>
                                    <input type="email" placeholder="user@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="aw-field">
                                <div className="aw-field-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16z" /></svg></div>
                                <div className="aw-inner">
                                    <div className="aw-lbl">Phone Number *</div>
                                    <input type="tel" placeholder="10 digit number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="aw-field" style={{ marginBottom: 0 }}>
                                    <div className="aw-field-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" /></svg></div>
                                    <div className="aw-inner">
                                        <div className="aw-lbl">Kaam</div>
                                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                            <option>Kaamgaar</option>
                                            <option>Driver</option>
                                            <option>Chowkidar</option>
                                            <option>Safai</option>
                                            <option>Manager</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="aw-field" style={{ marginBottom: 0 }}>
                                    <div className="aw-field-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg></div>
                                    <div className="aw-inner">
                                        <div className="aw-lbl">Din ka Vetan (₹)</div>
                                        <input type="number" placeholder="400" value={formData.daily_wage} onChange={e => setFormData({ ...formData, daily_wage: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <button className="aw-save" onClick={handleSaveWorker} style={{ marginTop: '20px' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>
                                Kaamgaar Save Karo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

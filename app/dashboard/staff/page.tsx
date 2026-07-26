'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { normalizeRole, isOwnerRole } from '@/lib/role-utils';
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

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(getLocalISODate());
    const [isSaving, setIsSaving] = useState(false);
    
    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFilter, setCurrentFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pdfActionSheet, setPdfActionSheet] = useState<{show: boolean, type: 'master' | 'salary'}>({show: false, type: 'master'});
    const [selectedStaff, setSelectedStaff] = useState<any>(null);

    // Add form state
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('Worker');
    const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);

    // Detail Sheet
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (fetchStaff) fetchStaff(false, 1);
        fetchAttendance();
    }, [fetchStaff, fetchAttendance]);

    // AI Draft Data
    useEffect(() => {
        if (!isClient) return;
        if (aiDraftData && aiDraftData.type === 'ATTENDANCE') {
            const timer = setTimeout(() => {
                const { staffName, status } = aiDraftData;
                if (staffName && staff && staff.length > 0) {
                    const normalizedStaffName = staffName.toLowerCase().replace(/\s+/g, '');
                    const foundStaff = staff.find((s: any) => {
                        const sName = s.name.toLowerCase().replace(/\s+/g, '');
                        return sName.includes(normalizedStaffName) || normalizedStaffName.includes(sName);
                    });
                    if (foundStaff) {
                        const attendanceStatus = status === 'ABSENT' ? 'ABSENT' : 'PRESENT';
                        markAttendance(foundStaff.id, selectedDate, attendanceStatus).then(() => {
                            toast.success(`✅ AI ne ${foundStaff.name} ki attendance laga di hai!`);
                        }).catch(console.error);
                    }
                }
                setAiDraftData(null);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [aiDraftData, staff, selectedDate, markAttendance, setAiDraftData, isClient]);

    if (!isClient) return null;

    // Data filtering
    const getStatus = (staffId: string, dStr: string) => {
        const rec = attendance?.find((a: any) => a.staff_id === staffId && a.date === dStr);
        return rec ? rec.status : null;
    };

    const roles = ["All", ...Array.from(new Set((staff || []).map((s: any) => s.role || 'Worker'))).filter(Boolean)] as string[];

    const filteredStaff = (staff || []).filter((s: any) => {
        const matchRole = currentFilter === 'All' || s.role === currentFilter;
        const matchName = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || getStatus(s.id, selectedDate) === statusFilter;
        return matchRole && matchName && matchStatus;
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));

    const todayStats = { P: 0, A: 0, H: 0, L: 0 };
    (staff || []).forEach((s: any) => {
        const st = getStatus(s.id, selectedDate);
        if (st === 'PRESENT') todayStats.P++;
        else if (st === 'ABSENT') todayStats.A++;
        else if (st === 'HALF_DAY') todayStats.H++;
        else if (st === 'LEAVE') todayStats.L++;
    });

    // Date nav
    const shiftDay = (delta: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + delta);
        setSelectedDate(getLocalISODate(d));
        setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    };

    // Actions
    const handleSetAtt = async (id: string, status: string, in_time?: string | null, out_time?: string | null, note?: string | null) => {
        try {
            const currentStatus = getStatus(id, selectedDate);
            const isJustStatusClick = in_time === undefined && out_time === undefined && note === undefined;
            const newStatus = (isJustStatusClick && currentStatus === status) ? 'UNMARKED' : status; 
            
            const existing = attendance?.find((a: any) => a.staff_id === id && a.date === selectedDate);
            await markAttendance(
                id, 
                selectedDate, 
                newStatus,
                in_time !== undefined ? in_time : existing?.in_time,
                out_time !== undefined ? out_time : existing?.out_time,
                note !== undefined ? note : existing?.note
            );
        } catch (e) { console.error(e); }
    };

    const markAllPresent = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const promises = [];
            for (const s of filteredStaff) {
                if (!getStatus(s.id, selectedDate) || getStatus(s.id, selectedDate) === 'UNMARKED') {
                    promises.push(markAttendance(s.id, selectedDate, 'PRESENT'));
                }
            }
            await Promise.all(promises);
            toast.success('Marked all as present ✓');
        } finally { setIsSaving(false); }
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400;
                    const MAX_HEIGHT = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = Math.round(width);
                    canvas.height = Math.round(height);
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% JPEG
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handlePhotoUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const tid = toast.loading('Compressing photo...');
        try {
            const compressedBase64 = await compressImage(file);
            toast.success('Photo ready!', { id: tid });
            setPendingPhoto(compressedBase64);
        } catch (err) {
            toast.error('Failed to compress photo', { id: tid });
        }
    };

    const handleStaffPhotoUpload = (id: string) => {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'image/*';
        inp.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const tid = toast.loading('Compressing and saving...');
            try {
                const compressedBase64 = await compressImage(file);
                const s = staff.find((x: any) => x.id === id);
                if (s) {
                    await updateStaff(id, { ...s, photo: compressedBase64 });
                    toast.success('Photo updated!', { id: tid });
                } else {
                    toast.dismiss(tid);
                }
            } catch (err) {
                toast.error('Failed to update photo', { id: tid });
            }
        };
        inp.click();
    };

    const handleAddStaff = async () => {
        if (!newName.trim()) return toast.error('Naam daalna zaroori hai');
        if (isSaving) return;
        setIsSaving(true);
        try {
            await addStaff({
                name: newName,
                role: newRole,
                photo: pendingPhoto,
                salary_type: 'daily',
                daily_wage: 0
            });
            setIsModalOpen(false);
            setNewName('');
            setPendingPhoto(null);
            toast.success('Staff added');
        } finally { setIsSaving(false); }
    };

    const initials = (name: string) => {
        return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    };

    const statusMeta = {
        PRESENT: { color: "var(--present)", bg: "var(--present-bg)", label: "Present" },
        ABSENT: { color: "var(--absent)", bg: "var(--absent-bg)", label: "Absent" },
        HALF_DAY: { color: "var(--half)", bg: "var(--half-bg)", label: "Half Day" },
        LEAVE: { color: "var(--leave)", bg: "var(--leave-bg)", label: "Leave" }
    };

    const dObj = new Date(selectedDate);
    const dayName = dObj.toLocaleDateString('en-US', { weekday: 'long' });
    const dateLabel = dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // PDF Logics
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    // Simplified ds logic for PDF
    const getStats = (staffId: string) => {
        const s = staff.find((x: any) => x.id === staffId);
        const rate = s?.salary_type === 'monthly' ? (Number(s.monthly_salary) / daysInMonth) : (Number(s.daily_wage) || 0);
        const currentMonthRecords = attendance?.filter((a: any) => 
            a.staff_id === staffId && 
            a.date.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}`)
        ) || [];
        let p = 0, a = 0, h = 0, l = 0;
        currentMonthRecords.forEach((r: any) => {
            if (r.status === 'PRESENT') p++;
            if (r.status === 'ABSENT') a++;
            if (r.status === 'HALF_DAY') h++;
            if (r.status === 'LEAVE') l++;
        });
        const gross = Math.round((p * rate) + (h * rate * 0.5) + (l * rate));
        const advance = Number(s?.advance) || 0;
        return { p, a, h, l, rate, gross, net: gross - advance };
    };

    const generateMasterReportPDF = async (action: 'view' | 'share' | 'download' = 'view') => {
        const doc = new jsPDF();
        // PDF Gen logic same as original...
        const margin = 8;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

        if (businessProfile?.logo) {
            try { doc.addImage(businessProfile.logo, 'PNG', 170, 10, 24, 24); } catch (e) { }
        }

        doc.setFontSize(22); doc.setTextColor(91, 61, 245);
        doc.text('Monthly Attendance & Salary Report', 14, 22);
        
        doc.setFontSize(10); doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Month: ${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`, 14, 35);

        const tableBody: any[] = [];
        let grandTotalNet = 0; let grandTotalPresent = 0;

        filteredStaff.forEach((member: any) => {
            const ds = getStats(member.id);
            grandTotalNet += ds.net;
            grandTotalPresent += ds.p + (ds.h * 0.5) + ds.l;
            tableBody.push([
                member.name,
                member.role || 'Worker',
                `${ds.p + (ds.h*0.5) + ds.l} days`,
                member.salary_type === 'monthly' ? `Rs. ${member.monthly_salary} /mo` : `Rs. ${ds.rate} /day`,
                `Rs. ${ds.net}`
            ]);
        });

        autoTable(doc, {
            startY: 45,
            head: [['Staff Name', 'Role', 'Total Presence', 'Daily Wage', 'Net Salary']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [91, 61, 245] }
        });

        const finalY = (doc as any).lastAutoTable.finalY || 150;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        
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
        }
        const filename = `Master_Report_${currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}_${Date.now()}.pdf`;
        try {
            const base64Data = doc.output('datauristring').split(',')[1];
            const { downloadAndShareFile } = await import('@/lib/utils');
            await downloadAndShareFile(base64Data, filename, 'application/pdf', action);
            if (action !== 'view') toast.success('Master Report Ready!');
        } catch (err) { toast.error('Failed to save PDF'); }
    };

    const generateSalarySlipPDF = async (action: 'view' | 'share' | 'download' = 'view') => {
        if (!selectedStaff) return;
        const doc = new jsPDF();
        const margin = 8;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

        if (businessProfile?.logo) {
            try { doc.addImage(businessProfile.logo, 'PNG', 170, 10, 24, 24); } catch (e) {}
        }
        
        doc.setFontSize(22); doc.setTextColor(91, 61, 245);
        doc.text('Salary Slip', 14, 22);
        
        doc.setFontSize(10); doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Report Month: ${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`, 14, 35);
        
        doc.setFontSize(14); doc.setTextColor(0, 0, 0);
        doc.text('Staff Details', 14, 50);
        
        const ds = getStats(selectedStaff.id);
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

        const finalY = (doc as any).lastAutoTable.finalY || 85;
        doc.setFontSize(14);
        doc.text('Attendance Summary', 14, finalY + 15);
        
        autoTable(doc, {
            startY: finalY + 20,
            head: [['Present', 'Absent', 'Half Day', 'Leave', 'Total Presence']],
            body: [[`${ds.p} days`, `${ds.a} days`, `${ds.h} days`, `${ds.l} days`, `${ds.p + (ds.h * 0.5) + ds.l} days`]],
            theme: 'grid',
            headStyles: { fillColor: [91, 61, 245] }
        });

        const finalY2 = (doc as any).lastAutoTable.finalY || 130;
        doc.setFontSize(14);
        doc.text('Salary Calculation', 14, finalY2 + 15);
        
        autoTable(doc, {
            startY: finalY2 + 20,
            head: [['Description', 'Amount']],
            body: [
                ['Gross Salary (Based on presence)', `Rs. ${ds.gross}`],
                ['Advance / Deductions', ds.net < ds.gross ? `Rs. ${ds.gross - ds.net}` : `Rs. ${Number(selectedStaff.advance) || 0}`],
            ],
            foot: [['Net Payable', `Rs. ${ds.net}`]],
            theme: 'grid',
            headStyles: { fillColor: [91, 61, 245] },
            footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
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
            if (rec.status === 'UNMARKED') return;
            const dateObj = new Date(rec.date);
            const dateDisplay = `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
            let statusText = rec.status.replace('_', ' ');
            if (rec.in_time || rec.out_time) {
                statusText += ` (${rec.in_time || '-'} to ${rec.out_time || '-'})`;
            }
            if (rec.note) statusText += ` | Note: ${rec.note}`;
            breakdownBody.push([dateDisplay, statusText]);
        });

        if (breakdownBody.length === 0) {
            breakdownBody.push(['-', 'No attendance marked this month']);
        }

        autoTable(doc, {
            startY: dailyY + 20,
            head: [['Date', 'Status / Time']],
            body: breakdownBody,
            theme: 'grid',
            headStyles: { fillColor: [50, 50, 50] },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 1) {
                    const st = data.cell.raw as string;
                    if (st.includes('PRESENT')) data.cell.styles.textColor = [16, 185, 129];
                    else if (st.includes('ABSENT')) data.cell.styles.textColor = [239, 68, 68];
                    else if (st.includes('HALF DAY')) data.cell.styles.textColor = [245, 158, 11];
                    else if (st.includes('LEAVE')) data.cell.styles.textColor = [59, 130, 246];
                }
            }
        });

        const isPremium = businessProfile?.subscription_plan === 'PREMIUM' || businessProfile?.subscription_plan === 'ENTERPRISE' || ['BASIC_30', 'PREMIUM_99', 'YEARLY_299', 'LIFETIME'].includes(businessProfile?.plan_type);
        if (!isPremium) {
            await drawFreeBranding(doc, false, pageWidth, pageHeight, pageHeight - 20);
        }
        
        const filename = `Salary_Slip_${selectedStaff.name.replace(/\s+/g, '_')}_${currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}.pdf`;
        try {
            const base64Data = doc.output('datauristring').split(',')[1];
            const { downloadAndShareFile } = await import('@/lib/utils');
            await downloadAndShareFile(base64Data, filename, 'application/pdf', action);
            if (action !== 'view') toast.success('Salary Slip Ready!');
        } catch (err) { toast.error('Failed to save PDF'); }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                :root{
                  --ink:#1E1B3A; --ink-soft:#6B6785; --bg:#F3F1FA; --card:#FFFFFF;
                  --primary:#5B3DF5; --primary-dark:#4527D6; --primary-light:#EFEBFF;
                  --present:#12B76A; --present-bg:#E7F9F0;
                  --absent:#F04438; --absent-bg:#FDEEEC;
                  --half:#F79009; --half-bg:#FEF3E2;
                  --leave:#2E90FA; --leave-bg:#EAF3FF;
                  --line:#EAE7F7;
                  --radius-lg:22px; --radius-md:16px; --radius-sm:12px;
                  --shadow-soft: 0 4px 18px rgba(91,61,245,0.08);
                  --shadow-card: 0 2px 10px rgba(30,27,58,0.05);
                }
                .att-wrapper *{box-sizing:border-box; -webkit-tap-highlight-color:transparent;}
                .att-wrapper {
                  font-family:'Inter',sans-serif;
                  background: linear-gradient(180deg,#EDE9FB 0%, #F6F4FC 100%);
                  color:var(--ink);
                  display:flex; justify-content:center;
                  padding: 20px 0; min-height:100vh;
                }
                .phone{
                  width:500px; max-width:100%;
                  background:var(--bg); border-radius:36px;
                  box-shadow: 0 30px 60px rgba(45,30,110,0.18), 0 0 0 10px #1c1830;
                  overflow:hidden; position:relative;
                }
                @media(max-width:600px){ .phone { width: 100%; border-radius: 0; box-shadow: none; } .att-wrapper{padding:0;} }
                .scroll{ height:820px; overflow-y:auto; padding-bottom:110px; scrollbar-width:none; }
                .scroll::-webkit-scrollbar{display:none;}
                
                .header{
                  background: linear-gradient(135deg, var(--primary) 0%, #7B5CFA 55%, #9B7CFF 100%);
                  padding:14px 16px 20px; border-radius:0 0 28px 28px;
                  color:#fff; position:relative; overflow:hidden;
                }
                .header::after{
                  display: none;
                }
                .brand-row{display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;}
                .brand{display:flex; align-items:center; gap:10px;}
                .brand-mark{
                  width:38px; height:38px; border-radius:11px;
                  background:rgba(255,255,255,0.18);
                  display:flex; align-items:center; justify-content:center;
                  font-weight:700; font-size:16px;
                }
                .brand-text .t1{font-weight:700; font-size:16px; line-height:1.1;}
                .brand-text .t2{font-size:11px; opacity:0.8; letter-spacing:0.03em;}
                .icon-btn{
                  width:38px; height:38px; border-radius:12px;
                  background:rgba(255,255,255,0.16); border:none; color:#fff; 
                  display:flex; align-items:center; justify-content:center; cursor:pointer;
                }
                .date-nav{
                  display:flex; align-items:center; gap:10px;
                  background:rgba(255,255,255,0.14); border-radius:16px; padding:8px 10px;
                }
                .date-nav button{
                  width:32px; height:32px; border-radius:10px; border:none;
                  background:rgba(255,255,255,0.18); color:#fff; font-size:16px; cursor:pointer;
                  display:flex; align-items:center; justify-content:center;
                }
                .date-center{flex:1; text-align:center; font-weight:600; font-size:15px; cursor:pointer;}
                .date-sub{font-size:10.5px; opacity:0.8; font-weight:400; margin-top:1px;}
                
                .body-pad{padding:12px 16px 0;}
                .search-row{display:flex; gap:10px; margin-bottom:12px;}
                .search-box{
                  flex:1; display:flex; align-items:center; gap:8px;
                  background:var(--card); border-radius:16px; padding:11px 14px;
                  box-shadow:var(--shadow-card); border:1px solid var(--line);
                }
                .search-box input{border:none; outline:none; font-size:13.5px; width:100%; background:transparent; color:var(--ink);}
                .all-present-btn{
                  background: linear-gradient(135deg,var(--present) 0%, #17CC7A 100%);
                  color:#fff; border:none; border-radius:16px; padding:0 16px;
                  font-weight:600; font-size:12.5px;
                  display:flex; align-items:center; gap:6px; cursor:pointer;
                  box-shadow:0 6px 14px rgba(18,183,106,0.28); white-space:nowrap;
                }
                
                .stats-row{display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:12px;}
                .stat{border-radius:16px; padding:10px 4px; text-align:center; border:2px solid transparent; cursor:pointer; transition:transform 0.1s, border 0.1s;}
                .stat.active{border-color:var(--primary); transform:scale(1.02);}
                .stat .num{font-weight:700; font-size:18px; line-height:1;}
                .stat .lbl{font-size:9.5px; font-weight:600; letter-spacing:0.04em; margin-top:2px; text-transform:uppercase; opacity:0.85;}
                .stat.present{background:var(--present-bg); color:var(--present);}
                .stat.absent{background:var(--absent-bg); color:var(--absent);}
                .stat.half{background:var(--half-bg); color:var(--half);}
                .stat.leave{background:var(--leave-bg); color:var(--leave);}
                
                .filters{display:flex; gap:8px; overflow-x:auto; padding-bottom:16px; scrollbar-width:none;}
                .filters::-webkit-scrollbar{display:none;}
                .chip{
                  flex:0 0 auto; padding:8px 16px; border-radius:20px; font-size:12.5px; font-weight:600;
                  background:var(--card); color:var(--ink-soft); border:1px solid var(--line); cursor:pointer;
                }
                .chip.active{background:var(--ink); color:#fff; border-color:var(--ink);}
                
                .list{padding:0 18px; display:flex; flex-direction:column; gap:14px;}
                .staff-card{
                  background:var(--card); border-radius:var(--radius-lg);
                  padding:16px; box-shadow:var(--shadow-card); border:1px solid var(--line);
                }
                .staff-top{display:flex; align-items:center; gap:12px; margin-bottom:14px;}
                .avatar-wrap{position:relative; width:52px; height:52px; flex:0 0 auto;}
                .avatar-ring{
                  width:52px; height:52px; border-radius:50%; padding:2.5px;
                  display:flex; align-items:center; justify-content:center;
                  background: conic-gradient(var(--ring-color, var(--line)) var(--ring-pct,0%), var(--line) 0);
                }
                .avatar-inner{
                  width:100%; height:100%; border-radius:50%; overflow:hidden;
                  background:var(--primary-light); display:flex; align-items:center; justify-content:center;
                  font-weight:700; color:var(--primary); font-size:17px;
                }
                .avatar-inner img{width:100%; height:100%; object-fit:cover;}
                .cam-badge{
                  position:absolute; bottom:-2px; right:-2px; width:20px; height:20px; border-radius:50%;
                  background:var(--primary); border:2px solid var(--card); display:flex; align-items:center; justify-content:center;
                  cursor:pointer;
                }
                .staff-info{flex:1; min-width:0;}
                .staff-name{font-weight:600; font-size:15px; color:var(--ink);}
                .staff-role{font-size:11px; color:var(--ink-soft); margin-top:1px;}
                .status-badge{font-size:10.5px; font-weight:700; padding:4px 10px; border-radius:10px;}
                
                .action-grid{display:grid; grid-template-columns:repeat(4,1fr); gap:7px; margin-bottom:10px;}
                .act-btn{
                  border-radius:12px; padding:9px 4px; font-size:10.5px; font-weight:600;
                  border:1.5px solid var(--line); background:#FBFAFF; color:var(--ink-soft);
                  display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer;
                  transition:transform .12s ease;
                }
                .act-btn:active{transform:scale(0.94);}
                .act-btn.present.on{background:var(--present); color:#fff; border-color:var(--present);}
                .act-btn.absent.on{background:var(--absent); color:#fff; border-color:var(--absent);}
                .act-btn.half.on{background:var(--half); color:#fff; border-color:var(--half);}
                .act-btn.leave.on{background:var(--leave); color:#fff; border-color:var(--leave);}
                
                .bottom-row{display:flex; gap:8px;}
                .del-btn{
                  flex:1; background:var(--absent-bg); color:var(--absent); border:none; border-radius:12px;
                  padding:9px; font-size:12px; font-weight:600; cursor:pointer;
                }
                .details-btn{
                  flex:1.4; background:#F5F3FE; color:var(--primary); border:none; border-radius:12px;
                  padding:9px; font-size:12px; font-weight:600; cursor:pointer;
                }
                
                .fab{
                  position:absolute; right:20px; bottom:24px; width:56px; height:56px; border-radius:18px;
                  background: linear-gradient(135deg, var(--primary), #8B6BFF);
                  display:flex; align-items:center; justify-content:center; color:#fff; border:none;
                  box-shadow:0 10px 24px rgba(91,61,245,0.4); cursor:pointer; font-size:26px; z-index:5;
                }
                
                .modal-overlay{
                  position:absolute; inset:0; background:rgba(20,15,45,0.45); display:none;
                  align-items:flex-end; z-index:20; border-radius:36px;
                }
                .modal-overlay.show{display:flex;}
                .modal{
                  background:var(--bg); width:100%; border-radius:26px 26px 0 0; padding:22px 20px 26px;
                  animation:slideUp .25s ease;
                }
                @keyframes slideUp{from{transform:translateY(30px); opacity:0;} to{transform:translateY(0); opacity:1;}}
                .modal-handle{width:40px; height:4px; background:var(--line); border-radius:4px; margin:0 auto 16px;}
                .modal h3{font-size:16px; margin:0 0 16px;}
                .photo-upload-zone{
                  width:96px; height:96px; border-radius:50%; margin:0 auto 16px; position:relative;
                  background:var(--primary-light); border:2px dashed #C9BBFF;
                  display:flex; align-items:center; justify-content:center; cursor:pointer; overflow:hidden;
                }
                .photo-upload-zone img{width:100%; height:100%; object-fit:cover;}
                .photo-upload-zone .plus-icon{color:var(--primary);}
                .field{margin-bottom:12px;}
                .field label{font-size:11.5px; font-weight:600; color:var(--ink-soft); margin-bottom:5px; display:block;}
                .field input, .field select{
                  width:100%; padding:11px 13px; border-radius:12px; border:1.5px solid var(--line);
                  background:var(--card); font-size:13.5px; outline:none; color:var(--ink);
                }
                .modal-actions{display:flex; gap:10px; margin-top:16px;}
                .btn-secondary{flex:1; background:var(--card); border:1.5px solid var(--line); border-radius:14px; padding:12px; font-weight:600; font-size:13px; color:var(--ink-soft); cursor:pointer;}
                .btn-primary{flex:1.4; background:linear-gradient(135deg,var(--primary),#8B6BFF); border:none; border-radius:14px; padding:12px; font-weight:600; font-size:13px; color:#fff; cursor:pointer;}
            `}} />
            
            <div className="att-wrapper">
                <div className="phone">
                    <div className="scroll">
                        <div className="header">
                            <div className="brand-row">
                                <div className="brand">
                                    <div className="brand-mark">BG</div>
                                    <div className="brand-text">
                                        <div className="t1">BillGST Staff</div>
                                        <div className="t2">Attendance Manager</div>
                                    </div>
                                </div>
                                <button className="icon-btn" title="Export PDF" onClick={() => setPdfActionSheet({show: true, type: 'master'})}>
                                    ⬇
                                </button>
                            </div>
                            <div className="date-nav">
                                <button onClick={() => shiftDay(-1)}>‹</button>
                                <div className="date-center">
                                    <input 
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            if(e.target.value) {
                                                setSelectedDate(e.target.value);
                                                setCurrentMonth(new Date(e.target.value));
                                            }
                                        }}
                                        style={{position:'absolute', opacity:0, left:0, top:0, width:1, height:1}}
                                        id="hiddenDatePicker"
                                    />
                                    <label htmlFor="hiddenDatePicker" style={{cursor:'pointer', display:'block'}}>
                                        {dateLabel}
                                        <div className="date-sub">{dayName}</div>
                                    </label>
                                </div>
                                <button onClick={() => shiftDay(1)}>›</button>
                            </div>
                        </div>

                        <div className="body-pad">
                            <div className="search-row">
                                <div className="search-box">
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--ink-soft)" strokeWidth="2.5" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    <input type="text" placeholder="Search name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                </div>
                                <button className="all-present-btn" onClick={markAllPresent}>
                                    ✓ All Present
                                </button>
                            </div>

                            <div className="stats-row">
                                <div className={`stat present ${statusFilter === 'PRESENT' ? 'active' : ''}`} onClick={() => setStatusFilter(f => f === 'PRESENT' ? 'ALL' : 'PRESENT')}>
                                    <div className="num">{todayStats.P}</div><div className="lbl">Present</div>
                                </div>
                                <div className={`stat absent ${statusFilter === 'ABSENT' ? 'active' : ''}`} onClick={() => setStatusFilter(f => f === 'ABSENT' ? 'ALL' : 'ABSENT')}>
                                    <div className="num">{todayStats.A}</div><div className="lbl">Absent</div>
                                </div>
                                <div className={`stat half ${statusFilter === 'HALF_DAY' ? 'active' : ''}`} onClick={() => setStatusFilter(f => f === 'HALF_DAY' ? 'ALL' : 'HALF_DAY')}>
                                    <div className="num">{todayStats.H}</div><div className="lbl">Half Day</div>
                                </div>
                                <div className={`stat leave ${statusFilter === 'LEAVE' ? 'active' : ''}`} onClick={() => setStatusFilter(f => f === 'LEAVE' ? 'ALL' : 'LEAVE')}>
                                    <div className="num">{todayStats.L}</div><div className="lbl">Leave</div>
                                </div>
                            </div>

                            <div className="filters">
                                {roles.map(r => (
                                    <div key={r} className={`chip ${r === currentFilter ? 'active' : ''}`} onClick={() => setCurrentFilter(r)}>
                                        {r}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="list">
                            {filteredStaff.length === 0 && (
                                <div style={{textAlign:'center', color:'var(--ink-soft)', padding:'40px 0', fontSize:'13px'}}>Koi staff nahi mila</div>
                            )}
                            {filteredStaff.map((s: any) => {
                                const status = getStatus(s.id, selectedDate) as keyof typeof statusMeta | null;
                                const meta = status ? statusMeta[status] : null;
                                const ringColor = meta ? meta.color : 'var(--line)';
                                const ringPct = meta ? '100%' : '0%';

                                return (
                                    <div className="staff-card" key={s.id}>
                                        <div className="staff-top">
                                            <div className="avatar-wrap">
                                                <div className="avatar-ring" style={{ '--ring-color': ringColor, '--ring-pct': ringPct } as any}>
                                                    <div className="avatar-inner">
                                                        {s.photo ? <img src={s.photo} alt={s.name} /> : initials(s.name)}
                                                    </div>
                                                </div>
                                                <div className="cam-badge" onClick={() => handleStaffPhotoUpload(s.id)}>
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="white" strokeWidth="2"/><circle cx="12" cy="14" r="3" stroke="white" strokeWidth="2"/></svg>
                                                </div>
                                            </div>
                                            <div className="staff-info">
                                                <div className="staff-name">{s.name}</div>
                                                <div className="staff-role">{s.role}</div>
                                            </div>
                                            {meta && <span className="status-badge" style={{background: meta.bg, color: meta.color}}>{meta.label}</span>}
                                        </div>
                                        <div className="action-grid">
                                            <button className={`act-btn present ${status === 'PRESENT' ? 'on' : ''}`} onClick={() => handleSetAtt(s.id, 'PRESENT')}>✓<span>Present</span></button>
                                            <button className={`act-btn absent ${status === 'ABSENT' ? 'on' : ''}`} onClick={() => handleSetAtt(s.id, 'ABSENT')}>✕<span>Absent</span></button>
                                            <button className={`act-btn half ${status === 'HALF_DAY' ? 'on' : ''}`} onClick={() => handleSetAtt(s.id, 'HALF_DAY')}>½<span>Half</span></button>
                                            <button className={`act-btn leave ${status === 'LEAVE' ? 'on' : ''}`} onClick={() => handleSetAtt(s.id, 'LEAVE')}>⛱<span>Leave</span></button>
                                        </div>
                                        <div className="bottom-row">
                                            {deleteStaff && (
                                                <button className="del-btn" onClick={async () => {
                                                    if (window.confirm(`Delete ${s.name}?`)) {
                                                        await deleteStaff(s.id);
                                                        toast.success('Staff removed');
                                                    }
                                                }}>🗑 Delete</button>
                                            )}
                                            <button className="details-btn" onClick={() => { setSelectedStaff(s); setIsDetailOpen(true); }}>Details ↓</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button className="fab" onClick={() => setIsModalOpen(true)}>+</button>

                    <div className={`modal-overlay ${isModalOpen ? 'show' : ''}`} onClick={() => setIsModalOpen(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-handle"></div>
                            <h3>Add Staff Member</h3>
                            <label className="photo-upload-zone" htmlFor="photoInputAdd">
                                {pendingPhoto ? <img src={pendingPhoto} alt="Upload" /> : <span className="plus-icon">📷<br/></span>}
                            </label>
                            <input type="file" id="photoInputAdd" accept="image/*" style={{display:'none'}} onChange={handlePhotoUpload} />
                            
                            <div className="field">
                                <label>Full name</label>
                                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Ramesh Kumar" />
                            </div>
                            <div className="field">
                                <label>Role</label>
                                <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                                    <option>Worker</option>
                                    <option>Gardener</option>
                                    <option>Security</option>
                                    <option>Housekeeping</option>
                                    <option>Cook</option>
                                    <option>Driver</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button className="btn-primary" onClick={handleAddStaff}>Save Staff</button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Details Sheet Modal */}
                    <div className={`modal-overlay ${isDetailOpen ? 'show' : ''}`} onClick={() => setIsDetailOpen(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-handle"></div>
                            {selectedStaff && (() => {
                                const sRecord = attendance?.find((a: any) => a.staff_id === selectedStaff.id && a.date === selectedDate);
                                const sStatus = sRecord?.status;
                                return (
                                <>
                                    <div style={{ display:'flex', gap:'12px', alignItems:'center', marginBottom:'16px' }}>
                                        <div className="avatar-ring" style={{'--ring-color':'var(--primary)', '--ring-pct':'100%', width:'48px', height:'48px'} as any}>
                                            <div className="avatar-inner" style={{width:'100%', height:'100%'}}>
                                                {selectedStaff.photo ? <img src={selectedStaff.photo} /> : initials(selectedStaff.name)}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{fontWeight:600, fontSize:'16px'}}>{selectedStaff.name}</div>
                                            <div style={{fontSize:'12px', color:'var(--ink-soft)'}}>{selectedStaff.role}</div>
                                        </div>
                                    </div>
                                    
                                    {(sStatus === 'PRESENT' || sStatus === 'HALF_DAY') && (
                                        <div style={{ padding: '12px', background: 'var(--primary-light)', border: '1px solid var(--line)', borderRadius: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase' }}>In Time</label>
                                                    <input type="time" value={sRecord?.in_time || ''} onChange={(e) => handleSetAtt(selectedStaff.id, sStatus, e.target.value, undefined, undefined)} style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px' }} />
                                                </div>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase' }}>Out Time</label>
                                                    <input type="time" value={sRecord?.out_time || ''} onChange={(e) => handleSetAtt(selectedStaff.id, sStatus, undefined, e.target.value, undefined)} style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px' }} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase' }}>Note / Remark</label>
                                                <input type="text" placeholder="e.g. 1 hour late..." defaultValue={sRecord?.note || ''} onBlur={(e) => { if(e.target.value !== sRecord?.note) handleSetAtt(selectedStaff.id, sStatus, undefined, undefined, e.target.value) }} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px', width: '100%' }} />
                                            </div>
                                        </div>
                                    )}

                                    <div style={{background:'var(--card)', border:'1px solid var(--line)', borderRadius:'12px', padding:'12px', marginBottom:'16px'}}>
                                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                                            <span style={{fontSize:'12px', color:'var(--ink-soft)'}}>Daily Wage / Salary</span>
                                            <span style={{fontWeight:600}}>₹{selectedStaff.salary_type === 'monthly' ? selectedStaff.monthly_salary : selectedStaff.daily_wage}</span>
                                        </div>
                                        <div style={{display:'flex', justifyContent:'space-between'}}>
                                            <span style={{fontSize:'12px', color:'var(--ink-soft)'}}>Advance</span>
                                            <span style={{fontWeight:600, color:'var(--half)'}}>₹{selectedStaff.advance || 0}</span>
                                        </div>
                                    </div>
                                    <div className="modal-actions">
                                        <button className="btn-secondary" onClick={() => setIsDetailOpen(false)}>Close</button>
                                        <button className="btn-primary" onClick={() => { setIsDetailOpen(false); setPdfActionSheet({ show: true, type: 'salary' }); }}>📄 Salary Slip</button>
                                    </div>
                                </>
                            )})()}
                        </div>
                    </div>

                    {/* PDF Action Sheet Modal */}
                    <div className={`modal-overlay ${pdfActionSheet.show ? 'show' : ''}`} onClick={() => setPdfActionSheet({...pdfActionSheet, show: false})}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-handle"></div>
                            <h3 style={{textAlign:'center'}}>{pdfActionSheet.type === 'master' ? 'Master PDF Options' : 'Salary Slip Options'}</h3>
                            <div className="field">
                                <label style={{textAlign:'center', display:'block'}}>Select Month for PDF</label>
                                <input 
                                    type="month" 
                                    value={`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const [year, month] = e.target.value.split('-');
                                            setCurrentMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
                                            setSelectedDate(`${year}-${month}-01`);
                                        }
                                    }}
                                    style={{textAlign:'center', fontWeight:700, color:'var(--primary)'}}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                                <button className="btn-secondary" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}} onClick={() => { setPdfActionSheet({...pdfActionSheet, show: false}); pdfActionSheet.type === 'master' ? generateMasterReportPDF('view') : generateSalarySlipPDF('view'); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    View
                                </button>
                                <button className="btn-primary" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}} onClick={() => { setPdfActionSheet({...pdfActionSheet, show: false}); pdfActionSheet.type === 'master' ? generateMasterReportPDF('share') : generateSalarySlipPDF('share'); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                                    Share
                                </button>
                                <button className="btn-secondary" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}} onClick={() => { setPdfActionSheet({...pdfActionSheet, show: false}); pdfActionSheet.type === 'master' ? generateMasterReportPDF('download') : generateSalarySlipPDF('download'); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                                    Download
                                </button>
                                <button className="btn-secondary" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', color:'#ef4444', borderColor:'#ef4444'}} onClick={() => { setPdfActionSheet({...pdfActionSheet, show: false}); pdfActionSheet.type === 'master' ? generateMasterReportPDF('view') : generateSalarySlipPDF('view'); toast('Please print from the PDF viewer', { icon: '🖨️' }); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                                    Print
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

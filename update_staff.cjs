const fs = require('fs');
let content = fs.readFileSync('f:/bill/app/dashboard/staff/page.tsx', 'utf8');

// 1. Topbar styles (3D company name, Attendance badge)
content = content.replace(
    `<span className="logo-nm" style={{ fontSize: '20px', fontWeight: 900, color: '#1e1b4b' }}>{businessProfile?.name || 'BillGST'}</span>`,
    `<span className="logo-nm" style={{ fontSize: '24px', fontWeight: 900, background: 'linear-gradient(135deg, #4f46e5, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>{businessProfile?.name || 'BillGST'}</span>`
);
content = content.replace(
    `<span className="tb-title" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink3)', letterSpacing: '1px', textTransform: 'uppercase' }}>Attendance</span>`,
    `<span className="tb-title" style={{ fontSize: '14px', fontWeight: 900, color: 'white', letterSpacing: '1px', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--indigo), var(--purple))', padding: '6px 16px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(79,70,229,0.3)' }}>Attendance</span>`
);

// 2. Stats row styles (colored side boxes)
content = content.replace(
    `<div className="stats-row">`,
    `<div className="stats-row" style={{ gap: '16px', padding: '0 20px', marginBottom: '24px' }}>`
);
content = content.replace(
    `<div className="stat-box"><div className="stat-num sn-g">{todayStats.P}</div><div className="stat-lbl sl">Present</div></div>`,
    `<div className="stat-box" style={{ borderLeft: '5px solid #10b981', background: '#f0fdf4', borderRadius: '12px', padding: '16px', flex: 1, boxShadow: '0 4px 10px rgba(16,185,129,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div className="stat-num sn-g" style={{ fontSize: '24px', fontWeight: 900, color: '#065f46' }}>{todayStats.P}</div><div className="stat-lbl sl" style={{ color: '#047857', fontWeight: 700 }}>Present</div></div>`
);
content = content.replace(
    `<div className="stat-box"><div className="stat-num sn-r">{todayStats.A}</div><div className="stat-lbl sl">Absent</div></div>`,
    `<div className="stat-box" style={{ borderLeft: '5px solid #ef4444', background: '#fef2f2', borderRadius: '12px', padding: '16px', flex: 1, boxShadow: '0 4px 10px rgba(239,68,68,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div className="stat-num sn-r" style={{ fontSize: '24px', fontWeight: 900, color: '#991b1b' }}>{todayStats.A}</div><div className="stat-lbl sl" style={{ color: '#b91c1c', fontWeight: 700 }}>Absent</div></div>`
);
content = content.replace(
    `<div className="stat-box"><div className="stat-num sn-a">{todayStats.H}</div><div className="stat-lbl sl">Half Day</div></div>`,
    `<div className="stat-box" style={{ borderLeft: '5px solid #f59e0b', background: '#fffbeb', borderRadius: '12px', padding: '16px', flex: 1, boxShadow: '0 4px 10px rgba(245,158,11,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div className="stat-num sn-a" style={{ fontSize: '24px', fontWeight: 900, color: '#92400e' }}>{todayStats.H}</div><div className="stat-lbl sl" style={{ color: '#b45309', fontWeight: 700 }}>Half Day</div></div>`
);
content = content.replace(
    `<div className="stat-box"><div className="stat-num sn-b">{todayStats.L}</div><div className="stat-lbl sl">Leave</div></div>`,
    `<div className="stat-box" style={{ borderLeft: '5px solid #3b82f6', background: '#eff6ff', borderRadius: '12px', padding: '16px', flex: 1, boxShadow: '0 4px 10px rgba(59,130,246,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div className="stat-num sn-b" style={{ fontSize: '24px', fontWeight: 900, color: '#1e40af' }}>{todayStats.L}</div><div className="stat-lbl sl" style={{ color: '#1d4ed8', fontWeight: 700 }}>Leave</div></div>`
);

// 3. Controls wrapper to be sticky
content = content.replace(
    `<div className="controls">`,
    `<div className="controls" style={{ position: 'sticky', top: '0', zIndex: 10, background: 'rgba(244, 247, 251, 0.95)', backdropFilter: 'blur(10px)', padding: '10px 20px', margin: '0 -20px 16px -20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>`
);

// 4. Staff list rendering (names inside professional boxes)
content = content.replace(
    `<div key={member.id} className="staff-row" onClick={() => { setSelectedStaff(member); setSheet('detail'); }}>`,
    `<div key={member.id} className="staff-row" onClick={() => { setSelectedStaff(member); setSheet('detail'); }} style={{ background: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', transition: 'transform 0.2s', cursor: 'pointer' }}>`
);

// 5. Add New Staff form (Role input instead of select)
const oldSelectStr = `<select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: 700, color: 'var(--ink)', appearance: 'none', padding: '0', cursor: 'pointer' }}>
                                            <option value="Worker">Worker</option>
                                            <option value="Driver">Driver</option>
                                            <option value="Guard">Guard</option>
                                            <option value="Cleaner">Cleaner</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Student">Student</option>
                                        </select>
                                        <div style={{ position: 'absolute', right: '0', top: '18px', pointerEvents: 'none', color: 'var(--ink3)' }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M6 9l6 6 6-6" /></svg>
                                        </div>`;
const newSelectStr = `<input type="text" list="rolesList" placeholder="e.g. Manager" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }} />
                                        <datalist id="rolesList">
                                            <option value="Worker" />
                                            <option value="Driver" />
                                            <option value="Guard" />
                                            <option value="Cleaner" />
                                            <option value="Manager" />
                                            <option value="Student" />
                                        </datalist>`;
content = content.replace(oldSelectStr, newSelectStr);

// 6. Dynamic role filters
const getUniqueRolesStr = `
    // Calculate unique roles for filter
    const uniqueRoles = Array.from(new Set((staff || []).map((s: any) => s.role || 'Worker'))).filter(Boolean);
`;
if (!content.includes('uniqueRoles = Array.from')) {
    content = content.replace('const handleUpdateStaffInfo = async () => {', getUniqueRolesStr + '\n    const handleUpdateStaffInfo = async () => {');
}

const oldTabsStr = `<div className="dept-tabs">
                    <button className={\`dtab \${deptFilter === 'all' ? 'on' : ''}\`} onClick={() => setDeptFilter('all')}>All</button>
                    <button className={\`dtab \${deptFilter === 'worker' ? 'on' : ''}\`} onClick={() => setDeptFilter('worker')}>Worker</button>
                    <button className={\`dtab \${deptFilter === 'driver' ? 'on' : ''}\`} onClick={() => setDeptFilter('driver')}>Driver</button>
                    <button className={\`dtab \${deptFilter === 'guard' ? 'on' : ''}\`} onClick={() => setDeptFilter('guard')}>Guard</button>
                    <button className={\`dtab \${deptFilter === 'cleaner' ? 'on' : ''}\`} onClick={() => setDeptFilter('cleaner')}>Cleaner</button>
                </div>`;
const newTabsStr = `<div className="dept-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none', paddingLeft: '20px', paddingRight: '20px' }}>
                    <button className={\`dtab \${deptFilter === 'all' ? 'on' : ''}\`} onClick={() => setDeptFilter('all')} style={{ padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '12px', whiteSpace: 'nowrap', border: deptFilter === 'all' ? 'none' : '1px solid #e2e8f0', background: deptFilter === 'all' ? 'var(--indigo)' : '#fff', color: deptFilter === 'all' ? '#fff' : 'var(--ink3)', boxShadow: deptFilter === 'all' ? '0 4px 10px rgba(79,70,229,0.3)' : 'none', cursor: 'pointer' }}>All</button>
                    {uniqueRoles.map((role: any) => (
                        <button key={role} className={\`dtab \${deptFilter === role.toLowerCase() ? 'on' : ''}\`} onClick={() => setDeptFilter(role.toLowerCase())} style={{ padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '12px', whiteSpace: 'nowrap', border: deptFilter === role.toLowerCase() ? 'none' : '1px solid #e2e8f0', background: deptFilter === role.toLowerCase() ? 'var(--indigo)' : '#fff', color: deptFilter === role.toLowerCase() ? '#fff' : 'var(--ink3)', boxShadow: deptFilter === role.toLowerCase() ? '0 4px 10px rgba(79,70,229,0.3)' : 'none', cursor: 'pointer' }}>{role}</button>
                    ))}
                </div>`;
content = content.replace(oldTabsStr, newTabsStr);

fs.writeFileSync('f:/bill/app/dashboard/staff/page.tsx', content);
console.log('Update script completed successfully.');

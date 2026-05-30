const fs = require('fs');
let content = fs.readFileSync('f:/bill/app/dashboard/staff/page.tsx', 'utf8');

// Fix salary calculation for selected staff (in the Sheet)
const oldCalcStr = `          currentMonthRecords.forEach((r: any) => {
              if (r.status === 'PRESENT' || r.status === 'HALF_DAY') {
                  if (r.in_time && r.out_time) {
                      const inDate = new Date(\`1970-01-01T\${r.in_time}Z\`);
                      const outDate = new Date(\`1970-01-01T\${r.out_time}Z\`);
                      let diffMs = outDate.getTime() - inDate.getTime();
                      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
                      const hours = diffMs / (1000 * 60 * 60);
                      calculatedGross += (ds.rate / 8) * hours;
                      presentDays += (hours / 8); // approximate days based on 8hr
                  } else {
                      calculatedGross += (r.status === 'PRESENT' ? ds.rate : (ds.rate * 0.5));
                      presentDays += (r.status === 'PRESENT' ? 1 : 0.5);
                  }
              }
              if (r.status === 'PRESENT') ds.p++;
              if (r.status === 'HALF_DAY') ds.h++;
              if (r.status === 'ABSENT') ds.a++;
              if (r.status === 'LEAVE') ds.l++;
          });

          ds.gross = Math.round(calculatedGross);
          // Note: ds.p and ds.h are just counts. We use a base deduction logic if simple
          ds.deduct = ds.a * ds.rate;
          const advance = Number(selectedStaff.advance) || 0;
          ds.net = ds.gross - ds.deduct - advance;`;

const newCalcStr = `          currentMonthRecords.forEach((r: any) => {
              if (r.status === 'PRESENT' || r.status === 'HALF_DAY' || r.status === 'LEAVE') {
                  if (r.in_time && r.out_time && r.status !== 'LEAVE') {
                      const inDate = new Date(\`1970-01-01T\${r.in_time}Z\`);
                      const outDate = new Date(\`1970-01-01T\${r.out_time}Z\`);
                      let diffMs = outDate.getTime() - inDate.getTime();
                      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
                      const hours = diffMs / (1000 * 60 * 60);
                      calculatedGross += (ds.rate / 8) * hours;
                      presentDays += (hours / 8); 
                  } else {
                      calculatedGross += (r.status === 'HALF_DAY' ? (ds.rate * 0.5) : ds.rate);
                      presentDays += (r.status === 'HALF_DAY' ? 0.5 : 1);
                  }
              }
              if (r.status === 'PRESENT') ds.p++;
              if (r.status === 'HALF_DAY') ds.h++;
              if (r.status === 'ABSENT') ds.a++;
              if (r.status === 'LEAVE') ds.l++;
          });

          ds.gross = Math.round(calculatedGross);
          // No deduction for absent, as they simply aren't paid for that day (gross doesn't include absent days)
          ds.deduct = 0; 
          const advance = Number(selectedStaff.advance) || 0;
          ds.net = ds.gross - ds.deduct - advance;`;

content = content.replace(oldCalcStr, newCalcStr);

// Fix deduction display in Sheet
const oldDeductStr = `<div className="sal-row"><span className="sal-lbl">Deduction (Absence)</span><span className="sal-val" style={{ color: '#ef4444' }}>-₹{ds.deduct}</span></div>`;
const newDeductStr = `<div className="sal-row"><span className="sal-lbl">Deduction (Absence)</span><span className="sal-val" style={{ color: '#ef4444' }}>₹0</span></div>`;
content = content.replace(oldDeductStr, newDeductStr);

const oldPresentDaysStr = `<div className="sal-row"><span className="sal-lbl">Present days</span><span className="sal-val" style={{ color: '#10b981' }}>{ds.p + (ds.h * 0.5)} days</span></div>`;
const newPresentDaysStr = `<div className="sal-row"><span className="sal-lbl">Paid days (Incl. Leave)</span><span className="sal-val" style={{ color: '#10b981' }}>{ds.p + (ds.h * 0.5) + ds.l} days</span></div>`;
content = content.replace(oldPresentDaysStr, newPresentDaysStr);

// Add stats to the wcard rendering
const oldCardMapStart = `                    {filteredStaff.map((member: any) => {
                        const status = getStatus(member.id, selectedDate);
                        const times = getTimeFields(member.id, selectedDate);
                        const roleColor = member.role === 'Driver' ? { bg: '#fff0f0', text: '#ef4444' } : 
                                          member.role === 'Chowkidar' ? { bg: '#e8faf3', text: '#10b981' } : 
                                          member.role === 'Safai' ? { bg: '#eff6ff', text: '#3b82f6' } : 
                                          { bg: '#eef0ff', text: '#4f46e5' };`;

const newCardMapStart = `                    {filteredStaff.map((member: any) => {
                        const status = getStatus(member.id, selectedDate);
                        const times = getTimeFields(member.id, selectedDate);
                        const roleColor = member.role === 'Driver' ? { bg: '#fff0f0', text: '#ef4444' } : 
                                          member.role === 'Chowkidar' ? { bg: '#e8faf3', text: '#10b981' } : 
                                          member.role === 'Safai' ? { bg: '#eff6ff', text: '#3b82f6' } : 
                                          { bg: '#eef0ff', text: '#4f46e5' };
                        
                        // Calculate stats for this month
                        const memberMonthRecords = attendance?.filter((a: any) => 
                            a.staff_id === member.id && 
                            a.date.startsWith(\`\${currentMonth.getFullYear()}-\${String(currentMonth.getMonth()+1).padStart(2,'0')}\`)
                        ) || [];
                        let cp=0, ca=0, cl=0, ch=0;
                        memberMonthRecords.forEach((r: any) => {
                            if(r.status==='PRESENT') cp++;
                            if(r.status==='ABSENT') ca++;
                            if(r.status==='LEAVE') cl++;
                            if(r.status==='HALF_DAY') ch++;
                        });`;

content = content.replace(oldCardMapStart, newCardMapStart);

const oldWInfo = `                                    <div className="winfo">
                                        <div className="wname">{member.name}</div>
                                        <div className="wmeta">
                                            <span className="wrole" style={{ background: roleColor.bg, color: roleColor.text }}>{member.role || 'Worker'}</span>
                                            {isOwnerOrAccountant && <span className="wsalary">₹{member.daily_wage || 0}/day</span>}
                                        </div>
                                    </div>`;

const newWInfo = `                                    <div className="winfo">
                                        <div className="wname">{member.name}</div>
                                        <div className="wmeta">
                                            <span className="wrole" style={{ background: roleColor.bg, color: roleColor.text }}>{member.role || 'Worker'}</span>
                                            {isOwnerOrAccountant && <span className="wsalary">₹{member.daily_wage || 0}/day</span>}
                                        </div>
                                        <div style={{ marginTop: '4px', fontSize: '11px', display: 'flex', gap: '8px' }}>
                                            <span style={{color:'#10b981', fontWeight: 600}}>P: {cp}</span>
                                            <span style={{color:'#ef4444', fontWeight: 600}}>A: {ca}</span>
                                            <span style={{color:'#f59e0b', fontWeight: 600}}>H: {ch}</span>
                                            <span style={{color:'#3b82f6', fontWeight: 600}}>L: {cl}</span>
                                        </div>
                                    </div>`;

content = content.replace(oldWInfo, newWInfo);

fs.writeFileSync('f:/bill/app/dashboard/staff/page.tsx', content);
console.log('Update script completed successfully.');

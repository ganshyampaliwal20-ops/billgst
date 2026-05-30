const fs = require('fs');
let content = fs.readFileSync('f:/bill/app/dashboard/staff/page.tsx', 'utf8');

const regex = /<select[\s\S]*?onChange=\{\(e\) => setActiveTab\(e\.target\.value\)\}[\s\S]*?<\/select>/;

const replacement = `<select 
                            value={deptFilter} 
                            onChange={(e) => setDeptFilter(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', background: '#fff', fontSize: '14px', fontWeight: 800, color: 'var(--ink)', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', appearance: 'none', cursor: 'pointer' }}
                        >
                            <option value="all">All Roles</option>
                            {uniqueRoles.map((role: any) => (
                                <option key={role} value={role.toLowerCase()}>{role}</option>
                            ))}
                        </select>`;

content = content.replace(regex, replacement);

fs.writeFileSync('f:/bill/app/dashboard/staff/page.tsx', content);
console.log('Update successful');

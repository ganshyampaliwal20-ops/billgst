const fs = require('fs');
let content = fs.readFileSync('f:/bill/app/dashboard/staff/page.tsx', 'utf8');

const regex = /<div style=\{\{ flex: 1, position: 'relative' \}\}>[\s\S]*?<select[\s\S]*?<\/select>[\s\S]*?<\/div>/;

const replacement = `<div style={{ flex: 1, position: 'relative' }}>
                          <input 
                              type="text"
                              list="filterRolesList"
                              placeholder="Search by Role (e.g. Manager)"
                              value={deptFilter === 'all' ? '' : deptFilter} 
                              onChange={(e) => setDeptFilter(e.target.value.toLowerCase() || 'all')}
                              style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', background: '#fff', fontSize: '14px', fontWeight: 800, color: 'var(--ink)', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
                          />
                          <datalist id="filterRolesList">
                              {uniqueRoles.map((role: any) => (
                                  <option key={role} value={role.toLowerCase()}>{role}</option>
                              ))}
                          </datalist>
                      </div>`;

content = content.replace(regex, replacement);

fs.writeFileSync('f:/bill/app/dashboard/staff/page.tsx', content);
console.log('Update successful');

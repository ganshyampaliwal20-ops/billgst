const fs = require('fs');

let pageContent = fs.readFileSync('app/page.tsx', 'utf-8');

// Add the state variable
const stateInsertionPoint = 'const [isStandalone, setIsStandalone] = useState(false);';
if (pageContent.includes(stateInsertionPoint) && !pageContent.includes('const [openFaq, setOpenFaq]')) {
    pageContent = pageContent.replace(
        stateInsertionPoint,
        stateInsertionPoint + '\n    const [openFaq, setOpenFaq] = useState<number | null>(null);'
    );
}

// Find the FAQ section exactly
const faqStartStr = '<div className="faq-grid" style={{ display: \'flex\', flexDirection: \'column\', gap: \'15px\', marginTop: \'40px\' }}>';
const faqEndStr = '</div>\n                </div>\n                <script\n                    type="application/ld+json"';

const startIndex = pageContent.indexOf(faqStartStr);
const endIndex = pageContent.indexOf(faqEndStr);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `<div className="faq-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '40px' }}>
                        {[
                            {
                                q: "Kya mera data safe hai?",
                                a: "Haan, 100% safe hai. Aapka data bank-level encryption ke sath cloud par store hota hai. Aapke alawa koi aur aapka data nahi dekh sakta, hum bhi nahi."
                            },
                            {
                                q: "Kya ye mobile aur computer dono par chalta hai?",
                                a: "Haan, BillGST ek fast aur secure cloud-based software hai. Aap apne mobile app aur computer (web) dono se login kar sakte hain aur aapka data hamesha auto-sync rahega."
                            },
                            {
                                q: "BillGST baaki billing apps se behtar kyun hai?",
                                a: "BillGST mein AI Voice Billing (bol kar bill banana) aur 1-Click WhatsApp Sharing jaisi modern features hain. Ye chalaane mein bahut hi aasan hai, jisse aapka bahut samay bachta hai aur pricing bhi sabse affordable hai."
                            },
                            {
                                q: "Kya isse GST return file hogi?",
                                a: "Aap GSTR-1, GSTR-3B aur GSTR-4 ki reports single click mein Excel aur JSON format mein download kar sakte hain jisse CA ko bhejna ya directly portal par upload karna bahut aasan ho jata hai."
                            }
                        ].map((faq, idx) => (
                            <div 
                                key={idx} 
                                className="faq-item" 
                                style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.3s ease' }}
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ color: '#4F8EF7' }}>Q.</span> {faq.q}
                                    </h4>
                                    <span style={{ color: '#4F8EF7', fontSize: '24px', transition: 'transform 0.3s ease', transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                        {openFaq === idx ? '−' : '+'}
                                    </span>
                                </div>
                                <div style={{
                                    maxHeight: openFaq === idx ? '200px' : '0',
                                    overflow: 'hidden',
                                    transition: 'max-height 0.3s ease, margin-top 0.3s ease',
                                    marginTop: openFaq === idx ? '15px' : '0'
                                }}>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    `;

    pageContent = pageContent.substring(0, startIndex) + replacement + pageContent.substring(endIndex);
    fs.writeFileSync('app/page.tsx', pageContent);
    console.log("FAQ dropdown successfully applied.");
} else {
    console.log("Could not find exact bounds.");
}

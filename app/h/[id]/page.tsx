import HisaabViewerPage from '../../hisaab/v/page';
import pool from '@/lib/db';
import { Metadata } from 'next';

function fmt(n: number) {
    if (n === undefined || isNaN(n)) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
}

// Next.js config to ensure the route accepts dynamic params properly
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
    const id = (await params).id;
    const search = await searchParams;
    const lang = search?.lang || 'en';
    
    // Import translations safely (cannot import full client-side module due to hooks if any, but translations is just an object)
    let t: any = {};
    try {
        const tr = await import('@/lib/translations');
        t = tr.getTranslations(lang);
    } catch (e) {
        t = { 
            statementReadyMsg: 'Hisaab Statement',
            outstanding: 'Dena Hai',
            advanceJamaHai: 'Advance',
            totalToReceive: 'Total Rcvd',
            totalGiven: 'Total Given'
        };
    }
    
    let title = t.statementReadyMsg || 'Hisaab Statement';
    let description = 'View your account statement and hisaab details securely on BillGST.in';
    
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT data FROM hisaab_shares WHERE id = $1 OR short_id = $1', [id]);
        client.release();
        
        if (result.rows.length > 0) {
            let data = result.rows[0].data;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch (e) {}
            }
            if (data && data.name) {
                title = `${title} - ${data.name}`;
                
                let c = 0, d = 0;
                (data.txns || []).forEach((txn: any) => {
                    if (txn.type === 'credit') c += txn.amt;
                    else d += txn.amt;
                });
                
                const balance = data.balance || (c - d);
                const netBal = Math.abs(balance);
                const isNeg = balance < 0;
                
                const dueStr = isNeg ? `🔴 ${t.outstanding || 'Dena Hai'}: ${fmt(netBal)}` : (balance > 0 ? `🟢 ${t.advanceJamaHai || 'Advance'}: ${fmt(netBal)}` : `✅ Settled`);
                const givenStr = `📈 ${t.totalGiven || 'Total Given'}: ${fmt(d)}`;
                const rcvStr = `📉 ${t.totalToReceive || 'Total Rcvd'}: ${fmt(c)}`;
                
                description = `${dueStr} | ${givenStr} | ${rcvStr} \nClick to view full details and UPI payment option.`;
            }
        }
    } catch (e) {
        console.error('Metadata Error:', e);
    }
    
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            images: [
                {
                    url: '/logo.png',
                    width: 180,
                    height: 180,
                    alt: 'BillGST Pro',
                }
            ],
        }
    };
}

export default function Page({ params }: any) {
    // Render the exact same client component used for /hisaab/v
    return <HisaabViewerPage />;
}

import HisaabViewerPage from '../../hisaab/v/page';
import pool from '@/lib/db';
import { Metadata } from 'next';

function fmt(n: number) {
    if (n === undefined || isNaN(n)) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
}

// Next.js config to ensure the route accepts dynamic params properly
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const id = params.id;
    let title = 'Hisaab Statement';
    let description = 'View your account statement and hisaab details securely on BillGST.in';
    
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT data FROM hisaab_shares WHERE id = $1 OR short_id = $1', [id]);
        client.release();
        
        if (result.rows.length > 0) {
            const data = result.rows[0].data;
            if (data && data.name) {
                title = `Hisaab Statement - ${data.name}`;
                
                let c = 0, d = 0;
                (data.txns || []).forEach((t: any) => {
                    if (t.type === 'credit') c += t.amt;
                    else d += t.amt;
                });
                
                const balance = data.balance || (c - d);
                const netBal = Math.abs(balance);
                const isNeg = balance < 0;
                
                const dueStr = isNeg ? `🔴 Dena Hai: ${fmt(netBal)}` : (balance > 0 ? `🟢 Advance: ${fmt(netBal)}` : `✅ Settled`);
                const givenStr = `📈 Total Given: ${fmt(d)}`;
                const rcvStr = `📉 Total Rcvd: ${fmt(c)}`;
                
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
                    url: '/apple-icon.png',
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

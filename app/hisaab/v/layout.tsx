import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hisaab Pro - BillGST',
    description: 'Aapka Hisaab-Kitab Ready Hai',
    openGraph: {
        title: 'Hisaab Pro Statement',
        description: 'Yahaan click karke apna poora hisaab dekhein',
        url: 'https://billgst.in',
        siteName: 'BillGST Hisaab Pro',
        images: [
            {
                url: 'https://billgst.in/logo.png',
                width: 512,
                height: 512,
                alt: 'BillGST Logo'
            },
        ],
        type: 'website',
    },
};

export default function HisaabViewerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    let client;
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const userId = session.user.id;

        // Fetch business profile to get NIC credentials
        client = await pool.connect();
        const profileResult = await client.query('SELECT business_gstin, nic_username, nic_password FROM users WHERE id = $1', [userId]);
        client.release();
        client = undefined;

        if (profileResult.rows.length === 0) {
            return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
        }

        const profile = profileResult.rows[0];
        
        // 1. Authenticate with Sandbox
        const authRes = await fetch('https://api.sandbox.co.in/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.SANDBOX_API_KEY || '',
                'x-api-secret': process.env.SANDBOX_API_SECRET || '',
                'x-api-version': '1.0'
            }
        });

        const authData = await authRes.json();
        if (authData.code !== 200 || !authData.access_token) {
            console.error('Sandbox Auth Error:', authData);
            return NextResponse.json({ error: 'Sandbox Authentication Failed', details: authData }, { status: 500 });
        }

        const accessToken = authData.access_token;

        // Prepare EWB Payload
        // Standardizing date format to dd/mm/yyyy
        const formatDate = (dateStr: string) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        };

        const ewbPayload = {
            supplyType: "O",
            subSupplyType: "1", // 1 = Supply
            docType: "INV",
            docNo: data.invoice_number,
            docDate: formatDate(data.invoice_date || new Date().toISOString()),
            fromGstin: profile.business_gstin || 'URP',
            fromTrdName: data.business_name || 'My Business',
            fromAddr1: data.business_address ? data.business_address.substring(0, 50) : 'Not Available',
            fromAddr2: "",
            fromPlace: data.business_city || 'City',
            fromPincode: 400001, // default pincode if not provided
            fromStateCode: parseInt(profile.business_gstin?.substring(0, 2) || '27'),
            toGstin: data.customer?.gstin || 'URP',
            toTrdName: data.customer?.name || 'Customer',
            toAddr1: data.customer?.address ? data.customer.address.substring(0, 50) : 'Not Available',
            toAddr2: "",
            toPlace: data.ewayBill?.deliveryPlace || data.customer?.city || 'City',
            toPincode: data.ewayBill?.deliveryPincode ? parseInt(data.ewayBill.deliveryPincode) : (data.customer?.pincode || 400001),
            toStateCode: data.customer?.gstin ? parseInt(data.customer.gstin.substring(0, 2)) : parseInt(profile.business_gstin?.substring(0, 2) || '27'),
            totalValue: data.totals?.subtotal || 0,
            cgstValue: (data.totals?.gst || 0) / 2, // Assuming split if intra
            sgstValue: (data.totals?.gst || 0) / 2,
            igstValue: 0,
            cessValue: 0,
            transporterId: data.ewayBill?.transporterId || "",
            transporterName: data.ewayBill?.transporterName || "",
            transDocNo: "",
            transMode: data.ewayBill?.mode === 'Road' ? "1" : "1",
            transDistance: data.ewayBill?.distance || 10,
            transDocDate: "",
            vehicleNo: data.ewayBill?.vehicleNo || "",
            vehicleType: "R", // R = Regular
            itemList: data.items.map((item: any, index: number) => ({
                productName: item.product_name,
                productDesc: "",
                hsnCode: item.hsn_code || 1234,
                quantity: item.quantity,
                qtyUnit: "NOS",
                cgstRate: item.tax_rate ? item.tax_rate / 2 : 0,
                sgstRate: item.tax_rate ? item.tax_rate / 2 : 0,
                igstRate: 0,
                cessRate: 0,
                cessAdvol: 0,
                taxableAmount: item.quantity * item.unit_price
            }))
        };

        // 2. Call Sandbox E-Way Bill API
        const ewbRes = await fetch('https://api.sandbox.co.in/gsp/ewaybill/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'x-api-version': '1.0',
                // Sandbox requires NIC credentials in headers for GSP calls
                'gstin': profile.business_gstin || '',
                'username': profile.nic_username || '',
                'password': profile.nic_password || ''
            },
            body: JSON.stringify(ewbPayload)
        });

        const ewbData = await ewbRes.json();
        
        if (ewbRes.ok && ewbData.status === 1 && ewbData.data) {
            let actualData = ewbData.data;
            if (typeof ewbData.data === 'string') {
                 // Sometimes response payload data is a JSON string
                try { actualData = JSON.parse(ewbData.data); } catch(e) {}
            }
            return NextResponse.json({
                success: true,
                ewayBillNo: actualData.ewayBillNo,
                ewayBillDate: actualData.ewayBillDate,
                validUpto: actualData.validUpto
            });
        }

        console.error('E-Way Bill Generation Error:', ewbData);
        return NextResponse.json({ 
            success: false, 
            error: ewbData.message || ewbData.error?.message || 'E-Way Bill Generation failed from Govt Portal.',
            details: ewbData 
        }, { status: 400 });

    } catch (error: any) {
        if (client) client.release();
        console.error('API Error in eway-bill/generate:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

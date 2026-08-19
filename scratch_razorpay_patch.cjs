const fs = require('fs');
const file = 'f:/bill/app/dashboard/pricing/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Inject the Razorpay script in useEffect if not already present
if (!code.includes('checkout.razorpay.com/v1/checkout.js')) {
    code = code.replace(
        /useEffect\(\(\) => \{/, 
        `useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        `
    );
}

// 2. Replace handleUpgrade logic
const oldHandleUpgradeRegex = /const handleUpgrade = async[\s\S]*?const verifyPayment = async/m;

const newHandleUpgrade = `const handleUpgrade = async (plan: { name: string; price: number; type: PlanType }) => {
        setSelectedPlan(plan);
        setLoading(true);

        try {
            const res = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: plan.price, planType: plan.type })
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Failed to initialize payment gateway');
                setLoading(false);
                return;
            }

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: 'BillGST',
                description: \`Upgrade to \${plan.name}\`,
                order_id: data.orderId,
                handler: async function (response: any) {
                    toast.loading('Verifying payment...');
                    try {
                        const verifyRes = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planType: plan.type
                            })
                        });
                        const verifyData = await verifyRes.json();
                        toast.dismiss();
                        if (verifyRes.ok) {
                            toast.success('Payment successful! Your plan is activated.');
                            window.location.reload();
                        } else {
                            toast.error(verifyData.error || 'Payment verification failed');
                        }
                    } catch (err) {
                        toast.dismiss();
                        toast.error('Payment verification error');
                    }
                },
                prefill: {
                    name: businessProfile?.business_owner_name || '',
                    email: session?.user?.email || '',
                    contact: businessProfile?.business_phone || ''
                },
                theme: {
                    color: '#1a56ff'
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast.error('Payment failed or cancelled');
            });
            rzp.open();
        } catch (err) {
            console.error('Razorpay Error:', err);
            toast.error('Could not load payment gateway');
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async`;

code = code.replace(oldHandleUpgradeRegex, newHandleUpgrade);

fs.writeFileSync(file, code);

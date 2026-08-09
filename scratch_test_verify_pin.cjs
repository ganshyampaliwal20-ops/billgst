async function run() {
  const res = await fetch('https://billgst.vercel.app/api/auth/verify-pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: '1234' })
  });
  console.log(res.status);
  const text = await res.text();
  console.log(text);
}
run();

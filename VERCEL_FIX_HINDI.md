# ⚠️ Vercel Error Kaise Fix Karein (Hindi Instructions)

Aapko jo "NEXTAUTH_SECRET is missing" error aa raha hai, wo **Code ki galti nahi hai**. Wo **Vercel Settings** ki kami hai.

Isko theek karne ke liye ye steps follow karein:

1.  **Vercel.com** par login karein aur apne `billgst` project par click karein.
2.  Upar **Settings** tab par click karein.
3.  Left side menu mein **Environment Variables** par click karein.
4.  Wahan naye variables add karein:

    *   **Variable 1:**
        *   **Key:** `NEXTAUTH_URL`
        *   **Value:** `https://billgst.in`
    *   **Variable 2:**
        *   **Key:** `NEXTAUTH_SECRET`
        *   **Value:** `kuch-bhi-lamba-password-likh-do` (Koi bhi random text)

5.  Ye dono add karne ke baad, **Deployments** tab mein jayein.
6.  Apne latest deployment ke paas 3 dots (...) par click karke **Redeploy** karein.

Jab redeploy ho jayega, ye error hat jayega aur login/PDF sab sahi chalega.

---

# WhatsApp PDF Problem

Browser (Chrome/Safari) se **Direct PDF** bhejna sirf mobile apps par possible hai jo 'System Share' support karte hain.

Agar aap Computer/Laptop par hain, toh browser security ki wajah se hum direct WhatsApp attach nahi kar sakte. Isliye humne ye system banaya hai:
1.  PDF pehle **Download** hoga.
2.  Fir WhatsApp Web khulega.
3.  Aapko bas "Attach" pin daba kar downloaded file select karni hai.

Agar Mobile par bhi direct share nahi ho raha, toh maine abhi ek **Alert** lagaya hai jo batayega ki error kya hai. Please try karein aur batayein.

import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n🔗 --- Vercel Database URL Generator --- 🔗");
console.log("I will help you generate the correct text for Vercel Environment Variables.\n");

rl.question('1. Enter Database Host (e.g. ep-xyz.aws.neon.tech): ', (host) => {
    rl.question('2. Enter Database User (default: neondb_owner): ', (user) => {
        rl.question('3. Enter Database Name (default: neondb): ', (dbName) => {
            rl.question('4. Enter Database Password (raw text): ', (pass) => {

                const finalUser = user.trim() || 'neondb_owner';
                const finalDb = dbName.trim() || 'neondb';
                const finalPass = pass.trim();
                const finalHost = host.trim();

                // MAGIC: This fixes the special characters!
                const encodedPass = encodeURIComponent(finalPass);
                const encodedUser = encodeURIComponent(finalUser);
                const encodedDb = encodeURIComponent(finalDb);

                const finalUrl = `postgres://${encodedUser}:${encodedPass}@${finalHost}/${encodedDb}?sslmode=require`;

                console.log("\n\n✅ SUCCESS! COPY THE LINE BELOW EXACTLY:\n");
                console.log(finalUrl);
                console.log("\n\n👉 Now go to Vercel -> Settings -> Environment Variables -> DATABASE_URL");
                console.log("👉 Paste this NEW code there and Save.");

                rl.close();
            });
        });
    });
});

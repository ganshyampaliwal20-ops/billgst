module.exports = {
    apps: [
        {
            name: "bill-app",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                // PORT: 3000
            }
        },
        {
            name: "bill-whatsapp",
            script: "./scripts/whatsapp-service.js",
            interpreter: "node",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
}

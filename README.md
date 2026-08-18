# BillGST - Advanced GST Billing & Inventory Management System

Complete GST billing solution with inventory management, analytics, multi-user support, and WhatsApp integration.

## 🚀 Features

- ✅ **GST Billing & Invoicing** - Automatic CGST/SGST/IGST calculation
- 📊 **Advanced Analytics** - Sales trends, revenue charts, GST reports
- 👥 **Multi-user Management** - Admin and staff roles
- 📦 **Inventory Management** - Stock tracking with low stock alerts
- 🌐 **Bilingual Support** - English & Hindi (हिंदी)
- 🔔 **WhatsApp Integration** - Payment reminders (setup required)
- 📄 **PDF Generation** - Professional invoice PDFs
- 📈 **Reports & Export** - Excel/PDF export capabilities

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL (Supabase compatible)
- **Charts**: Recharts
- **PDF**: jsPDF

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or Supabase free tier)
- npm or yarn

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Create a PostgreSQL database (local or use Supabase free tier).

Update `.env.local` file with your database URL:

```env
DATABASE_URL="postgresql://username:password@host:5432/database"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Business Details
BUSINESS_NAME="Your Business Name"
BUSINESS_GSTIN="22AAAAA0000A1Z5"
BUSINESS_ADDRESS="Your Address"
BUSINESS_PHONE="+91 9999999999"
BUSINESS_EMAIL="business@billgst.in"
```

### 3. Setup Database

Run the setup script to create tables and demo data:

```bash
npm run setup
```

This will create:
- Database tables (users, customers, products, invoices, etc.)
- Demo admin user
- Sample customers and products

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Login

Use these demo credentials:
- **Email**: admin@billgst.in
- **Password**: admin123

- **Password**: admin123

### 6. IMPORTANT: First Time Fix
If you see "Unauthorized" or "No Users" error:
1. Visit: `http://localhost:3000/api/fix-account`
2. Ideally do this once after setting up the database.
3. This creates the Admin user if it is missing.

## 📁 Project Structure

```
bill/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard pages
│   ├── login/         # Login page
│   └── register/      # Registration page
├── lib/
│   ├── db.js          # Database connection
│   ├── gst-calculator.js  # GST calculations
│   └── utils.js       # Utility functions
└── setup.js           # Database setup script
```

## 🗄️ Database Schema

- **users** - User accounts with roles
- **customers** - Customer management with GST details
- **products** - Inventory with HSN codes
- **invoices** - GST invoices
- **invoice_items** - Invoice line items
- **payments** - Payment tracking
- **stock_movements** - Inventory tracking
- **settings** - Application settings

## 🎨 Features Overview

### Dashboard
- Real-time analytics
- Sales trends chart
- Revenue overview
- Recent invoices
- Quick actions

### Invoicing
- Create GST-compliant invoices
- Automatic tax calculations
- Multi-item support
- PDF generation

### Inventory
- Product catalog
- Stock management
- Low stock alerts
- HSN code support

### Reports
- Sales reports
- GST reports (GSTR-1 ready)
- Customer ledger
- Excel/PDF export

### Multi-language
- English
- Hindi (हिंदी)

## 🌐 Using Supabase (Free Alternative)

1. Create free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings > Database
4. Update `DATABASE_URL` in `.env.local`
5. Run `npm run setup`

## 📱 WhatsApp Integration (Optional)

WhatsApp integration structure is ready. To activate:

1. Get WhatsApp Business API credentials from Meta
2. Add credentials to `.env.local`:
```env
WHATSAPP_API_KEY="your-api-key"
WHATSAPP_PHONE_NUMBER="your-whatsapp-number"
```

## 🚀 Deployment

### Deploy to Vercel (Free)

```bash
npm run build
```

Then deploy to Vercel:
1. Push code to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy

## 📞 Support

For issues or questions, create an issue in the repository.

## 📄 License

MIT

---

**Made with ❤️ for billgst.in**
 

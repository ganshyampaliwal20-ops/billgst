import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';

// GET - Profit & Loss Report
export async function GET(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        // Get total revenue from invoices
        let revenueQuery = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(paid_amount), 0) as collected_revenue,
        COUNT(*) as invoice_count
      FROM invoices
    `;
        const revenueParams: any[] = [];

        if (startDate && endDate) {
            revenueQuery += ' WHERE invoice_date BETWEEN $1 AND $2';
            revenueParams.push(startDate, endDate);
        }

        const revenueResult = await pool.query(revenueQuery, revenueParams);
        const revenue = revenueResult.rows[0];

        // Get total expenses
        let expenseQuery = `
      SELECT 
        COALESCE(SUM(amount), 0) as total_expenses,
        COUNT(*) as expense_count
      FROM expenses
    `;
        const expenseParams: any[] = [];

        if (startDate && endDate) {
            expenseQuery += ' WHERE expense_date BETWEEN $1 AND $2';
            expenseParams.push(startDate, endDate);
        }

        const expenseResult = await pool.query(expenseQuery, expenseParams);
        const expenses = expenseResult.rows[0];

        // Get total purchases
        let purchaseQuery = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_purchases,
        COUNT(*) as purchase_count
      FROM purchases
    `;
        const purchaseParams: any[] = [];

        if (startDate && endDate) {
            purchaseQuery += ' WHERE purchase_date BETWEEN $1 AND $2';
            purchaseParams.push(startDate, endDate);
        }

        const purchaseResult = await pool.query(purchaseQuery, purchaseParams);
        const purchases = purchaseResult.rows[0];

        // Calculate profit
        const totalRevenue = Number(revenue.total_revenue);
        const totalExpenses = Number(expenses.total_expenses);
        const totalPurchases = Number(purchases.total_purchases);
        const grossProfit = totalRevenue - totalPurchases;
        const netProfit = grossProfit - totalExpenses;

        // Get category-wise expenses
        let categoryQuery = `
      SELECT category, COALESCE(SUM(amount), 0) as amount
      FROM expenses
    `;
        const categoryParams: any[] = [];

        if (startDate && endDate) {
            categoryQuery += ' WHERE expense_date BETWEEN $1 AND $2';
            categoryParams.push(startDate, endDate);
        }

        categoryQuery += ' GROUP BY category ORDER BY amount DESC';
        const categoryResult = await pool.query(categoryQuery, categoryParams);

        return NextResponse.json({
            revenue: {
                total: totalRevenue,
                collected: Number(revenue.collected_revenue),
                invoice_count: Number(revenue.invoice_count)
            },
            expenses: {
                total: totalExpenses,
                count: Number(expenses.expense_count),
                by_category: categoryResult.rows
            },
            purchases: {
                total: totalPurchases,
                count: Number(purchases.purchase_count)
            },
            profit: {
                gross_profit: grossProfit,
                net_profit: netProfit,
                profit_margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0
            }
        });
    } catch (error: any) {
        console.error('P&L Report Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const client = await pool.connect();

        // Check if product is used in invoices
        const checkUsage = await client.query('SELECT COUNT(*) FROM invoice_items WHERE product_id = $1', [id]);
        if (parseInt(checkUsage.rows[0].count) > 0) {
            client.release();
            return NextResponse.json({ error: 'Cannot delete product: It is used in existing invoices' }, { status: 400 });
        }

        await client.query('DELETE FROM products WHERE id = $1', [id]);
        client.release();

        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}

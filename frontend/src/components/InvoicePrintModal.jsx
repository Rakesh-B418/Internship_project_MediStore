import { useEffect, useRef } from 'react';
import { X, Printer, Building2, Phone, Mail } from 'lucide-react';
import ReactDOM from 'react-dom';
import '../print.css';

/**
 * InvoicePrintModal
 * -----------------
 * Renders a professional A4 invoice in a modal.
 * Uses a React Portal so it can be targeted separately in print CSS.
 *
 * Props:
 *   bill       – bill object from POST /billing/checkout response
 *   storeInfo  – { store_name, address, phone, email, gstin }
 *   onClose    – called when user closes the modal
 */
export default function InvoicePrintModal({ bill, storeInfo, onClose }) {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!bill) return null;

  const invoiceNumber = bill._id ? `INV-${bill._id.slice(-8).toUpperCase()}` : 'INV-XXXXXXXX';
  const billDate = bill.created_at
    ? new Date(bill.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const store = storeInfo || {};

  const invoice = (
    <div className="printable-invoice" style={{ display: 'none' }}>
      {/* ── Store Header ── */}
      <div className="inv-header">
        <div className="inv-store-name">{store.store_name || 'SupplySense Medical Store'}</div>
        {store.address && <div className="inv-store-meta">{store.address}</div>}
        <div className="inv-store-meta" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {store.phone && <span>📞 {store.phone}</span>}
          {store.email && <span>✉ {store.email}</span>}
          {store.gstin && <span>GSTIN: {store.gstin}</span>}
        </div>
      </div>

      {/* ── Invoice Meta ── */}
      <div className="inv-meta-row">
        <div>
          <div><strong>Invoice No:</strong> {invoiceNumber}</div>
          <div><strong>Date:</strong> {billDate}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div><strong>Bill To:</strong></div>
          <div>{bill.customer_name || 'Walk-in Customer'}</div>
        </div>
      </div>

      {/* ── Items Table ── */}
      <table className="inv-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Medicine / Product</th>
            <th className="num">Qty</th>
            <th className="num">Unit Price (₹)</th>
            <th className="num">Disc %</th>
            <th className="num">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {(bill.items || []).map((item, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{item.product_name}</td>
              <td className="num">{item.quantity}</td>
              <td className="num">{Number(item.base_price).toFixed(2)}</td>
              <td className="num">{item.discount_percentage || 0}%</td>
              <td className="num">{Number(item.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Totals ── */}
      <div className="inv-totals">
        <table>
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td>₹{Number(bill.subtotal).toFixed(2)}</td>
            </tr>
            {(bill.tax_percent > 0) && (
              <tr>
                <td>Tax ({bill.tax_percent}%)</td>
                <td>₹{Number(bill.tax_amount).toFixed(2)}</td>
              </tr>
            )}
            {(bill.discount_percent > 0) && (
              <tr>
                <td>Discount ({bill.discount_percent}%)</td>
                <td>- ₹{Number(bill.discount_amount).toFixed(2)}</td>
              </tr>
            )}
            <tr className="inv-grand-total">
              <td>TOTAL</td>
              <td>₹{Number(bill.total).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="inv-footer">
        Thank you for your purchase! • All sales are subject to applicable terms and conditions.
        {store.gstin && <><br />GSTIN: {store.gstin}</>}
      </div>
    </div>
  );

  // ── Screen Modal ──────────────────────────────────────────────
  return ReactDOM.createPortal(
    <>
      <div
        ref={overlayRef}
        className="inv-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      >
        <div className="relative bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        {/* Modal header controls */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-800">Invoice Preview</h2>
          <div className="flex gap-2">
            <button
              className="inv-print-btn flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" />
              Print Bill
            </button>
            <button
              className="inv-close-btn p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice body (screen version) */}
        <div className="p-8">
          {/* Store Header */}
          <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-gray-800">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                {store.store_name || 'SupplySense Medical Store'}
              </h1>
              {store.address && <p className="text-sm text-gray-500 mt-1">{store.address}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                {store.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />{store.phone}
                  </span>
                )}
                {store.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />{store.email}
                  </span>
                )}
                {store.gstin && <span className="text-xs">GSTIN: {store.gstin}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-1">Invoice</div>
              <div className="text-xl font-bold text-gray-800">{invoiceNumber}</div>
              <div className="text-sm text-gray-500 mt-1">{billDate}</div>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Bill To</span>
            <p className="text-base font-semibold text-gray-800 mt-1">
              {bill.customer_name || 'Walk-in Customer'}
            </p>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 rounded-lg">
                  <th className="text-left px-3 py-2 font-semibold text-gray-600">#</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-600">Medicine / Product</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">Qty</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">Unit Price</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">Disc%</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {(bill.items || []).map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{item.product_name}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">₹{Number(item.base_price).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">
                      {item.discount_percentage > 0
                        ? <span className="text-green-600 font-medium">{item.discount_percentage}%</span>
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-800">
                      ₹{Number(item.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{Number(bill.subtotal).toFixed(2)}</span>
              </div>
              {bill.tax_percent > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({bill.tax_percent}%)</span>
                  <span>₹{Number(bill.tax_amount).toFixed(2)}</span>
                </div>
              )}
              {bill.discount_percent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({bill.discount_percent}%)</span>
                  <span>- ₹{Number(bill.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t-2 border-gray-800">
                <span className="font-extrabold text-base text-gray-900">TOTAL</span>
                <span className="font-extrabold text-xl text-indigo-700">₹{Number(bill.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
            Thank you for your purchase! • All sales subject to applicable terms.
            {store.gstin && <span className="block mt-1">GSTIN: {store.gstin}</span>}
          </div>
        </div>
      </div>
      </div>

      {/* Hidden printable version (revealed by print CSS) */}
      {invoice}
    </>,
    document.body
  );
}

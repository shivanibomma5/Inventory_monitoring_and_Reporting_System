import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SummaryCard from '../components/SummaryCard';
import ChartComponent from '../components/ChartComponent';
import LowStockBadge from '../components/LowStockBadge';
import { useProducts } from '../hooks/useProducts';
import { FormatUtils } from '../utilities/FormatUtils';
import '../styles/inventory.css';
import '../styles/dashboard.css';

const TABS = ['Summary', 'Low Stock', 'Value Report', 'Category Breakdown'];

export default function ReportsPage() {
  const { products, loading, lowStockProducts } = useProducts();
  const [activeTab, setActiveTab] = useState(0);

  const totalValue = products.reduce((acc, p) => acc + p.quantity * p.unitPrice, 0);

  // Category breakdown
  const categoryMap = {};
  products.forEach(p => { categoryMap[p.category] = (categoryMap[p.category] || 0) + 1; });
  const categoryChart = Object.entries(categoryMap).map(([label, value]) => ({ label, value }));

  // Value chart — top 8 by total value
  const valueChart = [...products]
    .sort((a, b) => (b.quantity * b.unitPrice) - (a.quantity * a.unitPrice))
    .slice(0, 8)
    .map(p => ({ label: p.name, value: Math.round(p.quantity * p.unitPrice) }));

  const tabStyle = (i) => ({
    padding: '9px 18px',
    borderRadius: 'var(--r)',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    background: activeTab === i ? 'var(--accent)' : 'var(--bg3)',
    color: activeTab === i ? '#fff' : 'var(--text2)',
    border: '1px solid ' + (activeTab === i ? 'var(--accent)' : 'var(--border)'),
    transition: 'all 0.15s',
  });

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Reports" />
        <div className="page-inner fade-up">
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Inventory analytics and detailed breakdowns.</p>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            {TABS.map((t, i) => (
              <button key={t} style={tabStyle(i)} onClick={() => setActiveTab(i)}>{t}</button>
            ))}
          </div>

          {/* ── Summary ── */}
          {activeTab === 0 && (
            <div>
              <div className="summary-grid" style={{ marginBottom: 28 }}>
                <SummaryCard
                  label="Total SKUs"
                  value={loading ? '…' : products.length}
                  icon="📦" color="accent" delay={0}
                />
                <SummaryCard
                  label="Total Value"
                  value={loading ? '…' : FormatUtils.currency(totalValue)}
                  icon="₹" color="green" delay={80}
                />
                <SummaryCard
                  label="Low Stock Items"
                  value={loading ? '…' : lowStockProducts.length}
                  icon="⚠" color={lowStockProducts.length > 0 ? 'amber' : 'green'} delay={160}
                />
                <SummaryCard
                  label="Categories"
                  value={loading ? '…' : Object.keys(categoryMap).length}
                  icon="🏷" color="purple" delay={240}
                />
              </div>
              <div className="dashboard-panel">
                <div className="dashboard-panel-title">Products by Category</div>
                <ChartComponent data={categoryChart} height={220} />
              </div>
            </div>
          )}

          {/* ── Low Stock ── */}
          {activeTab === 1 && (
            <div className="table-wrapper">
              {lowStockProducts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <h3>All products are sufficiently stocked</h3>
                  <p>No items are currently below their reorder level.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th><th>Category</th><th>Current Stock</th>
                      <th>Reorder Level</th><th>Shortage</th><th>Supplier</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td><span className="category-pill">{p.category}</span></td>
                        <td style={{ fontFamily: 'DM Mono,monospace', color: 'var(--accent-red)' }}>{p.quantity}</td>
                        <td style={{ fontFamily: 'DM Mono,monospace' }}>{p.reorderLevel}</td>
                        <td style={{ fontFamily: 'DM Mono,monospace', color: 'var(--accent-amber)' }}>
                          -{p.reorderLevel - p.quantity}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.supplier || '—'}</td>
                        <td><LowStockBadge quantity={p.quantity} reorderLevel={p.reorderLevel} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Value Report ── */}
          {activeTab === 2 && (
            <div>
              <div className="dashboard-panel" style={{ marginBottom: 24 }}>
                <div className="dashboard-panel-title">Top Products by Inventory Value</div>
                <ChartComponent data={valueChart} height={220} />
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Product</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Total Value</th></tr>
                  </thead>
                  <tbody>
                    {[...products]
                      .sort((a, b) => (b.quantity * b.unitPrice) - (a.quantity * a.unitPrice))
                      .map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 500 }}>{p.name}</td>
                          <td><span className="category-pill">{p.category}</span></td>
                          <td style={{ fontFamily: 'DM Mono,monospace' }}>{p.quantity}</td>
                          <td style={{ fontFamily: 'DM Mono,monospace' }}>{FormatUtils.currency(p.unitPrice)}</td>
                          <td style={{ fontFamily: 'DM Mono,monospace', color: 'var(--accent-primary)', fontWeight: 600 }}>
                            {FormatUtils.currency(p.quantity * p.unitPrice)}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Category Breakdown ── */}
          {activeTab === 3 && (
            <div>
              <div className="dashboard-panel" style={{ marginBottom: 24 }}>
                <div className="dashboard-panel-title">Category Distribution</div>
                <ChartComponent data={categoryChart} height={220} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16 }}>
                {Object.entries(categoryMap).map(([cat, count], idx) => {
                  const catValue = products
                    .filter(p => p.category === cat)
                    .reduce((acc, p) => acc + p.quantity * p.unitPrice, 0);
                  return (
                    <SummaryCard
                      key={cat}
                      label={cat}
                      value={count}
                      icon="🏷"
                      color="purple"
                      delay={idx * 50}
                      trend={<span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{FormatUtils.currency(catValue)} total value</span>}
                    />
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
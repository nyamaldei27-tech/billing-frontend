import React, { useState, useEffect } from 'react';
import { billingApi } from '../api'; // Pulls tracking routes directly from api.js

export default function ChurnDashboard() {
    const [attempts, setAttempts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [simStatus, setSimStatus] = useState('');

    const loadDashboardData = async () => {
        try {
            const [attemptsData, invoicesData] = await Promise.all([
                billingApi.getAllPaymentAttempts(),
                billingApi.getAllInvoices()
            ]);
            setAttempts(attemptsData);
            setInvoices(invoicesData);
        } catch (err) {
            console.error("Metric sync failed", err);
        }
    };

    useEffect(() => {
        loadDashboardData().catch(err => console.error("Initial dashboard sync failed:", err));
    }, []);

    const simulatePayment = async (invoiceId, status) => {
        setSimStatus(`Simulating processing for Invoice #${invoiceId}...`);
        try {
            await billingApi.payInvoiceViaPath(invoiceId, status);
            setSimStatus(`Success: Marked transaction context as ${status}.`);
            await loadDashboardData();
        } catch (err) {
            setSimStatus(`Simulation block error: ${err.message}`);
        }
    };

    return (
        <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', minHeight: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>📈 Ledger Feed & Attrition Triggers</h2>
                <button onClick={loadDashboardData} style={{ padding: '4px 8px', cursor: 'pointer' }}>Sync Metrics</button>
            </div>

            {simStatus && <p style={{ color: '#2b6cb0', fontStyle: 'italic', fontSize: '13px', margin: '0 0 15px 0' }}>{simStatus}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Open Invoices List */}
                <div style={{ border: '1px solid #edf2f7', padding: '12px', borderRadius: '6px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Open System Invoices</h4>
                    {invoices.length === 0 ? <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>No invoices found.</p> : (
                        <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                            {invoices.map(inv => (
                                <div key={inv.id} style={{ padding: '8px 0', borderBottom: '1px solid #edf2f7', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Invoice #{inv.id} | Balance: <strong>${(inv.amountCents ? inv.amountCents / 100 : inv.amount / 100 || 0).toFixed(2)}</strong> | [{inv.status}]</span>
                                    {inv.status !== 'PAID' && (
                                        <div>
                                            <button onClick={() => simulatePayment(inv.id, 'SUCCESS')} style={{ fontSize: '11px', background: '#38a169', color: '#fff', border: 'none', padding: '3px 6px', marginRight: '4px', borderRadius: '3px', cursor: 'pointer' }}>Pass</button>
                                            <button onClick={() => simulatePayment(inv.id, 'FAILED')} style={{ fontSize: '11px', background: '#e53e3e', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '3px', cursor: 'pointer' }}>Fail</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Churn Risk Output Logs */}
                <div style={{ border: '1px solid #edf2f7', padding: '12px', borderRadius: '6px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Payment Attempt History Log</h4>
                    {attempts.length === 0 ? <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>No payment attempts logged.</p> : (
                        <ul style={{ paddingLeft: '15px', margin: 0, maxHeight: '180px', overflowY: 'auto', fontSize: '13px' }}>
                            {attempts.map((att, idx) => (
                                <li key={att.id || idx} style={{ marginBottom: '6px', color: att.status === 'FAILED' ? '#e53e3e' : '#38a169' }}>
                                    <strong>[{att.status}]</strong> Invoice #{att.invoiceId || att.invoice?.id} - Attempted
                                    {att.status === 'FAILED' && <span style={{ fontWeight: 'bold' }}> ⚠️ (Attrition Multiplier Risk)</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}
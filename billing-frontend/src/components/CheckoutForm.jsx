import React, { useState } from 'react';
import { billingApi } from '../api'; // This looks back one folder level to your api.js file

export default function CheckoutForm({ plans }) {
    const [customerId, setCustomerId] = useState('');
    const [planId, setPlanId] = useState('');
    const [status, setStatus] = useState('');

    const handleCheckout = async (e) => {
        e.preventDefault();
        setStatus('Processing checkout...');
        try {
            const payload = {
                customerId: parseInt(customerId, 10),
                planId: parseInt(planId, 10)
            };
            const { id } = await billingApi.createSubscription(payload);
            setStatus(`✅ Success! Subscription ID #${id || 'New'} generated.`);
            setCustomerId('');
            setPlanId('');
        } catch (err) {
            setStatus(`❌ Error: ${err.response?.data || err.message}`);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#fff', marginTop: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Subscription Gateway (Checkout)</h3>
            <form onSubmit={handleCheckout}>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Target Customer ID:</label>
                    <input
                        type="number"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        required
                        style={{ width: '90%', padding: '6px' }}
                    />
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Select Target Plan:</label>
                    <select
                        value={planId}
                        onChange={(e) => setPlanId(e.target.value)}
                        required
                        style={{ width: '95%', padding: '6px' }}
                    >
                        <option value="">-- Choose a Catalog Plan --</option>
                        {plans.map(p => <option key={p.id} value={p.id}>{p.name} (${(p.priceCents / 100).toFixed(2)})</option>)}
                    </select>
                </div>
                <button type="submit" style={{ padding: '8px 12px', background: '#319795', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                    Provision Subscription
                </button>
            </form>
            {status && <p style={{ marginTop: '10px', fontStyle: 'italic', fontSize: '13px' }}>{status}</p>}
        </div>
    );
}
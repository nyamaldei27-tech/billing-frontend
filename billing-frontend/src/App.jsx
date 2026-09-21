import React, { useState, useEffect } from 'react';
import { billingApi } from './api';
import CheckoutForm from './components/CheckoutForm';
import ChurnDashboard from './components/ChurnDashboard';

export default function App() {
    const [plans, setPlans] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form states for creating a new Customer
    const [customerForm, setCustomerForm] = useState({ firstName: '', middleName: '', lastName: '', email: '' });
    const [customerMessage, setCustomerMessage] = useState('');

    // Form states for creating a new Plan
    const [planForm, setPlanForm] = useState({ name: '', billingCycle: 'MONTHLY', priceCents: '' });
    const [planMessage, setPlanMessage] = useState('');

    // 1. SAFELY DEFINED: This function only runs when specifically called
    const refreshCoreData = async () => {
        try {
            const [plansData, customersData] = await Promise.all([
                billingApi.getPlans(),
                billingApi.getAllCustomers()
            ]);
            setPlans(plansData);
            setCustomers(customersData);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch background resource data from API.');
        } finally {
            setLoading(false);
        }
    };

    // 2. ISOLATED INITIALIZATION: Runs exactly ONCE when the component mounts
    useEffect(() => {
        refreshCoreData().catch(err => console.error("Initial load failed:", err));
    }, []);

    // 3. EVENT DRIVEN: Runs ONLY when a user clicks the register button
    const handleCustomerSubmit = async (e) => {
        e.preventDefault();
        setCustomerMessage('Registering...');
        try {
            const savedCustomer = await billingApi.createCustomer(customerForm);
            setCustomerMessage(`✅ Success! Created Customer ID: ${savedCustomer.id}`);
            setCustomerForm({ firstName: '', middleName: '', lastName: '', email: '' });
            await refreshCoreData();
        } catch (err) {
            setCustomerMessage(`❌ Error: ${err.response?.data || err.message}`);
        }
    };

    // 4. EVENT DRIVEN: Runs ONLY when a user clicks the publish button
    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        setPlanMessage('Saving Plan...');
        try {
            const payload = {
                ...planForm,
                priceCents: parseInt(planForm.priceCents, 10)
            };
            const savedPlan = await billingApi.createPlan(payload);
            setPlanMessage(`✅ Success! Created Plan ID: ${savedPlan.id}`);
            setPlanForm({ name: '', billingCycle: 'MONTHLY', priceCents: '' });
            await refreshCoreData();
        } catch (err) {
            setPlanMessage(`❌ Error: ${err.response?.data || err.message}`);
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1400px', margin: '0 auto', color: '#333' }}>

            {/* Upper Status Ribbon */}
            <header style={{ borderBottom: '2px solid #ddd', paddingBottom: '15px', marginBottom: '25px' }}>
                <h1 style={{ margin: 0, color: '#1a202c' }}>Subscription Billing & Churn Ops Room</h1>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Connected to Spring Boot API Services</p>
                {error && (
                    <div style={{ background: '#fff5f5', color: '#c53030', padding: '10px', borderRadius: '4px', marginTop: '10px', border: '1px solid #fed7d7', fontWeight: 'bold' }}>
                        ⚠️ Connection Warning: {error}
                    </div>
                )}
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
                    Loading ledger states and billing metadata...
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '25px' }}>

                    {/* ================= COLUMN 1: ADMINISTRATIVE SETUP ================= */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Create Customer Box */}
                        <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                            <h3 style={{ margin: '0 0 12px 0' }}>User Account Provisioning</h3>
                            <form onSubmit={handleCustomerSubmit}>
                                <input style={{ width: '90%', padding: '6px', marginBottom: '8px' }} placeholder="First Name" value={customerForm.firstName} onChange={e => setCustomerForm({...customerForm, firstName: e.target.value})} required /><br/>
                                <input style={{ width: '90%', padding: '6px', marginBottom: '8px' }} placeholder="Middle Name (Optional)" value={customerForm.middleName} onChange={e => setCustomerForm({...customerForm, middleName: e.target.value})} /><br/>
                                <input style={{ width: '90%', padding: '6px', marginBottom: '8px' }} placeholder="Last Name" value={customerForm.lastName} onChange={e => setCustomerForm({...customerForm, lastName: e.target.value})} required /><br/>
                                <input style={{ width: '90%', padding: '6px', marginBottom: '12px' }} type="email" placeholder="Email Address" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} required /><br/>
                                <button type="submit" style={{ padding: '6px 12px', background: '#4a5568', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Register User</button>
                            </form>
                            {customerMessage && <p style={{ fontSize: '12px', margin: '8px 0 0 0', fontStyle: 'italic' }}>{customerMessage}</p>}
                        </div>

                        {/* Create Plan Box */}
                        <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                            <h3 style={{ margin: '0 0 12px 0' }}>Catalog Architecture (Plans)</h3>
                            <form onSubmit={handlePlanSubmit}>
                                <input style={{ width: '90%', padding: '6px', marginBottom: '8px' }} placeholder="Plan Name (e.g., Premium Tier)" value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} required /><br/>
                                <select style={{ width: '95%', padding: '6px', marginBottom: '8px' }} value={planForm.billingCycle} onChange={e => setPlanForm({...planForm, billingCycle: e.target.value})}>
                                    <option value="WEEKLY">Weekly Iteration</option>
                                    <option value="MONTHLY">Monthly Cycle</option>
                                    <option value="YEARLY">Yearly Terms</option>
                                </select><br/>
                                <input style={{ width: '90%', padding: '6px', marginBottom: '12px' }} type="number" placeholder="Price in Cents (e.g., 999 for $9.99)" value={planForm.priceCents} onChange={e => setPlanForm({...planForm, priceCents: e.target.value})} required /><br/>
                                <button type="submit" style={{ padding: '6px 12px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Publish Plan</button>
                            </form>
                            {planMessage && <p style={{ fontSize: '12px', margin: '8px 0 0 0', fontStyle: 'italic' }}>{planMessage}</p>}
                        </div>

                    </section>

                    {/* ================= COLUMN 2: ACTIVE REPOSITORIES & CHECKOUT ================= */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Live Plans Roster */}
                        <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Active System Catalogs</h3>
                            {plans.length === 0 ? <p style={{ color: '#aaa', margin: 0 }}>No plans registered.</p> : (
                                <ul style={{ paddingLeft: '18px', margin: 0 }}>
                                    {plans.map(p => (
                                        <li key={p.id} style={{ marginBottom: '6px', fontSize: '14px' }}>
                                            ID #{p.id}: <strong>{p.name}</strong> – ${(p.priceCents / 100).toFixed(2)} <span style={{ color: '#718096', fontSize: '11px' }}>/{p.billingCycle}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Active Customers Roster */}
                        <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Registered Customers Directory</h3>
                            {customers.length === 0 ? <p style={{ color: '#aaa', margin: 0 }}>No registered clients.</p> : (
                                <ul style={{ paddingLeft: '18px', margin: 0 }}>
                                    {customers.map(c => (
                                        <li key={c.id} style={{ marginBottom: '6px', fontSize: '14px' }}>
                                            ID #{c.id}: <strong>{c.firstName} {c.lastName}</strong> <span style={{ color: '#718096', fontSize: '12px' }}>({c.email})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Transaction Subscription Checkout Module */}
                        <CheckoutForm plans={plans} />

                    </section>

                    {/* ================= COLUMN 3: REAL-TIME LEDGERS & CHURN METRICS ================= */}
                    <section>
                        <ChurnDashboard />
                    </section>

                </div>
            )}
        </div>
    );
}
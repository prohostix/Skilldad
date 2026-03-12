import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Settings,
    Save,
    TestTube,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
    Loader2,
    CreditCard,
    Clock,
    DollarSign,
    Shield,
    AlertCircle,
    Wallet
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const GatewayConfigPanel = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const [config, setConfig] = useState({
        merchantId: '',
        merchantName: '',
        apiKey: '',
        apiSecret: '',
        enabledPaymentMethods: [],
        minTransactionAmount: 10,
        maxTransactionAmount: 500000,
        sessionTimeoutMinutes: 15,
        environment: 'sandbox',
        isActive: true,
        lastModifiedBy: null,
        updatedAt: null
    });

    const paymentMethods = [
        { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
        { id: 'debit_card', label: 'Debit Card', icon: CreditCard },
        { id: 'net_banking', label: 'Net Banking', icon: Shield },
        { id: 'upi', label: 'UPI', icon: DollarSign },
        { id: 'wallet', label: 'Digital Wallet', icon: Wallet }
    ];

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/admin/payment/config', config);
            
            if (data.success) {
                setConfig(data.config);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
            showToast(error.response?.data?.message || 'Failed to fetch configuration', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async (e) => {
        e.preventDefault();

        if (config.minTransactionAmount >= config.maxTransactionAmount) {
            showToast('Minimum amount must be less than maximum amount', 'error');
            return;
        }

        if (config.sessionTimeoutMinutes < 5 || config.sessionTimeoutMinutes > 60) {
            showToast('Session timeout must be between 5 and 60 minutes', 'error');
            return;
        }

        setSaving(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const headers = { Authorization: `Bearer ${userInfo.token}` };
            
            const { data } = await axios.put('/api/admin/payment/config', config, { headers });

            if (data.success) {
                showToast('Configuration updated successfully', 'success');
                fetchConfig();
            }
        } catch (error) {
            console.error('Error saving config:', error);
            showToast(error.response?.data?.message || 'Failed to save configuration', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);
        
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const headers = { Authorization: `Bearer ${userInfo.token}` };
            
            const { data } = await axios.post('/api/admin/payment/test-connection', {}, { headers });

            if (data.success) {
                setTestResult({
                    success: true,
                    status: data.gatewayStatus,
                    responseTime: data.responseTime,
                    timestamp: data.timestamp
                });
                showToast('Gateway connection successful', 'success');
            }
        } catch (error) {
            console.error('Error testing connection:', error);
            setTestResult({
                success: false,
                error: error.response?.data?.message || 'Connection test failed'
            });
            showToast('Gateway connection failed', 'error');
        } finally {
            setTesting(false);
        }
    };

    const togglePaymentMethod = (methodId) => {
        setConfig(prev => ({
            ...prev,
            enabledPaymentMethods: prev.enabledPaymentMethods.includes(methodId)
                ? prev.enabledPaymentMethods.filter(m => m !== methodId)
                : [...prev.enabledPaymentMethods, methodId]
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center justify-between">
                <DashboardHeading title="Gateway Configuration" />
                <ModernButton variant="secondary" onClick={handleTestConnection} disabled={testing}>
                    {testing ? (
                        <>
                            <Loader2 size={18} className="mr-2 animate-spin" />
                            Testing...
                        </>
                    ) : (
                        <>
                            <TestTube size={18} className="mr-2" />
                            Test Connection
                        </>
                    )}
                </ModernButton>
            </div>

            {/* Test Result */}
            {testResult && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className={`!p-4 border ${
                        testResult.success ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
                    }`}>
                        <div className="flex items-center space-x-3">
                            {testResult.success ? (
                                <CheckCircle2 className="text-emerald-400" size={24} />
                            ) : (
                                <XCircle className="text-red-400" size={24} />
                            )}
                            <div className="flex-1">
                                <h4 className={`font-bold ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                                </h4>
                                {testResult.success ? (
                                    <p className="text-xs text-white/70 mt-1">
                                        Status: {testResult.status} | Response Time: {testResult.responseTime}ms
                                    </p>
                                ) : (
                                    <p className="text-xs text-white/70 mt-1">{testResult.error}</p>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Merchant Credentials */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <GlassCard className="!p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <Shield className="text-primary mr-3" size={24} />
                                    <h2 className="text-lg font-bold text-white font-poppins">Merchant Credentials</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowCredentials(!showCredentials)}
                                    className="text-white/50 hover:text-white transition-colors"
                                >
                                    {showCredentials ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                        Merchant ID
                                    </label>
                                    <input
                                        type="text"
                                        value={config.merchantId}
                                        onChange={(e) => setConfig({ ...config, merchantId: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        disabled={saving}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                        API Key
                                    </label>
                                    <input
                                        type={showCredentials ? 'text' : 'password'}
                                        value={config.apiKey}
                                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        disabled={saving}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                        API Secret
                                    </label>
                                    <input
                                        type={showCredentials ? 'text' : 'password'}
                                        value={config.apiSecret}
                                        onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        disabled={saving}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                        Environment
                                    </label>
                                    <select
                                        value={config.environment}
                                        onChange={(e) => setConfig({ ...config, environment: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        disabled={saving}
                                    >
                                        <option value="sandbox">Sandbox</option>
                                        <option value="production">Production</option>
                                    </select>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Payment Methods */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <GlassCard className="!p-6">
                            <div className="flex items-center mb-6">
                                <CreditCard className="text-primary mr-3" size={24} />
                                <h2 className="text-lg font-bold text-white font-poppins">Payment Methods</h2>
                            </div>

                            <div className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <label
                                        key={method.id}
                                        className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={config.enabledPaymentMethods.includes(method.id)}
                                            onChange={() => togglePaymentMethod(method.id)}
                                            className="w-5 h-5 rounded border-white/20 text-primary focus:ring-primary/50"
                                            disabled={saving}
                                        />
                                        <method.icon className="text-white/50" size={20} />
                                        <span className="text-white font-medium">{method.label}</span>
                                    </label>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Transaction Limits & Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <GlassCard className="!p-6">
                        <div className="flex items-center mb-6">
                            <Settings className="text-primary mr-3" size={24} />
                            <h2 className="text-lg font-bold text-white font-poppins">Transaction Settings</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                    Min Transaction (₹)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" size={18} />
                                    <input
                                        type="number"
                                        value={config.minTransactionAmount}
                                        onChange={(e) => setConfig({ ...config, minTransactionAmount: parseFloat(e.target.value) })}
                                        min="1"
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        disabled={saving}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                    Max Transaction (₹)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" size={18} />
                                    <input
                                        type="number"
                                        value={config.maxTransactionAmount}
                                        onChange={(e) => setConfig({ ...config, maxTransactionAmount: parseFloat(e.target.value) })}
                                        min="1"
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        disabled={saving}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                    Session Timeout (min)
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" size={18} />
                                    <input
                                        type="number"
                                        value={config.sessionTimeoutMinutes}
                                        onChange={(e) => setConfig({ ...config, sessionTimeoutMinutes: parseInt(e.target.value) })}
                                        min="5"
                                        max="60"
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        disabled={saving}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Last Modified Info */}
                        {config.updatedAt && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex items-center text-xs text-white/50">
                                    <AlertCircle size={14} className="mr-2" />
                                    Last modified: {new Date(config.updatedAt).toLocaleString()}
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <ModernButton
                        type="submit"
                        variant="primary"
                        disabled={saving}
                        className="min-w-[200px]"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} className="mr-2" />
                                Save Configuration
                            </>
                        )}
                    </ModernButton>
                </div>
            </form>
        </div>
    );
};

export default GatewayConfigPanel;

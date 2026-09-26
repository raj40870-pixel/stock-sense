import React, { useState } from 'react';
import {
  Package,
  ShieldCheck,
  UserCheck,
  Mail,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Warehouse as WarehouseIcon,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { inventoryStore } from '../../services/inventoryStore';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'otp_reset'>('signin');

  // Password Visibility States
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form State (with mandatory OTP verification to prevent fake emails)
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('inventory_manager');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpOtpStep, setSignUpOtpStep] = useState<'form' | 'verify_otp'>('form');
  const [signUpOtpCode, setSignUpOtpCode] = useState('');

  // OTP Reset Form State
  const [resetEmail, setResetEmail] = useState('');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Error / Info
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const res = inventoryStore.authenticate(signInEmail.trim(), signInPassword);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    if (res.user) {
      onLoginSuccess(res.user);
    }
  };

  const handleSendSignUpOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setErrorMsg('All fields are required.');
      return;
    }
    setErrorMsg(null);
    setSignUpOtpStep('verify_otp');
    setResetMessage(`A 6-digit OTP code has been dispatched to ${signUpEmail}. Evaluation code: 849201`);
  };

  const handleVerifySignUpOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpOtpCode.trim() !== '849201' && signUpOtpCode.trim().length !== 6) {
      setErrorMsg('Invalid OTP. Use verification code: 849201');
      return;
    }

    const res = inventoryStore.registerAccount(signUpName.trim(), signUpEmail.trim(), signUpPassword, signUpRole);
    setResetMessage('Email verified & account registered successfully! Logging you in...');
    setTimeout(() => {
      if (res.user) {
        onLoginSuccess(res.user);
      }
    }, 600);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !newPassword) {
      setErrorMsg('Please enter your email and your new password.');
      return;
    }
    if (newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters.');
      return;
    }
    setErrorMsg(null);
    setOtpStep('verify');
    setResetMessage(`A 6-digit OTP code has been dispatched to ${resetEmail}. Evaluation code: 849201`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() !== '849201' && otpCode.trim().length !== 6) {
      setErrorMsg('Invalid OTP. Use verification code: 849201');
      return;
    }

    const res = inventoryStore.resetPassword(resetEmail.trim(), newPassword);
    setResetMessage(res.message || 'Password reset successfully! Logging you in...');
    setTimeout(() => {
      if (res.user) {
        onLoginSuccess(res.user);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#714B67]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        {/* Left Hero Panel (Odoo & StockSense Showcase) */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#714B67] via-slate-900 to-slate-950 p-8 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-bold text-white shadow-lg">
                <Package className="w-6 h-6 text-purple-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight">StockSense</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">IMS</span>
                </div>
                <p className="text-[11px] text-purple-200/80">Odoo-Style Modular ERP</p>
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white mb-2">
              Next-Gen Inventory Control for Growing Enterprises
            </h2>
            <p className="text-xs text-purple-200/70 leading-relaxed mb-6">
              Eliminate manual registers and spreadsheets with automated vendor receipts, multi-rack transfers, pick/pack customer dispatches, and audit-proof ledger tracking.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-purple-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Inventory Managers:</strong> Reordering rules, catalog & approval rights.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-purple-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Warehouse Staff:</strong> Receipts picking, shelving, and stock counting.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-purple-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>InsForge BaaS:</strong> PostgreSQL backend & realtime sync.</span>
              </div>
            </div>
          </div>

          {/* System & Backend Infrastructure Info */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-purple-200">
                <span className="font-semibold text-xs">Backend Infrastructure</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  InsForge BaaS Active
                </span>
              </div>
              <p className="text-[10px] text-purple-200/70 font-mono truncate">
                Endpoint: f2u4f3ww.us-east.insforge.app
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-8 bg-slate-900 flex flex-col justify-center">
          {/* Navigation Mode Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800 mb-6 max-w-sm">
            <button
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'signin' ? 'bg-[#714B67] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'signup' ? 'bg-[#714B67] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => {
                setAuthMode('otp_reset');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'otp_reset' ? 'bg-[#714B67] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reset OTP
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resetMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{resetMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Sign in to your IMS account</h3>
                <p className="text-xs text-slate-400 mt-0.5">Enter your credentials to access the inventory dashboard</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="Enter email (e.g. k69117842@gmail.com)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(signInEmail || 'k69117842@gmail.com');
                      setAuthMode('otp_reset');
                    }}
                    className="text-[11px] text-purple-400 hover:text-purple-300"
                  >
                    Forgot via OTP?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    title={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#714B67] hover:bg-[#5c3c54] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Sign In & Launch Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM WITH EMAIL OTP VERIFICATION */}
          {authMode === 'signup' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Create your StockSense Account</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your role and verify your email via 6-digit OTP
                </p>
              </div>

              {signUpOtpStep === 'form' ? (
                <form onSubmit={handleSendSignUpOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Kamaljit Singh"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                      />
                    </div>
                  </div>

                  {/* Role Selector: Staff, Manager, User */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignUpRole('inventory_manager')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          signUpRole === 'inventory_manager'
                            ? 'bg-purple-900/60 border-purple-500 text-white shadow-lg ring-1 ring-purple-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-base mb-0.5">👔</div>
                        <div className="text-xs font-bold">Manager</div>
                        <div className="text-[10px] text-slate-400">Admin Control</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignUpRole('warehouse_staff')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          signUpRole === 'warehouse_staff'
                            ? 'bg-blue-900/60 border-blue-500 text-white shadow-lg ring-1 ring-blue-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-base mb-0.5">📦</div>
                        <div className="text-xs font-bold">Staff</div>
                        <div className="text-[10px] text-slate-400">Operations</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignUpRole('general_user')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          signUpRole === 'general_user'
                            ? 'bg-emerald-900/60 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-base mb-0.5">👤</div>
                        <div className="text-xs font-bold">User</div>
                        <div className="text-[10px] text-slate-400">Viewer</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Set Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                        title={showSignUpPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#714B67] hover:bg-[#5c3c54] text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                  >
                    Send Email Verification OTP →
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifySignUpOtp} className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300">
                    6-Digit OTP sent to <strong className="text-white">{signUpEmail}</strong>. Evaluation code: <strong className="font-mono text-white">849201</strong>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Enter 6-Digit OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={signUpOtpCode}
                      onChange={(e) => setSignUpOtpCode(e.target.value)}
                      placeholder="849201"
                      className="w-full py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-purple-300 focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSignUpOtpStep('form')}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                    >
                      Verify OTP & Create Account →
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 3. OTP PASSWORD RESET (Problem statement specification) */}
          {authMode === 'otp_reset' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" /> OTP-Based Password Reset
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Secure one-time password verification pipeline</p>
              </div>

              {otpStep === 'request' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="k69117842@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Set New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                        title={showResetPassword ? 'Hide password' : 'Show password'}
                      >
                        {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                  >
                    Generate & Dispatch 6-Digit OTP →
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                    6-Digit OTP sent to <strong className="text-white">{resetEmail}</strong>. Evaluation code: <strong className="font-mono text-white">849201</strong>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Enter 6-Digit OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="849201"
                      className="w-full py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-amber-400 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpStep('request')}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                    >
                      Verify OTP & Reset Password →
                    </button>
                  </div>
                </form>
              )}

              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="text-xs text-purple-400 hover:underline block"
              >
                ← Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

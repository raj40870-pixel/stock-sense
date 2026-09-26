import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  User,
  Eye,
  EyeOff,
  Plus,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Users,
  LogOut,
  Check,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { inventoryStore, StoredUserAccount } from '../../services/inventoryStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
}) => {
  const [modalTab, setModalTab] = useState<'switcher' | 'add_account' | 'otp_reset'>('switcher');
  const [isAccountsExpanded, setIsAccountsExpanded] = useState(true);

  // New Account state (with OTP verification)
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('inventory_manager');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [addAccountStep, setAddAccountStep] = useState<'form' | 'verify_otp'>('form');
  const [accountOtpCode, setAccountOtpCode] = useState('');
  const [addAccountMsg, setAddAccountMsg] = useState<string | null>(null);
  const [addAccountErr, setAddAccountErr] = useState<string | null>(null);

  // OTP Reset State
  const [resetEmail, setResetEmail] = useState(currentUser.email);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetErr, setResetErr] = useState<string | null>(null);

  if (!isOpen) return null;

  const accounts = inventoryStore.getAccounts();

  // Role Switch Handler
  const handleSelectRole = (role: UserRole) => {
    inventoryStore.setUserRole(role);
    const updated = { ...currentUser, role };
    onUpdateUser(updated);
  };

  // Account Switch Handler
  const handleSelectAccount = (acc: StoredUserAccount) => {
    const user = inventoryStore.switchAccount(acc.email);
    if (user) {
      onUpdateUser(user);
    }
  };

  // Add Account - Send OTP
  const handleSendAccountOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName || !newPassword) {
      setAddAccountErr('All fields are required.');
      return;
    }
    setAddAccountErr(null);
    setAddAccountStep('verify_otp');
    setAddAccountMsg(`A 6-digit OTP code has been dispatched to ${newEmail}. Evaluation code: 849201`);
  };

  // Add Account - Verify OTP & Create
  const handleVerifyAccountOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountOtpCode.trim() !== '849201' && accountOtpCode.trim().length !== 6) {
      setAddAccountErr('Invalid OTP. Use verification code: 849201');
      return;
    }

    const res = inventoryStore.registerAccount(newName.trim(), newEmail.trim(), newPassword, newRole);
    if (res.user) {
      onUpdateUser(res.user);
      setAddAccountMsg('Account verified & created successfully!');
      setTimeout(() => {
        setAddAccountStep('form');
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setAccountOtpCode('');
        setAddAccountMsg(null);
        setModalTab('switcher');
      }, 1000);
    }
  };

  // Reset Password - Send OTP
  const handleSendResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetErr('Please enter email address.');
      return;
    }
    setResetErr(null);
    setResetStep('verify');
    setResetMsg(`A 6-digit OTP has been sent to ${resetEmail}. Evaluation code: 849201`);
  };

  // Reset Password - Verify OTP & Update
  const handleVerifyResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetOtpCode.trim() !== '849201' && resetOtpCode.trim().length !== 6) {
      setResetErr('Invalid OTP. Use verification code: 849201');
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 4) {
      setResetErr('Password must be at least 4 characters.');
      return;
    }

    const res = inventoryStore.resetPassword(resetEmail.trim(), resetNewPassword);
    setResetMsg(res.message || 'Password updated successfully!');
    if (res.user && res.user.email.toLowerCase() === currentUser.email.toLowerCase()) {
      onUpdateUser(res.user);
    }
    setTimeout(() => {
      setResetStep('request');
      setResetOtpCode('');
      setResetNewPassword('');
      setResetMsg(null);
      setModalTab('switcher');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-800 overflow-hidden font-sans">
        {/* Top Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">StockSense IAM & Accounts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. GOOGLE-STYLE ACCOUNT SWITCHER TAB */}
        {modalTab === 'switcher' && (
          <div className="p-6 space-y-5">
            {/* Active User Header (Styled exactly like Google Account switcher) */}
            <div className="flex flex-col items-center text-center pb-2">
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#714B67] to-purple-600 border-2 border-purple-400/50 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-purple-950/50">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] ${
                    currentUser.role === 'inventory_manager'
                      ? 'bg-purple-600 text-white'
                      : currentUser.role === 'warehouse_staff'
                      ? 'bg-blue-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                  title={currentUser.role}
                >
                  {currentUser.role === 'inventory_manager' ? '👔' : currentUser.role === 'warehouse_staff' ? '📦' : '👤'}
                </div>
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">
                Hi, {currentUser.name || 'User'}!
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>

              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 border border-white/15 text-purple-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="capitalize">
                  {currentUser.role === 'inventory_manager'
                    ? 'Inventory Manager (Admin)'
                    : currentUser.role === 'warehouse_staff'
                    ? 'Warehouse Staff (Operations)'
                    : 'General User (Viewer)'}
                </span>
              </div>
            </div>

            {/* Role Perspective Selector (Staff, Manager, User) */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Select Your Role
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRole('inventory_manager')}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    currentUser.role === 'inventory_manager'
                      ? 'bg-purple-900/60 border-purple-500 text-white shadow-lg shadow-purple-950/60 ring-2 ring-purple-400/80'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-lg mb-0.5">👔</div>
                  <div className="text-xs font-bold">Manager</div>
                  <div className="text-[9px] text-purple-300/80">Admin Rights</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('warehouse_staff')}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    currentUser.role === 'warehouse_staff'
                      ? 'bg-blue-900/60 border-blue-500 text-white shadow-lg shadow-blue-950/60 ring-2 ring-blue-400/80'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-lg mb-0.5">📦</div>
                  <div className="text-xs font-bold">Staff</div>
                  <div className="text-[9px] text-blue-300/80">Operations</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('general_user')}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    currentUser.role === 'general_user'
                      ? 'bg-emerald-900/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400/80'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-lg mb-0.5">👤</div>
                  <div className="text-xs font-bold">User</div>
                  <div className="text-[9px] text-emerald-300/80">Viewer</div>
                </button>
              </div>
            </div>

            {/* Switch Account Section (Exact Google Style from Screenshot) */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl overflow-hidden">
              <div
                onClick={() => setIsAccountsExpanded(!isAccountsExpanded)}
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors border-b border-slate-800/60"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-300">Switch Account</span>
                </div>
                {isAccountsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {isAccountsExpanded && (
                <div className="divide-y divide-slate-800/50 max-h-52 overflow-y-auto">
                  {accounts.map((acc) => {
                    const isCurrent = acc.email.toLowerCase() === currentUser.email.toLowerCase();
                    const initial = acc.name.charAt(0).toUpperCase();

                    return (
                      <div
                        key={acc.id}
                        onClick={() => handleSelectAccount(acc)}
                        className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isCurrent ? 'bg-purple-950/40' : 'hover:bg-slate-900/70'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                              acc.role === 'warehouse_staff'
                                ? 'bg-blue-600'
                                : acc.role === 'general_user'
                                ? 'bg-emerald-600'
                                : 'bg-[#714B67]'
                            }`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-white truncate">{acc.name}</p>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-slate-300 uppercase font-mono">
                                {acc.role === 'inventory_manager' ? 'Manager' : acc.role === 'warehouse_staff' ? 'Staff' : 'User'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* + Add Another Account Option */}
                  <div
                    onClick={() => {
                      setModalTab('add_account');
                      setAddAccountErr(null);
                      setAddAccountMsg(null);
                    }}
                    className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-900 transition-colors text-purple-300 hover:text-white text-xs font-semibold"
                  >
                    <div className="w-8 h-8 rounded-full border border-dashed border-purple-400/50 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-purple-400" />
                    </div>
                    <span>+ Add another account (with OTP Verification)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setModalTab('otp_reset');
                  setResetErr(null);
                  setResetMsg(null);
                }}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" /> Reset Password via OTP
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors font-medium flex items-center gap-1.5 border border-rose-900/30"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. ADD ANOTHER ACCOUNT TAB (WITH OTP VERIFICATION) */}
        {modalTab === 'add_account' && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" /> Create Account with Email OTP
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every account requires 6-digit OTP verification to prevent fake emails.
              </p>
            </div>

            {addAccountErr && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {addAccountErr}
              </div>
            )}

            {addAccountMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {addAccountMsg}
              </div>
            )}

            {addAccountStep === 'form' ? (
              <form onSubmit={handleSendAccountOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Raj Kumar"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="raj40870@gmail.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewRole('inventory_manager')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        newRole === 'inventory_manager'
                          ? 'bg-purple-900/50 border-purple-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-sm">👔</div>
                      <div className="text-xs">Manager</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRole('warehouse_staff')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        newRole === 'warehouse_staff'
                          ? 'bg-blue-900/50 border-blue-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-sm">📦</div>
                      <div className="text-xs">Staff</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRole('general_user')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        newRole === 'general_user'
                          ? 'bg-emerald-900/50 border-emerald-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-sm">👤</div>
                      <div className="text-xs">User</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Set Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalTab('switcher')}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#714B67] hover:bg-[#5b3c53] text-xs font-bold text-white shadow"
                  >
                    Send OTP Verification →
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyAccountOtp} className="space-y-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300">
                  Evaluation code for evaluation: <strong className="font-mono text-white">849201</strong>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={accountOtpCode}
                    onChange={(e) => setAccountOtpCode(e.target.value)}
                    placeholder="849201"
                    className="w-full py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-purple-300 focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAddAccountStep('form')}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow"
                  >
                    Verify & Create Account →
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 3. OTP PASSWORD RESET TAB */}
        {modalTab === 'otp_reset' && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" /> Reset Password via OTP
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify registered email with OTP to update password.
              </p>
            </div>

            {resetErr && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {resetErr}
              </div>
            )}

            {resetMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {resetMsg}
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="k69117842@gmail.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalTab('switcher')}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow"
                  >
                    Send 6-Digit OTP →
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                  Verification evaluation code: <strong className="font-mono text-white">849201</strong>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={resetOtpCode}
                    onChange={(e) => setResetOtpCode(e.target.value)}
                    placeholder="849201"
                    className="w-full py-2 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-amber-400 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Set New Password</label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow"
                  >
                    Update Password →
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, KeyRound, CheckCircle2, User, Eye, EyeOff } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

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
  const [mode, setMode] = useState<'profile' | 'otp_reset'>('profile');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState<UserRole>(currentUser.role);

  // OTP Reset simulation state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name,
      email,
      role,
    });
    onClose();
  };

  const handleSendOtp = () => {
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 6) {
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setOtpSent(false);
        setMode('profile');
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {mode === 'profile' ? 'Staff Profile & Security' : 'OTP Password Reset'}
              </h3>
              <p className="text-[11px] text-slate-400">StockSense IAM Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'profile' ? (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="inventory_manager">Inventory Manager (Approvals & Rules)</option>
                <option value="warehouse_staff">Warehouse Staff (Receipts, Picking & Audit)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setMode('otp_reset')}
                className="text-xs text-[#714B67] hover:underline flex items-center gap-1 font-semibold"
              >
                <KeyRound className="w-3.5 h-3.5" /> Request OTP-based Password Reset
              </button>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold rounded-lg transition-colors"
                >
                  Log Out
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-[#714B67] text-white rounded-lg shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-4">
            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Password reset successfully via OTP verification!
              </div>
            ) : !otpSent ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  We will send a 6-digit verification code to <strong>{email}</strong> to authorize your password change.
                </p>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-2 bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-bold rounded-xl transition-all"
                >
                  Send OTP Code
                </button>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in">
                <div className="p-2.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs">
                  OTP sent to {email}. Demo code: <strong className="font-mono text-purple-700">849201</strong>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="849201"
                    className="w-full px-3 py-2 text-center text-lg font-mono font-bold tracking-widest bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Verify OTP & Reset Password
                </button>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setMode('profile')}
                className="text-xs text-slate-500 hover:underline"
              >
                ← Back to Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

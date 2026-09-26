import React, { useState, useEffect } from 'react';
import {
  Package,
  ShieldCheck,
  Mail,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Warehouse as WarehouseIcon,
  ShieldAlert,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { inventoryStore } from '../../services/inventoryStore';
import { insforge } from '../../lib/insforge';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'otp_reset'>('signup');

  // Password Visibility States
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form State (with real InsForge OTP verification)
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

  // Feedback & Loading
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Timer countdown for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // 1. SIGN IN HANDLER
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResetMessage(null);

    const email = signInEmail.trim().toLowerCase();

    try {
      // Step A: Attempt authentication via InsForge SDK
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password: signInPassword,
      });

      if (error) {
        // If unverified email
        if (
          error.message?.toLowerCase().includes('not verified') ||
          error.message?.toLowerCase().includes('verification')
        ) {
          setErrorMsg('Your email is not verified yet. We have resent a verification code to your email.');
          await insforge.auth.resendVerificationEmail({ email });
          setSignUpEmail(email);
          setSignUpOtpStep('verify_otp');
          setAuthMode('signup');
          setResendCooldown(60);
          setIsLoading(false);
          return;
        }

        // Check local store as fallback
        const localAuth = inventoryStore.authenticate(email, signInPassword);
        if (localAuth.success && localAuth.user) {
          onLoginSuccess(localAuth.user);
          setIsLoading(false);
          return;
        }

        setErrorMsg(error.message || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      // Step B: Authenticated successfully with InsForge BaaS!
      // Check if user exists in local store; if not, register locally
      const accounts = inventoryStore.getAccounts();
      const existing = accounts.find((a) => a.email.toLowerCase() === email);

      let loggedInUser: UserProfile;
      if (existing) {
        existing.password = signInPassword;
        inventoryStore.authenticate(email, signInPassword);
        loggedInUser = {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          role: existing.role,
          warehouseId: existing.warehouseId,
        };
      } else {
        const displayName =
          (data?.user?.profile && typeof data.user.profile === 'object' && 'name' in data.user.profile
            ? (data.user.profile.name as string)
            : '') || email.split('@')[0];

        const regRes = inventoryStore.registerAccount(
          displayName,
          email,
          signInPassword,
          'inventory_manager'
        );
        loggedInUser = regRes.user || {
          id: data?.user?.id || `usr-${Date.now()}`,
          name: displayName,
          email,
          role: 'inventory_manager',
          warehouseId: 'wh-1',
        };
      }

      setResetMessage('Login successful! Launching your StockSense workspace...');
      onLoginSuccess(loggedInUser);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error occurred while connecting to InsForge.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. SIGN UP: DISPATCH REAL OTP VIA INSFORGE
  const handleSendSignUpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = signUpName.trim();
    const email = signUpEmail.trim().toLowerCase();

    if (!name || !email || !signUpPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResetMessage(null);

    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password: signUpPassword,
        name,
      });

      if (error) {
        // If user already exists in InsForge
        if (
          error.message?.toLowerCase().includes('already registered') ||
          error.message?.toLowerCase().includes('already exists')
        ) {
          // Attempt resending verification code if unverified
          const resend = await insforge.auth.resendVerificationEmail({ email });
          if (!resend.error) {
            setSignUpOtpStep('verify_otp');
            setResetMessage(
              `An account with ${email} exists and is pending verification. A fresh 6-digit OTP code has been sent to your Gmail inbox!`
            );
            setResendCooldown(60);
            setIsLoading(false);
            return;
          }
          setErrorMsg('An account with this email is already registered and verified. Please go to Sign In.');
          setIsLoading(false);
          return;
        }

        setErrorMsg(error.message || 'Failed to initiate account creation. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success: Email verification OTP dispatched by InsForge!
      setSignUpOtpStep('verify_otp');
      setResetMessage(
        `A 6-digit verification code has been dispatched to ${email}. Please check your Gmail Inbox and Spam/Junk folder.`
      );
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to dispatch email verification OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. SIGN UP: VERIFY REAL OTP VIA INSFORGE
  const handleVerifySignUpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = signUpEmail.trim().toLowerCase();
    const code = signUpOtpCode.trim();

    if (code.length !== 6) {
      setErrorMsg('Please enter the 6-digit numeric OTP code sent to your email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email,
        otp: code,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired OTP code. Please check your email or click "Resend Code".');
        setIsLoading(false);
        return;
      }

      // Success! Email verified in InsForge. Now register and activate in StockSense
      const regRes = inventoryStore.registerAccount(
        signUpName.trim(),
        email,
        signUpPassword,
        signUpRole
      );

      setResetMessage('Email successfully verified! Your account is created. Logging you in...');
      if (regRes.user) {
        onLoginSuccess(regRes.user);
      } else {
        onLoginSuccess({
          id: data?.user?.id || `usr-${Date.now()}`,
          name: signUpName.trim(),
          email,
          role: signUpRole,
          warehouseId: 'wh-1',
        });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Sign Up Verification OTP
  const handleResendSignUpOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    const email = signUpEmail.trim().toLowerCase();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await insforge.auth.resendVerificationEmail({ email });
      if (error) {
        setErrorMsg(error.message || 'Failed to resend verification code.');
      } else {
        setResetMessage(`A fresh 6-digit verification code has been dispatched to ${email}.`);
        setResendCooldown(60);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. PASSWORD RESET: SEND OTP VIA INSFORGE
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = resetEmail.trim().toLowerCase();

    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResetMessage(null);

    try {
      const { data, error } = await insforge.auth.sendResetPasswordEmail({ email });
      if (error) {
        setErrorMsg(error.message || 'Failed to send password reset code.');
        setIsLoading(false);
        return;
      }

      setOtpStep('verify');
      setResetMessage(
        `A 6-digit password reset code has been dispatched to ${email}. Please check your Gmail Inbox & Spam folder.`
      );
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. PASSWORD RESET: VERIFY OTP AND SET NEW PASSWORD
  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = resetEmail.trim().toLowerCase();
    const code = otpCode.trim();

    if (code.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Step A: Exchange code for reset token
      const exchangeRes = await insforge.auth.exchangeResetPasswordToken({
        email,
        code,
      });

      if (exchangeRes.error || !exchangeRes.data?.token) {
        setErrorMsg(exchangeRes.error?.message || 'Invalid or expired OTP code.');
        setIsLoading(false);
        return;
      }

      // Step B: Set new password on InsForge BaaS
      const resetRes = await insforge.auth.resetPassword({
        newPassword,
        otp: exchangeRes.data.token,
      });

      if (resetRes.error) {
        setErrorMsg(resetRes.error.message || 'Failed to reset password.');
        setIsLoading(false);
        return;
      }

      // Step C: Update password in local store as well
      const localRes = inventoryStore.resetPassword(email, newPassword);

      setResetMessage('Password reset successfully! Logging you in with your new credentials...');
      if (localRes.user) {
        onLoginSuccess(localRes.user);
      } else {
        setAuthMode('signin');
        setSignInEmail(email);
        setSignInPassword(newPassword);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#714B67]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        {/* Left Hero Panel (StockSense IMS Overview) */}
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
                <span>
                  <strong>Inventory Managers:</strong> Full catalog management, stock audits & approvals.
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-purple-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Warehouse Staff:</strong> Material receipts, shelving, and pick/pack dispatches.
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-purple-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Verified Real OTPs:</strong> Direct 6-digit email codes dispatched via InsForge BaaS.
                </span>
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
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
                setResetMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'signup' ? 'bg-[#714B67] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setResetMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'signin' ? 'bg-[#714B67] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp_reset');
                setErrorMsg(null);
                setResetMessage(null);
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="Enter your email"
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
                      setResetEmail(signInEmail);
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
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
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
                disabled={isLoading}
                className="w-full py-2.5 bg-[#714B67] hover:bg-[#5c3c54] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    Sign In & Launch Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-slate-800/80">
                <p className="text-xs text-slate-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMsg(null);
                    }}
                    className="text-purple-400 font-bold hover:underline"
                  >
                    Create Account & Verify OTP →
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* 2. SIGN UP FORM WITH EMAIL OTP VERIFICATION */}
          {authMode === 'signup' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Create your StockSense Account</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your permanent role and verify your real email via 6-digit OTP
                </p>
              </div>

              {signUpOtpStep === 'form' ? (
                <form onSubmit={handleSendSignUpOtp} className="space-y-3.5">
                  {/* Step 1: Role Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-200">1. Select Your Role</label>
                      <span className="text-[10px] text-amber-400/90 font-medium">Permanent for account</span>
                    </div>
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">2. Full Name</label>
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">3. Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="your-email@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-300">4. Set Password</label>
                      <span className="text-[10px] text-slate-400">Min 6 characters</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        minLength={6}
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
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#714B67] hover:bg-[#5c3c54] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Dispatching OTP to your email...
                      </>
                    ) : (
                      <>Send Email Verification OTP →</>
                    )}
                  </button>

                  <div className="pt-2 text-center border-t border-slate-800/80">
                    <p className="text-xs text-slate-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setErrorMsg(null);
                        }}
                        className="text-purple-400 font-bold hover:underline"
                      >
                        Sign In →
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifySignUpOtp} className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-200 space-y-1">
                    <p>
                      A 6-digit verification code has been dispatched to:{' '}
                      <strong className="text-white">{signUpEmail}</strong>
                    </p>
                    <p className="text-[11px] text-purple-300/80">
                      Please check your Gmail inbox and Spam/Junk folder.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enter 6-Digit Email Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={signUpOtpCode}
                      onChange={(e) => setSignUpOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-mono font-bold tracking-widest text-purple-300 focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs px-1">
                    <button
                      type="button"
                      onClick={handleResendSignUpOtp}
                      disabled={resendCooldown > 0 || isLoading}
                      className="text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignUpOtpStep('form')}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      Change Email
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSignUpOtpStep('form')}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || signUpOtpCode.trim().length !== 6}
                      className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying Code...
                        </>
                      ) : (
                        <>Verify OTP & Create Account →</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 3. OTP PASSWORD RESET */}
          {authMode === 'otp_reset' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" /> OTP-Based Password Reset
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Secure one-time password verification via InsForge</p>
              </div>

              {otpStep === 'request' ? (
                <form onSubmit={handleSendResetOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="your-email@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-[#714B67] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Dispatching Reset OTP...
                      </>
                    ) : (
                      <>Generate & Dispatch 6-Digit OTP →</>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyResetOtp} className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
                    <p>
                      A 6-digit password reset code has been sent to:{' '}
                      <strong className="text-white">{resetEmail}</strong>
                    </p>
                    <p className="text-[11px] text-amber-300/80">Please check your inbox and Spam folder.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Enter 6-Digit Reset Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-mono font-bold tracking-widest text-amber-400 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Set New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        minLength={6}
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
                      disabled={isLoading || otpCode.trim().length !== 6 || newPassword.length < 6}
                      className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Resetting Password...
                        </>
                      ) : (
                        <>Verify OTP & Reset Password →</>
                      )}
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

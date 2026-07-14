import React, { useState } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { toastSuccess, toastError } from '../../components/Toast';

export default function SuperAdminProfile({ user, onLogout }) {
  const [profile, setProfile] = useState({
    name: user?.name || 'Super Admin',
    email: user?.email || 'superadmin@inventory.com',
    twoFactor: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    toastSuccess('Profile updated successfully');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toastError('New passwords do not match');
      return;
    }
    toastSuccess('Password updated successfully');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Super Admin Profile</h1>
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Edit Profile */}
          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm self-start">
            <h2 className="text-base font-bold text-slate-800 mb-6">Account Credentials</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-400 font-medium text-sm bg-slate-50 cursor-not-allowed"
                />
              </div>

              <div className="pt-4 border-t border-slate-150">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-slate-850">Two-Factor Authentication (2FA)</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Secure your account with authentication codes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.twoFactor}
                    onChange={(e) => {
                      setProfile({ ...profile, twoFactor: e.target.checked });
                      toastSuccess(`2FA ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                    }}
                    className="w-4.5 h-4.5 text-primary border-slate-350 rounded focus:ring-primary/20 cursor-pointer"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg transition duration-150 text-sm mt-2 cursor-pointer"
              >
                Save Details
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm self-start">
            <h2 className="text-base font-bold text-slate-800 mb-6">Security Settings</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg transition duration-150 text-sm mt-2 cursor-pointer"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

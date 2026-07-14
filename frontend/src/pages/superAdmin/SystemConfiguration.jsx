import React, { useState } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { toastSuccess } from '../../components/Toast';

export default function SystemConfiguration({ user, onLogout }) {
  const [config, setConfig] = useState({
    systemName: 'Rentalyze Premium',
    supportEmail: 'support@rentalyze.com',
    enableRegistrations: true,
    maintenanceMode: false,
    require2fa: false,
  });

  const handleSave = (e) => {
    e.preventDefault();
    toastSuccess('System configuration updated successfully');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">System Configuration</h1>
          </div>
        </header>

        <div className="p-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-6">Global Platform Settings</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">System Name</label>
                <input
                  type="text"
                  value={config.systemName}
                  onChange={(e) => setConfig({ ...config, systemName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 font-medium text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">System Support Email</label>
                <input
                  type="email"
                  value={config.supportEmail}
                  onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 font-medium text-sm"
                  required
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableRegistrations}
                    onChange={(e) => setConfig({ ...config, enableRegistrations: e.target.checked })}
                    className="w-4.5 h-4.5 text-primary border-slate-350 rounded focus:ring-primary/20 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700">Enable Public Registrations</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.maintenanceMode}
                    onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                    className="w-4.5 h-4.5 text-primary border-slate-350 rounded focus:ring-primary/20 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700">Enable Maintenance Mode (System-wide Lockout)</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.require2fa}
                    onChange={(e) => setConfig({ ...config, require2fa: e.target.checked })}
                    className="w-4.5 h-4.5 text-primary border-slate-350 rounded focus:ring-primary/20 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700">Enforce Multi-Factor Authentication (MFA) for Admins</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg transition duration-150 text-sm mt-4 cursor-pointer"
              >
                Save Settings
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

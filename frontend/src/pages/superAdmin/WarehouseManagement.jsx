import React, { useState } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { Warehouse, MapPin, CheckCircle, Percent } from 'lucide-react';

export default function WarehouseManagement({ user, onLogout }) {
  // We can mock the physical warehouses or list them nicely
  const [warehouses] = useState([
    { id: '1', name: 'Delhi Central Logistics Center', location: 'Okhla Phase III, New Delhi', capacity: '15,000 sq ft', occupancy: 82, status: 'active' },
    { id: '2', name: 'Mumbai Harbor Terminal', location: 'Navi Mumbai, Maharashtra', capacity: '25,000 sq ft', occupancy: 91, status: 'active' },
    { id: '3', name: 'Bengaluru Tech-Park Warehouse', location: 'Whitefield, Bengaluru', capacity: '10,000 sq ft', occupancy: 45, status: 'active' },
    { id: '4', name: 'Chennai Port Storage', location: 'Royapuram, Chennai', capacity: '18,000 sq ft', occupancy: 0, status: 'maintenance' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Warehouse Management</h1>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {warehouses.map((wh) => (
              <div key={wh.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-50 text-primary rounded-2xl">
                      <Warehouse size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{wh.name}</h3>
                      <div className="flex items-center text-xs text-slate-400 font-medium mt-1">
                        <MapPin size={12} className="mr-1" />
                        <span>{wh.location}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    wh.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {wh.status}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-50 pt-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Capacity</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{wh.capacity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Occupancy</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{wh.occupancy}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Available</p>
                    <p className="text-sm font-bold text-green-600 mt-0.5">{100 - wh.occupancy}%</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      wh.occupancy > 85 ? 'bg-rose-500' : wh.occupancy > 50 ? 'bg-amber-500' : 'bg-primary'
                    }`} 
                    style={{ width: `${wh.occupancy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

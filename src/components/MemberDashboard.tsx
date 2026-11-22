import { useState, useEffect } from 'react';
import { User, WorkOrder } from '../types';
import { getWorkOrders } from '../store';

interface MemberDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function MemberDashboard({ user, onLogout }: MemberDashboardProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    const allOrders = getWorkOrders();
    // Filter orders assigned to this technician
    const myOrders = allOrders.filter(wo =>
      wo.leader === user.name ||
      wo.tim1 === user.name ||
      wo.tim2 === user.name ||
      wo.tim3 === user.name ||
      wo.tim4 === user.name
    );
    setWorkOrders(myOrders);
  }, [user.name]);

  const filteredOrders = workOrders.filter(wo => {
    if (filter === 'all') return true;
    return wo.status === filter;
  });

  const getWhatsAppLink = (order: WorkOrder) => {
    let message = order.waTemplate;
    if (order.slotTimeChanged && order.slotTimePerubahan) {
      message = message.replace('[SLOT_TIME_BARU]', order.slotTimePerubahan);
    }
    const phone = order.custPhone.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">👷</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Plan Schedule</h1>
              <p className="text-green-200 text-xs">Teknisi Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">👤 {user.name}</span>
            <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Notification Banner for Slot Time Changes */}
        {workOrders.some(wo => wo.slotTimeChanged) && (
          <div className="bg-orange-50 border border-orange-300 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-orange-800">Perubahan Slot Time!</h3>
              <p className="text-sm text-orange-700 mt-1">
                Ada {workOrders.filter(wo => wo.slotTimeChanged).length} work order dengan perubahan slot time. 
                Silakan hubungi customer melalui WhatsApp dengan template yang sudah disediakan.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-gray-400">
            <p className="text-2xl font-bold text-gray-800">{workOrders.length}</p>
            <p className="text-sm text-gray-500">Total Tugas</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-400">
            <p className="text-2xl font-bold text-gray-800">{workOrders.filter(w => w.status === 'pending').length}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-400">
            <p className="text-2xl font-bold text-gray-800">{workOrders.filter(w => w.status === 'in-progress').length}</p>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-400">
            <p className="text-2xl font-bold text-gray-800">{workOrders.filter(w => w.status === 'completed').length}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {f === 'all' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Work Order Cards */}
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${order.slotTimeChanged ? 'border-orange-300 ring-2 ring-orange-100' : ''}`}>
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-800">{order.woNo}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    {order.slotTimeChanged && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                        ⚠️ Slot Changed
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{order.woType}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                    <p className="font-medium text-gray-800">{order.custName}</p>
                    <p className="text-sm text-gray-600">{order.custNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Alamat</p>
                    <p className="text-sm text-gray-700">{order.custAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Jadwal</p>
                    <p className="font-medium text-gray-800">{order.installationDate}</p>
                    <p className="text-sm text-gray-600">Slot: {order.slotTime}</p>
                    {order.slotTimeChanged && (
                      <p className="text-sm text-orange-600 font-medium">
                        → Perubahan: {order.slotTimePerubahan}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                  {order.fatCode && (
                    <div>
                      <p className="text-xs text-gray-500">Fat Code</p>
                      <p className="font-medium">{order.fatCode}</p>
                    </div>
                  )}
                  {order.callsign && (
                    <div>
                      <p className="text-xs text-gray-500">Callsign</p>
                      <p className="font-medium">{order.callsign}</p>
                    </div>
                  )}
                  {order.leader && (
                    <div>
                      <p className="text-xs text-gray-500">Leader</p>
                      <p className="font-medium">{order.leader}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Team</p>
                    <p className="font-medium">{[order.tim1, order.tim2, order.tim3, order.tim4].filter(Boolean).join(', ') || '-'}</p>
                  </div>
                </div>

                {order.remarks && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Remarks</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{order.remarks}</p>
                  </div>
                )}

                {/* Slot Time Change Notification */}
                {order.slotTimeChanged && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📱</span>
                      <div className="flex-1">
                        <p className="font-semibold text-orange-800 text-sm">
                          Hubungi Customer via WhatsApp
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Ada perubahan slot time. Silakan hubungi customer untuk konfirmasi jadwal baru.
                        </p>
                        <div className="mt-3 bg-white rounded-lg p-3 border border-orange-100">
                          <p className="text-xs text-gray-500 mb-1">Template Pesan:</p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">
                            {order.waTemplate.replace('[SLOT_TIME_BARU]', order.slotTimePerubahan)}
                          </p>
                        </div>
                        <a
                          href={getWhatsAppLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-3 bg-green-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-600 transition shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Hubungi Customer via WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    📄 Detail
                  </button>
                  {!order.slotTimeChanged && order.custPhone && (
                    <a
                      href={getWhatsAppLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-800 font-medium ml-4"
                    >
                      💬 WA Customer
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p className="text-5xl mb-4">📋</p>
              <p className="text-lg">Belum ada work order yang ditugaskan</p>
              <p className="text-sm mt-1">Hubungi admin untuk penugasan</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Detail Work Order</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="WO No" value={selectedOrder.woNo} />
                <InfoItem label="WO Type" value={selectedOrder.woType} />
                <InfoItem label="Installation Date" value={selectedOrder.installationDate} />
                <InfoItem label="Slot Time" value={selectedOrder.slotTime} />
                <InfoItem label="Customer No" value={selectedOrder.custNo} />
                <InfoItem label="Customer Name" value={selectedOrder.custName} />
                <InfoItem label="Customer Phone" value={selectedOrder.custPhone} />
                <InfoItem label="Fat Code" value={selectedOrder.fatCode || '-'} />
                <InfoItem label="Callsign" value={selectedOrder.callsign || '-'} />
                <InfoItem label="Status" value={selectedOrder.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Customer Address</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedOrder.custAddress}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem label="Leader" value={selectedOrder.leader || '-'} />
                <InfoItem label="TIM 1" value={selectedOrder.tim1 || '-'} />
                <InfoItem label="TIM 2" value={selectedOrder.tim2 || '-'} />
                <InfoItem label="TIM 3" value={selectedOrder.tim3 || '-'} />
                <InfoItem label="TIM 4" value={selectedOrder.tim4 || '-'} />
              </div>
              {selectedOrder.remarks && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Remarks</p>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedOrder.remarks}</p>
                </div>
              )}
              {selectedOrder.slotTimeChanged && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="font-semibold text-orange-800 text-sm">⚠️ Perubahan Slot Time</p>
                  <p className="text-sm text-orange-700 mt-1">Slot baru: {selectedOrder.slotTimePerubahan}</p>
                  <div className="mt-2 bg-white rounded p-3 border">
                    <p className="text-xs text-gray-500 mb-1">Template WA:</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {selectedOrder.waTemplate.replace('[SLOT_TIME_BARU]', selectedOrder.slotTimePerubahan)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setSelectedOrder(null)} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition">
                Tutup
              </button>
              <a
                href={getWhatsAppLink(selectedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-600 transition inline-flex items-center gap-2"
              >
                💬 WhatsApp Customer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

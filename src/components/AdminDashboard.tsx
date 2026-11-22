import { useState, useEffect } from 'react';
import { User, WorkOrder } from '../types';
import { getWorkOrders, saveWorkOrders, generateId, getUsers, saveUsers } from '../store';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSlotChange, setShowSlotChange] = useState<string | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'members' | 'settings'>('orders');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const emptyForm: Omit<WorkOrder, 'id' | 'createdAt' | 'slotTimeChanged' | 'notificationSent'> = {
    woNo: '', woType: 'New Installation', installationDate: '', slotTime: '',
    custNo: '', custName: '', custAddress: '', custPhone: '', remarks: '',
    fatCode: '', callsign: '', leader: '', tim1: '', tim2: '', tim3: '', tim4: '',
    status: 'pending', slotTimePerubahan: '', waTemplate: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [slotChangeForm, setSlotChangeForm] = useState({ newSlotTime: '', waTemplate: '' });

  // Member form
  const [memberForm, setMemberForm] = useState({ username: '', password: '', name: '', phone: '' });

  useEffect(() => {
    setWorkOrders(getWorkOrders());
    setMembers(getUsers().filter(u => u.role === 'member'));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: WorkOrder[];
    if (editingOrder) {
      updated = workOrders.map(wo => wo.id === editingOrder.id ? { ...wo, ...form } : wo);
    } else {
      const newOrder: WorkOrder = {
        ...form,
        id: generateId(),
        createdAt: new Date().toISOString(),
        slotTimeChanged: false,
        notificationSent: false,
      };
      updated = [...workOrders, newOrder];
    }
    saveWorkOrders(updated);
    setWorkOrders(updated);
    setShowForm(false);
    setEditingOrder(null);
    setForm(emptyForm);
  };

  const handleEdit = (order: WorkOrder) => {
    setEditingOrder(order);
    setForm({
      woNo: order.woNo, woType: order.woType, installationDate: order.installationDate,
      slotTime: order.slotTime, custNo: order.custNo, custName: order.custName,
      custAddress: order.custAddress, custPhone: order.custPhone, remarks: order.remarks,
      fatCode: order.fatCode, callsign: order.callsign, leader: order.leader,
      tim1: order.tim1, tim2: order.tim2, tim3: order.tim3, tim4: order.tim4,
      status: order.status, slotTimePerubahan: order.slotTimePerubahan, waTemplate: order.waTemplate,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus work order ini?')) {
      const updated = workOrders.filter(wo => wo.id !== id);
      saveWorkOrders(updated);
      setWorkOrders(updated);
    }
  };

  const handleSlotChange = (orderId: string) => {
    const updated = workOrders.map(wo => {
      if (wo.id === orderId) {
        return {
          ...wo,
          slotTimePerubahan: slotChangeForm.newSlotTime,
          waTemplate: slotChangeForm.waTemplate,
          slotTimeChanged: true,
          notificationSent: true,
        };
      }
      return wo;
    });
    saveWorkOrders(updated);
    setWorkOrders(updated);
    setShowSlotChange(null);
    setSlotChangeForm({ newSlotTime: '', waTemplate: '' });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const allUsers = getUsers();
    const newMember: User = {
      id: generateId(),
      ...memberForm,
      role: 'member',
    };
    allUsers.push(newMember);
    saveUsers(allUsers);
    setMembers(allUsers.filter(u => u.role === 'member'));
    setShowMemberForm(false);
    setMemberForm({ username: '', password: '', name: '', phone: '' });
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Yakin ingin menghapus member ini?')) {
      const allUsers = getUsers().filter(u => u.id !== id);
      saveUsers(allUsers);
      setMembers(allUsers.filter(u => u.role === 'member'));
    }
  };

  const filteredOrders = workOrders.filter(wo =>
    wo.woNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.custNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.callsign.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Plan Schedule</h1>
              <p className="text-blue-200 text-xs">Admin Panel</p>
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

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-lg font-medium transition ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            📋 Work Orders
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-5 py-2.5 rounded-lg font-medium transition ${activeTab === 'members' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            👥 Team Members
          </button>
        </div>

        {/* Work Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <input
                type="text"
                placeholder="🔍 Cari WO No, Customer Name, Cust No, Callsign..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-96 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => { setShowForm(true); setEditingOrder(null); setForm(emptyForm); }}
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition whitespace-nowrap"
              >
                + Tambah Work Order
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-400">
                <p className="text-2xl font-bold text-gray-800">{workOrders.filter(w => w.slotTimeChanged).length}</p>
                <p className="text-sm text-gray-500">Slot Changed</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-3 text-left font-semibold text-gray-600">WO No</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-600">Type</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-600">Date</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-600">Slot</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-600">Customer</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-600">Team</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-600">Status</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-600">Slot Change</th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 font-medium">{order.woNo}</td>
                        <td className="px-3 py-3">{order.woType}</td>
                        <td className="px-3 py-3">{order.installationDate}</td>
                        <td className="px-3 py-3">{order.slotTime}</td>
                        <td className="px-3 py-3">
                          <div className="font-medium">{order.custName}</div>
                          <div className="text-xs text-gray-500">{order.custNo}</div>
                        </td>
                        <td className="px-3 py-3 text-xs">
                          <div>{order.leader}</div>
                          <div className="text-gray-500">{[order.tim1, order.tim2, order.tim3, order.tim4].filter(Boolean).join(', ')}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {order.slotTimeChanged ? (
                            <div>
                              <span className="text-orange-600 font-medium text-xs">⚠️ {order.slotTimePerubahan}</span>
                              <div className="text-xs text-green-600">✓ Notified</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(order)}
                              className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => {
                                setShowSlotChange(order.id);
                                setSlotChangeForm({ newSlotTime: order.slotTime, waTemplate: order.waTemplate || `Yth. Bpk/Ibu ${order.custName}, kami dari tim instalasi ingin menginformasikan bahwa jadwal pemasangan pada tanggal ${order.installationDate} mengalami perubahan. Slot time baru: [SLOT_TIME_BARU]. Mohon konfirmasinya. Terima kasih.` });
                              }}
                              className="p-1.5 bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition"
                              title="Change Slot Time"
                            >
                              🕐
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-2">📋</p>
                  <p>Belum ada work order</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Team Members</h2>
              <button
                onClick={() => setShowMemberForm(true)}
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
              >
                + Tambah Member
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map(member => (
                <div key={member.id} className="bg-white rounded-xl p-5 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                        👷
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{member.name}</p>
                        <p className="text-sm text-gray-500">@{member.username}</p>
                        <p className="text-xs text-gray-400">{member.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Assigned: {workOrders.filter(wo => wo.leader === member.name || wo.tim1 === member.name || wo.tim2 === member.name || wo.tim3 === member.name || wo.tim4 === member.name).length} work orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Work Order Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingOrder ? 'Edit Work Order' : 'Tambah Work Order Baru'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingOrder(null); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WO No *</label>
                  <input type="text" required value={form.woNo} onChange={e => setForm({...form, woNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WO Type *</label>
                  <select value={form.woType} onChange={e => setForm({...form, woType: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="New Installation">New Installation</option>
                    <option value="Relocation">Relocation</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Repair">Repair</option>
                    <option value="Disconnection">Disconnection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Installation Date *</label>
                  <input type="date" required value={form.installationDate} onChange={e => setForm({...form, installationDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slot Time *</label>
                  <input type="time" required value={form.slotTime} onChange={e => setForm({...form, slotTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer No *</label>
                  <input type="text" required value={form.custNo} onChange={e => setForm({...form, custNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input type="text" required value={form.custName} onChange={e => setForm({...form, custName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone *</label>
                  <input type="text" required value={form.custPhone} onChange={e => setForm({...form, custPhone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="628xxx" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Address *</label>
                  <input type="text" required value={form.custAddress} onChange={e => setForm({...form, custAddress: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fat Code</label>
                  <input type="text" value={form.fatCode} onChange={e => setForm({...form, fatCode: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Callsign</label>
                  <input type="text" value={form.callsign} onChange={e => setForm({...form, callsign: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leader</label>
                  <input type="text" value={form.leader} onChange={e => setForm({...form, leader: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as WorkOrder['status']})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TIM 1</label>
                  <input type="text" value={form.tim1} onChange={e => setForm({...form, tim1: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TIM 2</label>
                  <input type="text" value={form.tim2} onChange={e => setForm({...form, tim2: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TIM 3</label>
                  <input type="text" value={form.tim3} onChange={e => setForm({...form, tim3: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TIM 4</label>
                  <input type="text" value={form.tim4} onChange={e => setForm({...form, tim4: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
                  {editingOrder ? 'Update' : 'Simpan'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingOrder(null); }} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slot Time Change Modal */}
      {showSlotChange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🕐 Ubah Slot Time</h2>
              <button onClick={() => setShowSlotChange(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-700">
                <strong>Info:</strong> Teknisi akan diberitahu untuk menghubungi customer via WhatsApp dengan template pesan di bawah ini.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Time Baru *</label>
                <input
                  type="time"
                  required
                  value={slotChangeForm.newSlotTime}
                  onChange={e => setSlotChangeForm({...slotChangeForm, newSlotTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Pesan WhatsApp *</label>
                <textarea
                  required
                  value={slotChangeForm.waTemplate}
                  onChange={e => setSlotChangeForm({...slotChangeForm, waTemplate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  placeholder="Template pesan yang akan dikirim teknisi ke customer..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gunakan [SLOT_TIME_BARU] untuk slot time baru yang akan otomatis terisi.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSlotChange(showSlotChange)}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition"
                >
                  Kirim Notifikasi ke Teknisi
                </button>
                <button onClick={() => setShowSlotChange(null)} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition">
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Tambah Member Baru</h2>
              <button onClick={() => setShowMemberForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input type="text" required value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input type="text" required value={memberForm.username} onChange={e => setMemberForm({...memberForm, username: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="text" required value={memberForm.password} onChange={e => setMemberForm({...memberForm, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. HP *</label>
                <input type="text" required value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="08xxx" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
                  Simpan
                </button>
                <button type="button" onClick={() => setShowMemberForm(false)} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

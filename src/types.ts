export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'member';
  name: string;
  phone?: string;
}

export interface WorkOrder {
  id: string;
  woNo: string;
  woType: string;
  installationDate: string;
  slotTime: string;
  custNo: string;
  custName: string;
  custAddress: string;
  custPhone: string;
  remarks: string;
  fatCode: string;
  callsign: string;
  leader: string;
  tim1: string;
  tim2: string;
  tim3: string;
  tim4: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  slotTimePerubahan: string;
  slotTimeChanged: boolean;
  waTemplate: string;
  notificationSent: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  workOrderId: string;
  message: string;
  sentAt: string;
  readBy: string[];
}

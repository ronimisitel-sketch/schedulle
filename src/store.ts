import { User, WorkOrder } from './types';

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrator',
    phone: '081234567890',
  },
  {
    id: '2',
    username: 'teknisi1',
    password: 'teknisi123',
    role: 'member',
    name: 'Budi Santoso',
    phone: '081234567891',
  },
  {
    id: '3',
    username: 'teknisi2',
    password: 'teknisi123',
    role: 'member',
    name: 'Ahmad Rizki',
    phone: '081234567892',
  },
  {
    id: '4',
    username: 'teknisi3',
    password: 'teknisi123',
    role: 'member',
    name: 'Dedi Kurniawan',
    phone: '081234567893',
  },
];

export function getUsers(): User[] {
  const stored = localStorage.getItem('ps_users');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('ps_users', JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

export function saveUsers(users: User[]) {
  localStorage.setItem('ps_users', JSON.stringify(users));
}

export function getWorkOrders(): WorkOrder[] {
  const stored = localStorage.getItem('ps_workorders');
  if (stored) return JSON.parse(stored);
  return [];
}

export function saveWorkOrders(orders: WorkOrder[]) {
  localStorage.setItem('ps_workorders', JSON.stringify(orders));
}

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem('ps_current_user');
  if (stored) return JSON.parse(stored);
  return null;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem('ps_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('ps_current_user');
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Doctor extends User {
  role: 'doctor';
  isSubscribed: boolean;
  appointmentsEnabled: boolean;
  specialization?: string;
}

export interface Patient {
  id: string;
  name: string;
  cnic: string;
  phone: string;
  email: string;
  disease: string;
  medicine: string;
  dateAdded: string;
  nextVisit: string;
  doctorId: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  disease: string;
  medicine: string;
  nextVisit?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

export interface Payment {
  id: string;
  doctorId: string;
  doctorName: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid';
  type: 'subscription';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  totalDoctors: number;
  totalPatients: number;
  totalVisits: number;
  totalAppointments: number;
}

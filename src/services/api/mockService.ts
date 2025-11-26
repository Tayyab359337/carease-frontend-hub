import { 
  User, Doctor, Patient, Visit, Appointment, Payment, 
  Notification, DashboardMetrics, UserRole 
} from './types';

// LocalStorage keys
const STORAGE_KEYS = {
  USERS: 'carease_users',
  PATIENTS: 'carease_patients',
  VISITS: 'carease_visits',
  APPOINTMENTS: 'carease_appointments',
  PAYMENTS: 'carease_payments',
  NOTIFICATIONS: 'carease_notifications',
  CURRENT_USER: 'carease_current_user',
};

// Helper functions for localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const saveToStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize with sample data
const initializeSampleData = () => {
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
  
  if (users.length === 0) {
    const sampleUsers: User[] = [
      {
        id: 'admin-1',
        email: 'admin@carease.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'doctor-1',
        email: 'doctor@carease.com',
        name: 'Dr. Sarah Johnson',
        role: 'doctor',
        phone: '+92 300 1234567',
        createdAt: new Date().toISOString(),
      } as Doctor,
      {
        id: 'patient-1',
        email: 'patient@carease.com',
        name: 'John Smith',
        role: 'patient',
        phone: '+92 300 9876543',
        createdAt: new Date().toISOString(),
      },
    ];
    
    saveToStorage(STORAGE_KEYS.USERS, sampleUsers);
    
    // Add sample doctor data
    const doctors = sampleUsers.filter(u => u.role === 'doctor') as Doctor[];
    doctors.forEach(d => {
      d.isSubscribed = false;
      d.appointmentsEnabled = true;
      d.specialization = 'General Physician';
    });
    
    // Add sample patients
    const samplePatients: Patient[] = [
      {
        id: 'pat-1',
        name: 'Alice Brown',
        cnic: '12345-6789012-3',
        phone: '+92 301 1111111',
        email: 'alice@example.com',
        disease: 'Common Cold',
        medicine: 'Paracetamol 500mg',
        dateAdded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextVisit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        doctorId: 'doctor-1',
      },
    ];
    
    saveToStorage(STORAGE_KEYS.PATIENTS, samplePatients);
    
    // Add sample visits
    const sampleVisits: Visit[] = [
      {
        id: 'visit-1',
        patientId: 'patient-1',
        patientName: 'John Smith',
        doctorId: 'doctor-1',
        doctorName: 'Dr. Sarah Johnson',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        disease: 'Fever',
        medicine: 'Panadol',
        nextVisit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    saveToStorage(STORAGE_KEYS.VISITS, sampleVisits);
  }
};

initializeSampleData();

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    
    return {
      user,
      token: `mock-token-${user.id}`,
    };
  },
  
  signup: async (email: string, password: string, name: string, role: UserRole): Promise<{ user: User; token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    const newUser: User = {
      id: `${role}-${Date.now()}`,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    
    if (role === 'doctor') {
      (newUser as Doctor).isSubscribed = false;
      (newUser as Doctor).appointmentsEnabled = false;
    }
    
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, newUser);
    
    return {
      user: newUser,
      token: `mock-token-${newUser.id}`,
    };
  },
  
  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
  
  getCurrentUser: (): User | null => {
    return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },
};

// Patient API
export const patientAPI = {
  getPatients: async (doctorId: string): Promise<Patient[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const patients = getFromStorage<Patient[]>(STORAGE_KEYS.PATIENTS, []);
    return patients.filter(p => p.doctorId === doctorId);
  },
  
  addPatient: async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const patients = getFromStorage<Patient[]>(STORAGE_KEYS.PATIENTS, []);
    
    // Check for duplicates
    if (patients.find(p => p.cnic === patient.cnic)) {
      throw new Error('Patient with this CNIC already exists');
    }
    
    if (patients.find(p => p.phone === patient.phone && p.doctorId === patient.doctorId)) {
      throw new Error('Patient with this phone number already exists');
    }
    
    const newPatient: Patient = {
      ...patient,
      id: `pat-${Date.now()}`,
    };
    
    patients.push(newPatient);
    saveToStorage(STORAGE_KEYS.PATIENTS, patients);
    
    return newPatient;
  },
  
  getPatientById: async (id: string): Promise<Patient | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const patients = getFromStorage<Patient[]>(STORAGE_KEYS.PATIENTS, []);
    return patients.find(p => p.id === id) || null;
  },
};

// Visit API
export const visitAPI = {
  getVisits: async (patientId: string): Promise<Visit[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const visits = getFromStorage<Visit[]>(STORAGE_KEYS.VISITS, []);
    return visits.filter(v => v.patientId === patientId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
  
  getAllVisits: async (): Promise<Visit[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const visits = getFromStorage<Visit[]>(STORAGE_KEYS.VISITS, []);
    return visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
};

// Appointment API
export const appointmentAPI = {
  getAppointments: async (userId: string, role: UserRole): Promise<Appointment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const appointments = getFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    
    if (role === 'patient') {
      return appointments.filter(a => a.patientId === userId);
    } else if (role === 'doctor') {
      return appointments.filter(a => a.doctorId === userId);
    }
    
    return appointments;
  },
  
  createAppointment: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const appointments = getFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    
    const newAppointment: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
    };
    
    appointments.push(newAppointment);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
    
    return newAppointment;
  },
};

// Payment API
export const paymentAPI = {
  getPayments: async (): Promise<Payment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
  },
  
  updatePaymentStatus: async (id: string, status: 'pending' | 'paid'): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const payments = getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
    const payment = payments.find(p => p.id === id);
    
    if (payment) {
      payment.status = status;
      saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
    }
  },
};

// Doctor API
export const doctorAPI = {
  getDoctors: async (): Promise<Doctor[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    return users.filter(u => u.role === 'doctor') as Doctor[];
  },
  
  updateDoctorSubscription: async (doctorId: string, isSubscribed: boolean): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const doctor = users.find(u => u.id === doctorId && u.role === 'doctor') as Doctor;
    
    if (doctor) {
      doctor.isSubscribed = isSubscribed;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
  },
  
  updateAppointmentsEnabled: async (doctorId: string, enabled: boolean): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const doctor = users.find(u => u.id === doctorId && u.role === 'doctor') as Doctor;
    
    if (doctor) {
      doctor.appointmentsEnabled = enabled;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
  },
};

// Admin API
export const adminAPI = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const patients = getFromStorage<Patient[]>(STORAGE_KEYS.PATIENTS, []);
    const visits = getFromStorage<Visit[]>(STORAGE_KEYS.VISITS, []);
    const appointments = getFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    
    return {
      totalDoctors: users.filter(u => u.role === 'doctor').length,
      totalPatients: patients.length,
      totalVisits: visits.length,
      totalAppointments: appointments.length,
    };
  },
};

// Notification API
export const notificationAPI = {
  getNotifications: async (userId: string): Promise<Notification[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const notifications = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifications.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  
  markAsRead: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const notifications = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const notification = notifications.find(n => n.id === id);
    
    if (notification) {
      notification.read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  },
};

// CSV Export utility
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string;
  phone: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt?: string;
  appointmentCount?: number;
}

export type ServiceStatus = 'active' | 'inactive';

export interface SalonService {
  id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: ServiceStatus;
  createdAt: string;
}

export interface CategorySummary {
  name: string;
  count: number;
  minPrice: number | null;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

export interface Appointment {
  id: string;
  serviceId: string;
  customerId?: string;
  serviceName: string;
  serviceCategory: string;
  serviceImage: string;
  serviceDuration?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerImage?: string;
  appointmentDate: string;
  timeSlot: string;
  message: string;
  servicePrice: number;
  paymentStatus: PaymentStatus;
  status: AppointmentStatus;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: 'paid' | 'failed';
  createdAt: string;
}

export interface CustomerOverview {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
}

export interface AdminOverview {
  totalCustomers: number;
  totalActiveServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalSuccessfulPayments: number;
  totalRevenue: number;
}

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  bio?: string;
  profileImage?: string;
  companyName?: string;
  phone?: string;
  memberSince: string;
  referrals?: number;
  coupons?: string[];
  role?: string;
}

export interface Order {
  id: string;
  service: string;
  date: string;
  dateStarted?: string;
  dateCompleted?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Pending Payment';
  amount: number;
  amountPaid: number;
  trackingId?: string;
  clientName?: string;
  clientId: string;
  isPortfolio?: boolean;
  description?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  roleApplied: string;
  status: 'Pending' | 'Reviewed' | 'Interviewing' | 'Rejected' | 'Hired';
  appliedDate: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export interface CustomOffer {
  id: string;
  orderId: string;
  userId: string;
  offerAmount: number;
  description: string;
  createdAt: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Expired';
}

export interface Invoice {
  id: string;
  orderId?: string;
  userId: string;
  clientName?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  paymentLink?: string;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeCoupons: number;
  totalUsers: number;
  pendingJobApplications: number;
}
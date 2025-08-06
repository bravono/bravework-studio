import { Session } from "next-auth"; // For extending Session type

// Extend NextAuth's Session type to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Assuming you've added 'id' to the session
      roles?: string[]; // If you store multiple roles as an array
      email_verified?: boolean;
    } & DefaultSession["user"];
  }
}

// Your existing UserProfile, updated for admin context
interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  bio?: string;
  profileImage?: string; // URL to the image
  companyName?: string;
  phone?: string;
  memberSince: string; // Date string or actual Date object
  referrals?: number;
  coupons?: string[]; // Array of coupon codes
  role?: string; // Admin's own role
}

// Updated Order interface
interface Order {
  id: string;
  service: string; // category_id from DB
  date: string; // created_at from DB
  dateStarted?: string; // New: date when work started
  dateCompleted?: string; // New: date when work completed
  amount: number; // total_expected_amount_kobo from DB (remember to convert kobo to actual currency)
  amountPaid: number; // amount_paid_to_date_kobo from DB
  trackingId?: string; // If you have a separate tracking ID
  clientName?: string; // Derived from user_id, for admin view
  clientId: string; // The user_id associated with the order
  isPortfolio?: boolean; // New: to mark if it can be added to portfolio
  description?: string; // Optional: order description for admin view
  serviceName?: string;
  statusName?: string;
}

// New: User interface for User Management
interface User {
  id: string;
  fullName: string;
  email: string;
  role: string; // e.g., 'user', 'admin', 'client', 'student'
  emailVerified: boolean;
  createdAt: string; // When they joined
  // Add other relevant user details for admin view
}

// New: Job Application interface
interface JobApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  roleApplied: string; // e.g., '3D Artist', 'UI/UX Designer'
  status: "Pending" | "Reviewed" | "Interviewing" | "Rejected" | "Hired";
  appliedDate: string;
  resumeUrl?: string; // Link to resume
  coverLetter?: string; // Text of cover letter
}

// New: Custom Offer interface
interface CustomOffer {
  id: string;
  orderId: string;
  userId: string;
  offerAmount: number;
  description: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt?: string; // Optional expiry date
  orderService?: string; // From join
  orderDescription?: string; // From join
  orderBudget?: number; // From join
  rejectionReason?: string;
  categoryName?: string;
  projectDuration?: number; // New: duration in days or weeks
}

// New: Invoice interface (expanded)
interface Invoice {
  id: string;
  orderId?: string; // Link to associated order
  userId: string;
  clientName?: string; // For admin view
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: "Paid" | "Pending" | "Overdue" | "Cancelled";
  paymentLink?: string; // If you generate a payment link
  // Add line items if invoices have detailed breakdown
}

// New: Discount interface (if you manage discounts centrally)
interface Discount {
  id: string;
  code: string;
  percentage: number;
  minAmount?: number;
  maxUses?: number;
  expiresAt?: string;
  isActive: boolean;
  applicableRoles?: string[]; // e.g., ['client', 'student']
}

// Admin Dashboard Stats
interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeCoupons: number;
  totalUsers: number;
  pendingJobApplications: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  rejectionReason?: string; // Optional, only for rejected offers
  // Custom offer specific fields (optional, from JOIN)
  offerId?: string;
  offerAmount?: number;
  offerDescription?: string;
  offerStatus?: "pending" | "accepted" | "rejected" | "expired" | string; // String for other statuses
  offerExpiresAt?: string;
}

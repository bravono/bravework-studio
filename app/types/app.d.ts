import { Session } from "next-auth"; // For extending Session type

// Extend NextAuth's Session type to include custom properties
declare module "next-auth";
interface Session {
  user: {
    id: string; // Assuming you've added 'id' to the session
    roles?: string[]; // If you store multiple roles as an array
    email_verified?: boolean;
  } & DefaultSession["user"];
} // Your existing UserProfile, updated for admin context
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
  expiresAt?: string;
  orderService?: string;
  orderDescription?: string;
  orderBudget?: number;
  rejectionReason?: string;
  categoryName?: string;
  projectDuration?: number;
  totalPaid?: number;
  discount?: number;
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
  userId: number;
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

interface ExchangeRates {
  [key: string]: number; // e.g., { "USD": 1, "NGN": 1500, "GBP": 0.8, "EUR": 0.9 }
}

// Define a type for your user profile data
interface UserProfile {
  fullName: string;
  email: string;
  bio: string;
  profileImage: string; // URL to the image
  companyName: string;
  phone: string;
  memberSince: string; // Date string or actual Date object
  referrals: number;
  coupons: string[]; // Array of coupon codes
  // Add other fields you might have, like user ID
  id?: string;
}

interface Course {
  id: string;
  title: string;
  progress: number; // Percentage
  lastAccessed: string; // Date string
  paymentStatus: number; // e.g., 1 = pending, 2 = completed, etc.
  description: string;
  price: number; // Stored in kobo, convert to currency unit for display
  isActive: boolean;
  startDate: string;
  endDate: string;
  maxStudents: string;
  thumbnailUrl: string;
  level: "Beginner" | "Intermediate" | "Advance";
  language: string;
  amount: number;
  category: string;
  discount?: number; // Early bird discount percentage
  discountStartDate?: string;
  discountEndDate?: string;
  sessionOption?: number;
  // Current or next upcoming session
  session?: {
    timestamp: string;
    link: string;
    duration: number;
  };
  sessions: Array<{
    datetime: string;
    link: string;
    duration: number; // Duration in minutes
    options: SessionOption[];
  }>;
  sessionGroup: SessionOption[];
  // Join with instructor table
  
  instructor: string;
  bio: string;
}

interface CourseSession {
  id: number; // Used for React key and easy state management
  options: SessionOption[];
}

interface SessionFormProps {
  session: CourseSession;
  index: number;
  sessionsLength: number;
  removeSession: (id: number) => void;
  handleOptionChange: (
    sessionId: number,
    optionNumber: number,
    field: keyof SessionOption,
    value: any
  ) => void;
  addOption: (sessionId: number) => void;
  removeOption: (sessionId: number, optionNumber: number) => void;
}

interface SessionOption {
  optionNumber: number;
  label: string; // e.g., "Morning", "Monday"
  datetime: string;
  link: string;
  duration: number; // Duration in minutes
}

interface AdminStats {
  totalOrders: number;
  totalRevenue: number; // Stored in kobo, convert to currency unit for display
  pendingOrders: number;
  activeCoupons: number;
  totalUsers: number;
  pendingJobApplications: number;
  totalUnreadNotifications: number;
}

interface CourseModalProps {
  onClose: () => void;
  existingCourse?: Course;
  onSave: () => void;
  userRole: 'admin' | 'instructor';
  currentInstructorName?: string,
  currentInstructorId?: number,
}

interface CustomOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: CustomOffer | null;
  onSave: (data: any) => void;
  orders: Order[];
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

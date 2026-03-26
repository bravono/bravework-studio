"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  Edit3,
  Loader2,
  Phone,
  CheckCircle2,
  Zap,
  Briefcase,
  GraduationCap,
  Wallet
} from "lucide-react";
import VerificationModal from "./VerificationModal";

import { 
  Order, 
  Course, 
  UserProfile, 
  Invoice, 
  CustomOffer, 
  Rental, 
  Booking,
  ExchangeRates
} from "app/types/app";

type Currency = "NGN" | "USD" | "GBP" | "EUR";

interface UserOverviewSectionProps {
  session: any;
  courses: Course[];
  selectedCurrency: Currency;
  exchangeRates: ExchangeRates;
  handleCreateCourse: () => void;
  orders: Order[];
  paginatedOrders: Order[];
  ordersPage: number;
  totalOrdersPages: number;
  setOrdersPage: (p: number) => void;
  offers: CustomOffer[];
  paginatedOffers: CustomOffer[];
  offersPage: number;
  totalOffersPages: number;
  setOffersPage: (p: number) => void;
  invoices: Invoice[];
  paginatedInvoices: Invoice[];
  invoicesPage: number;
  totalInvoicesPages: number;
  setInvoicesPage: (p: number) => void;
  rentals: Rental[];
  paginatedRentals: Rental[];
  rentalsPage: number;
  totalRentalsPages: number;
  setRentalsPage: (p: number) => void;
  bookings: Booking[];
  paginatedBookings: Booking[];
  bookingsPage: number;
  totalBookingsPages: number;
  setBookingsPage: (p: number) => void;
  userProfile: UserProfile;
  isEditingProfile: boolean;
  setIsEditingProfile: (v: boolean) => void;
  editableProfile: UserProfile;
  setEditableProfile: (p: UserProfile) => void;
  handleProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSaveProfile: () => void;
  loading: boolean;
  handleChangePassword: () => void;
  notificationCount: number;
  setActiveTab: (t: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  selectedCourse: Course | null;
  handleInitiatePayment: (id: any, type?: "invoice" | "booking") => void;
  handleOfferAction: (offer: CustomOffer, action: "accept" | "reject", reason?: string) => void;
  handleRejectClick: (offer: CustomOffer) => void;
  actionLoading: boolean;
  isRejectReasonModalOpen: boolean;
  setIsRejectReasonModalOpen: (v: boolean) => void;
  selectedOfferForRejection: CustomOffer | null;
  handleConfirmReject: (reason: string) => void;
  handleReleaseFunds: (bookingId: number) => void;
  handleRentAgain: (rentalId: number) => void;
}

export default function UserOverviewSection({
  session,
  userProfile,
  isEditingProfile,
  setIsEditingProfile,
  editableProfile,
  handleProfileChange,
  handleSaveProfile,
  loading,
  courses,
  orders,
  bookings,
  setActiveTab
}: UserOverviewSectionProps) {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const stats = [
    { label: "Studio Hub", value: orders.length, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Courses", value: courses.length, icon: GraduationCap, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Bookings", value: bookings.length, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome & Verification Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Hello, <span className="text-green-600">{userProfile?.fullName?.split(" ")[0]}</span>!
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Welcome back to your dashboard.</p>
        </div>
        
        {!userProfile?.isVerified && (
          <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
            userProfile?.verificationSubmittedAt 
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {userProfile?.verificationSubmittedAt ? (
              <>
                <Loader2 className="animate-spin shrink-0" size={24} />
                <div className="text-xs">
                  <p className="font-black uppercase tracking-widest">Verification Pending</p>
                  <p className="font-medium opacity-90 mt-0.5">We're currently reviewing your ID.</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="shrink-0 animate-pulse" size={24} />
                <div className="text-xs">
                  <p className="font-black uppercase tracking-widest">Verification Required</p>
                  <p className="font-medium opacity-90 mt-0.5">Start renting by verifying your identity.</p>
                </div>
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-700 transition shadow-lg shadow-red-200"
                >
                  Verify Now
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 ring-4 ring-green-50 aspect-square relative shadow-2xl">
                <Image
                  src={userProfile?.profileImage || "/assets/Bravework_Studio-Logo-Color.png"}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              {userProfile?.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-2xl shadow-lg border-4 border-white dark:border-gray-900">
                  <ShieldCheck size={20} />
                </div>
              )}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-xl font-black text-gray-900 dark:text-white truncate">{userProfile?.fullName}</h2>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-1 font-bold tracking-widest uppercase">
                <Mail size={12} />
                {userProfile?.email}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-800">
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl font-black text-xs uppercase hover:scale-[1.02] transition shadow-xl"
              >
                {isEditingProfile ? "Cancel Editing" : <><Edit3 size={16} /> Edit Profile</>}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-green-200/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
              <Zap size={100} />
            </div>
            <h3 className="text-lg font-black mb-2 flex items-center gap-2">
              <Zap size={20} /> Professional Plan
            </h3>
            <p className="text-green-100 text-xs font-medium leading-relaxed mb-6">
              You are currently on a free account. Upgrade to access premium features and mentorship.
            </p>
            <button className="w-full bg-white text-green-700 py-3 rounded-2xl font-black text-xs uppercase hover:bg-green-50 transition shadow-xl">
              Coming Soon
            </button>
          </div>
        </div>

        {/* Info Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/30 dark:shadow-none hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-5`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Detailed Info Card */}
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-xl shadow-gray-100/30 dark:shadow-none border border-gray-100 dark:border-gray-800">
            {isEditingProfile ? (
              <div className="space-y-6 animate-in slide-in-from-top-2">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Edit Your Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        name="fullName"
                        value={editableProfile.fullName}
                        onChange={handleProfileChange}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        name="phone"
                        value={editableProfile.phone}
                        onChange={handleProfileChange}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Bio / Professional Intro</label>
                    <textarea 
                      name="bio"
                      value={editableProfile.bio}
                      onChange={handleProfileChange}
                      rows={4}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500 transition-all resize-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full md:w-auto px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-green-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Profile Changes"}
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                   <div className="space-y-6">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">Profile Overview</h3>
                      <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-lg italic">
                        {userProfile?.bio || "Describe your professional background and interests here..."}
                      </p>
                   </div>
                   <div className="flex gap-3">
                      <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase border border-blue-100">
                        <Calendar size={14} />
                        Joined {new Date(userProfile?.memberSince || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: "Company", value: userProfile?.companyName, icon: Building, placeholder: "No company specified" },
                    { label: "Phone", value: userProfile?.phone, icon: Phone, placeholder: "No phone specified" },
                    { label: "Full Name", value: userProfile?.fullName, icon: User, placeholder: "Enter your name" },
                    { label: "Contact Email", value: userProfile?.email, icon: Mail, placeholder: "No email specified" },
                  ].map((field, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl group border border-transparent hover:border-gray-100 transition-all">
                      <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-green-600 transition-all shadow-sm">
                        <field.icon size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{field.label}</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[180px]">
                          {field.value || <span className="text-gray-300 italic">{field.placeholder}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <VerificationModal 
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSuccess={() => {
          // You might want to refresh profile data here
          window.location.reload();
        }}
      />
    </div>
  );
}

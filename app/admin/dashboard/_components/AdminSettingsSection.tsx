'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Key, User, ExternalLink } from 'lucide-react';

// Assuming the new Modal component is imported from its location
import Modal from './Modal'; // Adjust the import path as needed

// Define the type for the admin profile data
interface AdminProfile {
  fullName: string;
  email: string;
  profileImage?: string | null;
}

export default function AdminSettingsSection() {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalChildren, setModalChildren] = useState<React.ReactNode>(null);

  // Simulate fetching admin profile data
  useEffect(() => {
    const mockFetch = new Promise<AdminProfile>((resolve) => {
      setTimeout(() => {
        resolve({
          fullName: "Admin User",
          email: "admin.user@example.com",
          profileImage: null, // Can be a URL to a profile image
        });
      }, 500);
    });

    mockFetch.then((data) => {
      setAdminProfile(data);
      setIsLoading(false);
    });
  }, []);

  const handleChangePassword = () => {
    setModalTitle('Change Password');
    setModalChildren(
      <>
        <p className="text-gray-600 mb-6">
          This feature is currently under development. You will be able to change your password from here soon.
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-6 py-2 rounded-lg font-bold text-white transition-colors bg-blue-500 hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </>
    );
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <div className="w-8 h-8 border-4 border-t-4 border-blue-500 border-opacity-25 rounded-full animate-spin"></div>
        <span className="ml-3 font-semibold">Loading settings...</span>
      </div>
    );
  }

  if (!adminProfile) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load admin profile data.
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">
          Admin Settings
        </h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Profile Information</h3>
          <div className="flex items-center space-x-6 mb-8">
            <img
              src={adminProfile.profileImage || "https://placehold.co/100x100/A5B4FC/3730A3?text=A"}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full border-4 border-indigo-500 shadow-md object-cover"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                {adminProfile.fullName}
              </span>
              <span className="text-gray-600">
                {adminProfile.email}
              </span>
              <a href="/profile" className="text-indigo-500 hover:text-indigo-600 font-semibold mt-2 flex items-center space-x-1 transition-colors">
                <span>Edit Profile</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            General application settings, integrations, and more.
          </p>
          <button
            onClick={handleChangePassword}
            className="flex items-center space-x-2 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-600 transition-colors"
          >
            <Key size={20} />
            <span>Change Admin Password</span>
          </button>
        </div>
      </div>
      <Modal
        title={modalTitle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        {modalChildren}
      </Modal>
    </div>
  );
}

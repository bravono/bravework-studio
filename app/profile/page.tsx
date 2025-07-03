'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '../css/profile.css'; 

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: 'Ahbideen Yusuf',
    email: 'ahbideeny@gmail.com',
    phone: '+234 810 300 3000',
    bio: 'Creative professional interested in 3D modeling and UI/UX design.',
    profileImage: '/images/profile-placeholder.jpg'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to update the user profile
    setUser(formData);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here you would typically upload the image to your server
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <button 
            className={`edit-button ${isEditing ? 'cancel' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-image-section">
            <div className="profile-image-container">
              <Image
                src={formData.profileImage}
                alt="Profile"
                width={150}
                height={150}
                className="profile-image"
              />
              {isEditing && (
                <label className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span>Change Photo</span>
                </label>
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                rows={4}
              />
            </div>

            {isEditing && (
              <div className="form-actions">
                <button type="submit" className="save-button">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </form>

        <div className="profile-sections">
          <div className="profile-section">
            <h2>Account Security</h2>
            <button className="section-button">Change Password</button>
          </div>

          <div className="profile-section">
            <h2>Notification Preferences</h2>
            <button className="section-button">Manage Notifications</button>
          </div>

          <div className="profile-section">
            <h2>Connected Accounts</h2>
            <button className="section-button">Manage Connections</button>
          </div>
        </div>
      </div>
    </div>
  );
} 
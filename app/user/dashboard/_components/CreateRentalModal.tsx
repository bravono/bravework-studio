"use client";

import React, { useState, useRef } from "react";
import Modal from "@/app/components/Modal";
import { toast } from "react-toastify";
import { Loader2, Info, Upload, X, MapPin } from "lucide-react";
import { put } from "@vercel/blob";
import LocationPicker from "@/app/components/LocationPicker";

interface CreateRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRentalModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRentalModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    deviceType: "PC",
    deviceName: "",
    description: "",
    specs: "",
    hourlyRate: "",
    locationCity: "",
    locationAddress: "",
    hasInternet: false,
    hasBackupPower: false,
    images: [] as string[],
    locationLat: 6.5244,
    locationLng: 3.3792,
  });
  const [showSpecHelp, setShowSpecHelp] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    if (formData.images.length >= 3) {
      toast.error("You can only upload up to 3 images");
      return;
    }

    setIsUploading(true);
    const file = e.target.files[0];

    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });

      if (!response.ok) throw new Error("Upload failed");

      const newBlob = await response.json();
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newBlob.url],
      }));
      toast.success("Image uploaded!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    const rate = Number(formData.hourlyRate);
    if (rate < 500 || rate > 2000) {
      toast.error("Hourly rate must be between ₦1,000 and ₦500,000");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/user/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create rental");
      }

      toast.success("Rental listed successfully!");
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        deviceType: "PC",
        deviceName: "",
        description: "",
        specs: "",
        hourlyRate: "",
        locationCity: "",
        locationAddress: "",
        hasInternet: false,
        hasBackupPower: false,
        images: [],
        locationLat: 6.5244,
        locationLng: 3.3792,
      });
    } catch (error: any) {
      console.error("Error creating rental:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="List a New Device">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Device Type
            </label>
            <select
              name="deviceType"
              value={formData.deviceType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            >
              <option value="PC">PC</option>
              <option value="iPad">iPad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Device Name
            </label>
            <input
              type="text"
              name="deviceName"
              value={formData.deviceName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
              placeholder="e.g. High-End Gaming PC"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            placeholder="Describe your device..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Specs
            </label>
            <button
              type="button"
              onClick={() => setShowSpecHelp(!showSpecHelp)}
              className="text-green-600 hover:text-green-700"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          {showSpecHelp && (
            <div className="bg-blue-50 p-2 rounded-md text-xs text-blue-700 mb-2">
              <p>
                <strong>How to check specs:</strong>
              </p>
              <ul className="list-disc pl-4">
                <li>
                  <strong>Windows:</strong> Settings &gt; System &gt; About
                </li>
                <li>
                  <strong>Mac:</strong> Apple Menu &gt; About This Mac
                </li>
              </ul>
            </div>
          )}
          <textarea
            name="specs"
            value={formData.specs}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            placeholder="e.g. RTX 3080, 32GB RAM, i9 Processor"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images (Max 3)
          </label>
          <div className="flex flex-wrap gap-4">
            {formData.images.map((img, index) => (
              <div key={index} className="relative w-24 h-24">
                <img
                  src={img}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {formData.images.length < 3 && (
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-green-500 transition-colors">
                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400" />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hourly Rate (₦)
            </label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              required
              min="500"
              max="2000"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
            <p className="text-xs text-gray-500 mt-1">
              Min: ₦500 - Max: ₦2,000
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              name="locationCity"
              value={formData.locationCity}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            name="locationAddress"
            value={formData.locationAddress}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Map Location
          </label>
          <div
            onClick={() => setIsLocationPickerOpen(true)}
            className="flex items-center gap-3 p-3 border border-gray-300 rounded-md cursor-pointer hover:border-green-500 transition-colors bg-gray-50"
          >
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-grow">
              <p className="text-sm font-medium text-gray-900">
                {formData.locationLat.toFixed(4)},{" "}
                {formData.locationLng.toFixed(4)}
              </p>
              <p className="text-xs text-gray-500">
                Click to pick precise location on map
              </p>
            </div>
          </div>
        </div>

        <LocationPicker
          isOpen={isLocationPickerOpen}
          onClose={() => setIsLocationPickerOpen(false)}
          initialLat={formData.locationLat}
          initialLng={formData.locationLng}
          onConfirm={(lat, lng) => {
            setFormData((prev) => ({
              ...prev,
              locationLat: lat,
              locationLng: lng,
            }));
          }}
        />

        <div className="flex gap-4">
          <div className="flex items-center">
            <input
              id="hasInternet"
              name="hasInternet"
              type="checkbox"
              checked={formData.hasInternet}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label
              htmlFor="hasInternet"
              className="ml-2 block text-sm text-gray-900"
            >
              Has Internet
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="hasBackupPower"
              name="hasBackupPower"
              type="checkbox"
              checked={formData.hasBackupPower}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label
              htmlFor="hasBackupPower"
              className="ml-2 block text-sm text-gray-900"
            >
              Backup Power
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isUploading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            List Device
          </button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { Loader2, Upload, X, MapPin } from "lucide-react";

import Modal from "@/app/components/Modal";
import LocationPicker from "@/app/components/LocationPicker";
import { KOBO_PER_NAIRA } from "@/lib/constants";
import { uploadFile } from "@/lib/utils/upload";

interface EditRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: any; // Rental object to edit
  onSuccess: () => void;
}

export default function EditRentalModal({
  isOpen,
  onClose,
  rental,
  onSuccess,
}: EditRentalModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    deviceType: rental?.deviceType || "",
    deviceName: rental?.deviceName || "",
    description: rental?.description || "",
    specs: rental?.specs || "",
    ram: rental?.ram || "",
    storage: rental?.storage || "",
    processor: rental?.processor || "",
    systemType: rental?.systemType || "64-bit",
    hourlyRate: rental?.hourlyRate
      ? (rental.hourlyRate / KOBO_PER_NAIRA).toString()
      : "",
    locationCity: rental?.locationCity || "",
    locationAddress: rental?.locationAddress || "",
    locationLat: rental?.locationLat ? parseFloat(rental.locationLat) : null,
    locationLng: rental?.locationLng ? parseFloat(rental.locationLng) : null,
    hasInternet: rental?.hasInternet || false,
    hasBackupPower: rental?.hasBackupPower || false,
    rentalType: rental?.rentalType || "p2p",
    isPartner: rental?.isPartner || false,
    isOffice: rental?.isOffice || false,
    images: rental?.imagesArray || rental?.images || [] as string[],
  });

  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [hasPickedLocation, setHasPickedLocation] = useState(
    rental?.locationLat !== null && rental?.locationLng !== null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const standardStorageOptions = [
    "128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD",
    "500GB HDD", "1TB HDD", "2TB HDD"
  ];

  const initialStorage = rental?.storage || "";
  const isStandardStorage = standardStorageOptions.includes(initialStorage);

  const [storageSelectValue, setStorageSelectValue] = useState(
    initialStorage ? (isStandardStorage ? initialStorage : "Other") : ""
  );
  const [customStorageValue, setCustomStorageValue] = useState(
    initialStorage && !isStandardStorage ? initialStorage : ""
  );

  const handleStorageSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStorageSelectValue(val);
    if (val !== "Other") {
      setFormData((prev) => ({ ...prev, storage: val }));
    } else {
      setFormData((prev) => ({ ...prev, storage: customStorageValue }));
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
      const result = await uploadFile(file, "rental-images");

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, result.fileUrl],
      }));
      toast.success("Image uploaded!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
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

  const generateAIDescription = async () => {
    if (!formData.ram && !formData.processor && !formData.deviceName) {
      toast.error(
        "Please enter RAM, Processor or Device Name first to help the AI generate a relevant description.",
      );
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const res = await fetch("/api/rentals/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName: formData.deviceName,
          deviceType: formData.deviceType,
          ram: formData.ram,
          storage: formData.storage,
          processor: formData.processor,
          systemType: formData.systemType,
          locationCity: formData.locationCity,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate description");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, description: data.description }));
      toast.success("Description generated!");
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error("Failed to generate description with AI");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/rentals/${rental.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update rental");
      }
      toast.success("Rental updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating rental:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Rental">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formData.rentalType === "hub" && formData.isPartner && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex gap-2 items-center mb-4">
            <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
              Partner Hub
            </span>
            <p className="text-xs text-green-700 font-bold">
              Fixed ₦500/hr Rate & Mentorship
            </p>
          </div>
        )}
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
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <button
              type="button"
              onClick={generateAIDescription}
              disabled={isGeneratingDescription}
              className="text-xs flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50 font-bold"
            >
              {isGeneratingDescription ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z" />
                </svg>
              )}
              Generate with AI
            </button>
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Device Specifications
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                RAM
              </label>
              <input
                type="text"
                name="ram"
                value={formData.ram}
                onChange={handleChange}
                placeholder="e.g. 16GB DDR4"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-2 border"
              />
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Storage (SSD/HDD)
              </label>
              <select
                name="storageSelect"
                value={storageSelectValue}
                onChange={handleStorageSelectChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-2 border"
              >
                <option value="">Select Storage Type</option>
                <option value="128GB SSD">128GB SSD</option>
                <option value="256GB SSD">256GB SSD</option>
                <option value="512GB SSD">512GB SSD</option>
                <option value="1TB SSD">1TB SSD</option>
                <option value="2TB SSD">2TB SSD</option>
                <option value="500GB HDD">500GB HDD</option>
                <option value="1TB HDD">1TB HDD</option>
                <option value="2TB HDD">2TB HDD</option>
                <option value="Other">Other (Specify)</option>
              </select>
              {storageSelectValue === "Other" && (
                <input
                  type="text"
                  name="customStorage"
                  value={customStorageValue}
                  onChange={(e) => {
                    setCustomStorageValue(e.target.value);
                    setFormData((prev) => ({ ...prev, storage: e.target.value }));
                  }}
                  placeholder="Specify custom storage e.g. 4TB NVMe SSD"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-2 border"
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Processor
              </label>
              <input
                type="text"
                name="processor"
                value={formData.processor}
                onChange={handleChange}
                placeholder="e.g. Intel Core i7 12th Gen"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                System Type
              </label>
              <select
                name="systemType"
                value={formData.systemType || "64-bit"}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-2 border"
              >
                <option value="64-bit">64-bit</option>
                <option value="32-bit">32-bit</option>
                <option value="N/A">Not Applicable</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Other Specs (Optional)
            </label>
            <textarea
              name="specs"
              value={formData.specs}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
              placeholder="e.g. RTX 3080 GPU, 4K Display, Backlit Keyboard"
            />
          </div>
        </div>

        {/* Image Upload/Edit */}
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
              disabled={formData.rentalType === "hub" && formData.isPartner}
              min="500"
              max="500000"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border ${
                formData.rentalType === "hub" && formData.isPartner
                  ? "bg-gray-100 italic"
                  : ""
              }`}
            />
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
                {hasPickedLocation && formData.locationLat && formData.locationLng
                  ? `${Number(formData.locationLat).toFixed(4)}, ${Number(formData.locationLng).toFixed(4)}`
                  : "Location not selected"}
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
          initialLat={formData.locationLat || 6.5244}
          initialLng={formData.locationLng || 3.3792}
          onConfirm={(lat, lng) => {
            setFormData((prev) => ({
              ...prev,
              locationLat: lat,
              locationLng: lng,
            }));
            setHasPickedLocation(true);
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
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

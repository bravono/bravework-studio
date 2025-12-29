"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Info, Upload, X } from "lucide-react";
import { uploadFile } from "@/lib/utils/upload";

import Modal from "@/app/components/Modal";
import { KOBO_PER_NAIRA } from "@/lib/constants";

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
    hourlyRate: rental?.hourlyRate
      ? (rental.hourlyRate / KOBO_PER_NAIRA).toString()
      : "",
    locationCity: rental?.locationCity || "",
    locationAddress: rental?.locationAddress || "",
    hasInternet: rental?.hasInternet || false,
    hasBackupPower: rental?.hasBackupPower || false,
    images: (rental?.images || []) as {
      fileName: string;
      fileSize: number;
      fileUrl: string;
    }[],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [showSpecHelp, setShowSpecHelp] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name } = e.target;
    console.log("Event", e.target);
    if (e.target instanceof HTMLInputElement) {
      // This branch is only run for <input> elements → `checked` is safe
      const { checked, value } = e.target;
      // use `checked` here
      setFormData((prev) => ({ ...prev, [name]: checked || value }));
    } else {
      // This branch is for <textarea> elements → use `value` instead
      const { value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const currentImageCount = formData.images.length;
    const availableSlots = 3 - currentImageCount;

    if (availableSlots <= 0) {
      toast.error("You can only upload up to 3 images");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const filesToUpload = Array.from(selectedFiles).slice(0, availableSlots);

    if (selectedFiles.length > availableSlots) {
      toast.warning(
        `Only the first ${availableSlots} images will be uploaded (max 3 total)`
      );
    }

    setIsUploading(true);

    try {
      const uploadPromises = filesToUpload.map((file) =>
        uploadFile(file, "rentals")
      );

      const uploadedImages = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));

      toast.success(`${uploadedImages.length} image(s) uploaded!`);
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error(error.message || "Failed to upload one or more images");
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
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/rentals/${rental.id}`, {
        method: "PATCH",
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
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Specs
          </label>
          <textarea
            name="specs"
            value={formData.specs}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          />
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images (Max 3)
          </label>
          <div className="flex flex-wrap gap-4">
            {formData.images.map((img, index) => (
              <div key={index} className="relative w-24 h-24">
                <img
                  src={img.fileUrl}
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
                    multiple
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

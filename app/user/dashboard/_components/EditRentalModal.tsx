"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

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
    ram: rental?.ram || "",
    storage: rental?.storage || "",
    processor: rental?.processor || "",
    systemType: rental?.systemType || "64-bit",
    hourlyRate: rental?.hourlyRate
      ? (rental.hourlyRate / KOBO_PER_NAIRA).toString()
      : "",
    locationCity: rental?.locationCity || "",
    locationAddress: rental?.locationAddress || "",
    hasInternet: rental?.hasInternet || false,
    hasBackupPower: rental?.hasBackupPower || false,
    rentalType: rental?.rentalType || "p2p",
    isPartner: rental?.isPartner || false,
    isOffice: rental?.isOffice || false,
  });

  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

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
              <input
                type="text"
                name="storage"
                value={formData.storage}
                onChange={handleChange}
                placeholder="e.g. 512GB NVMe SSD"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-2 border"
              />
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

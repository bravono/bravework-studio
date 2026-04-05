"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { 
  ShieldCheck, 
  Upload, 
  Camera, 
  FileText, 
  Loader2, 
  CheckCircle2,
  AlertCircle 
} from "lucide-react";
import Modal from "@/app/components/Modal";
import { uploadFile } from "@/lib/utils/upload";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ID_TYPES = [
  { id: "nin", name: "National ID (NIN)" },
  { id: "voters_card", name: "Voter's Card" },
  { id: "drivers_license", name: "Driver's License" },
  { id: "intl_passport", name: "International Passport" },
];

export default function VerificationModal({
  isOpen,
  onClose,
  onSuccess,
}: VerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    idType: "",
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, [field]: e.target.files![0] }));
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idType || !formData.idFront || !formData.selfie) {
      toast.error("Please fill in all required fields and upload images.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Upload files
      const frontData = await uploadFile(formData.idFront, "verifications");
      const selfieData = await uploadFile(formData.selfie, "verifications");
      
      let backUrl = null;
      if (formData.idBack) {
        const backData = await uploadFile(formData.idBack, "verifications");
        backUrl = backData.fileUrl;
      }

      const frontUrl = frontData.fileUrl;
      const selfieUrl = selfieData.fileUrl;

      // 2. Submit to verification API
      const res = await fetch("/api/user/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idType: formData.idType,
          idCardFrontUrl: frontUrl,
          idCardBackUrl: backUrl,
          selfieWithIdUrl: selfieUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit verification");
      }

      toast.success("Verification submitted! Our team will review it within 24-48 hours.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Identity Verification">
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
          <ShieldCheck className="text-blue-600 shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-blue-900 text-sm">Secure Verification</h4>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              We need a valid ID to ensure the safety of our community. Your data is encrypted and used only for verification.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ID Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              1. Select ID Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ID_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, idType: type.id }))}
                  className={`p-3 text-xs font-bold rounded-xl border-2 transition-all text-left ${
                    formData.idType === type.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-100 hover:border-gray-200 text-gray-600"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* ID Front Upload */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Upload size={16} className="text-gray-400" />
              2. Upload ID Front
            </label>
            <div className={`relative isolate rounded-2xl border-2 border-dashed transition-all p-6 text-center ${
              formData.idFront ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-blue-300"
            }`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "idFront")}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {formData.idFront ? (
                <div className="flex flex-col items-center gap-1 text-green-700">
                  <CheckCircle2 size={32} />
                  <span className="text-xs font-bold truncate max-w-[200px]">{formData.idFront.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <Camera size={24} />
                  </div>
                  <span className="text-xs font-medium">Click to upload ID Front</span>
                </div>
              )}
            </div>
          </div>

          {/* Selfie Upload */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Camera size={16} className="text-gray-400" />
              3. Selfie holding ID
            </label>
            <div className={`relative isolate rounded-2xl border-2 border-dashed transition-all p-6 text-center ${
              formData.selfie ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-blue-300"
            }`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "selfie")}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {formData.selfie ? (
                <div className="flex flex-col items-center gap-1 text-green-700">
                  <CheckCircle2 size={32} />
                  <span className="text-xs font-bold truncate max-w-[200px]">{formData.selfie.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <Camera size={24} />
                  </div>
                  <span className="text-xs font-medium">Ensure your face & ID are clear</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                  <AlertCircle size={14} className="text-amber-500" />
                  Review may take up to 48 hours.
              </div>
            <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Verification"
                  )}
                </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

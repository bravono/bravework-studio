"use client";

import React, { useState } from "react";
import Modal from "@/app/components/Modal";
import { Sparkles, Bot, Send, CheckCircle2, Clock, DollarSign, Calendar } from "lucide-react";
import { toast } from "react-toastify";

interface ProposalMilestone {
  title: string;
  description: string;
  durationDays: number;
  amountKobo: number;
}

interface AIProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | number;
  orderTitle?: string;
  existingOffer?: any;
  onSuccess?: () => void;
}

export default function AIProposalModal({
  isOpen,
  onClose,
  orderId,
  orderTitle,
  existingOffer,
  onSuccess,
}: AIProposalModalProps) {
  const [loading, setLoading] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [proposalData, setProposalData] = useState<any>(existingOffer || null);

  const parseMilestonesFromDescription = (desc: string): ProposalMilestone[] => {
    if (!desc) return [];
    // Basic fallback parsing if formatted string
    const lines = desc.split("\n");
    const milestones: ProposalMilestone[] = [];
    let current: Partial<ProposalMilestone> = {};

    lines.forEach((line) => {
      const match = line.match(/^\d+\.\s+(.*?)\s+\((\d+)\s+days\s+-\s+₦([\d,]+)\)/);
      if (match) {
        if (current.title) milestones.push(current as ProposalMilestone);
        current = {
          title: match[1],
          durationDays: parseInt(match[2], 10),
          amountKobo: parseInt(match[3].replace(/,/g, ""), 10) * 100,
          description: "",
        };
      } else if (current.title && line.trim().startsWith("   ")) {
        current.description = (current.description || "") + " " + line.trim();
      }
    });
    if (current.title) milestones.push(current as ProposalMilestone);
    return milestones;
  };

  const handleGenerateOrRefine = async (customPrompt?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ai-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refinementPrompt: customPrompt || refinementPrompt }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate AI proposal");
      }

      const data = await res.json();
      setProposalData(data);
      setRefinementPrompt("");
      toast.success(
        customPrompt
          ? "Proposal modified by AI Agent Fleet!"
          : "AI Agent Fleet generated proposal successfully!"
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("AI proposal generation error:", err);
      toast.error(err.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`AI Fleet Custom Offer: Order #${orderId}`}>
      <div className="space-y-6 max-w-3xl">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
              <Bot className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Multi-Agent Fleet Orchestrator
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </h3>
              <p className="text-xs text-indigo-200">
                {orderTitle ? `Order: ${orderTitle}` : `Order ID #${orderId}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleGenerateOrRefine()}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {proposalData ? "Re-Run Fleet" : "Generate Proposal"}
          </button>
        </div>

        {/* Generated Proposal Content */}
        {proposalData ? (
          <div className="space-y-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-md">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Total Budget</div>
                  <div className="text-base font-bold text-slate-100">
                    ₦
                    {proposalData.fleetResult?.totalBudgetKobo
                      ? (proposalData.fleetResult.totalBudgetKobo / 100).toLocaleString()
                      : proposalData.offerAmount
                      ? (proposalData.offerAmount / 100).toLocaleString()
                      : "0"}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-md">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Duration</div>
                  <div className="text-base font-bold text-slate-100">
                    {proposalData.fleetResult?.estimatedDays || proposalData.projectDuration || "7"} Days
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 flex items-center space-x-3">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-md">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Custom Offer Status</div>
                  <div className="text-sm font-bold text-emerald-400 capitalize">
                    {proposalData.status || "Pending Admin Review"}
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Milestones preview */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Synthesized Proposal Breakdown & Milestones
              </label>
              <textarea
                readOnly
                rows={10}
                value={proposalData.formattedDescription || proposalData.description || ""}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs font-mono text-slate-200 focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Interactive Prompt Refinement Box */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <label className="text-xs font-medium text-indigo-300 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-400" />
                Ask AI Fleet for Modifications / Refinements
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  placeholder="e.g. Reduce timeline by 3 days and split deliverables into 2 equal milestones..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && refinementPrompt.trim()) {
                      handleGenerateOrRefine();
                    }
                  }}
                />
                <button
                  onClick={() => handleGenerateOrRefine()}
                  disabled={loading || !refinementPrompt.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Refine
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 space-y-4">
            <Bot className="w-12 h-12 text-slate-600 mx-auto" />
            <div>
              <p className="text-sm font-medium text-slate-300">No proposal generated for this order yet.</p>
              <p className="text-xs text-slate-500">
                Click below to launch the 3-Agent fleet to analyze order specs and create a proposal.
              </p>
            </div>
            <button
              onClick={() => handleGenerateOrRefine()}
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md inline-flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              Start AI Agent Fleet
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

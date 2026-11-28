"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  Sparkles,
  HelpCircle,
  BookOpen,
  TrendingUp,
  MessageSquare,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  BrainCircuit,
  Lightbulb,
} from "lucide-react";

interface KnowledgeItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  keywords: string | null;
  is_active: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

interface EscalationItem {
  id: number;
  session_id: string;
  user_email: string | null;
  user_name: string | null;
  question: string;
  context: string | null;
  status: "pending" | "answered" | "dismissed";
  admin_response: string | null;
  resolved_at: string | null;
  created_at: string;
}

interface OfferingGap {
  id: number;
  title: string;
  category: string;
  description: string;
  customer_context: string | null;
  suggested_offering: string;
  potential_impact: "high" | "medium" | "low";
  status: "new" | "under_review" | "planned" | "adopted" | "dismissed";
  admin_notes: string | null;
  occurrences_count: number;
  created_at: string;
  updated_at: string;
}

interface ChatSessionItem {
  session_id: string;
  user_email: string | null;
  user_name: string | null;
  created_at: string;
  updated_at: string;
  messages: Array<{
    id: number;
    sender: string;
    content: string;
    created_at: string;
  }>;
}

const CATEGORIES = [
  "general",
  "services",
  "academy",
  "rentals",
  "pricing",
  "kids",
];

const GAP_STATUS_OPTIONS = [
  { value: "new", label: "New Lead" },
  { value: "under_review", label: "Under Review" },
  { value: "planned", label: "Planned Offering" },
  { value: "adopted", label: "Adopted / Launched" },
  { value: "dismissed", label: "Dismissed" },
];

export default function AdminAiCustomerServiceSection() {
  const [activeTab, setActiveTab] = useState<"escalations" | "knowledge" | "gaps" | "logs">("escalations");
  
  // Escalations state
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationItem | null>(null);
  const [resolveAnswer, setResolveAnswer] = useState("");
  const [resolveCategory, setResolveCategory] = useState("general");
  const [resolveKeywords, setResolveKeywords] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Knowledge base state
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [knowledgeCategoryFilter, setKnowledgeCategoryFilter] = useState("all");
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [editingKnowledgeItem, setEditingKnowledgeItem] = useState<KnowledgeItem | null>(null);
  const [kbFormQuestion, setKbFormQuestion] = useState("");
  const [kbFormAnswer, setKbFormAnswer] = useState("");
  const [kbFormCategory, setKbFormCategory] = useState("general");
  const [kbFormKeywords, setKbFormKeywords] = useState("");
  const [kbFormActive, setKbFormActive] = useState(true);
  const [isSavingKb, setIsSavingKb] = useState(false);

  // Offering Gaps state
  const [gaps, setGaps] = useState<OfferingGap[]>([]);
  const [gapStats, setGapStats] = useState({ total: 0, new: 0, planned: 0, adopted: 0, highImpact: 0 });
  const [gapCategoryFilter, setGapCategoryFilter] = useState("all");
  const [gapStatusFilter, setGapStatusFilter] = useState("all");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [editingGapNotesId, setEditingGapNotesId] = useState<number | null>(null);
  const [gapNotesInput, setGapNotesInput] = useState("");

  // Conversation logs state
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSessionItem | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Fetch functions
  const fetchEscalations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-service/escalations");
      if (res.ok) {
        const data = await res.json();
        setEscalations(data.escalations || []);
        setPendingCount(data.pendingCount || 0);
      }
    } catch {
      toast.error("Failed to load customer escalations.");
    }
  }, []);

  const fetchKnowledge = useCallback(async () => {
    try {
      const url = `/api/admin/ai-service/knowledge?category=${encodeURIComponent(knowledgeCategoryFilter)}&search=${encodeURIComponent(knowledgeSearch)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setKnowledgeItems(data.items || []);
      }
    } catch {
      toast.error("Failed to load knowledge base items.");
    }
  }, [knowledgeCategoryFilter, knowledgeSearch]);

  const fetchGaps = useCallback(async () => {
    try {
      const url = `/api/admin/ai-service/gaps?category=${encodeURIComponent(gapCategoryFilter)}&status=${encodeURIComponent(gapStatusFilter)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setGaps(data.gaps || []);
        if (data.stats) setGapStats(data.stats);
      }
    } catch {
      toast.error("Failed to load offering gaps.");
    }
  }, [gapCategoryFilter, gapStatusFilter]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-service/conversations");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      toast.error("Failed to load conversation logs.");
    }
  }, []);

  useEffect(() => {
    fetchEscalations();
    fetchKnowledge();
    fetchGaps();
  }, [fetchEscalations, fetchKnowledge, fetchGaps]);

  useEffect(() => {
    if (activeTab === "escalations") fetchEscalations();
    if (activeTab === "knowledge") fetchKnowledge();
    if (activeTab === "gaps") fetchGaps();
    if (activeTab === "logs") fetchConversations();
  }, [activeTab, fetchEscalations, fetchKnowledge, fetchGaps, fetchConversations]);

  // Escalation Handlers
  const handleOpenResolve = (item: EscalationItem) => {
    setSelectedEscalation(item);
    setResolveAnswer("");
    setResolveCategory("general");
    setResolveKeywords("");
  };

  const handleResolveEscalation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEscalation || !resolveAnswer.trim() || isResolving) return;

    setIsResolving(true);
    try {
      const res = await fetch(`/api/admin/ai-service/escalations/${selectedEscalation.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: resolveAnswer.trim(),
          category: resolveCategory,
          keywords: resolveKeywords,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to resolve escalation");
      }

      toast.success("AI memory updated successfully and escalation resolved.");
      setSelectedEscalation(null);
      fetchEscalations();
      fetchKnowledge();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error resolving escalation";
      toast.error(msg);
    } finally {
      setIsResolving(false);
    }
  };

  // Knowledge Base Handlers
  const handleOpenNewKnowledge = () => {
    setEditingKnowledgeItem(null);
    setKbFormQuestion("");
    setKbFormAnswer("");
    setKbFormCategory("general");
    setKbFormKeywords("");
    setKbFormActive(true);
    setIsKnowledgeModalOpen(true);
  };

  const handleOpenEditKnowledge = (item: KnowledgeItem) => {
    setEditingKnowledgeItem(item);
    setKbFormQuestion(item.question);
    setKbFormAnswer(item.answer);
    setKbFormCategory(item.category);
    setKbFormKeywords(item.keywords || "");
    setKbFormActive(item.is_active);
    setIsKnowledgeModalOpen(true);
  };

  const handleSaveKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbFormQuestion.trim() || !kbFormAnswer.trim() || isSavingKb) return;

    setIsSavingKb(true);
    try {
      if (editingKnowledgeItem) {
        const res = await fetch(`/api/admin/ai-service/knowledge/${editingKnowledgeItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: kbFormQuestion.trim(),
            answer: kbFormAnswer.trim(),
            category: kbFormCategory,
            keywords: kbFormKeywords,
            is_active: kbFormActive,
          }),
        });
        if (!res.ok) throw new Error("Failed to update knowledge entry");
        toast.success("Knowledge memory updated successfully.");
      } else {
        const res = await fetch("/api/admin/ai-service/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: kbFormQuestion.trim(),
            answer: kbFormAnswer.trim(),
            category: kbFormCategory,
            keywords: kbFormKeywords,
            is_active: kbFormActive,
          }),
        });
        if (!res.ok) throw new Error("Failed to add knowledge entry");
        toast.success("New verified knowledge added to AI memory.");
      }
      setIsKnowledgeModalOpen(false);
      fetchKnowledge();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving knowledge item";
      toast.error(msg);
    } finally {
      setIsSavingKb(false);
    }
  };

  const handleDeleteKnowledge = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this entry from AI memory?")) return;
    try {
      const res = await fetch(`/api/admin/ai-service/knowledge/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      toast.success("Knowledge item removed.");
      fetchKnowledge();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting item";
      toast.error(msg);
    }
  };

  const handleToggleKnowledgeActive = async (item: KnowledgeItem) => {
    try {
      const res = await fetch(`/api/admin/ai-service/knowledge/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      toast.success(item.is_active ? "Knowledge deactivated" : "Knowledge activated");
      fetchKnowledge();
    } catch {
      toast.error("Failed to update active state.");
    }
  };

  // Offering Gaps Handlers
  const handleSynthesizeGaps = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch("/api/admin/ai-service/gaps/synthesize", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Synthesis failed");
      const data = await res.json();
      toast.success(`Analysis completed. Analyzed ${data.analyzedConversationsCount} messages, discovered ${data.identifiedGapsCount} new opportunities.`);
      fetchGaps();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error synthesizing gaps";
      toast.error(msg);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleUpdateGapStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/ai-service/gaps/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");
      toast.success(`Offering gap updated to: ${newStatus}`);
      fetchGaps();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleSaveGapNotes = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/ai-service/gaps/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_notes: gapNotesInput }),
      });
      if (!res.ok) throw new Error("Notes update failed");
      toast.success("Admin action notes saved.");
      setEditingGapNotesId(null);
      fetchGaps();
    } catch {
      toast.error("Failed to save notes.");
    }
  };

  const handleDeleteGap = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this offering gap?")) return;
    try {
      const res = await fetch(`/api/admin/ai-service/gaps/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Offering gap deleted.");
      fetchGaps();
    } catch {
      toast.error("Failed to delete offering gap.");
    }
  };

  return (
    <div className="space-y-6 text-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 p-6 rounded-2xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BrainCircuit size={22} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Customer Service & Intelligence</h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Train AI memory, review unanswered customer questions, and explore unmet business demand recommendations.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 bg-gray-950/80 p-1.5 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab("escalations")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "escalations"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <AlertTriangle size={15} />
            <span>Pending Escalations</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("knowledge")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "knowledge"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <BookOpen size={15} />
            <span>AI Memory ({knowledgeItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("gaps")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "gaps"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <TrendingUp size={15} />
            <span>Offering Recommendations ({gaps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "logs"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <MessageSquare size={15} />
            <span>Conversations</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PENDING ESCALATIONS */}
      {activeTab === "escalations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Unanswered Inquiries Requiring Human Review</span>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-semibold">
                {escalations.filter((e) => e.status === "pending").length} Pending
              </span>
            </h2>
            <button
              onClick={fetchEscalations}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          {escalations.length === 0 ? (
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-12 text-center">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No Pending Escalations</h3>
              <p className="text-sm text-gray-400 mt-1">
                The AI customer service currently has all the verified knowledge it needs to answer customer inquiries.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {escalations.map((item) => (
                <div
                  key={item.id}
                  className={`bg-gray-900/70 border rounded-2xl p-5 transition-all ${
                    item.status === "pending"
                      ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                      : "border-gray-800 opacity-75"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            item.status === "pending"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {item.status === "pending" ? "Needs Answer" : "Resolved & Learned"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(item.created_at), "MMM d, yyyy h:mm a")}
                        </span>
                        {item.user_email && (
                          <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-0.5 rounded-full">
                            Visitor: {item.user_email}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-white">"{item.question}"</h3>

                      {item.context && (
                        <p className="text-xs text-gray-400 bg-gray-950/60 p-2.5 rounded-xl border border-gray-800/80">
                          {item.context}
                        </p>
                      )}

                      {item.admin_response && (
                        <div className="mt-3 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs">
                          <span className="font-bold text-emerald-400 block mb-1">Trained AI Memory Answer:</span>
                          <p className="text-gray-200">{item.admin_response}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.status === "pending" && (
                        <button
                          onClick={() => handleOpenResolve(item)}
                          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <Edit2 size={14} />
                          <span>Train AI & Answer</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI KNOWLEDGE BASE MEMORY */}
      {activeTab === "knowledge" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={knowledgeSearch}
                  onChange={(e) => setKnowledgeSearch(e.target.value)}
                  placeholder="Search AI verified memory..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={knowledgeCategoryFilter}
                onChange={(e) => setKnowledgeCategoryFilter(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenNewKnowledge}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <PlusCircle size={15} />
              <span>Add Knowledge Memory</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900/70 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 capitalize">
                        Source: {item.source.replace("_", " ")}
                      </span>
                      <button
                        onClick={() => handleToggleKnowledgeActive(item)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-gray-800 text-gray-400 border-gray-700"
                        }`}
                      >
                        {item.is_active ? "Active" : "Disabled"}
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-white">{item.question}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{item.answer}</p>

                  {item.keywords && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      {item.keywords.split(",").map((k, idx) => (
                        <span key={idx} className="text-[10px] bg-gray-950 px-2 py-0.5 rounded-md text-gray-400 border border-gray-800">
                          {k.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">
                    Updated {format(new Date(item.updated_at), "MMM d, yyyy")}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditKnowledge(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      title="Edit knowledge"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteKnowledge(item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
                      title="Delete knowledge"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS OFFERING GAPS & RECOMMENDATIONS PORTAL */}
      {activeTab === "gaps" && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
              <span className="text-xs text-gray-400 font-medium">Total Opportunities</span>
              <p className="text-2xl font-bold text-white mt-1">{gapStats.total}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
              <span className="text-xs text-amber-400 font-medium">High Impact Needs</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{gapStats.highImpact}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
              <span className="text-xs text-blue-400 font-medium">Planned Offerings</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">{gapStats.planned}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
              <span className="text-xs text-emerald-400 font-medium">Adopted / Launched</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{gapStats.adopted}</p>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={gapStatusFilter}
                onChange={(e) => setGapStatusFilter(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Statuses</option>
                {GAP_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={gapCategoryFilter}
                onChange={(e) => setGapCategoryFilter(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Sectors</option>
                <option value="Services">Services</option>
                <option value="Academy">Academy</option>
                <option value="Hardware Rentals">Hardware Rentals</option>
                <option value="Kids Hub">Kids Hub</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              onClick={handleSynthesizeGaps}
              disabled={isSynthesizing}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              <Lightbulb size={16} className={isSynthesizing ? "animate-spin" : ""} />
              <span>{isSynthesizing ? "Synthesizing Conversations..." : "Synthesize Gaps from Chat History"}</span>
            </button>
          </div>

          {/* Offering Gap Cards */}
          <div className="grid grid-cols-1 gap-4">
            {gaps.map((gap) => (
              <div
                key={gap.id}
                className="bg-gray-900/70 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {gap.category}
                      </span>
                      <span
                        className={`text-xs uppercase font-bold px-2 py-0.5 rounded-full ${
                          gap.potential_impact === "high"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : gap.potential_impact === "medium"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}
                      >
                        {gap.potential_impact} Impact
                      </span>
                      <span className="text-xs text-gray-400">
                        Requested {gap.occurrences_count} {gap.occurrences_count === 1 ? "time" : "times"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mt-1">{gap.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{gap.description}</p>
                  </div>

                  {/* Status Picker */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={gap.status}
                      onChange={(e) => handleUpdateGapStatus(gap.id, e.target.value)}
                      className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                    >
                      {GAP_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDeleteGap(gap.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-xl transition-colors"
                      title="Delete gap"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* AI Business Offering Recommendation */}
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
                  <span className="text-xs font-bold text-amber-400 block mb-1">
                    Strategic Business Offering Recommendation:
                  </span>
                  <p className="text-xs text-gray-200 leading-relaxed">{gap.suggested_offering}</p>
                </div>

                {/* Customer context snippets */}
                {gap.customer_context && (
                  <div className="bg-gray-950/60 border border-gray-800/80 rounded-xl p-3">
                    <span className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Customer Inquiry Context:
                    </span>
                    <p className="text-xs text-gray-400 italic whitespace-pre-wrap">{gap.customer_context}</p>
                  </div>
                )}

                {/* Admin Notes / Action Plan */}
                <div className="pt-2 border-t border-gray-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">Action Plan & Admin Notes:</span>
                    {editingGapNotesId !== gap.id && (
                      <button
                        onClick={() => {
                          setEditingGapNotesId(gap.id);
                          setGapNotesInput(gap.admin_notes || "");
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                      >
                        <Edit2 size={12} />
                        <span>{gap.admin_notes ? "Edit Notes" : "Add Plan"}</span>
                      </button>
                    )}
                  </div>

                  {editingGapNotesId === gap.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={gapNotesInput}
                        onChange={(e) => setGapNotesInput(e.target.value)}
                        placeholder="Write implementation plan, team assignees, or feasibility assessment..."
                        rows={3}
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingGapNotesId(null)}
                          className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveGapNotes(gap.id)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
                        >
                          Save Plan
                        </button>
                      </div>
                    </div>
                  ) : (
                    gap.admin_notes && (
                      <p className="text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-xl">
                        {gap.admin_notes}
                      </p>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONVERSATION LOGS */}
      {activeTab === "logs" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="space-y-3 md:col-span-1">
            <h3 className="text-sm font-bold text-white mb-2">Customer Sessions ({sessions.length})</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {sessions.map((sess) => (
                <button
                  key={sess.session_id}
                  onClick={() => setSelectedSession(sess)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedSession?.session_id === sess.session_id
                      ? "bg-amber-600/20 border-amber-500 text-white"
                      : "bg-gray-900/60 border-gray-800 text-gray-300 hover:bg-gray-850"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold truncate max-w-[150px]">
                      {sess.user_email || sess.user_name || "Anonymous Visitor"}
                    </span>
                    <span className="text-gray-500 text-[10px]">
                      {format(new Date(sess.updated_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {sess.messages[sess.messages.length - 1]?.content || "Empty session"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Session Transcript View */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 md:col-span-2 flex flex-col h-[650px]">
            {selectedSession ? (
              <>
                <div className="pb-3 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Session Transcript ({selectedSession.user_email || "Anonymous"})
                    </h3>
                    <span className="text-xs text-gray-500">ID: {selectedSession.session_id}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  {selectedSession.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                          m.sender === "user"
                            ? "bg-amber-600 text-white rounded-br-none"
                            : "bg-gray-950 border border-gray-800 text-gray-200 rounded-bl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <span className="text-[9px] text-gray-400 block mt-1 text-right">
                          {format(new Date(m.created_at), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-gray-500 text-sm">
                Select a conversation session on the left to inspect customer questions and AI recommendations.
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESOLVE ESCALATION MODAL */}
      {selectedEscalation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <BrainCircuit size={18} className="text-amber-400" />
                <span>Train AI Memory with Verified Answer</span>
              </h3>
              <button
                onClick={() => setSelectedEscalation(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResolveEscalation} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">
                  Customer Question
                </label>
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white">
                  {selectedEscalation.question}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">
                  Verified Answer (AI Long-Term Memory)
                </label>
                <textarea
                  value={resolveAnswer}
                  onChange={(e) => setResolveAnswer(e.target.value)}
                  placeholder="Type the official answer. The AI will learn and use this for all future customer inquiries..."
                  rows={4}
                  required
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">
                    Knowledge Category
                  </label>
                  <select
                    value={resolveCategory}
                    onChange={(e) => setResolveCategory(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">
                    Keywords / Tags (optional)
                  </label>
                  <input
                    type="text"
                    value={resolveKeywords}
                    onChange={(e) => setResolveKeywords(e.target.value)}
                    placeholder="e.g. pricing, quote, lagos"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEscalation(null)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResolving || !resolveAnswer.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  <Check size={14} />
                  <span>{isResolving ? "Updating Memory..." : "Save to Memory & Resolve"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KNOWLEDGE ENTRY MODAL (NEW / EDIT) */}
      {isKnowledgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <BookOpen size={18} className="text-amber-400" />
                <span>{editingKnowledgeItem ? "Edit AI Knowledge Entry" : "Add Direct Knowledge to AI"}</span>
              </h3>
              <button
                onClick={() => setIsKnowledgeModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveKnowledge} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">
                  Question / Topic Prompt
                </label>
                <input
                  type="text"
                  value={kbFormQuestion}
                  onChange={(e) => setKbFormQuestion(e.target.value)}
                  placeholder="e.g. Do you provide VR character modeling for Unreal Engine?"
                  required
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">
                  Verified Answer / Policy
                </label>
                <textarea
                  value={kbFormAnswer}
                  onChange={(e) => setKbFormAnswer(e.target.value)}
                  placeholder="Detailed explanation the AI should use when responding to clients..."
                  rows={4}
                  required
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Category</label>
                  <select
                    value={kbFormCategory}
                    onChange={(e) => setKbFormCategory(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">
                    Keywords / Tags
                  </label>
                  <input
                    type="text"
                    value={kbFormKeywords}
                    onChange={(e) => setKbFormKeywords(e.target.value)}
                    placeholder="e.g. vr, unreal, character"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="kbActiveCheck"
                  checked={kbFormActive}
                  onChange={(e) => setKbFormActive(e.target.checked)}
                  className="rounded border-gray-700 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="kbActiveCheck" className="text-xs text-gray-300">
                  Active (enable immediately in AI response prompt)
                </label>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKnowledgeModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingKb || !kbFormQuestion.trim() || !kbFormAnswer.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  <Check size={14} />
                  <span>{isSavingKb ? "Saving..." : "Save Knowledge Entry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Mail,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { ServiceRecommendation } from "@/lib/ai/customer-service-agent";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  recommendations?: ServiceRecommendation[];
  isEscalated?: boolean;
}

const STARTER_PROMPTS = [
  "What services does Bravework Studio provide?",
  "Recommend the best service for my new project",
  "How can I enroll in Bravework Academy?",
  "How does PC and workstation rental work?",
];

export default function AICustomerServiceWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("bws_ai_session_id");
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadHistory(storedSessionId);
    } else {
      initializeGreeting();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeGreeting = () => {
    setMessages([
      {
        id: "initial-greeting",
        sender: "assistant",
        content:
          "Welcome to Bravework Studio! I am your AI assistant. I can answer questions about our 3D animation, software engineering, UI/UX design, Academy courses, and workstation rentals, or recommend the ideal solution for your project. How can I help you today?",
      },
    ]);
  };

  const loadHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/history?sessionId=${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          const formatted: ChatMessage[] = data.messages.map((m: any) => ({
            id: String(m.id),
            sender: m.sender,
            content: m.content,
            recommendations: m.suggested_services || undefined,
            isEscalated: m.is_escalated,
          }));
          setMessages(formatted);
          return;
        }
      }
      initializeGreeting();
    } catch {
      initializeGreeting();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          message: text,
          userEmail: userEmail || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to receive response from AI assistant.");
      }

      const data = await response.json();

      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("bws_ai_session_id", data.sessionId);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        content: data.reply,
        recommendations: data.recommendations,
        isEscalated: data.isEscalated,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          content:
            "I apologize, but I encountered an issue connecting to the service. Please try again in a moment or reach out to us directly via WhatsApp.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    localStorage.removeItem("bws_ai_session_id");
    setSessionId("");
    setEmailSubmitted(false);
    initializeGreeting();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !sessionId || isSubmittingEmail) return;

    setIsSubmittingEmail(true);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: `Contact follow-up email provided: ${userEmail}`,
          userEmail,
        }),
      });
      setEmailSubmitted(true);
    } catch {
      // Ignore submission error
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[99] flex flex-col items-end">
      {/* Floating Toggle Launcher */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 focus:outline-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Customer Service"
      >
        {/* Tooltip Label */}
        <span className="bg-gray-900/95 backdrop-blur-md border border-gray-800 text-white px-4 py-2 rounded-2xl text-xs font-semibold shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 hidden md:flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400" />
          <span>Ask Bravework AI</span>
        </span>

        {/* Circular Button */}
        <div className="relative">
          <span className="absolute -inset-1 rounded-full bg-amber-500/20 animate-pulse" />
          <div className="relative bg-gradient-to-tr from-gray-900 via-gray-800 to-amber-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.35)] border-2 border-amber-500/30 flex items-center justify-center transition-all duration-300 hover:border-amber-400">
            {isOpen ? <X size={26} /> : <MessageSquare size={26} className="text-amber-300" />}
          </div>
        </div>
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-20 right-0 w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] bg-gray-950/95 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-gray-100 z-[100]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-white">Bravework AI Support</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online & Verified</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close window"
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-amber-600 text-white rounded-br-none shadow-md"
                        : "bg-gray-900/90 border border-gray-800 text-gray-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Escalation Notification Card */}
                    {msg.isEscalated && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-600/30 text-xs text-amber-200">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                          <span>
                            This inquiry has been escalated to the Bravework Studio team. We will review and provide verified guidance.
                          </span>
                        </div>

                        {!emailSubmitted ? (
                          <form onSubmit={handleEmailSubmit} className="mt-2 flex gap-1.5">
                            <input
                              type="email"
                              value={userEmail}
                              onChange={(e) => setUserEmail(e.target.value)}
                              placeholder="Enter your email for follow-up"
                              className="flex-1 bg-gray-950/80 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                              required
                            />
                            <button
                              type="submit"
                              disabled={isSubmittingEmail}
                              className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                            >
                              <Mail size={12} />
                              <span>Notify</span>
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-medium mt-1">
                            <CheckCircle2 size={14} />
                            <span>Contact email recorded for follow-up.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Service Recommendations Cards */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-400/90">
                          Recommended Solutions:
                        </p>
                        {msg.recommendations.map((rec) => (
                          <div
                            key={rec.id}
                            className="bg-gray-950/70 border border-gray-800 rounded-xl p-3 hover:border-amber-500/50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-xs text-white">{rec.title}</span>
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                                {rec.category}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mb-2 leading-normal">
                              {rec.description}
                            </p>
                            <Link
                              href={rec.actionUrl}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                            >
                              <span>{rec.actionLabel}</span>
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-bl-none p-3.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                  </div>
                </div>
              )}

              {/* Starter Quick Actions when 1 message */}
              {messages.length === 1 && !isLoading && (
                <div className="pt-2">
                  <p className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-amber-400" />
                    <span>Frequently Asked Questions:</span>
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {STARTER_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-left text-xs bg-gray-900/60 hover:bg-gray-850 border border-gray-800 hover:border-amber-500/40 text-gray-300 hover:text-white p-2.5 rounded-xl transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-gray-800 bg-gray-900/80 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about our services, academy, rentals..."
                disabled={isLoading}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

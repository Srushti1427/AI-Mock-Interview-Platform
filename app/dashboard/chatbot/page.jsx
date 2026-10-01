"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Sparkles, 
  Copy, 
  Check, 
  Plus,
  Search,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Square,
  FileText,
  Brain,
  Code,
  Zap,
  HelpCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Shield,
  Star,
  BarChart2,
  Target,
  RefreshCw,
  MessageSquare,
  Briefcase
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

// INTERVIEW MODES CONFIG
const INTERVIEW_MODES = [
  { id: "Technical Interview", label: "Technical", icon: Code, color: "from-blue-500 to-indigo-600" },
  { id: "HR Interview", label: "HR / Behavioral", icon: User, color: "from-purple-500 to-pink-600" },
  { id: "Aptitude", label: "Aptitude & Math", icon: Brain, color: "from-amber-500 to-orange-600" },
  { id: "Coding/DSA", label: "Coding & DSA", icon: Zap, color: "from-emerald-500 to-teal-600" },
  { id: "System Design", label: "System Design", icon: Shield, color: "from-cyan-500 to-blue-600" },
  { id: "Resume Review", label: "Resume Review", icon: FileText, color: "from-rose-500 to-red-600" },
  { id: "Career Guidance", label: "Career Guidance", icon: Target, color: "from-violet-500 to-purple-600" },
];

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const TARGET_ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "AI / Machine Learning Engineer",
  "DevOps / Cloud Engineer",
  "Data Scientist",
  "Product Manager",
  "QA / Test Automation Engineer"
];

// STARTER PROMPT SUGGESTIONS PER MODE
const STARTER_PROMPTS = {
  "Technical Interview": [
    "What are the core differences between SQL and NoSQL databases?",
    "Explain how the Event Loop works in JavaScript with microtasks and macrotasks.",
    "What is dependency injection and why is it useful in software design?"
  ],
  "HR Interview": [
    "How do I answer 'Tell me about a time you failed and what you learned' using STAR?",
    "What is the best way to handle a salary negotiation question during HR rounds?",
    "How do I answer 'Where do you see yourself in 5 years?' effectively?"
  ],
  "Aptitude": [
    "Give me 3 mental math speed tricks for calculating percentages instantly.",
    "Explain how to solve time, speed, and distance problems step-by-step.",
    "How do I approach logical reasoning syllogism questions quickly?"
  ],
  "Coding/DSA": [
    "Explain Two-Pointers vs Sliding Window technique with code examples.",
    "How do I analyze the Time & Space complexity (Big-O) of recursive functions?",
    "Explain how to detect a cycle in a Linked List using Floyd's algorithm."
  ],
  "System Design": [
    "How would you design a rate-limiter for a public REST API?",
    "Explain database sharding vs replication and their tradeoffs.",
    "How do cache-aside and write-through caching strategies differ?"
  ],
  "Resume Review": [
    "How can I rewrite my project bullet points to sound more impactful to recruiters?",
    "What are the most critical ATS keywords for a Full Stack Engineer resume?",
    "Analyze my resume text and give me 5 immediate improvements."
  ],
  "Career Guidance": [
    "Create a 90-day learning roadmap to transition into an AI/ML Engineer role.",
    "What are the top 5 high-yield open source projects I can build to get hired?",
    "How do I effectively network on LinkedIn to land referrals?"
  ]
};

// MARKDOWN FORMATTER COMPONENT
const FormatMessage = ({ content = "" }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);

  const copyCode = (codeText, index) => {
    navigator.clipboard.writeText(codeText || "");
    setCopiedCodeIndex(index);
    toast.success("Code copied!");
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const safeContent = typeof content === "string" ? content : (content ? String(content) : "");
  const parts = safeContent.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 font-normal leading-relaxed text-sm md:text-base">
      {parts.map((part, idx) => {
        if (!part) return null;
        if (part.startsWith("```") && part.endsWith("```")) {
          const firstLineEnd = part.indexOf("\n");
          let lang = "code";
          let codeContent = part.slice(3, -3);

          if (firstLineEnd !== -1 && firstLineEnd < 20) {
            lang = part.slice(3, firstLineEnd).trim() || "code";
            codeContent = part.slice(firstLineEnd + 1, -3);
          }

          return (
            <div key={idx} className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md">
              <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800/90 text-xs font-mono text-slate-400 border-b border-slate-700">
                <span>{lang}</span>
                <button
                  onClick={() => copyCode(codeContent, idx)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  title="Copy code"
                >
                  {copiedCodeIndex === idx ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs md:text-sm font-mono text-emerald-300 overflow-x-auto whitespace-pre">
                {(codeContent || "").trim()}
              </pre>
            </div>
          );
        }

        const lines = part.split("\n");
        return (
          <div key={idx} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              if (!line.trim()) return <div key={lineIdx} className="h-1.5" />;

              // Bullets
              if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
                const bulletText = line.trim().substring(2);
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-strawberry font-bold">•</span>
                    <span>{renderBoldText(bulletText)}</span>
                  </div>
                );
              }

              // Numbered lists
              const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="font-semibold text-salmon">{numMatch[1]}.</span>
                    <span>{renderBoldText(numMatch[2])}</span>
                  </div>
                );
              }

              // Headers
              if (line.trim().startsWith("### ")) {
                return (
                  <h4 key={lineIdx} className="text-base md:text-lg font-bold text-gray-900 dark:text-white mt-2 mb-1">
                    {renderBoldText(line.trim().substring(4))}
                  </h4>
                );
              }

              if (line.trim().startsWith("## ")) {
                return (
                  <h3 key={lineIdx} className="text-lg md:text-xl font-extrabold text-strawberry dark:text-salmon mt-3 mb-1">
                    {renderBoldText(line.trim().substring(3))}
                  </h3>
                );
              }

              return <p key={lineIdx}>{renderBoldText(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

const renderBoldText = (text = "") => {
  if (!text) return "";
  const safeText = typeof text === "string" ? text : String(text);
  const parts = safeText.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const ChatbotPage = () => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  // Session & Message State
  const [sessions, setSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  
  // UI Controls
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editTitleText, setEditTitleText] = useState("");
  const [copiedMsgIndex, setCopiedMsgIndex] = useState(null);

  // Mode & Simulation Configuration
  const [activeMode, setActiveMode] = useState("Technical Interview");
  const [activeDifficulty, setActiveDifficulty] = useState("Intermediate");
  const [isSimulation, setIsSimulation] = useState(false);
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Resume Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Fetch all chat sessions for user on mount
  useEffect(() => {
    fetchChatSessions();
  }, [userEmail]);

  const fetchChatSessions = async () => {
    if (!userEmail) {
      setIsFetchingHistory(false);
      return;
    }

    try {
      setIsFetchingHistory(true);
      const res = await fetch(`/api/chat/sessions?userEmail=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        
        // If sessions exist, load latest session
        if (data.sessions && data.sessions.length > 0) {
          const latestId = data.sessions[0].chatId;
          loadChatSession(latestId);
        } else {
          // Create initial default session
          createNewSession("Technical Interview", "Intermediate");
        }
      }
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
      toast.error("Failed to load chat history");
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const loadChatSession = async (chatId) => {
    try {
      setActiveChatId(chatId);
      const res = await fetch(`/api/chat?chatId=${encodeURIComponent(chatId)}&userEmail=${encodeURIComponent(userEmail || "")}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.session) {
          setActiveMode(data.session.mode || "Technical Interview");
          setActiveDifficulty(data.session.difficulty || "Intermediate");
          setIsSimulation(!!data.session.isSimulation);
        }
      }
    } catch (err) {
      console.error("Failed to load session details:", err);
    }
  };

  const createNewSession = async (mode = activeMode, difficulty = activeDifficulty) => {
    if (!userEmail) {
      const tempId = `temp_${Date.now()}`;
      setActiveChatId(tempId);
      setMessages([
        {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: `Hello! I am your AI Interview Coach. Mode: **${mode}** (${difficulty}). How can I help you prepare today?`,
          timestamp: new Date().toISOString(),
        }
      ]);
      return;
    }

    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, mode, difficulty }),
      });

      if (res.ok) {
        const data = await res.json();
        const newSession = data.session;
        setSessions((prev) => [newSession, ...prev]);
        setActiveChatId(newSession.chatId);
        setMessages(newSession.messages || []);
        setActiveMode(newSession.mode);
        setActiveDifficulty(newSession.difficulty);
        setLatestEvaluation(null);
        toast.success(`Started new ${mode} session!`);
      }
    } catch (err) {
      console.error("Failed to create session:", err);
      toast.error("Could not create new chat session");
    }
  };

  const handleRenameSession = async (chatId) => {
    if (!editTitleText.trim()) return;
    try {
      const res = await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, title: editTitleText.trim() }),
      });

      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.chatId === chatId ? { ...s, title: editTitleText.trim() } : s))
        );
        setEditingTitleId(null);
        toast.success("Session renamed!");
      }
    } catch (err) {
      console.error("Rename error:", err);
      toast.error("Failed to rename session");
    }
  };

  const handleDeleteSession = async (chatId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat?chatId=${encodeURIComponent(chatId)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.chatId !== chatId));
        toast.success("Session deleted");
        if (activeChatId === chatId) {
          const remaining = sessions.filter((s) => s.chatId !== chatId);
          if (remaining.length > 0) {
            loadChatSession(remaining[0].chatId);
          } else {
            createNewSession();
          }
        }
      }
    } catch (err) {
      console.error("Delete session error:", err);
      toast.error("Failed to delete session");
    }
  };

  const handleClearCurrentMessages = async () => {
    if (!activeChatId) return;
    try {
      const res = await fetch(`/api/chat?chatId=${encodeURIComponent(activeChatId)}&clearMessages=true`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessages([
          {
            id: `msg_welcome_${Date.now()}`,
            role: "assistant",
            content: "Conversation cleared. What interview topic would you like to practice next?",
            timestamp: new Date().toISOString(),
          }
        ]);
        setLatestEvaluation(null);
        toast.success("Conversation cleared!");
      }
    } catch (err) {
      console.error("Clear error:", err);
      toast.error("Failed to clear conversation");
    }
  };

  // SEND MESSAGE LOGIC
  const sendMessagePrompt = async (promptText, overrideMessages = null) => {
    if (!promptText.trim() || isLoading) return;

    const userMsgId = `msg_user_${Date.now()}`;
    const userMessage = {
      id: userMsgId,
      role: "user",
      content: promptText.trim(),
      timestamp: new Date().toISOString(),
    };

    const currentList = overrideMessages || messages;
    const newMessages = [...currentList, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          chatId: activeChatId,
          messages: newMessages,
          userEmail,
          mode: activeMode,
          difficulty: activeDifficulty,
          isSimulation,
        }),
      });

      if (!res.ok) {
        throw new Error("API response error");
      }

      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }

      // Update session title in list if generated
      if (data.title && data.chatId) {
        setSessions((prev) =>
          prev.map((s) => (s.chatId === data.chatId ? { ...s, title: data.title } : s))
        );
      }

      // If in Simulation Mode, trigger evaluation for candidate's answer
      if (isSimulation && currentList.length > 0) {
        const lastQuestion = [...currentList].reverse().find((m) => m.role === "assistant")?.content;
        if (lastQuestion) {
          evaluateCandidateAnswer(lastQuestion, promptText.trim());
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        toast.info("Generation stopped");
      } else {
        console.error("Send message error:", err);
        toast.error("Failed to generate AI response");
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_err_${Date.now()}`,
            role: "assistant",
            content: "⚠️ I encountered an error connecting to the AI provider. Please try sending your prompt again.",
            timestamp: new Date().toISOString(),
          }
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const evaluateCandidateAnswer = async (question, answer) => {
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEvaluationRequest: true,
          evaluationData: { question, answer },
          mode: activeMode,
          difficulty: activeDifficulty,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.evaluation) {
          setLatestEvaluation(data.evaluation);
        }
      }
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerate = () => {
    if (isLoading || messages.length <= 1) return;
    const lastUserIndex = [...messages].map(m => m.role).lastIndexOf("user");
    if (lastUserIndex === -1) return;

    const previousMessages = messages.slice(0, lastUserIndex);
    const lastUserPrompt = messages[lastUserIndex].content;

    sendMessagePrompt(lastUserPrompt, previousMessages);
  };

  const handleFeedback = async (messageId, feedbackType) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: m.feedback === feedbackType ? null : feedbackType } : m))
    );

    if (!activeChatId) return;
    try {
      await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: activeChatId, messageId, feedback: feedbackType }),
      });
      toast.success(feedbackType === "like" ? "Feedback recorded! 👍" : "Feedback recorded! 👎");
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) {
      toast.error("Please paste your resume content or details");
      return;
    }

    setIsAnalyzingResume(true);
    try {
      const res = await fetch("/api/chat/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: resumeText.trim(), targetRole }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowResumeModal(false);
        setResumeText("");
        
        // Inject analysis into active chat
        sendMessagePrompt(`Resume Analysis Request for "${targetRole}":\n\n${data.analysis}`);
        toast.success("Resume analysis generated!");
      } else {
        toast.error("Failed to analyze resume");
      }
    } catch (err) {
      console.error("Resume analysis error:", err);
      toast.error("Error conducting resume analysis");
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessagePrompt(input);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    if (!isFullscreen && chatContainerRef.current) {
      if (chatContainerRef.current.requestFullscreen) {
        chatContainerRef.current.requestFullscreen().catch(() => {});
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={chatContainerRef}
      className={`transition-all duration-300 flex overflow-hidden ${
        isFullscreen
          ? "fixed inset-0 z-50 p-2 md:p-4 bg-slate-950 dark:bg-slate-950 w-screen h-screen"
          : "w-full max-w-7xl mx-auto h-[calc(100vh-5rem)] md:h-[calc(100vh-5.5rem)] p-2 md:p-4"
      }`}
    >
      {/* SIDEBAR */}
      <div
        className={`transition-all duration-300 flex flex-col border-r border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 rounded-l-2xl ${
          sidebarOpen ? "w-72 md:w-80" : "w-0 hidden"
        }`}
      >
        {/* Sidebar Top: New Chat & Search */}
        <div className="p-3.5 space-y-3 border-b border-gray-200 dark:border-slate-800">
          <button
            onClick={() => createNewSession(activeMode, activeDifficulty)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-salmon/20 transition-all text-sm"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-800 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-strawberry"
            />
          </div>
        </div>

        {/* Sidebar Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="px-2 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Conversation History
          </p>
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No chat history found
            </div>
          ) : (
            filteredSessions.map((s) => {
              const isActive = s.chatId === activeChatId;
              const isEditing = editingTitleId === s.chatId;

              return (
                <div
                  key={s.chatId}
                  onClick={() => loadChatSession(s.chatId)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    isActive
                      ? "bg-strawberry/10 text-strawberry dark:bg-strawberry/20 dark:text-salmon font-semibold border border-salmon/30"
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-200/60 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <MessageSquare size={16} className="flex-shrink-0" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitleText}
                        onChange={(e) => setEditTitleText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRenameSession(s.chatId)}
                        onBlur={() => handleRenameSession(s.chatId)}
                        autoFocus
                        className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-strawberry text-xs text-gray-900 dark:text-white"
                      />
                    ) : (
                      <span className="truncate">{s.title || "Untitled Chat"}</span>
                    )}
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTitleId(s.chatId);
                          setEditTitleText(s.title || "");
                        }}
                        className="p-1 hover:text-strawberry"
                        title="Rename Chat"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(s.chatId, e)}
                        className="p-1 hover:text-red-500"
                        title="Delete Chat"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer: Resume Analyzer Trigger */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={() => setShowResumeModal(true)}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow transition-all"
          >
            <FileText size={15} className="text-salmon" />
            <span>Resume & Role Analyzer</span>
          </button>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-r-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-xl">
        {/* HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between p-3 border-b border-gray-200 dark:border-slate-800 gap-2">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
              title="Toggle Sidebar"
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            {/* Mode Selector Pill */}
            <select
              value={activeMode}
              onChange={(e) => {
                setActiveMode(e.target.value);
                createNewSession(e.target.value, activeDifficulty);
              }}
              className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-strawberry cursor-pointer"
            >
              {INTERVIEW_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} Mode
                </option>
              ))}
            </select>

            {/* Difficulty Pill */}
            <select
              value={activeDifficulty}
              onChange={(e) => setActiveDifficulty(e.target.value)}
              className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {DIFFICULTY_LEVELS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Simulation Mode Toggle Button */}
            <button
              onClick={() => {
                setIsSimulation((prev) => !prev);
                toast.info(!isSimulation ? "1-on-1 Interview Simulation Enabled!" : "Standard Chat Mode Enabled");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isSimulation
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700"
              }`}
              title="Interactive 1-on-1 question & evaluation mode"
            >
              <Award size={14} />
              <span>Simulation {isSimulation ? "ON" : "OFF"}</span>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCurrentMessages}
              title="Clear Messages"
              className="p-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/40 flex items-center gap-1 transition-all"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="p-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center gap-1 transition-all"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
            </button>
          </div>
        </div>

        {/* MESSAGES SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {isFetchingHistory ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
              <Loader2 className="animate-spin text-strawberry" size={32} />
              <span className="text-sm font-medium">Loading conversation history...</span>
            </div>
          ) : (
            messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id || index}
                  className={`flex gap-3 md:gap-4 ${isUser ? "justify-end" : "justify-start"} group`}
                >
                  {!isUser && (
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-strawberry to-salmon flex items-center justify-center flex-shrink-0 shadow-md shadow-salmon/20 text-white mt-1">
                      <Bot size={20} />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[88%] md:max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`relative rounded-2xl px-5 py-4 shadow-sm ${
                        isUser
                          ? "bg-gradient-to-r from-strawberry to-salmon text-white rounded-tr-none shadow-salmon/20"
                          : "bg-gray-50 dark:bg-slate-800/90 text-gray-900 dark:text-slate-100 rounded-tl-none border border-gray-200 dark:border-slate-700/80"
                      }`}
                    >
                      <FormatMessage content={message.content} />

                      {/* Action Bar for AI Assistant Messages */}
                      {!isUser && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200/50 dark:border-slate-700/50 text-xs text-gray-400 dark:text-slate-400">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              toast.success("Copied to clipboard!");
                            }}
                            className="hover:text-strawberry flex items-center gap-1"
                            title="Copy message"
                          >
                            <Copy size={13} />
                            <span>Copy</span>
                          </button>

                          <button
                            onClick={() => handleFeedback(message.id, "like")}
                            className={`flex items-center gap-1 ${
                              message.feedback === "like" ? "text-emerald-500 font-bold" : "hover:text-emerald-500"
                            }`}
                            title="Helpful response"
                          >
                            <ThumbsUp size={13} />
                          </button>

                          <button
                            onClick={() => handleFeedback(message.id, "dislike")}
                            className={`flex items-center gap-1 ${
                              message.feedback === "dislike" ? "text-red-500 font-bold" : "hover:text-red-500"
                            }`}
                            title="Unhelpful response"
                          >
                            <ThumbsDown size={13} />
                          </button>

                          {index === messages.length - 1 && (
                            <button
                              onClick={handleRegenerate}
                              className="ml-auto hover:text-strawberry flex items-center gap-1 text-xs"
                              title="Regenerate response"
                            >
                              <RotateCcw size={13} />
                              <span>Regenerate</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {message.timestamp && (
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 px-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      <User size={20} />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* SIMULATION MODE EVALUATION SCORECARD */}
          {isSimulation && latestEvaluation && (
            <div className="my-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-salmon/40 shadow-xl text-white space-y-4 animate-slide-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-strawberry dark:text-salmon flex items-center gap-2">
                  <BarChart2 size={20} />
                  Interview Answer Evaluation Scorecard
                </h3>
                <span className="text-xl font-extrabold text-emerald-400">
                  {latestEvaluation.scores?.overall}% Overall
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 p-3 rounded-xl text-center border border-slate-700">
                  <p className="text-[11px] text-slate-400 uppercase font-medium">Correctness</p>
                  <p className="text-lg font-bold text-white mt-0.5">{latestEvaluation.scores?.correctness}%</p>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl text-center border border-slate-700">
                  <p className="text-[11px] text-slate-400 uppercase font-medium">Communication</p>
                  <p className="text-lg font-bold text-white mt-0.5">{latestEvaluation.scores?.communication}%</p>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl text-center border border-slate-700">
                  <p className="text-[11px] text-slate-400 uppercase font-medium">Technical Depth</p>
                  <p className="text-lg font-bold text-white mt-0.5">{latestEvaluation.scores?.technicalDepth}%</p>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl text-center border border-slate-700">
                  <p className="text-[11px] text-slate-400 uppercase font-medium">Completeness</p>
                  <p className="text-lg font-bold text-white mt-0.5">{latestEvaluation.scores?.completeness}%</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-slate-300"><strong className="text-strawberry">Feedback:</strong> {latestEvaluation.feedback}</p>
                {latestEvaluation.modelAnswer && (
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 text-emerald-300">
                    <strong>Model 100% Ideal Answer:</strong>
                    <p className="mt-1 leading-relaxed text-slate-200">{latestEvaluation.modelAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STARTER PROMPTS WHEN CHAT IS FRESH */}
          {messages.length <= 1 && !isFetchingHistory && (
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3 text-center">
                Suggested Prompts for {activeMode}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
                {(STARTER_PROMPTS[activeMode] || STARTER_PROMPTS["Technical Interview"]).map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessagePrompt(promptText)}
                    disabled={isLoading}
                    className="p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 hover:bg-strawberry/5 dark:hover:bg-slate-800 hover:border-salmon/40 dark:hover:border-salmon/40 transition-all text-left text-xs font-medium text-gray-700 dark:text-slate-300 group"
                  >
                    <span className="group-hover:text-strawberry dark:group-hover:text-salmon transition-colors">
                      {promptText}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* THINKING LOADING INDICATOR */}
          {isLoading && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-strawberry to-salmon flex items-center justify-center text-white shadow-md">
                  <Bot size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-strawberry" />
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-300">
                    Generating answer using AI model...
                  </span>
                </div>
              </div>

              <button
                onClick={handleStopGeneration}
                className="px-3 py-1 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-red-200 dark:border-red-900/50 transition-all"
              >
                <Square size={12} />
                <span>Stop</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FORM BAR */}
        <div className="p-3 md:p-4 bg-gray-50/90 dark:bg-slate-900/90 border-t border-gray-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessagePrompt(input);
            }}
            className="flex items-end gap-2 max-w-5xl mx-auto"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask anything in ${activeMode}... (Enter to send, Shift+Enter for new line)`}
              className="flex-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-strawberry dark:focus:ring-salmon transition-all resize-none max-h-40"
              disabled={isLoading || isFetchingHistory}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading || isFetchingHistory}
              className="px-5 py-3 bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-salmon/30 flex-shrink-0"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* RESUME & ROLE ANALYZER MODAL */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="text-strawberry" size={22} />
                Resume & Target Role Analyzer
              </h3>
              <button
                onClick={() => setShowResumeModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Select Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-white"
                >
                  {TARGET_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Paste Resume Content / Text
                </label>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here (education, experience, technical skills, projects)..."
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-strawberry"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResumeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyzeResume}
                disabled={isAnalyzingResume || !resumeText.trim()}
                className="px-5 py-2 bg-gradient-to-r from-strawberry to-salmon text-white rounded-xl text-xs font-semibold shadow flex items-center gap-2 disabled:opacity-50"
              >
                {isAnalyzingResume ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{isAnalyzingResume ? "Analyzing Resume..." : "Analyze Resume"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotPage;

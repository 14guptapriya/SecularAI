import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Send, Copy, Bookmark, Volume2, Square, Menu, Plus, MessageSquare, X, Trash2, SendHorizontalIcon } from "lucide-react";
import { getScripture, getReligionByScriptureId, type ChatMessage } from "@/data/mockData";
import { getFaithIcon } from "@/components/FaithIcons";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const sentimentColors: Record<string, string> = {
  Contemplative: "262 60% 55%",
  Peaceful: "152 50% 45%",
  Motivating: "28 80% 52%",
  Reflective: "220 60% 55%",
  Instructional: "42 70% 48%",
};

// Parse [VERSE title="..."]...[/VERSE] tags from the AI response
function parseVerses(content: string): { cleanText: string; verses: { reference: string; text: string }[] } {
  const verses: { reference: string; text: string }[] = [];
  const regex = /\[VERSE title="(.+?)"\]([\s\S]*?)\[\/VERSE\]/g;
  const cleanText = content.replace(regex, (_, title, text) => {
    verses.push({ reference: title, text: text.trim() });
    return "";
  }).trim();
  return { cleanText, verses };
}

type Session = {
  id: string;
  title: string;
  created_at: string;
};

const ChatPage = () => {
  const { scriptureId } = useParams<{ scriptureId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Open by default on large screens
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [showOnlyCurrent, setShowOnlyCurrent] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scripture = getScripture(scriptureId || "");
  const religion = getReligionByScriptureId(scriptureId || "");
  const colorVar = religion?.colorVar || "--primary";
  const Icon = religion ? getFaithIcon(religion.id) : getFaithIcon("hinduism");

  // Fetch token
  const token = localStorage.getItem("secularai-token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchSessions();
  }, [scriptureId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/sessions/${scriptureId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && !currentSessionId) {
          loadSession(data[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    }
  };

  const loadSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsSidebarOpen(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/messages/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((m: any) => ({
          id: m.id.toString(),
          role: m.role,
          content: m.content,
          verses: m.verses || undefined,
          sentiment: m.sentiment || undefined
        }));
        setMessages(formatted);
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  };

  const createNewSession = async () => {
    const title = input.trim() ? input.substring(0, 30) + "..." : "New Conversation";
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          scripture_id: scriptureId,
          religion_id: religion?.id,
          title
        })
      });
      if (res.ok) {
        const newSession = await res.json();
        setSessions([newSession, ...sessions]);
        setCurrentSessionId(newSession.id);
        setMessages([]);
        return newSession.id;
      }
    } catch (e) {
      console.error("Failed to create session", e);
    }
    return null;
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSessions(sessions.filter((s) => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    } finally {
      setSessionToDelete(null);
    }
  };

  const filteredSessions = sessions
    .filter((s) => s.title.toLowerCase().includes(sidebarSearch.toLowerCase()))
    .filter((s) => (showOnlyCurrent && currentSessionId ? s.id === currentSessionId : true));

  if (!scripture || !religion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0515]">
        <p className="text-gray-400">Scripture not found</p>
      </div>
    );
  }

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userText },
    ]);
    setIsLoading(true);

    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = await createNewSession();
    }

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`${BACKEND_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_query: userText,
          religion: religion.name,
          scripture: scripture.name,
          session_id: activeSessionId
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const { cleanText, verses } = parseVerses(data.answer);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: cleanText,
          verses: verses.length > 0 ? verses : undefined,
        },
      ]);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: "Sorry, I couldn't connect to the server. Please check that the backend is running and try again.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      // Refresh sidebar titles if it was a new chat
      if (!currentSessionId) fetchSessions();
    }
  };

  const handleFollowUp = (text: string) => {
    setInput(text);
  };

  return (
    <div className="min-h-screen bg-[#0a0515] flex overflow-hidden">

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 xl:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile drawer) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[300px] bg-[#1a1428] border-r border-amber-500/20 transform transition-all duration-300 ease-in-out xl:relative xl:w-72 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full xl:-ml-72"}`}>
        <div className="h-full flex flex-col pt-4">
          <div className="px-4 pb-3 border-b border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <button onClick={() => navigate("/home")} className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors text-gray-400 hover:text-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button className="xl:hidden p-2 rounded-lg text-gray-400 hover:text-gray-100" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full rounded-lg border border-amber-500/30 bg-[#0f0620] px-9 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                {sidebarSearch && (
                  <button
                    onClick={() => setSidebarSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-amber-500/10 text-gray-400"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={() => { setCurrentSessionId(null); setMessages([]); setIsSidebarOpen(false); }}
                className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                title="Start a new chat"
              >
                New Chat
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOnlyCurrent}
                  onChange={(e) => setShowOnlyCurrent(e.target.checked)}
                  className="h-4 w-4 rounded border border-amber-500/30 focus:ring-amber-500"
                />
                Active chat only
              </label>
              <button
                onClick={() => { setSidebarSearch(""); setShowOnlyCurrent(false); }}
                className="text-amber-400 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2 custom-scrollbar">
            {filteredSessions.length === 0 ? (
              <p className="px-3 text-xs text-gray-400/60 italic">No matching history.</p>
            ) : (
              filteredSessions.map(s => (
                <div key={s.id} className={`group border border-amber-500/20 bg-[#0f0620] px-3 py-2 rounded-xl transition-colors ${currentSessionId === s.id ? "ring-2 ring-amber-500/60 bg-amber-500/10" : "hover:bg-amber-500/10"}`}>
                  <button
                    onClick={() => loadSession(s.id)}
                    className="flex items-center gap-2 w-full"
                  >
                    <span className={`w-2 h-2 rounded-full ${currentSessionId === s.id ? "bg-amber-500" : "bg-gray-500"}`}></span>
                    <MessageSquare size={14} className={`shrink-0 ${currentSessionId === s.id ? "text-amber-400" : "text-gray-400"}`} />
                    <span className="text-sm truncate text-left w-full text-gray-100">{s.title}</span>
                  </button>

                  <AlertDialog open={sessionToDelete === s.id} onOpenChange={(open) => { if (!open) setSessionToDelete(null) }}>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={() => setSessionToDelete(s.id)}
                        className={"p-1.5 rounded-md transition-opacity hover:bg-red-500/10 text-gray-400 hover:text-red-400 " + (currentSessionId === s.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete? This will erase all messages in this conversation.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteSession(s.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>

          {/* User Profile Area */}
          <div className="p-4 border-t border-amber-500/20">
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                {(localStorage.getItem("secularai-username") || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">{localStorage.getItem("secularai-username") || "User"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen transition-all duration-300">

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-amber-500/20 shrink-0 bg-[#0a0515]/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 -ml-2 rounded-lg hover:bg-amber-500/10 transition-colors text-gray-300"
                title="Toggle Sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `hsl(var(${colorVar}) / 0.15)` }}>
                  <Icon size={14} color={`hsl(var(${colorVar}))`} />
                </div>
                <span className="font-semibold text-[15px] text-gray-100">{scripture.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Scroll container */}
        <div className="flex-1 overflow-y-auto w-full relative bg-[#0a0515]">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.length === 0 && !isLoading ? (
              /* Welcome state */
              <div className="flex flex-col items-center text-center pt-[10vh] animate-fade-in-up">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: `hsl(var(${colorVar}) / 0.15)` }}>
                  <Icon size={32} color={`hsl(var(${colorVar}))`} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-100">Ask {scripture.name}</h2>
                <p className="text-gray-400 text-[15px] mb-10 max-w-sm">{scripture.tagline}</p>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto">
                  {["What is the central message?", "Teach me about the core teachings", "How to find inner peace?"].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="flex-1 px-4 py-3 rounded-xl border border-amber-500/30 bg-[#1a1428]/60 text-sm text-gray-100 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all text-center sm:text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                    {msg.role === "user" ? (
                      <div className="max-w-[85%] px-5 py-3 rounded-2xl rounded-br-sm bg-amber-500/20 text-gray-100 text-[15px] border border-amber-500/30">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="w-full max-w-[95%] space-y-3">
                        {/* AI label */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500/30 flex items-center justify-center border border-amber-500/50">
                            <span className="text-[11px] font-bold text-amber-400">S</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-100">SecularAI</span>
                          {msg.sentiment && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium ml-2 border"
                              style={{
                                background: `hsl(${sentimentColors[msg.sentiment] || "262 60% 55%"} / 0.15)`,
                                color: `hsl(${sentimentColors[msg.sentiment] || "262 60% 55%"})`,
                                borderColor: `hsl(${sentimentColors[msg.sentiment] || "262 60% 55%"} / 0.3)`,
                              }}
                            >
                              {msg.sentiment}
                            </span>
                          )}
                        </div>

                        {/* Message content - No left border as requested */}
                        <div className="pl-9 format-markdown">
                          <p className="text-[15px] leading-relaxed text-gray-100 whitespace-pre-wrap">{msg.content}</p>

                          {/* Verse tiles */}
                          {msg.verses?.map((v, i) => (
                            <div
                              key={i}
                              className="mt-5 rounded-xl p-5 border border-amber-500/20 bg-[#1a1428]/60 shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: `hsl(var(${colorVar}))` }}>
                                  {v.reference}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button className="p-1.5 rounded-md hover:bg-amber-500/10 transition-colors text-gray-400 hover:text-gray-100">
                                    <Volume2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    className="p-1.5 rounded-md hover:bg-amber-500/10 transition-colors text-gray-400 hover:text-gray-100"
                                    onClick={() => navigator.clipboard.writeText(v.text)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                  <button className="p-1.5 rounded-md hover:bg-amber-500/10 transition-colors text-gray-400 hover:text-gray-100">
                                    <Bookmark className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <p className="font-serif text-[15px] italic leading-relaxed text-gray-100">
                                "{v.text}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Better Loading Shimmer */}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in w-full">
                    <div className="w-full max-w-[95%] space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/30 flex items-center justify-center border border-amber-500/50">
                          <span className="text-[11px] font-bold text-amber-400">S</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-100">SecularAI</span>
                      </div>

                      <div className="pl-9 w-full">
                        <div className="space-y-3 w-full max-w-2xl">
                          <div className="h-4 bg-amber-500/20 rounded-md w-full animate-pulse"></div>
                          <div className="h-4 bg-amber-500/20 rounded-md w-[90%] animate-pulse"></div>
                          <div className="h-4 bg-amber-500/20 rounded-md w-[95%] animate-pulse"></div>
                          <div className="h-4 bg-amber-500/20 rounded-md w-[70%] animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Floating input */}
        <div className="shrink-0 p-4 pb-6 bg-[#0a0515]">
          <div className="max-w-3xl mx-auto">
            <PromptInput
              onSubmit={handleSend}
              className="bg-[#1a1428]/60 border border-amber-500/30 rounded-2xl transition-all"
            >
              <PromptInputBody className="bg-transparent">
                <PromptInputTextarea
                  onChange={(e) => !isLoading && setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!isLoading) handleSend();
                    }
                  }}
                  value={input}
                  disabled={isLoading}
                  placeholder={isLoading ? "Generating response..." : `Ask about ${scripture.name}...`}
                  className="bg-transparent text-[15px] text-gray-100 placeholder:text-gray-500 resize-none min-h-[44px] max-h-32 disabled:opacity-50 py-3 custom-scrollbar"
                />
              </PromptInputBody>
              <PromptInputFooter className="bg-transparent tracking-tight">
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger
                      className="text-muted-foreground hover:text-foreground"
                      disabled={true}
                    />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                </PromptInputTools>
                {isLoading ? (
                  <button
                    onClick={stopGeneration}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <PromptInputSubmit
                    disabled={!input.trim() || isLoading}
                    status="ready"
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <SendHorizontalIcon className="w-4 h-4" />
                  </PromptInputSubmit>
                )}
              </PromptInputFooter>
            </PromptInput>

            <p className="text-center text-[11px] text-gray-500 mt-3 font-medium">
              AI can make mistakes. Verify important information from original texts.
            </p>
          </div>
        </div>

      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MessageSquare, History, Settings, LogOut, Menu, X, Sparkles, Share2, BookOpen } from "lucide-react";
import { religions, dailyWisdoms, getReligionColor } from "@/data/mockData";
import { getFaithIcon } from "@/components/FaithIcons";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("secularai-token");
  const username = localStorage.getItem("secularai-username") || "User";

  const handleLogout = () => {
    localStorage.removeItem("secularai-token");
    localStorage.removeItem("secularai-username");
    localStorage.removeItem("secularai-email");
    navigate("/login");
  };

  const handleSelectReligion = (religionId: string) => {
    const religion = religions.find((r) => r.id === religionId);
    if (religion && religion.scriptures.length > 0) {
      const firstAvailableScripture = religion.scriptures.find((s) => s.available);
      if (firstAvailableScripture) {
        navigate(`/chat/${firstAvailableScripture.id}`);
      }
    }
  };

  const filteredReligions = religions.filter((religion) =>
    religion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    religion.scriptures.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0a0515] flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[#1a1428] border-r border-amber-500/20 transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-4">
          {/* Close Button & Logo */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/home")}
              className="hover:opacity-80 transition-opacity flex items-center gap-3 flex-1"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-300/20 to-amber-600/20 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                <Logo size={32} />
              </div>
              <div className="flex flex-col items-start">
                <div className="text-sm font-bold tracking-tight">
                  Secular<span className="text-amber-400">AI</span>
                </div>
                <div className="text-[10px] text-amber-400/60 font-medium">Wisdom</div>
              </div>
            </button>
            <button onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-amber-500/10 rounded-lg transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* New Chat Button */}
          {isAuthenticated && (
            <button className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium transition-colors mb-4 border border-amber-500/40">
              <Plus size={18} />
              New Chat
            </button>
          )}

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            <div className="text-xs font-semibold text-amber-400/60 uppercase tracking-wider px-2 py-4">
              Menu
            </div>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-500/10 transition-colors text-gray-100 flex items-center gap-2">
              <MessageSquare size={16} />
              <span className="text-sm">New Synthesis</span>
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-500/10 transition-colors text-gray-100 flex items-center gap-2">
              <History size={16} />
              <span className="text-sm">Chat History</span>
            </button>

            <div className="border-t border-amber-500/20 my-4"></div>

            <div className="text-xs font-semibold text-amber-400/60 uppercase tracking-wider px-2 py-4">
              Faiths
            </div>
            {religions.map((religion) => {
              const Icon = getFaithIcon(religion.id);
              return (
                <button
                  key={religion.id}
                  onClick={() => handleSelectReligion(religion.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-500/10 transition-colors text-gray-100 flex items-center gap-2 group"
                >
                  <Icon size={16} color={`hsl(var(${religion.colorVar}))`} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm">{religion.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-amber-500/20 pt-4 space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-500/10 transition-colors text-gray-100 flex items-center gap-2">
              <Settings size={16} />
              <span className="text-sm">Settings</span>
            </button>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-500/10 transition-colors text-gray-100 flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="text-sm">Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="border-b border-amber-500/20 px-4 py-3 flex items-center justify-between sticky top-0 z-40 bg-[#0a0515]/95">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-amber-500/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1 flex items-center justify-center md:justify-start md:ml-4">
            <h1 className="text-xl font-semibold text-gray-100"></h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition-colors">
                    {username[0].toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <span className="text-sm">{username}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-100 hover:bg-amber-500/10 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-all"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-4xl">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                What are you <span className="text-white">exploring today?</span>
              </h1>
              <p className="text-lg text-gray-300">
                Dive into sacred texts across multiple faiths
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-12">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400/60" />
              <input
                type="text"
                placeholder="Search across all scriptures, ask questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#1a1428] border border-amber-500/30 text-base text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              />
            </div>

            {/* Quick Start Religious Tiles */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-amber-400/70 uppercase tracking-wider mb-4">Start Exploring</h2>
              {filteredReligions.length === 0 && searchQuery.trim() ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No scriptures found matching "{searchQuery}"</p>
                  <p className="text-gray-500 text-sm mt-2">Try searching for a religion or scripture name</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReligions.map((religion) => {
                    const Icon = getFaithIcon(religion.id);
                    const firstAvailable = religion.scriptures.find((s) => s.available);
                    return (
                      <button
                        key={religion.id}
                        onClick={() => handleSelectReligion(religion.id)}
                        disabled={!firstAvailable}
                        className="group relative text-left rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#1a1428] to-[#0f0620] hover:bg-[#1a1428]/80 hover:border-amber-500/40 p-5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {/* Icon background */}
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300 group-hover:scale-110"
                          style={{
                            background: `hsl(var(${religion.colorVar}) / 0.15)`,
                          }}
                        >
                          <Icon size={24} color={`hsl(var(${religion.colorVar}))`} />
                        </div>

                        <h3 className="text-base font-semibold mb-1 text-gray-100">{religion.name}</h3>
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                          {religion.description || `Explore ${religion.name} wisdom and teachings`}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{religion.scriptures.filter((s) => s.available).length} texts</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Daily Wisdom */}
            <div className="mt-16 pt-8 border-t border-amber-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-semibold text-amber-400/70 uppercase tracking-wider">Daily Wisdom</h2>
              </div>

              <div className="relative rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#1a1428] to-[#0f0620] p-6 md:p-8">
                <p className="font-serif text-lg md:text-xl italic leading-relaxed mb-6 text-gray-100">
                  "{dailyWisdoms.buddhism?.verse || 'Conquer anger with non-anger. Conquer badness with goodness.'}"
                </p>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: `hsl(var(${dailyWisdoms.buddhism?.colorVar || "--primary"}))` }}
                    >
                      {dailyWisdoms.buddhism?.reference || "Dhammapada 223"}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">— {dailyWisdoms.buddhism?.religion || "Buddhism"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default HomePage;

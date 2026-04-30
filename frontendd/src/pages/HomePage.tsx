import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Share2, BookOpen, Sparkles, LogOut } from "lucide-react";
import { religions, dailyWisdoms, getReligionColor } from "@/data/mockData";
import { getFaithIcon } from "@/components/FaithIcons";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HomePage = () => {
  const [activeReligion, setActiveReligion] = useState(religions[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const activeRel = useMemo(() => religions.find((r) => r.id === activeReligion)!, [activeReligion]);
  const colorVar = activeRel.colorVar;

  const handleLogout = () => {
    localStorage.removeItem("secularai-token");
    localStorage.removeItem("secularai-username");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity duration-150 cursor-pointer"
          >
            Secular<span className="text-primary">AI</span>
          </button>

          {/* Search bar - hidden on mobile, shown md+ */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search across all scriptures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary/60 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {localStorage.getItem("secularai-token") ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer"
                    title={localStorage.getItem("secularai-username") || "User"}
                  >
                    <span className="text-xs font-bold text-primary">
                      {(localStorage.getItem("secularai-username") || "U")[0].toUpperCase()}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <span className="text-sm">{localStorage.getItem("secularai-username")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search across all scriptures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary/60 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
        {/* Religion Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-5 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          {religions.map((r) => {
            const Icon = getFaithIcon(r.id);
            const isActive = r.id === activeReligion;
            return (
              <button
                key={r.id}
                onClick={() => setActiveReligion(r.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
                  }`}
              >
                <Icon size={18} color={isActive ? `hsl(var(${r.colorVar}))` : "currentColor"} />
                <span>{r.name}</span>
                {isActive && (
                  <div
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all duration-500"
                    style={{
                      background: `hsl(var(${r.colorVar}))`,
                      boxShadow: `0 0 12px hsl(var(${r.colorVar}) / 0.5)`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Scripture Grid */}
        <section className="animate-fade-in" key={activeReligion}>
          <h2 className="text-lg font-semibold mb-4">
            {activeRel.name} Scriptures
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRel.scriptures.map((s) => (
              <button
                key={s.id}
                onClick={() => s.available && navigate(`/chat/${s.id}`)}
                disabled={!s.available}
                className="group relative text-left rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:opacity-80 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {/* Top icon area */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300"
                  style={{
                    background: `hsl(var(${colorVar}) / 0.1)`,
                  }}
                >
                  {(() => {
                    const Icon = getFaithIcon(activeReligion);
                    return <Icon size={24} color={`hsl(var(${colorVar}))`} />;
                  })()}
                </div>

                <h3 className="text-base font-semibold mb-1 text-card-foreground">{s.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.tagline}</p>

                {s.chapters && (
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    {s.chapters && <span>{s.chapters} chapters</span>}
                    {s.verses && <span>• {s.verses.toLocaleString()} verses</span>}
                  </div>
                )}

                {!s.available && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase glass border border-border/50 text-muted-foreground">
                    Coming Soon
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Daily Wisdom */}
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Daily Wisdom</h2>
          </div>
          <div
            className="relative rounded-2xl border border-border/60 bg-card p-6 md:p-8 overflow-hidden shimmer"
          >
            <div className="relative z-10">
              <p className="font-serif text-lg md:text-xl italic leading-relaxed text-card-foreground mb-4">
                "{dailyWisdoms[activeReligion]?.verse || dailyWisdoms['buddhism'].verse}"
              </p>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: `hsl(var(${getReligionColor(dailyWisdoms[activeReligion]?.religionId || 'buddhism')}))` }}
                  >
                    {dailyWisdoms[activeReligion]?.reference || dailyWisdoms['buddhism'].reference}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">— {dailyWisdoms[activeReligion]?.religion || dailyWisdoms['buddhism'].religion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors">
                    <BookOpen className="h-3.5 w-3.5" />
                    Read Context
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors">
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;

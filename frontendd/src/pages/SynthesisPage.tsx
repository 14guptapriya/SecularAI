import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, Share2, Play, Pause, ChevronDown, Sparkles } from "lucide-react";
import { religions } from "@/data/mockData";
import { getFaithIcon } from "@/components/FaithIcons";
import { ThemeToggle } from "@/components/ThemeToggle";

const FAITH_DATA: Record<
  string,
  {
    scriptureId: string;
    scripture: string;
    reference: string;
    verse: string;
    interpretation: { title: string; text: string };
  }
> = {
  buddhism: {
    scripture: "Dhammapada",
    scriptureId: "dhammapada",
    reference: "Dhammapada 1.1-2",
    verse: "Mind is the forerunner of all actions. All deeds are led by mind, created by mind. If one speaks or acts with a corrupt mind, suffering follows, as the wheel follows the hoof of an ox.",
    interpretation: {
      title: "The Power of Mental Intention",
      text: "This foundational teaching establishes that all of our experiences — suffering and happiness alike — originate in the mind. Our thoughts shape our reality, making mental discipline the most important spiritual practice.",
    },
  },
  hinduism: {
    scripture: "Bhagavad Gita",
    scriptureId: "bhagavad_gita",
    reference: "Bhagavad Gita 2.47",
    verse: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself the cause of the results of your activities.",
    interpretation: {
      title: "Detachment in Action",
      text: "The concept of nishkama karma — acting without attachment to outcomes — is a cornerstone of Hindu ethical philosophy and a path to liberation.",
    },
  },
  judaism: {
    scripture: "Torah",
    scriptureId: "torah",
    reference: "Leviticus 19:18",
    verse: "Love your neighbor as yourself. I am the Lord.",
    interpretation: {
      title: "The Golden Rule",
      text: "This commandment encapsulates the ethical heart of Jewish law, forming the basis of interpersonal relationships and social justice in the Torah.",
    },
  },
  sikhism: {
    scripture: "Guru Granth Sahib",
    scriptureId: "ggsahib",
    reference: "SGGS 349",
    verse: "Recognize the Lord's light within all, and do not consider social class or status; there are no classes in the next world.",
    interpretation: {
      title: "Universal Equality",
      text: "Sikhism emphasizes the divine spark present in every human being, rejecting caste distinctions as contrary to God's will and the teachings of the Gurus.",
    },
  },
  christianity: {
    scripture: "Bible",
    scriptureId: "bible",
    reference: "Proverbs 23:7",
    verse: "For as he thinketh in his heart, so is he: Eat and drink, saith he to thee; but his heart is not with thee.",
    interpretation: {
      title: "Thoughts Define Character",
      text: "This proverb speaks to the same truth — our inner thoughts define who we truly are, regardless of outward appearances. Authentic character is revealed through the quality of our thinking, not our words.",
    },
  },
  islam: {
    scripture: "Quran",
    scriptureId: "quran",
    reference: "Quran 57:4",
    verse: "And He is with you wherever you are. And Allah, of what you do, is Seeing.",
    interpretation: {
      title: "Divine Omnipresence",
      text: "The concept of Allah's constant awareness encourages mindfulness in every action, knowing that divine witness accompanies every moment of our lives.",
    },
  },
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const SynthesisPage = () => {
  const navigate = useNavigate();

  const [leftReligionId, setLeftReligionId] = useState("buddhism");
  const [rightReligionId, setRightReligionId] = useState("christianity");
  const [leftDropdownOpen, setLeftDropdownOpen] = useState(false);
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [leftAnswer, setLeftAnswer] = useState<string | null>(null);
  const [rightAnswer, setRightAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const leftPanel = FAITH_DATA[leftReligionId];
  const rightPanel = FAITH_DATA[rightReligionId];

  const LeftIcon = getFaithIcon(leftReligionId);
  const RightIcon = getFaithIcon(rightReligionId);
  const leftRel = religions.find((r) => r.id === leftReligionId)!;
  const rightRel = religions.find((r) => r.id === rightReligionId)!;

  const handleSelectLeft = (id: string) => {
    if (id === rightReligionId) return;
    setLeftReligionId(id);
    setLeftAnswer(null);
    setRightAnswer(null);
    setLeftDropdownOpen(false);
  };

  const handleSelectRight = (id: string) => {
    if (id === leftReligionId) return;
    setRightReligionId(id);
    setLeftAnswer(null);
    setRightAnswer(null);
    setRightDropdownOpen(false);
  };

  const handleSynthesize = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setLeftAnswer(null);
    setRightAnswer(null);
    setError(null);

    try {
      const [leftRes, rightRes] = await Promise.all([
        fetch(`${BACKEND_URL}/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_query: prompt.trim(),
            religion: leftReligionId,
            scripture: leftPanel.scriptureId,
          }),
        }),
        fetch(`${BACKEND_URL}/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_query: prompt.trim(),
            religion: rightReligionId,
            scripture: rightPanel.scriptureId,
          }),
        }),
      ]);

      if (!leftRes.ok || !rightRes.ok) throw new Error("Server error");

      const [leftData, rightData] = await Promise.all([
        leftRes.json(),
        rightRes.json(),
      ]);
      setLeftAnswer(leftData.answer);
      setRightAnswer(rightData.answer);
    } catch {
      setError("Could not connect to the server. Please make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Mobile-friendly Faith Selector ─────────────────────────────────────────
  const FaithSelector = ({
    side,
    selectedId,
    onSelect,
    isOpen,
    onToggle,
  }: {
    side: "left" | "right";
    selectedId: string;
    onSelect: (id: string) => void;
    isOpen: boolean;
    onToggle: () => void;
  }) => {
    const rel = religions.find((r) => r.id === selectedId)!;
    const Icon = getFaithIcon(selectedId);
    const otherId = side === "left" ? rightReligionId : leftReligionId;

    return (
      <div className="relative flex-1 min-w-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-border transition-all duration-200"
          style={{
            boxShadow: isOpen ? `0 0 0 1.5px hsl(var(${rel.colorVar}) / 0.4)` : undefined,
          }}
        >
          {/* Icon */}
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: `hsl(var(${rel.colorVar}) / 0.18)`,
              boxShadow: `0 0 10px hsl(var(${rel.colorVar}) / 0.2)`,
            }}
          >
            <Icon size={13} color={`hsl(var(${rel.colorVar}))`} />
          </div>

          {/* Text — truncate on small screens */}
          <div className="text-left min-w-0 flex-1 overflow-hidden">
            <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground leading-none mb-0.5 truncate">
              {side === "left" ? "Left Tradition" : "Right Tradition"}
            </p>
            <p
              className="text-xs sm:text-sm font-bold leading-none truncate"
              style={{ color: `hsl(var(${rel.colorVar}))` }}
            >
              {rel.name}
            </p>
          </div>

          <ChevronDown
            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className={`absolute top-full mt-2 z-50 w-48 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden ${
              side === "right" ? "right-0" : "left-0"
            }`}
          >
            <div className="p-1.5">
              {religions
                .filter((r) => r.id !== otherId)
                .map((r) => {
                  const I = getFaithIcon(r.id);
                  const isSelected = r.id === selectedId;
                  return (
                    <button
                      key={r.id}
                      onClick={() => onSelect(r.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors text-left"
                      style={{
                        background: isSelected ? `hsl(var(${r.colorVar}) / 0.1)` : undefined,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `hsl(var(${r.colorVar}) / 0.15)` }}
                      >
                        <I size={12} color={`hsl(var(${r.colorVar}))`} />
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={isSelected ? { color: `hsl(var(${r.colorVar}))` } : undefined}
                      >
                        {r.name}
                      </span>
                      {isSelected && (
                        <span
                          className="ml-auto text-xs font-bold"
                          style={{ color: `hsl(var(${r.colorVar}))` }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Verse Panel ─────────────────────────────────────────────────────────────
  const VersePanel = ({
    data,
    Icon,
    rel,
    answer,
  }: {
    data: (typeof FAITH_DATA)[string];
    Icon: React.ComponentType<{ size: number; color: string }>;
    rel: (typeof religions)[number];
    answer: string | null;
  }) => (
    <div className="space-y-3 sm:space-y-4">
      {/* Religion header */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `hsl(var(${rel.colorVar}) / 0.15)`,
            boxShadow: `0 0 14px hsl(var(${rel.colorVar}) / 0.15)`,
          }}
        >
          <Icon size={15} color={`hsl(var(${rel.colorVar}))`} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{rel.name}</p>
          <p className="text-sm font-bold text-foreground">{data.scripture}</p>
        </div>
      </div>

      {/* Verse card */}
      <div
        className="relative rounded-2xl border border-border/50 bg-card overflow-hidden"
        style={{
          borderLeft: `3px solid hsl(var(${rel.colorVar}))`,
          background: `linear-gradient(135deg, hsl(var(${rel.colorVar}) / 0.04) 0%, transparent 60%)`,
        }}
      >
        <div
          className="absolute top-0 left-0 w-28 h-16 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top left, hsl(var(${rel.colorVar})), transparent 70%)`,
          }}
        />
        <div className="relative p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest"
              style={{ color: `hsl(var(${rel.colorVar}))` }}
            >
              {data.reference}
            </span>
            <div className="flex gap-1">
              <button className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors">
                <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors">
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <p className="font-serif text-sm sm:text-[15px] italic leading-relaxed sm:leading-[1.75] text-card-foreground/90">
            "{data.verse}"
          </p>
        </div>
      </div>

      {/* Loading dots */}
      {isLoading && !answer && (
        <div
          className="rounded-xl px-4 py-3 sm:px-5 sm:py-4 border border-border/30"
          style={{ background: `hsl(var(${rel.colorVar}) / 0.05)` }}
        >
          <div className="flex gap-1.5 items-center">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}ms`, background: `hsl(var(${rel.colorVar}) / 0.6)` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* AI Answer */}
      {answer && (
        <div
          className="rounded-xl border border-border/30 overflow-hidden animate-fade-in"
          style={{
            borderLeft: `3px solid hsl(var(${rel.colorVar}))`,
            background: `linear-gradient(135deg, hsl(var(${rel.colorVar}) / 0.08) 0%, hsl(var(${rel.colorVar}) / 0.02) 100%)`,
          }}
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="h-3 w-3" style={{ color: `hsl(var(${rel.colorVar}))` }} />
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: `hsl(var(${rel.colorVar}))` }}
              >
                AI Response · {rel.name}
              </p>
            </div>
            <p className="text-sm text-card-foreground/85 leading-relaxed whitespace-pre-wrap">
              {answer}
            </p>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div
        className="rounded-xl p-4 sm:p-5 border border-border/30"
        style={{ background: "hsl(var(--secondary) / 0.3)" }}
      >
        <h4 className="text-sm font-bold mb-1.5 text-foreground">
          {data.interpretation.title}
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {data.interpretation.text}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-background flex flex-col transition-colors duration-300"
      onClick={() => {
        setLeftDropdownOpen(false);
        setRightDropdownOpen(false);
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-4 py-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate("/home")}
              className="p-2 rounded-lg hover:bg-secondary/60 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="font-bold text-sm tracking-tight">Cross-Faith Synthesis</span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">
                Explore wisdom across traditions
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Faith Selectors Row — flex with min-w-0 to prevent overflow */}
      <div
        className="border-b border-border/30"
        style={{ background: "hsl(var(--card) / 0.4)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2">
          <FaithSelector
            side="left"
            selectedId={leftReligionId}
            onSelect={handleSelectLeft}
            isOpen={leftDropdownOpen}
            onToggle={() => {
              setLeftDropdownOpen((v) => !v);
              setRightDropdownOpen(false);
            }}
          />

          {/* VS divider — compact on mobile */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="h-px w-3 sm:w-5 bg-border/60" />
            <span className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase">
              vs
            </span>
            <div className="h-px w-3 sm:w-5 bg-border/60" />
          </div>

          <FaithSelector
            side="right"
            selectedId={rightReligionId}
            onSelect={handleSelectRight}
            isOpen={rightDropdownOpen}
            onToggle={() => {
              setRightDropdownOpen((v) => !v);
              setLeftDropdownOpen(false);
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* On mobile: single column tabs. On md+: side-by-side grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <VersePanel data={leftPanel} Icon={LeftIcon} rel={leftRel} answer={leftAnswer} />

          {/* Divider visible only on mobile between the two panels */}
          <div className="block md:hidden h-px bg-border/40 -mx-3" />

          <VersePanel data={rightPanel} Icon={RightIcon} rel={rightRel} answer={rightAnswer} />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-2xl bg-destructive/8 border border-destructive/25 text-xs sm:text-sm text-destructive text-center flex items-center justify-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Audio player */}
        <div className="mt-6 sm:mt-8 rounded-2xl border border-border/50 bg-card/80 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 backdrop-blur-sm">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, hsl(var(${leftRel.colorVar})), hsl(var(${rightRel.colorVar})))`,
              boxShadow: `0 4px 14px hsl(var(${leftRel.colorVar}) / 0.35)`,
            }}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            ) : (
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white ml-0.5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground mb-1.5 sm:mb-2">
              Listen to Synthesis
            </p>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full w-1/3 transition-all duration-300"
                style={{
                  background: `linear-gradient(90deg, hsl(var(${leftRel.colorVar})), hsl(var(${rightRel.colorVar})))`,
                }}
              />
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground tabular-nums flex-shrink-0">
            2:45
          </span>
        </div>
      </div>

      {/* Bottom bar — fixed height, no overflow */}
      <div className="sticky bottom-0 glass border-t border-border/40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-2.5 pb-4 sm:pb-5">

          {/* Faith tags — hidden on very small screens to save space */}
          <div className="hidden xs:flex sm:flex items-center gap-2 mb-2.5 flex-wrap">
            {[leftRel, rightRel].map((r) => {
              const I = getFaithIcon(r.id);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/50 bg-card/60 text-xs font-semibold"
                  style={{ color: `hsl(var(${r.colorVar}))` }}
                >
                  <I size={10} color={`hsl(var(${r.colorVar}))`} />
                  <span>{r.name}</span>
                </div>
              );
            })}
            <span className="text-xs text-muted-foreground/40 hidden sm:inline">
              · Ask anything about these traditions
            </span>
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSynthesize()}
              placeholder="Ask SecularAI to synthesize..."
              disabled={isLoading}
              className="flex-1 min-w-0 h-10 sm:h-11 px-4 sm:px-5 rounded-full bg-secondary/50 border border-border/50 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSynthesize}
              disabled={!prompt.trim() || isLoading}
              className="h-10 sm:h-11 px-4 sm:px-6 rounded-full text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-1.5 flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, hsl(var(${leftRel.colorVar})), hsl(var(${rightRel.colorVar})))`,
                boxShadow:
                  !prompt.trim() || isLoading
                    ? undefined
                    : `0 4px 16px hsl(var(${leftRel.colorVar}) / 0.4)`,
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Synthesizing…</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Synthesize</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynthesisPage;
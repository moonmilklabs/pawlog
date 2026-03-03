import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const MOBILE_DAYS_TO_SHOW = 3;
const DESKTOP_DAYS_TO_SHOW = 7;
const MOBILE_BREAKPOINT = 768;

const EMOJI_OPTIONS = [
  "🍖","🥩","🍗","🐟","🥕","💊","🛁","🦷","🪮","🌅","🌆","🏃","🎾","🧸","💉","❤️","💤","🌿","🚗","🏥"
];

type Habit = {
  id: string;
  label: string;
  icon: string;
};

type Pet = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  habits: Habit[];
};

const DEFAULT_PETS: Pet[] = [
  {
    id: 1,
    name: "Zoe",
    emoji: "🐶",
    color: "#3b9ede",
    habits: [
      { id: "h1", label: "Breakfast", icon: "🍖" },
      { id: "h2", label: "Lunch", icon: "🥩" },
      { id: "h3", label: "Dinner", icon: "🍗" },
      { id: "h4", label: "Morning Walk", icon: "🌅" },
      { id: "h5", label: "Evening Walk", icon: "🌆" },
    ],
  },
];

type Theme = (typeof THEMES)[keyof typeof THEMES];

// ── Themes ──────────────────────────────────────────────────────
const THEMES = {
  dark: {
    // backgrounds
    pageBg:       "#1a1f2e",
    pageGrad:     "linear-gradient(160deg, #1e2740 0%, #1a1f2e 55%, #151a27 100%)",
    cardBg:       "rgba(255,255,255,0.06)",
    cardBorder:   "rgba(255,255,255,0.10)",
    modalBg:      "#1e2740",
    modalBorder:  "rgba(255,255,255,0.12)",
    // text
    textPrimary:  "#f0f4ff",
    textSecondary:"rgba(200,210,240,0.65)",
    textMuted:    "rgba(180,195,230,0.45)",
    // cells
    cellEmpty:    "rgba(255,255,255,0.08)",
    cellToday:    "rgba(255,255,255,0.14)",
    cellChecked:  "#22c55e",          // vivid green fill
    checkColor:   "#ffffff",          // white ✓ on green
    checkShadow:  "0 1px 6px rgba(0,0,0,0.4)",
    todayHighlight:"rgba(255,255,255,0.10)",
    // tabs / buttons
    tabBg:        "rgba(255,255,255,0.07)",
    tabActiveBg:  "rgba(255,255,255,0.18)",
    tabText:      "#d4e0ff",
    btnGhost:     "rgba(255,255,255,0.08)",
    btnGhostBorder:"rgba(255,255,255,0.22)",
    btnConfirm:   "rgba(255,255,255,0.18)",
    btnDelete:    "rgba(239,68,68,0.28)",
    // input
    inputBg:      "rgba(255,255,255,0.08)",
    inputBorder:  "rgba(255,255,255,0.18)",
    inputText:    "#f0f4ff",
    // progress
    progressBg:   "rgba(255,255,255,0.12)",
    // dots
    dotColor:     "rgba(255,255,255,0.04)",
    // edit btn
    editBg:       "rgba(255,255,255,0.08)",
    // add event btn border
    dashedBorder: "rgba(255,255,255,0.30)",
  },
  light: {
    pageBg:       "#f0f4f8",
    pageGrad:     "linear-gradient(160deg, #e8f0fb 0%, #f0f4f8 55%, #e4ecf5 100%)",
    cardBg:       "rgba(255,255,255,0.75)",
    cardBorder:   "rgba(0,0,0,0.07)",
    modalBg:      "#ffffff",
    modalBorder:  "rgba(0,0,0,0.10)",
    textPrimary:  "#1a2236",
    textSecondary:"rgba(40,55,90,0.65)",
    textMuted:    "rgba(40,55,90,0.42)",
    cellEmpty:    "rgba(0,0,0,0.07)",
    cellToday:    "rgba(59,158,222,0.18)",
    cellChecked:  "#16a34a",          // rich green fill
    checkColor:   "#ffffff",
    checkShadow:  "0 1px 4px rgba(22,163,74,0.35)",
    todayHighlight:"rgba(59,158,222,0.10)",
    tabBg:        "rgba(0,0,0,0.05)",
    tabActiveBg:  "rgba(59,158,222,0.15)",
    tabText:      "#2a3a5e",
    btnGhost:     "rgba(0,0,0,0.04)",
    btnGhostBorder:"rgba(0,0,0,0.18)",
    btnConfirm:   "#3b9ede",
    btnDelete:    "rgba(220,38,38,0.12)",
    inputBg:      "rgba(0,0,0,0.04)",
    inputBorder:  "rgba(0,0,0,0.14)",
    inputText:    "#1a2236",
    progressBg:   "rgba(0,0,0,0.10)",
    dotColor:     "rgba(0,0,0,0.025)",
    editBg:       "rgba(0,0,0,0.05)",
    dashedBorder: "rgba(0,0,0,0.22)",
  },
};

function getDates(count: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d);
  }
  return dates;
}
function formatDate(d: Date): string { return `${d.getMonth() + 1}/${d.getDate()}`; }
function getDayName(d: Date): string { return d.toLocaleDateString("en-US", { weekday: "short" }); }
function dateKey(d: Date): string { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function isToday(d: Date): boolean { return dateKey(d) === dateKey(new Date()); }

// ── Modal ────────────────────────────────────────────────────────
type ModalProps = {
  title: string;
  onClose: () => void;
  t: Theme;
  children: ReactNode;
};

function Modal({ title, onClose, t, children }: ModalProps) {
  return (
    <div
      style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:t.modalBg,border:`1px solid ${t.modalBorder}`,borderRadius:22,padding:24,width:"100%",maxWidth:360,boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <h2 style={{ color:t.textPrimary,margin:0,fontSize:20,fontWeight:900 }}>{title}</h2>
          <button onClick={onClose} style={{ background:t.btnGhost,border:"none",color:t.textPrimary,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:14 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Emoji picker ─────────────────────────────────────────────────
type EmojiPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
  t: Theme;
};

function EmojiPicker({ value, onChange, t }: EmojiPickerProps) {
  return (
    <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:16 }}>
      {EMOJI_OPTIONS.map((e) => (
        <button
          key={e}
          onClick={() => onChange(e)}
          style={{
            fontSize:22, width:42, height:42, borderRadius:10, cursor:"pointer",
            border: value === e ? `2px solid ${t.cellChecked}` : "2px solid transparent",
            background: value === e ? (t.tabActiveBg) : t.inputBg,
            transition:"all 0.15s",
          }}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState<keyof typeof THEMES>("dark");
  const t = THEMES[mode];
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);

  const [pets, setPets] = useState<Pet[]>(DEFAULT_PETS);
  const [activePetId, setActivePetId] = useState(1);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [animating, setAnimating] = useState<Record<string, boolean>>({});

  const [showAddPet, setShowAddPet] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [newPetEmoji, setNewPetEmoji] = useState("🐱");

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventLabel, setNewEventLabel] = useState("");
  const [newEventIcon, setNewEventIcon] = useState("🍖");

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editIcon, setEditIcon] = useState("");

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const dates = getDates(isMobile ? MOBILE_DAYS_TO_SHOW : DESKTOP_DAYS_TO_SHOW);
  const activePet = pets.find((p) => p.id === activePetId);

  const getKey = (petId: number, habitId: string, date: Date): string => `${petId}_${habitId}_${dateKey(date)}`;

  const toggle = (petId: number, habitId: string, date: Date) => {
    const key = getKey(petId, habitId, date);
    setAnimating((a) => ({ ...a, [key]: true }));
    setTimeout(() => setAnimating((a) => ({ ...a, [key]: false })), 300);
    setChecks((c) => ({ ...c, [key]: !c[key] }));
  };

  const isChecked = (petId: number, habitId: string, date: Date): boolean => !!checks[getKey(petId, habitId, date)];

  const streakCount = (habitId: string): number => {
    let streak = 0;
    for (let i = dates.length - 1; i >= 0; i--) {
      if (isChecked(activePetId, habitId, dates[i])) streak++;
      else break;
    }
    return streak;
  };

  const todayProgress = () => {
    if (!activePet || activePet.habits.length === 0) return 0;
    const today = new Date();
    const done = activePet.habits.filter((h) => isChecked(activePetId, h.id, today)).length;
    return Math.round((done / activePet.habits.length) * 100);
  };

  const addPet = () => {
    if (!newPetName.trim()) return;
    const id = Date.now();
    setPets((p) => [...p, {
      id, name: newPetName.trim(), emoji: newPetEmoji,
      color: ["#3b9ede","#81c784","#ffb74d","#f06292","#ba68c8"][Math.floor(Math.random()*5)],
      habits: [],
    }]);
    setActivePetId(id);
    setNewPetName("");
    setShowAddPet(false);
  };

  const addEvent = () => {
    if (!newEventLabel.trim()) return;
    setPets((prev) => prev.map((p) =>
      p.id === activePetId
        ? { ...p, habits: [...p.habits, { id:`h_${Date.now()}`, label:newEventLabel.trim(), icon:newEventIcon }] }
        : p
    ));
    setNewEventLabel(""); setNewEventIcon("🍖"); setShowAddEvent(false);
  };

  const openEdit = (habit: Habit) => { setEditingHabit(habit); setEditLabel(habit.label); setEditIcon(habit.icon); };

  const saveEdit = () => {
    if (!editingHabit || !editLabel.trim()) return;
    setPets((prev) => prev.map((p) =>
      p.id === activePetId
        ? { ...p, habits: p.habits.map((h) => h.id === editingHabit.id ? { ...h, label:editLabel.trim(), icon:editIcon } : h) }
        : p
    ));
    setEditingHabit(null);
  };

  const deleteHabit = (habitId: string) => {
    setPets((prev) => prev.map((p) =>
      p.id === activePetId ? { ...p, habits: p.habits.filter((h) => h.id !== habitId) } : p
    ));
    setEditingHabit(null);
  };

  const progress = todayProgress();

  // shared input style
  const inputStyle: CSSProperties = {
    width:"100%", padding:"11px 14px", borderRadius:12,
    border:`1px solid ${t.inputBorder}`, background:t.inputBg,
    color:t.inputText, fontSize:15, fontWeight:700, outline:"none",
    boxSizing: "border-box", marginBottom:14,
  };

  return (
    <div style={{ minHeight:"100vh", background:t.pageBg, position:"relative", overflowX:"hidden", fontFamily:"'Nunito', sans-serif", transition:"background 0.3s" }}>
      {/* Background gradient */}
      <div style={{ position:"fixed", inset:0, zIndex:0, background:t.pageGrad, transition:"background 0.3s" }} />
      {/* Dot texture */}
      <div style={{ position:"fixed", inset:0, zIndex:1, backgroundImage:`radial-gradient(circle, ${t.dotColor} 1px, transparent 1px)`, backgroundSize:"22px 22px" }} />

      <div style={{ position:"relative", zIndex:2, maxWidth:560, margin:"0 auto", padding:"18px 14px 60px" }}>

        {/* Pet tabs + controls */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, flex:1 }}>
            {pets.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePetId(p.id)}
                style={{
                  display:"flex", alignItems:"center", gap:5,
                  padding:"8px 14px", borderRadius:999,
                  border:`2px solid ${activePetId === p.id ? p.color : "transparent"}`,
                  background: activePetId === p.id ? t.tabActiveBg : t.tabBg,
                  color:t.tabText, cursor:"pointer", fontSize:14, fontWeight:800, transition:"all 0.2s",
                  whiteSpace:"nowrap",
                }}
              >
                <span>{p.emoji}</span>
                <span>{p.name}</span>
              </button>
            ))}
            <button
              onClick={() => setShowAddPet(true)}
              style={{ width:38,height:38,borderRadius:"50%",border:`2px dashed ${t.dashedBorder}`,background:"transparent",color:t.tabText,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}
            >+</button>
          </div>

          <button
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            style={{
              padding:"8px 12px", borderRadius:999, border:`1.5px solid ${t.btnGhostBorder}`,
              background:t.btnGhost, color:t.textPrimary, cursor:"pointer",
              fontSize:17, fontWeight:700, flexShrink:0, transition:"all 0.2s",
            }}
            title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {mode === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Pet header */}
        {activePet && (
          <div style={{ marginBottom:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
              <div style={{
                width:88, height:88, borderRadius:"50%", border:`4px solid ${activePet.color}`,
                background:t.cardBg, display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0, boxShadow:`0 0 22px ${activePet.color}44`,
              }}>
                <span style={{ fontSize:44 }}>{activePet.emoji}</span>
              </div>
              <div style={{ minWidth:0 }}>
                <h1 style={{ margin:"0 0 2px", fontSize:62, lineHeight:0.95, fontWeight:900, color:t.textPrimary, letterSpacing:"-1.4px" }}>{activePet.name}</h1>
                <span style={{ fontSize:13, color:t.textSecondary, display:"block", fontWeight:700 }}>Today: {progress}% complete</span>
              </div>
            </div>
            <div style={{
              height:10, borderRadius:999, background:t.progressBg, overflow:"hidden",
            }}>
              <div style={{ height:"100%", borderRadius:999, width:`${progress}%`, background:activePet.color, transition:"width 0.5s ease" }} />
            </div>
          </div>
        )}

        {activePet && (
          <div style={{ background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:20, padding:"14px 12px", backdropFilter:"blur(10px)" }}>
            <div style={{ display:"grid", gridTemplateColumns:`repeat(${dates.length}, minmax(0, 1fr))`, gap:10, marginBottom:12 }}>
              {dates.map((d) => (
                <div
                  key={dateKey(d)}
                  style={{
                    display:"flex",
                    flexDirection:"column",
                    alignItems:"center",
                    gap:2,
                    borderRadius:10,
                    padding:"8px 4px",
                    background:isToday(d) ? t.todayHighlight : "transparent",
                  }}
                >
                  <span style={{ fontSize:12, fontWeight:900, color:t.textPrimary }}>{formatDate(d)}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:t.textSecondary }}>{getDayName(d)}</span>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {activePet.habits.length === 0 && (
              <div style={{ textAlign:"center", color:t.textMuted, padding:"24px 0 18px", fontSize:15 }}>
                No events yet — add one below 👇
              </div>
            )}

            {/* Habit rows */}
            {activePet.habits.map((habit) => {
              const streak = streakCount(habit.id);
              return (
                <div key={habit.id} style={{ background:t.inputBg, border:`1px solid ${t.cardBorder}`, borderRadius:16, padding:"11px 10px", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, minWidth:0 }}>
                      <span style={{ fontSize:23, flexShrink:0 }}>{habit.icon}</span>
                      <span style={{ fontSize:26, fontWeight:800, color:t.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textTransform:"lowercase" }}>{habit.label}</span>
                      {streak > 0 && <span style={{ fontSize:13, fontWeight:800, color:t.textSecondary, flexShrink:0 }}>🔥{streak}</span>}
                    </div>
                    <button
                      onClick={() => openEdit(habit)}
                      style={{ width:34, height:34, borderRadius:10, border:"none", background:t.editBg, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", color:t.textSecondary, flexShrink:0 }}
                    >✏️</button>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:`repeat(${dates.length}, minmax(0, 1fr))`, gap:12 }}>
                    {dates.map((d) => {
                      const checked = isChecked(activePetId, habit.id, d);
                      const key = getKey(activePetId, habit.id, d);
                      const popping = animating[key];
                      return (
                        <button
                          key={`${habit.id}_${dateKey(d)}`}
                          onClick={() => toggle(activePetId, habit.id, d)}
                          style={{
                            width:"100%",
                            aspectRatio:"1",
                            borderRadius:"50%",
                            border:"none",
                            cursor:"pointer",
                            padding:0,
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            background: checked ? t.cellChecked : (isToday(d) ? t.cellToday : t.cellEmpty),
                            transform: popping ? "scale(1.16)" : "scale(1)",
                            transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1), background 0.18s ease",
                            boxShadow: checked ? `0 2px 10px ${t.cellChecked}66` : "none",
                          }}
                        >
                          {checked && (
                            <span style={{
                              fontSize:46,
                              fontWeight:900,
                              lineHeight:1,
                              color: t.checkColor,
                              textShadow: t.checkShadow,
                              transform: popping ? "scale(1.1)" : "scale(1)",
                              transition:"transform 0.2s",
                            }}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Add event */}
            <div style={{ marginTop:16, display:"flex", justifyContent:"center" }}>
              <button
                onClick={() => setShowAddEvent(true)}
                style={{
                  display:"flex", alignItems:"center", gap:6,
                  padding:"11px 22px", borderRadius:999,
                  border:`2px dashed ${t.dashedBorder}`,
                  background:"transparent", color:t.textSecondary,
                  fontWeight:800, fontSize:14, cursor:"pointer", transition:"all 0.2s",
                  width:"100%", justifyContent:"center",
                }}
              >＋ Add Event</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Pet Modal ── */}
      {showAddPet && (
        <Modal title="Add a New Pet 🐾" onClose={() => setShowAddPet(false)} t={t}>
          <p style={{ color:t.textSecondary, margin:"0 0 8px", fontSize:13, fontWeight:700 }}>Pick an emoji</p>
          <EmojiPicker value={newPetEmoji} onChange={setNewPetEmoji} t={t} />
          <p style={{ color:t.textSecondary, margin:"0 0 8px", fontSize:13, fontWeight:700 }}>Pet's name</p>
          <input placeholder="e.g. Buddy" value={newPetName} onChange={(e) => setNewPetName(e.target.value)} onKeyDown={(e) => e.key==="Enter" && addPet()} style={inputStyle} autoFocus />
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setShowAddPet(false)} style={{ flex:1, padding:"11px", borderRadius:12, border:`1px solid ${t.btnGhostBorder}`, background:"transparent", color:t.textPrimary, fontWeight:700, cursor:"pointer", fontSize:14 }}>Cancel</button>
            <button onClick={addPet} style={{ flex:1, padding:"11px", borderRadius:12, border:"none", background:t.btnConfirm, color:"white", fontWeight:800, cursor:"pointer", fontSize:14 }}>Add Pet</button>
          </div>
        </Modal>
      )}

      {/* ── Add Event Modal ── */}
      {showAddEvent && (
        <Modal title="Add Event" onClose={() => setShowAddEvent(false)} t={t}>
          <p style={{ color:t.textSecondary, margin:"0 0 8px", fontSize:13, fontWeight:700 }}>Pick an emoji</p>
          <EmojiPicker value={newEventIcon} onChange={setNewEventIcon} t={t} />
          <p style={{ color:t.textSecondary, margin:"0 0 8px", fontSize:13, fontWeight:700 }}>Event name</p>
          <input placeholder="e.g. Morning Walk" value={newEventLabel} onChange={(e) => setNewEventLabel(e.target.value)} onKeyDown={(e) => e.key==="Enter" && addEvent()} style={inputStyle} autoFocus />
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setShowAddEvent(false)} style={{ flex:1, padding:"11px", borderRadius:12, border:`1px solid ${t.btnGhostBorder}`, background:"transparent", color:t.textPrimary, fontWeight:700, cursor:"pointer", fontSize:14 }}>Cancel</button>
            <button onClick={addEvent} style={{ flex:1, padding:"11px", borderRadius:12, border:"none", background:t.btnConfirm, color:"white", fontWeight:800, cursor:"pointer", fontSize:14 }}>Add Event</button>
          </div>
        </Modal>
      )}

      {/* ── Edit Event Modal ── */}
      {editingHabit && (
        <Modal title="Edit Event" onClose={() => setEditingHabit(null)} t={t}>
          <p style={{ color:t.textSecondary, margin:"0 0 8px", fontSize:13, fontWeight:700 }}>Pick an emoji</p>
          <EmojiPicker value={editIcon} onChange={setEditIcon} t={t} />
          <p style={{ color:t.textSecondary, margin:"0 0 8px", fontSize:13, fontWeight:700 }}>Event name</p>
          <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} onKeyDown={(e) => e.key==="Enter" && saveEdit()} style={inputStyle} autoFocus />
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => editingHabit && deleteHabit(editingHabit.id)} style={{ flex:1, padding:"11px", borderRadius:12, border:"none", background:t.btnDelete, color: mode==="dark" ? "#fca5a5" : "#dc2626", fontWeight:800, cursor:"pointer", fontSize:14 }}>🗑 Delete</button>
            <button onClick={saveEdit} style={{ flex:1, padding:"11px", borderRadius:12, border:"none", background:t.btnConfirm, color:"white", fontWeight:800, cursor:"pointer", fontSize:14 }}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

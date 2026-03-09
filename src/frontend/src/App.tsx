import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Bell, Droplets, History, Pencil, Plus, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { CustomAmountDialog } from "./components/CustomAmountDialog";
import { GoalDialog } from "./components/GoalDialog";
import { HistorySheet } from "./components/HistorySheet";
import { WaveBubble } from "./components/WaveBubble";
import {
  useAddEntry,
  useClearTodayEntries,
  useGetGoal,
  useGetTodayEntries,
  useSetGoal,
} from "./hooks/useQueries";

const REMINDER_KEY = "water_reminder_active";

export default function App() {
  const { data: goalData } = useGetGoal();
  const { data: entries } = useGetTodayEntries();
  const addEntry = useAddEntry();
  const setGoalMutation = useSetGoal();
  const clearEntries = useClearTodayEntries();

  const goalMl = Number(goalData ?? BigInt(2000));
  const currentMl = (entries ?? []).reduce(
    (acc, e) => acc + Number(e.amountMl),
    0,
  );

  const [historyOpen, setHistoryOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [reminderActive, setReminderActive] = useState(() => {
    try {
      return localStorage.getItem(REMINDER_KEY) === "true";
    } catch {
      return false;
    }
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const clearReminderInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startReminderInterval = useCallback(() => {
    clearReminderInterval();
    intervalRef.current = setInterval(
      () => {
        const now = Date.now();
        const current = entriesRef.current ?? [];
        if (current.length === 0) {
          fireReminder();
          return;
        }
        const latest = current.reduce((max, e) =>
          Number(e.timestamp) > Number(max.timestamp) ? e : max,
        );
        const lastMs = Number(latest.timestamp) / 1_000_000;
        if (now - lastMs > 60 * 60 * 1000) {
          fireReminder();
        }
      },
      5 * 60 * 1000,
    );
  }, [clearReminderInterval]);

  function fireReminder() {
    if (Notification.permission === "granted") {
      new Notification("Time to hydrate! 💧", {
        body: "You haven't logged water in over an hour.",
        icon: "/favicon.ico",
      });
    }
  }

  useEffect(() => {
    if (reminderActive) {
      startReminderInterval();
    } else {
      clearReminderInterval();
    }
    return clearReminderInterval;
  }, [reminderActive, startReminderInterval, clearReminderInterval]);

  const handleReminderToggle = async (active: boolean) => {
    if (active) {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          toast.error(
            "Notifications blocked. Enable them in browser settings.",
          );
          return;
        }
      }
      if (Notification.permission === "denied") {
        toast.error(
          "Notifications are blocked. Enable them in browser settings.",
        );
        return;
      }
    }
    setReminderActive(active);
    try {
      localStorage.setItem(REMINDER_KEY, String(active));
    } catch {
      /* noop */
    }
    toast.success(active ? "Reminders enabled 🔔" : "Reminders disabled");
  };

  const handleAddMl = (ml: number) => {
    addEntry.mutate(ml, {
      onSuccess: () =>
        toast.success(`+${ml} ml logged! 💧`, { duration: 2000 }),
      onError: () => toast.error("Failed to log drink"),
    });
  };

  const handleReset = () => {
    clearEntries.mutate(undefined, {
      onSuccess: () => toast.success("Today's log cleared"),
      onError: () => toast.error("Failed to reset"),
    });
  };

  const handleSaveGoal = (goal: number) => {
    setGoalMutation.mutate(goal, {
      onSuccess: () => toast.success(`Goal set to ${goal} ml`),
      onError: () => toast.error("Failed to update goal"),
    });
  };

  return (
    <div
      className="relative min-h-dvh flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #E0F2FE 0%, #f8fcff 55%, #ffffff 100%)",
        fontFamily:
          "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-10%",
          right: "-10%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,119,255,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "5%",
          left: "-8%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
        <div>
          <h1
            className="font-display font-black text-2xl tracking-tight leading-none"
            style={{ color: "#0033AA" }}
          >
            Hydrate
          </h1>
          <p
            className="text-xs font-medium mt-0.5"
            style={{ color: "#5B8FC9" }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button
          data-ocid="tracker.history_button"
          variant="ghost"
          size="sm"
          onClick={() => setHistoryOpen(true)}
          className="rounded-full glass h-9 px-3 gap-1.5 text-xs font-semibold"
          style={{ color: "#0055CC" }}
        >
          <History size={14} />
          History
        </Button>
      </header>

      {/* MAIN */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 px-5 py-6">
        {/* Goal label + edit */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-2"
        >
          <span className="text-sm font-semibold" style={{ color: "#5B8FC9" }}>
            Daily goal:{" "}
            <strong style={{ color: "#0033AA" }}>{goalMl} ml</strong>
          </span>
          <button
            type="button"
            data-ocid="tracker.goal_edit_button"
            onClick={() => setGoalOpen(true)}
            className="rounded-full p-1 transition-colors hover:bg-blue-50"
            aria-label="Edit goal"
          >
            <Pencil size={13} style={{ color: "#0077FF" }} />
          </button>
        </motion.div>

        {/* Wave bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <WaveBubble currentMl={currentMl} goalMl={goalMl} />
        </motion.div>

        {/* Quick-add buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="flex gap-3"
        >
          {[
            { label: "+250 ml", ml: 250, ocid: "tracker.add_250_button" },
            { label: "+500 ml", ml: 500, ocid: "tracker.add_500_button" },
          ].map(({ label, ml, ocid }) => (
            <motion.button
              key={ml}
              type="button"
              data-ocid={ocid}
              onClick={() => handleAddMl(ml)}
              disabled={addEntry.isPending}
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.04 }}
              className="glass font-bold rounded-full px-7 py-3.5 text-sm transition-all"
              style={{
                color: "#0055CC",
                boxShadow:
                  "0 4px 16px rgba(0,119,255,0.15), 0 1px 4px rgba(0,0,0,0.07)",
                minWidth: 120,
              }}
            >
              <Droplets
                size={14}
                className="inline mr-1.5"
                style={{ verticalAlign: "middle" }}
              />
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* Reminder toggle + Reset panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="glass rounded-3xl px-6 py-4 flex flex-col gap-4 w-full max-w-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell
                size={16}
                style={{ color: reminderActive ? "#0077FF" : "#94A3B8" }}
              />
              <Label
                htmlFor="reminder-toggle"
                className="text-sm font-semibold cursor-pointer"
                style={{ color: "#334155" }}
              >
                Reminders
              </Label>
            </div>
            <Switch
              id="reminder-toggle"
              data-ocid="tracker.reminder_toggle"
              checked={reminderActive}
              onCheckedChange={handleReminderToggle}
              style={reminderActive ? { background: "#0077FF" } : {}}
            />
          </div>

          <AnimatePresence>
            {reminderActive && (
              <motion.p
                key="reminder-hint"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs"
                style={{ color: "#5B8FC9" }}
              >
                You'll be notified if you haven't logged water in 60 min.
              </motion.p>
            )}
          </AnimatePresence>

          <div
            className="h-px"
            style={{ background: "rgba(0,119,255,0.12)" }}
          />

          <button
            type="button"
            data-ocid="tracker.reset_button"
            onClick={handleReset}
            disabled={clearEntries.isPending}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
            style={{ color: "#94A3B8" }}
          >
            <RotateCcw size={12} />
            Reset today
          </button>
        </motion.div>
      </main>

      {/* FAB */}
      <motion.button
        type="button"
        data-ocid="tracker.custom_fab_button"
        onClick={() => setCustomOpen(true)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.08 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          position: "fixed",
          bottom: 28,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0077FF, #0055CC)",
          boxShadow:
            "0 8px 28px rgba(0,119,255,0.38), 0 2px 8px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          border: "none",
          cursor: "pointer",
          color: "white",
        }}
        aria-label="Add custom amount"
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>

      {/* FOOTER */}
      <footer
        className="relative z-10 text-center py-4 text-xs"
        style={{ color: "#94A3B8" }}
      >
        &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#0077FF" }}
        >
          caffeine.ai
        </a>
      </footer>

      <HistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        entries={entries ?? []}
      />

      <CustomAmountDialog
        open={customOpen}
        onOpenChange={setCustomOpen}
        onSubmit={handleAddMl}
        isPending={addEntry.isPending}
      />

      <GoalDialog
        open={goalOpen}
        onOpenChange={setGoalOpen}
        currentGoal={goalMl}
        onSave={handleSaveGoal}
        isPending={setGoalMutation.isPending}
      />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,119,255,0.2)",
            color: "#0033AA",
            fontWeight: 600,
          },
        }}
      />
    </div>
  );
}

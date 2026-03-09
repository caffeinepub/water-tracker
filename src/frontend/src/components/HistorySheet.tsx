import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Clock, Droplets } from "lucide-react";
import type { DrinkEntryView } from "../backend.d";

interface HistorySheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entries: DrinkEntryView[];
}

function formatTime(timestamp: bigint): string {
  // Motoko timestamps are in nanoseconds
  const ms = Number(timestamp) / 1_000_000;
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function HistorySheet({
  open,
  onOpenChange,
  entries,
}: HistorySheetProps) {
  const sorted = [...entries].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  const totalMl = entries.reduce((acc, e) => acc + Number(e.amountMl), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        data-ocid="tracker.history_sheet"
        className="rounded-t-3xl glass-strong"
        style={{ maxHeight: "75dvh", background: "rgba(255,255,255,0.92)" }}
      >
        <SheetHeader className="mb-4">
          <SheetTitle
            className="font-display font-black text-xl"
            style={{ color: "#0077FF" }}
          >
            Today's Hydration
          </SheetTitle>
          <div
            className="flex items-center gap-1.5"
            style={{ color: "#0055CC" }}
          >
            <Droplets size={16} />
            <span className="text-sm font-semibold">
              {totalMl} ml total • {entries.length} drink
              {entries.length !== 1 ? "s" : ""}
            </span>
          </div>
        </SheetHeader>

        {entries.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 gap-3"
            data-ocid="tracker.history.empty_state"
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E0F2FE, #BAE6FD)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Droplets size={28} style={{ color: "#0077FF" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#64748B" }}>
              No drinks logged yet today
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[45dvh] pr-2">
            <div className="space-y-2 pb-4">
              {sorted.map((entry, idx) => (
                <div
                  key={entry.id}
                  data-ocid={`tracker.history.item.${idx + 1}`}
                  className="drop-in flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: "rgba(224,242,254,0.55)",
                    border: "1px solid rgba(186,230,253,0.7)",
                    animationDelay: `${idx * 0.04}s`,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0077FF, #38BDF8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Droplets size={16} style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <div
                      className="font-bold text-sm"
                      style={{ color: "#0033AA" }}
                    >
                      {Number(entry.amountMl)} ml
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={11} style={{ color: "#64748B" }} />
                      <span className="text-xs" style={{ color: "#64748B" }}>
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div
                    className="text-xs font-semibold rounded-full px-2.5 py-1"
                    style={{
                      background: "rgba(0,119,255,0.12)",
                      color: "#0055CC",
                    }}
                  >
                    #{entries.length - idx}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

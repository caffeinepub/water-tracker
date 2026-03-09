import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";
import { useEffect, useState } from "react";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentGoal: number;
  onSave: (goal: number) => void;
  isPending?: boolean;
}

export function GoalDialog({
  open,
  onOpenChange,
  currentGoal,
  onSave,
  isPending,
}: GoalDialogProps) {
  const [value, setValue] = useState(String(currentGoal));

  useEffect(() => {
    if (open) setValue(String(currentGoal));
  }, [open, currentGoal]);

  const handleSave = () => {
    const goal = Number.parseInt(value, 10);
    if (!goal || goal < 100 || goal > 10000) return;
    onSave(goal);
    onOpenChange(false);
  };

  const presets = [1500, 2000, 2500, 3000, 3500];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-3xl glass-strong max-w-sm mx-auto"
        style={{ background: "rgba(255,255,255,0.94)" }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0077FF, #38BDF8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Target size={18} style={{ color: "white" }} />
            </div>
            <DialogTitle
              className="font-display font-black text-lg"
              style={{ color: "#0033AA" }}
            >
              Daily Goal
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label
            htmlFor="goal-ml"
            className="text-sm font-semibold"
            style={{ color: "#334155" }}
          >
            Set your daily water goal
          </Label>
          <div className="relative">
            <Input
              id="goal-ml"
              data-ocid="tracker.goal_input"
              type="number"
              min={100}
              max={10000}
              placeholder="2000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="rounded-2xl text-lg font-bold pr-12 focus-visible:ring-2"
              style={{
                background: "rgba(224,242,254,0.5)",
                border: "1.5px solid rgba(0,119,255,0.25)",
                color: "#0033AA",
                height: 52,
              }}
              autoFocus
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold"
              style={{ color: "rgba(0,85,200,0.55)" }}
            >
              ml
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue(String(preset))}
                className="text-xs font-semibold rounded-full px-3 py-1.5 transition-all"
                style={{
                  background:
                    value === String(preset)
                      ? "#0077FF"
                      : "rgba(0,119,255,0.10)",
                  color: value === String(preset) ? "white" : "#0055CC",
                  border: "1px solid rgba(0,119,255,0.2)",
                }}
              >
                {preset} ml
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            data-ocid="tracker.goal_save_button"
            onClick={handleSave}
            disabled={!value || Number.parseInt(value, 10) < 100 || isPending}
            className="rounded-full font-bold px-6"
            style={{ background: "#0077FF", color: "white" }}
          >
            Save Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

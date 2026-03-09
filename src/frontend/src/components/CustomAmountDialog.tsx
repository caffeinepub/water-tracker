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
import { Droplets } from "lucide-react";
import { useState } from "react";

interface CustomAmountDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (ml: number) => void;
  isPending?: boolean;
}

export function CustomAmountDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: CustomAmountDialogProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const ml = Number.parseInt(value, 10);
    if (!ml || ml <= 0 || ml > 5000) return;
    onSubmit(ml);
    setValue("");
    onOpenChange(false);
  };

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
              <Droplets size={18} style={{ color: "white" }} />
            </div>
            <DialogTitle
              className="font-display font-black text-lg"
              style={{ color: "#0033AA" }}
            >
              Custom Amount
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label
            htmlFor="custom-ml"
            className="text-sm font-semibold"
            style={{ color: "#334155" }}
          >
            How much did you drink?
          </Label>
          <div className="relative">
            <Input
              id="custom-ml"
              data-ocid="tracker.custom_amount_input"
              type="number"
              min={1}
              max={5000}
              placeholder="e.g. 350"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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

          {/* Quick presets */}
          <div className="flex gap-2">
            {[100, 150, 200, 300, 400].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue(String(preset))}
                className="flex-1 text-xs font-semibold rounded-full py-1.5 transition-all"
                style={{
                  background:
                    value === String(preset)
                      ? "#0077FF"
                      : "rgba(0,119,255,0.10)",
                  color: value === String(preset) ? "white" : "#0055CC",
                  border: "1px solid rgba(0,119,255,0.2)",
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setValue("");
              onOpenChange(false);
            }}
            data-ocid="tracker.custom_amount_cancel_button"
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            data-ocid="tracker.custom_amount_submit_button"
            onClick={handleSubmit}
            disabled={!value || Number.parseInt(value, 10) <= 0 || isPending}
            className="rounded-full font-bold px-6"
            style={{ background: "#0077FF", color: "white" }}
          >
            <Droplets size={15} className="mr-1.5" />
            Add Drink
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

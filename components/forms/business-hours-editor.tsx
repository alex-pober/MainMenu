import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface BusinessHours {
  open: string;
  close: string;
  closed?: boolean;
}

interface BusinessHoursEditorProps {
  value: Record<string, BusinessHours>;
  onChange: (hours: Record<string, BusinessHours>) => void;
}

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function BusinessHoursEditor({
  value,
  onChange,
}: BusinessHoursEditorProps) {
  const updateHours = (
    day: string,
    field: keyof BusinessHours,
    newValue: string | boolean
  ) => {
    const newHours = { ...value };
    if (field === "closed") {
      newHours[day] = {
        ...newHours[day],
        closed: newValue as boolean,
      };
    } else {
      newHours[day] = {
        ...newHours[day],
        [field]: newValue,
      };
    }
    onChange(newHours);
  };

  return (
    <div className="space-y-4">
      {DAYS.map((day) => (
        <div
          key={day}
          className="grid grid-cols-[1fr,auto,1fr,auto] items-center gap-4"
        >
          <Label className="capitalize">{day}</Label>
          <Switch
            checked={!value[day]?.closed}
            onCheckedChange={(checked) =>
              updateHours(day, "closed", !checked)
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="time"
              value={value[day]?.open || "09:00"}
              onChange={(e) => updateHours(day, "open", e.target.value)}
              disabled={value[day]?.closed}
            />
            <Input
              type="time"
              value={value[day]?.close || "17:00"}
              onChange={(e) => updateHours(day, "close", e.target.value)}
              disabled={value[day]?.closed}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

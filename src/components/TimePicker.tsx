import React from "react";

interface TimePickerProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    disabled?: boolean
}

export default function TimePicker({
    label,
    name,
    value,
    onChange,
    required,
    disabled = false,
}: TimePickerProps) {
    // generate time slots with 15 min gap + AM/PM
    const generateTimeSlots = () => {
        const slots: { label: string; value: string }[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                const h = displayHour.toString().padStart(2, "0");
                const m = minute.toString().padStart(2, "0");
                const period = hour < 12 ? "AM" : "PM";

                // ✅ Display label
                const displayTime = `${h}:${m} ${period}`;

                // ✅ Store value as 24-hour time + period
                const valueTime = `${hour.toString().padStart(2, "0")}:${m} ${period}`;

                slots.push({ label: displayTime, value: valueTime });
            }
        }
        return slots;
    };

    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled} // ✅ pass it here
                className="border border-gray-300 rounded-lg p-3 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
                <option value="">Select Time</option>
                {generateTimeSlots().map((slot) => (
                    <option key={slot.value} value={slot.value}>
                        {slot.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

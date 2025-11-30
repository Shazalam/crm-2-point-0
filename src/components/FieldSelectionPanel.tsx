import { editableGroups } from "@/lib/types/booking";

interface FieldSelectionPanelProps {
  editable: Record<string, boolean>;
  toggleField: (field: string) => void;
  toggleAll: () => void;
}

export default function FieldSelectionPanel({ editable, toggleField, toggleAll }: FieldSelectionPanelProps) {
  const allFields = Object.values(editableGroups).flat();
  const allSelected = allFields.every((f) => editable[f]);

  return (
    <div className="md:col-span-1 space-y-6 sticky top-10 self-start">
      {Object.entries(editableGroups).map(([group, fields]) => (
        <div key={group}>
          <h3 className="text-lg font-semibold text-indigo-700 mb-2 border-b pb-1">{group}</h3>
          <div className="space-y-2">
            {fields.map((field) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editable[field]}
                  onChange={() => toggleField(field)}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="capitalize text-gray-600">{field}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={toggleAll}
        className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
      >
        {allSelected ? "Deselect All" : "Select All"}
      </button>
    </div>
  );
}
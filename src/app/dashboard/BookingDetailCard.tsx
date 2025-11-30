import { IconType } from "react-icons";

// Detail Card Component for expanded view
export default function DetailCard({ icon: Icon, title, items }: { icon: IconType, title: string, items: { label: string, value: string }[] }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-blue-600" />
        {title}
      </h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="text-sm">
            <div className="text-slate-500 font-medium">{item.label}</div>
            <div className="text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
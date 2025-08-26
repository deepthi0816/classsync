import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  testId?: string;
}

export default function StatsCard({ title, value, icon, iconBgColor, testId }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid={testId}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600" data-testid={`text-${testId}-title`}>
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900" data-testid={`text-${testId}-value`}>
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

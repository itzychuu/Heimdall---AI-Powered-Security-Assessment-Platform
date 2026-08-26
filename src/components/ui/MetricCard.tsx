import type { ReactNode } from "react";
import Card from "./Card";

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: string;
  trendPositive?: boolean;
}

export default function MetricCard({
  label,
  value,
  description,
  icon,
  trend,
  trendPositive,
}: MetricCardProps) {
  return (
    <Card className="metric-card">
      <div className="metric-card-header">
        <span className="metric-label">{label}</span>

        {icon && (
          <span className="metric-icon">
            {icon}
          </span>
        )}
      </div>

      <div className="metric-value">
        {value}
      </div>

      {(description || trend) && (
        <div className="metric-footer">
          {description && (
            <span className="metric-description">
              {description}
            </span>
          )}

          {trend && (
            <span
              className={`metric-trend ${
                trendPositive ? "positive" : "negative"
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
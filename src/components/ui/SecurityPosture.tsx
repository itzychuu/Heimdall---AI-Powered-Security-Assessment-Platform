import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import Card from "./Card";

interface SeverityData {
  severity: string;
  findings: number;
  color: string;
}

const postureData: SeverityData[] = [
  {
    severity: "Critical",
    findings: 2,
    color: "#C95C5C",
  },
  {
    severity: "High",
    findings: 8,
    color: "#C98A5C",
  },
  {
    severity: "Medium",
    findings: 15,
    color: "#C9A45C",
  },
  {
    severity: "Low",
    findings: 9,
    color: "#8F887C",
  },
  {
    severity: "Info",
    findings: 3,
    color: "#6F777D",
  },
];

export default function SecurityPosture() {
  const totalFindings = postureData.reduce(
    (total, item) => total + item.findings,
    0
  );

  return (
    <Card className="security-posture">
      <div className="section-header">
        <div>
          <h2>Security Posture</h2>

          <p>
            Current assessment findings by severity.
          </p>
        </div>

        <div className="posture-total">
          <span>{totalFindings}</span>
          <small>Findings</small>
        </div>
      </div>

      <div className="posture-chart">
        <ResponsiveContainer width="100%" height={215}>
          <BarChart
            data={postureData}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="severity"
              stroke="#716C63"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#716C63"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={30}
            />

            <Tooltip
              cursor={{
                fill: "rgba(201, 164, 92, 0.05)",
              }}
              contentStyle={{
                background: "#11110F",
                border: "1px solid #2B2925",
                borderRadius: "6px",
                color: "#F1EDE4",
              }}
              labelStyle={{
                color: "#C9A45C",
              }}
            />

            <Bar
              dataKey="findings"
              radius={[4, 4, 0, 0]}
            >
              {postureData.map((entry) => (
                <Cell
                  key={entry.severity}
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";

interface ChartDataPoint {
  [key: string]: string | number;
}

interface ProgressChartProps {
  data: ChartDataPoint[];
  type?: "line" | "bar";
  height?: number;
  className?: string;
}

export default function ProgressChart({ 
  data, 
  type = "line", 
  height = 300,
  className 
}: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-50 rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-slate-500">No data available</p>
      </div>
    );
  }

  // Get all numeric keys from the data (excluding the first key which is usually the label)
  const keys = Object.keys(data[0] || {});
  const labelKey = keys[0];
  const dataKeys = keys.slice(1).filter(key => 
    typeof data[0][key] === 'number'
  );

  const colors = [
    "hsl(221, 83%, 53%)", // primary
    "hsl(142, 71%, 45%)", // accent
    "hsl(38, 92%, 50%)",  // warning
    "hsl(0, 84%, 60%)",   // destructive
    "hsl(262, 83%, 58%)", // purple
    "hsl(24, 70%, 50%)",  // orange
  ];

  if (type === "bar") {
    return (
      <div className={className} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis 
              dataKey={labelKey} 
              stroke="hsl(215, 16%, 46.9%)"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(215, 16%, 46.9%)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(214, 32%, 91%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
          <XAxis 
            dataKey={labelKey} 
            stroke="hsl(215, 16%, 46.9%)"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(215, 16%, 46.9%)"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(214, 32%, 91%)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

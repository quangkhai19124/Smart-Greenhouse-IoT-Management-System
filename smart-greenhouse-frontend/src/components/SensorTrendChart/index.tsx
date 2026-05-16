import { IDailySensorData } from "@/models/observationdata.type";
import { toVietnamDate } from "@/utils/functions";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SensorTrendChart({ data }: { data: IDailySensorData[] }) {
  const dataChart = data.map((item) => ({
    time: toVietnamDate(item.date),
    value: Number(item?.averageValue ?? 0).toFixed(2),
  }));

  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={dataChart}>
        <defs>
          <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5CE191" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#5CE191" stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="time"
          axisLine={{ stroke: "#e0e0e0" }}
          tickLine={{ stroke: "#e0e0e0" }}
          interval="preserveStartEnd"
          minTickGap={20}
        />

        <YAxis
          axisLine={{ stroke: "#e0e0e0" }}
          tickLine={{ stroke: "#e0e0e0" }}
          label={{
            value: "Value",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle" },
          }}
        />

        <Tooltip />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#5CE191"
          fill="url(#moistureGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { IResDeviceToggleCount } from "@/models/deviceControl.type";

export default function ToggleCountChart({ data }: { data:  IResDeviceToggleCount[] }) {
  const dataChart = data.map(item => ({
    time: item.date,
    onCount: item.onCount,
    offCount: item.offCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={dataChart}>
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={{ stroke: '#e0e0e0' }}
          padding={{ left: 10, right: 10 }}
        />
        
        <YAxis
          yAxisId="left"
          orientation="left"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={{ stroke: '#e0e0e0' }}
          label={{ value: "Toggle count (times)", angle: -90, position: "insideLeft", offset: 1, style: { textAnchor: "middle" } }}
        />

        <Tooltip />
        <Legend />

        <Bar
          yAxisId="left"
          dataKey="offCount"
          fill="#0095FF"
          name="Off Count"
          radius={[8, 8, 8, 8]}
          maxBarSize={40}
        />
        <Bar
          yAxisId="right"
          dataKey="onCount"
          fill="#00E096"
          name="On Count"
          radius={[8, 8, 8, 8]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { IHourlyAvgData } from "@/models/dashboard.type";

export default function TemperatureLightChart({ data }: { data: IHourlyAvgData[] }) {
  const recentData = data.slice(-5);
  const dataChart = recentData.map(item => ({
    time: item.time,
    lightsensor: Number((item?.lightsensor ?? 0)/1000).toFixed(2),
    dht20temp: Number(item?.dht20temp ?? 0).toFixed(2),
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
          label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft", offset: 1, style: { textAnchor: "middle" } }}
        />

        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={{ stroke: '#e0e0e0' }}
          label={{ value: "Light (klx)", angle: 90, position: "insideRight", offset: 0, style: { textAnchor: "middle" } }}
        />

        <Tooltip />
        <Legend />

        <Bar
          yAxisId="right"
          dataKey="lightsensor"
          fill="#FFCF03"
          name="Light Intensity (klx)"
          radius={[8, 8, 8, 8]}
          maxBarSize={40}
        />
        <Bar
          yAxisId="left"
          dataKey="dht20temp"
          fill="#00E096"
          name="Temperature (°C)"
          radius={[8, 8, 8, 8]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

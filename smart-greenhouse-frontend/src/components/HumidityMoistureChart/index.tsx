import { IHourlyAvgData } from "@/models/dashboard.type";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

export default function HumidityMoistureChart({ data }: { data: IHourlyAvgData[]}) {
   const dataChart = data.slice(-23).map(item => ({
      time: item.time,
      dht20humi: Number(item?.dht20humi ?? 0).toFixed(2),
      soilhumi: Number(item?.soilhumi ?? 0).toFixed(2)
    }));
    
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={dataChart}>
        <defs>
          <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#90FFF8" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#90FFF8" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5CE191" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#5CE191" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis 
            dataKey="time" 
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
        />
        <YAxis
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
            label={{ value: "Humidity & Moisture (%)", angle: -90, position: "insideLeft", offset: 0, style: { textAnchor: "middle" } }}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="dht20humi"
          stroke="#90FFF8"
          fill="url(#humidityGradient)"
          name="Air Humidity"
        />
        <Area
          type="monotone"
          dataKey="soilhumi"
          stroke="#5CE191"
          fill="url(#moistureGradient)"
          name="Soil Moisture"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

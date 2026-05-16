import HumidityMoistureChart from "@/components/HumidityMoistureChart";
import TemperatureLightChart from "@/components/TemperatureLightChart";
import { Sun, Thermometer, Wind } from "lucide-react";
import CountUp from "react-countup";
import { useEffect, useState } from "react";
import DashboardService from "@/services/dashboardService";
import { IHourlyAvgData, IResponseSensorsData } from "@/models/dashboard.type";
import { toVietnamTime } from "@/utils/functions";
import { formatChange } from "./utils/functions";
import { Skeleton } from "antd";
import { useFetchAllSensors } from "../observation-data/api";

const DashboardPage = () => {
    const [sensorData, setSensorData] = useState<Map<string, IResponseSensorsData>>(new Map());
    const [sensorHourlyAvg, setSensorHourlyAvg] = useState<IHourlyAvgData[]>([]);
    const [lastUpdatedChartTime, setLastUpdatedChartTime] = useState<string>("");
    const [lastUpdatedSensorTime, setLastUpdatedSensorTime] = useState<string>("");
    const [isLoadingChart, setIsLoadingChart] = useState<boolean>(true);
    const { data: sensorsData } = useFetchAllSensors();

    useEffect(() => {
        const dashboardService = new DashboardService();

        dashboardService.connect();

        dashboardService.sensorData((data) => {
            setSensorData((prev) => new Map(prev).set(data.sensorName, data));
            setLastUpdatedSensorTime(new Date().toISOString());
        });

        dashboardService.onSensorHourlyAvg((data) => {
            setSensorHourlyAvg(data);
            setLastUpdatedChartTime(new Date().toISOString());
            setIsLoadingChart(false);
        });

        dashboardService.onSensorLatestData((data) => {
            const latestDataMap = new Map<string, IResponseSensorsData>();
            data.forEach(item => {
                latestDataMap.set(item.sensorName, item);
            });
            setSensorData(latestDataMap);
            setLastUpdatedSensorTime(new Date().toISOString());
        });

        return () => {
            dashboardService.disconnect();
        };
    }, []);

    const hasSensor = (name: string) =>
        !sensorsData || sensorsData.some((s) => s.sensorName === name);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex gap-6 xl:flex-row flex-col">
                <div className="lg:min-w-[830px] bg-white px-6 py-4 rounded-xl shadow-sm">
                    <div>
                        <div className="font-semibold text-gray-600 text-base">Real-time Sensor Monitoring</div>
                        <div className="text-gray-500 pt-1">Last update: {lastUpdatedSensorTime ? toVietnamTime(lastUpdatedSensorTime) : "__"}</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        {hasSensor("dht20temp") && (
                        <div className="bg-[#FFE2E5] p-5 rounded-xl text-gray-700">
                            <div className="bg-[#FA5A7D] p-2 rounded-full h-10 w-10">
                                <Thermometer className="text-white" />
                            </div>
                            <div className="text-2xl font-semibold pt-4">
                                {sensorData.get("dht20temp") ? (
                                    <CountUp
                                        end={Number(sensorData.get("dht20temp")?.value || 0)}
                                        decimals={2}
                                        duration={1.5}
                                        suffix="°C"
                                    />
                                ) : (
                                    <div>__°C</div>
                                )}
                            </div>
                            <div className="pt-1 font-medium">Temperature</div>
                            <div className="text-xs text-blue-500 pt-2">{formatChange(Number(sensorData.get("dht20temp")?.value || 0), (sensorHourlyAvg[sensorHourlyAvg.length - 1]?.dht20temp || 0))}</div>
                        </div>
                        )}

                        {hasSensor("dht20humi") && (
                        <div className="bg-[#FFF4DE] p-5 rounded-xl text-gray-700">
                            <div className="bg-[#FF947A] p-2 rounded-full h-10 w-10">
                                <Wind className="text-white" />
                            </div>
                            <div className="text-2xl font-semibold pt-4">
                                {sensorData.get("dht20humi") ? (
                                    <CountUp
                                        end={Number(sensorData.get("dht20humi")?.value || 0)}
                                        decimals={2}
                                        duration={1.5}
                                        suffix="%"
                                    />
                                ) : (
                                    <div>__%</div>
                                )}
                            </div>
                            <div className="pt-1 font-medium">Air Humidity</div>
                            <div className="text-xs text-blue-500 pt-2">{formatChange(Number(sensorData.get("dht20humi")?.value || 0), (sensorHourlyAvg[sensorHourlyAvg.length - 1]?.dht20humi || 0))}</div>
                        </div>
                        )}

                        {hasSensor("lightsensor") && (
                        <div className="bg-[#DCFCE7] p-5 rounded-xl text-gray-700">
                            <div className="bg-[#3CD856] p-2 rounded-full h-10 w-10">
                                <Sun className="text-white" />
                            </div>
                            <div className="text-2xl font-semibold pt-4">
                                {sensorData.get("lightsensor") ? (
                                    <CountUp
                                        end={Number(sensorData.get("lightsensor")?.value || 0)}
                                        decimals={2}
                                        duration={1.5}
                                        suffix=" lx"
                                    />
                                ) : (
                                     <div>__ lx</div>
                                )}
                            </div>
                            <div className="pt-1 font-medium">Light Intensity</div>
                            <div className="text-xs text-blue-500 pt-2">{formatChange(Number(sensorData.get("lightsensor")?.value || 0), (sensorHourlyAvg[sensorHourlyAvg.length - 1]?.lightsensor || 0))}</div>
                        </div>
                        )}

                        {hasSensor("soilhumi") && (
                        <div className="bg-[#F3E8FF] p-5 rounded-xl text-gray-700">
                            <div className="bg-[#BF83FF] p-2 rounded-full h-10 w-10">
                                <Sun className="text-white" />
                            </div>
                            <div className="text-2xl font-semibold pt-4">
                                {sensorData.get("soilhumi") ? (
                                    <CountUp
                                        end={Number(sensorData.get("soilhumi")?.value || 0)}
                                        decimals={2}
                                        duration={1.5}
                                        suffix="%"
                                    />
                                ) : (
                                    <div>__%</div>
                                )}
                            </div>
                            <div className="pt-1 font-medium">Soil Moisture</div>
                            <div className="text-xs text-blue-500 pt-2">{formatChange(Number(sensorData.get("soilhumi")?.value || 0), (sensorHourlyAvg[sensorHourlyAvg.length - 1]?.soilhumi || 0))}</div>
                        </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 bg-white pr-6 py-4 rounded-xl shadow-sm">
                    <div className="px-6">
                        <div className="font-semibold text-gray-600 text-base">
                            Temperature & Light Trends
                        </div>
                        <div className="text-gray-500 pt-1">Last update: {lastUpdatedChartTime ? toVietnamTime(lastUpdatedChartTime) : "__"}</div>
                    </div>
                    <div className="pl-6 pt-4">
                        {isLoadingChart ? (
                            <div className="min-h-52">
                                <Skeleton active />
                            </div>
                            ) : (   
                                <TemperatureLightChart data={sensorHourlyAvg} />
                        )}
                    </div>
                </div>
            </div>
            <div className="pr-6 py-4 bg-white rounded-xl shadow-sm">
                <div className="px-6">
                    <div className="font-semibold text-gray-600 text-base">
                        Air Humidity & Soil Moisture Trends
                    </div>
                    <div className="text-gray-500 pt-1">Last update: {lastUpdatedChartTime ? toVietnamTime(lastUpdatedChartTime) : "__"}</div>
                </div>
                <div className="pt-4 pl-6">
                    {isLoadingChart ? (
                        <div className="min-h-76">
                            <Skeleton active />
                        </div>
                    ) : (
                        <HumidityMoistureChart data={sensorHourlyAvg} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
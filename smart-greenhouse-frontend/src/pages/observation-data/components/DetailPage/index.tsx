import SensorTrendChart from "@/components/SensorTrendChart";
import TableAnt from "@/components/TableAnt";
import { ISensorDataLogs } from "@/models/observationdata.type";
import { toVietnamTime } from "@/utils/functions";
import { Breadcrumb, DatePicker, Pagination, Skeleton } from "antd";
import { ColumnType } from "antd/es/table";
import { ChartLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useFetchDailySensorData, useFetchSensorData, useFetchSensorDataLogs } from "./api";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export const ObservationDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigator = useNavigate();

    const defaultDateRange: [dayjs.Dayjs, dayjs.Dayjs] = [
        dayjs().subtract(7, 'day'),
        dayjs()
    ];
    const [selectedDateRange, setSelectedDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(defaultDateRange);

    const startDate = selectedDateRange?.[0];
    const endDate = selectedDateRange?.[1];

    const startDateString = startDate?.format('YYYY-MM-DD') + ' 00:00:00';
    const endDateString = endDate?.format('YYYY-MM-DD') + ' 23:59:59';

    const { data: sensorData } = useFetchSensorData(id || "", startDateString, endDateString);
    const { data: dailySensorData, isLoading: isLoadingChart } = useFetchDailySensorData(id || "", startDateString, endDateString);

    const [lastUpdatedMonitoring, setLastUpdatedMonitoring] = useState<string>("");
    const [lastUpdatedChartTime, setLastUpdatedChartTime] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const { data: sensorLogs, isLoading } = useFetchSensorDataLogs(id || "", currentPage, startDateString, endDateString);
    const { logs: logSensorLogs, totalRecords: logTotalRecords } = sensorLogs || {};

    useEffect(() => {
        setLastUpdatedMonitoring(new Date().toISOString());
    }, [sensorData]);

    useEffect(() => {
        setLastUpdatedChartTime(new Date().toISOString());
    }, [dailySensorData]);

    const columns: ColumnType<ISensorDataLogs>[] = [
        {
            title: "Timestamp",
            dataIndex: "time",
            key: "time",
            render: (text: string) => {
                return <span>{toVietnamTime(text)}</span>;
            }
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
        }
    ];


    return (
        <div>
            <div className="bg-white p-6 rounded-lg flex justify-between items-center">
                <Breadcrumb
                    items={[
                        {
                            title: <div onClick={() => navigator("/observation-data")} className="cursor-pointer">Observation Data</div>,
                        },
                        {
                            title: `${sensorData?.name} Sensor`,
                        },
                    ]}
                />
                <RangePicker
                    format="YYYY-MM-DD"
                    placeholder={["Start date", "End date"]}
                    value={selectedDateRange}
                    onChange={(values) => {
                        if (values && values[0] && values[1]) {
                            setSelectedDateRange([values[0], values[1]]);
                        }
                    }}
                />
            </div>
            <div className="py-6">
                <div className="flex gap-6 xl:flex-row flex-col">
                    <div className="bg-white px-6 py-4 rounded-xl shadow-sm">
                        <div>
                            <div className="font-semibold text-gray-600 text-base">Data Summary</div>
                            <div className="text-gray-500 pt-1">Last update: {lastUpdatedMonitoring ? toVietnamTime(lastUpdatedMonitoring) : "__"}</div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                            <div className="bg-[#FFE2E5] p-5 rounded-xl text-gray-700">
                                <div className="bg-[#FA5A7D] p-2 rounded-full h-10 w-10">
                                    <ChartLine className="text-white" />
                                </div>
                                <div className="text-2xl font-semibold pt-4">
                                    {sensorData?.maxValue?.toFixed(2) ?? "__"}
                                </div>
                                <div className="pt-1 font-medium">Maximum</div>
                                <div className="text-xs text-blue-500 pt-2">Summary of sensor values</div>
                            </div>

                            <div className="bg-[#FFF4DE] p-5 rounded-xl text-gray-700">
                                <div className="bg-[#FF947A] p-2 rounded-full h-10 w-10">
                                    <ChartLine className="text-white" />
                                </div>
                                <div className="text-2xl font-semibold pt-4">
                                    {sensorData?.avgValue?.toFixed(2) ?? "__"}
                                </div>
                                <div className="pt-1 font-medium">Average</div>
                                <div className="text-xs text-blue-500 pt-2">Summary of sensor values</div>
                            </div>

                            <div className="bg-[#DCFCE7] p-5 rounded-xl text-gray-700">
                                <div className="bg-[#3CD856] p-2 rounded-full h-10 w-10">
                                    <ChartLine className="text-white" />
                                </div>
                                <div className="text-2xl font-semibold pt-4">
                                    {sensorData?.minValue?.toFixed(2) ?? "__"}
                                </div>
                                <div className="pt-1 font-medium">Minimum</div>
                                <div className="text-xs text-blue-500 pt-2">Summary of sensor values</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-white pr-6 py-4 rounded-xl shadow-sm">
                        <div className="px-6">
                            <div className="font-semibold text-gray-600 text-base">
                                {`${sensorData?.name} Trend Chart`}
                            </div>
                            <div className="text-gray-500 pt-1">Last update: {lastUpdatedChartTime ? toVietnamTime(lastUpdatedChartTime) : "__"}</div>
                        </div>
                        <div className="pl-6 pt-4">
                            {isLoadingChart ? (
                                <div className="min-h-52">
                                    <Skeleton active />
                                </div>
                            ) : (
                                <SensorTrendChart data={dailySensorData || []} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 rounded-xl shadow-sm bg-white">
                <div className="font-semibold text-gray-600 text-base pb-4">{`${sensorData?.name} Data Log`}</div>
                <TableAnt
                    columns={columns}
                    dataSource={logSensorLogs || []}
                    pagination={false}
                    bordered={false}
                    loading={isLoading}
                />
                <div className="py-4">
                    <Pagination
                        className="flex justify-end"
                        total={logTotalRecords || 0}
                        pageSize={10}
                        showSizeChanger={false}
                        onChange={(page: number) => setCurrentPage(page)}
                    />
                </div>
            </div>
        </div>
    )
}
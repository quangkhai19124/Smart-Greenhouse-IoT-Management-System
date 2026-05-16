import TableAnt from "@/components/TableAnt";
import ToggleCountChart from "@/components/ToggleCountChart";
import { ILogData } from "@/models/deviceControl.type";
import { toVietnamTime } from "@/utils/functions";
import { Breadcrumb, DatePicker, Pagination, Skeleton } from "antd";
import { ColumnType } from "antd/es/table";
import { ChartLine } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useFetchDeviceDataLogs, useFetchDeviceStatus, useFetchDeviceToggleCount } from "./api";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export const DeviceControlDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigator = useNavigate();
    const [lastUpdatedMonitoring, setLastUpdatedMonitoring] = useState<string>("");
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [currentPage, setCurrentPage] = useState<number>(1);

    const defaultDateRange: [dayjs.Dayjs, dayjs.Dayjs] = [
        dayjs().subtract(7, 'day'),
        dayjs()
    ];
    const [selectedDateRange, setSelectedDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(defaultDateRange);

    const startDate = selectedDateRange?.[0];
    const endDate = selectedDateRange?.[1];

    const startDateString = startDate?.format('YYYY-MM-DD') + ' 00:00:00';
    const endDateString = endDate?.format('YYYY-MM-DD') + ' 23:59:59';

    const { data: deviceStatus, isLoading: isLoadingDeviceStatus } = useFetchDeviceStatus(id);
    const { data: deviceDataLogs, isLoading: isLoadingDeviceDataLogs } = useFetchDeviceDataLogs(
        id, 
        currentPage, 
        startDateString || '', 
        endDateString || ''
    );
    const { data: deviceToggleCount, isLoading: isLoadingDeviceToggleCount } = useFetchDeviceToggleCount(
        id,
        startDateString || '',
        endDateString || ''
    );

    useEffect(() => {
        setLastUpdatedMonitoring(new Date().toISOString());
    }, [deviceStatus]);

    const runtimeDisplay = useMemo(() => {
        if (!deviceStatus?.runtimeLog || deviceStatus?.status !== "ON") {
            return "__:__:__";
        }

        try {
            const startTime = new Date(deviceStatus.runtimeLog);
            const now = currentTime;
            const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            
            if (diffInSeconds < 0) return "00:00:00";
            
            const hours = Math.floor(diffInSeconds / 3600);
            const minutes = Math.floor((diffInSeconds % 3600) / 60);
            const seconds = diffInSeconds % 60;
            
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } catch {
            return "__:__:__";
        }
    }, [deviceStatus?.runtimeLog, deviceStatus?.status, currentTime]);

    useEffect(() => {
        if (deviceStatus?.status !== "ON") {
            return;
        }

        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, [deviceStatus?.status]);

    const columns : ColumnType<ILogData>[] = [
        {
          title: "Timestamp",
          dataIndex: "time",
          key: "time",
          render: (text: string) => {
            return <span>{toVietnamTime(text)}</span>;
          }
        },
        {
            title: "Device Status",
            dataIndex: "value",
            key: "value",
            render: (_, record: ILogData) => (
            <span
                style={{
                backgroundColor: record.value === "ON" ? "#E9FFF3" : "#F5F5F5",
                color: record.value === "ON" ? "#22A76F" : "#9E9E9E",
                padding: "4px 12px",
                borderRadius: "16px",
                fontWeight: 500,
                }}
            >
                {record.value}
            </span>
            ),
        },
        {
          title: "Control Mode",
          dataIndex: "mode",
          key: "mode",
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "description",
        }
      ];


    return (
        <div>
            <div className="bg-white p-6 rounded-lg flex justify-between items-center">
                <Breadcrumb
                    items={[
                        {
                            title: <div className="cursor-pointer" onClick={() => navigator("/device-control")}>Device Control</div>,
                        },
                        {
                            title: deviceStatus?.deviceName,
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
                            setCurrentPage(1);
                        }
                    }}
                />
            </div>
            <div className="py-6">
                <div className="flex gap-6 xl:flex-row flex-col">
                    <div className="bg-white px-6 py-4 rounded-xl shadow-sm">
                        <div>
                            <div className="font-semibold text-gray-600 text-base">Device Status</div>
                            <div className="text-gray-500 pt-1">Last update: {lastUpdatedMonitoring ? toVietnamTime(lastUpdatedMonitoring) : "__"}</div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                            <div className="bg-[#FFE2E5] p-5 rounded-xl text-gray-700">
                                <div className="bg-[#FA5A7D] p-2 rounded-full h-10 w-10">
                                    <ChartLine className="text-white" />
                                </div>
                                <div className="text-2xl font-semibold pt-4">
                                    {isLoadingDeviceStatus ? "__" : deviceStatus?.status ?? "__"}
                                </div>
                                <div className="pt-1 font-medium">Current Status</div>
                                <div className="text-xs text-blue-500 pt-2">Device is switched off</div>
                            </div>

                            <div className="bg-[#FFF4DE] p-5 rounded-xl text-gray-700">
                                <div className="bg-[#FF947A] p-2 rounded-full h-10 w-10">
                                    <ChartLine className="text-white" />
                                </div>
                                <div className="text-2xl font-semibold pt-4">
                                    {isLoadingDeviceStatus ? "__" : deviceStatus?.power ?? "__"}%
                                </div>
                                <div className="pt-1 font-medium">Device Power</div>
                                <div className="text-xs text-blue-500 pt-2">Device is switched off</div>
                            </div>

                            <div className="bg-[#DCFCE7] p-5 rounded-xl text-gray-700">
                                <div className="bg-[#3CD856] p-2 rounded-full h-10 w-10">
                                    <ChartLine className="text-white" />
                                </div>
                                <div className="text-2xl font-semibold pt-4">
                                    {isLoadingDeviceStatus ? "__" : runtimeDisplay}
                                </div>
                                <div className="pt-1 font-medium">Device Runtime</div>
                                <div className="text-xs text-blue-500 pt-2">
                                    {deviceStatus?.status === "ON" ? "Device is running" : "Device is turned off"}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-white pr-6 py-4 rounded-xl shadow-sm">
                        <div className="px-6">
                            <div className="font-semibold text-gray-600 text-base">
                                Toggle Count
                            </div>
                            <div className="text-gray-500 pt-1">Last update: {lastUpdatedMonitoring ? toVietnamTime(lastUpdatedMonitoring) : "__"}</div>
                        </div>
                        <div className="pl-6 pt-4">
                            {isLoadingDeviceToggleCount ? (
                                <div className="min-h-62">
                                    <Skeleton active />
                                </div>
                            ) : (
                                <ToggleCountChart data={deviceToggleCount || []} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 rounded-xl shadow-sm bg-white">
                <div className="font-semibold text-gray-600 text-base pb-4">Supplemental Light Data Log</div>
                <TableAnt
                columns={columns}
                dataSource={deviceDataLogs?.logs || []}
                pagination={false}
                bordered={false}
                loading={isLoadingDeviceDataLogs}
                />
                <div className="py-4">
                <Pagination
                    className="flex justify-end"
                    total={deviceDataLogs?.totalRecords || 0}
                    pageSize={10}
                    showSizeChanger={false}
                    showQuickJumper
                />
                </div>
            </div>
        </div>
    )
}
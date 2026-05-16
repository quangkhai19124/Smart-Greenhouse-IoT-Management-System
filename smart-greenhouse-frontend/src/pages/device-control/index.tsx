import { SettingOutlined } from "@ant-design/icons";
import { Pagination, Switch, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import Settings from "./components/Settings";
import { IDeviceDashboardData } from "@/models/deviceControl.type";
import TableAnt from "@/components/TableAnt";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router";
import { useFetchAllDevices, useToggleDevice } from "./api";
import { useNotificationProvider } from "@/providers/notification";

export default function DeviceControlPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
   
  const [selectedDevice, setSelectedDevice] = useState<IDeviceDashboardData | null>(null);
  const [togglingDeviceId, setTogglingDeviceId] = useState<number | null>(null);
  const navigator = useNavigate();
  const notificationProvider = useNotificationProvider();

  const { data: devicesData, isLoading, refetch } = useFetchAllDevices();
  const { toggleDevice } = useToggleDevice();

  const columns: ColumnsType<IDeviceDashboardData> = [
    {
      title: "Device ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => (
        <span style={{ color: "#3e8e7e", fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: "Device Name",
      dataIndex: "deviceName",
      key: "deviceName",
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Device Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Device Mode Control",
      dataIndex: "mode",
      key: "mode",
    },
    {
      title: "Device Status",
      dataIndex: "status",
      key: "status",
      render: (_, record: IDeviceDashboardData) => (
        <span
          style={{
            backgroundColor: record.status === "ON" ? "#E9FFF3" : "#F5F5F5",
            color: record.status === "ON" ? "#22A76F" : "#9E9E9E",
            padding: "4px 12px",
            borderRadius: "16px",
            fontWeight: 500,
          }}
        >
          {record.status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record: IDeviceDashboardData) => (
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Tooltip title="Toggle Status">
            <Switch
              checked={record.status === "ON"}
              loading={togglingDeviceId === record.id}
              onChange={async () => {
                try {
                  setTogglingDeviceId(record.id);
                  const response = await toggleDevice(record.id);
                  const EC = response?.data?.EC;
                  if(EC !== 0) {
                    notificationProvider.open({
                      type: 'error',
                      message: response?.data?.EM || 'Toggle device failed!',
                    });
                  }
                  await refetch();  
                } catch (error) {
                  console.error("Failed to toggle device:", error);
                } finally {
                  setTogglingDeviceId(null);
                }
              }}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Eye
              className="!text-gray-600 cursor-pointer text-lg"
              onClick={() => navigator(`/device-control/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Settings">
            <SettingOutlined
              className="!text-gray-600 cursor-pointer text-lg"
              onClick={() => {
                setSelectedDevice(record);
                setSettingsOpen(true);
              }}
            />
          </Tooltip>
        </div>
      ),
      align: "center",
    },
  ];

  return (
    <div className="px-6 py-4 rounded-xl shadow-sm bg-white">
      <div className="font-semibold text-gray-600 text-base pb-4">Device Control</div>
      <TableAnt
        columns={columns}
        dataSource={devicesData}
        pagination={false}
        bordered={false}
        loading={isLoading}
      />
      <div className="py-4">
        <Pagination
          className="flex justify-end"
          total={devicesData?.length}
          pageSize={10}
          showSizeChanger={false}
          showQuickJumper
        />
      </div>
      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        device={selectedDevice}
        refetchAllDevices={refetch}
      />
    </div>
  );
}
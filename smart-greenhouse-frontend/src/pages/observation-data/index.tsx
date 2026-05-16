import { SettingOutlined } from "@ant-design/icons";
import { Pagination, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useMemo } from "react";
import TableAnt from "@/components/TableAnt";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router";
import { ISensorData } from "@/models/observationdata.type";
import SettingSensor from "./components/SettingSensor";
import { useFetchAllSensors } from "./api";

export default function ObservationPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ISensorData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigator = useNavigate();

  const { data, isLoading } = useFetchAllSensors();

  const paginatedData = useMemo(() => {
    if (!data) return [];
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  const columns: ColumnsType<ISensorData> = [
    {
      title: "Sensor ID",
      dataIndex: "id",
      key: "id",
      width: 110,
      align: "center",
      render: (text: string) => (
        <span style={{ color: "#3e8e7e", fontWeight: 500, textAlign: "center" }}>{text}</span>
      ),
    },
    {
      title: "Sensor Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Sensor Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record: ISensorData) => (
        <div className="w-full flex justify-center gap-2 px-10">
          <Tooltip title="View Details">
            <Eye
              className="!text-gray-600 cursor-pointer text-lg"
              onClick={() => navigator(`/observation-data/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Settings">
            <SettingOutlined
              className="!text-gray-600 cursor-pointer text-lg"
              onClick={() => {
                setSelectedItems(record);
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
      <div className="font-semibold text-gray-600 text-base pb-4">Observation Data</div>
      <TableAnt
        loading={isLoading}
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
        bordered={false}
      />
      <div className="py-4">
        <Pagination
          className="flex justify-end"
          current={currentPage}
          total={data?.length || 0}
          pageSize={pageSize}
          showTotal={(total, range) => 
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={(page, size) => {
            setCurrentPage(page);
            if (size !== pageSize) {
              setPageSize(size);
            }
          }}
          hideOnSinglePage
        />
      </div>
      <SettingSensor
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        selectedItems={selectedItems}
      />
    </div>
  );
}
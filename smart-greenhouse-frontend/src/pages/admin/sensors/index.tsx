import React, { useMemo, useState, useEffect } from "react";
import { Table, Button, Input, Modal, Form, Select, Space, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import sensorService, { ISensor } from "@/services/sensorService";

const { Search } = Input;
const { Option } = Select;

interface SensorItem {
  id: number;
  sensorName: string;
  name: string;
  description: string;
  status: string;
}

type SensorFormValues = {
  sensorName: string;
  name: string;
  description: string;
  status: string;
};

const SensorManagementPage: React.FC = () => {
  const [sensors, setSensors] = useState<SensorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<SensorItem | null>(null);
  const [form] = Form.useForm();
  const [sensorNames, setSensorNames] = useState<string[]>([]);
  const [loadingSensorNames, setLoadingSensorNames] = useState(false);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    setLoading(true);
    try {
      const data = await sensorService.getAllSensors();
      setSensors(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch sensors');
    } finally {
      setLoading(false);
    }
  };

  const filteredSensors = useMemo(() => {
    const lower = searchText.toLowerCase();
    return sensors.filter((s) =>
      s.id.toString().includes(lower) ||
      s.sensorName.toLowerCase().includes(lower) ||
      s.name.toLowerCase().includes(lower) ||
      s.description.toLowerCase().includes(lower)
    );
  }, [sensors, searchText]);

  const columns: ColumnsType<SensorItem> = [
    { title: "Sensor ID", dataIndex: "id", key: "id", width: 100 },
    { title: "Sensor Name", dataIndex: "sensorName", key: "sensorName", width: 150 },
    { title: "Display Name", dataIndex: "name", key: "name", width: 150 },
    { title: "Sensor Description", dataIndex: "description", key: "description" },
    {
      title: "Sensor Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={status === "ON" ? "green" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: unknown, record: SensorItem) => (
        <Space size="small">
          <Button type="text" icon={<DeleteOutlined />} danger onClick={() => onDelete(record.id)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
        </Space>
      ),
    },
  ];

  const fetchSensorNames = async (includeCurrent?: string) => {
    setLoadingSensorNames(true);
    try {
      const names = await sensorService.getNewSensorFeedName();
      // Include current sensor name in edit mode if provided
      if (includeCurrent && !names.includes(includeCurrent)) {
        setSensorNames([includeCurrent, ...names]);
      } else {
        setSensorNames(names);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch sensor feed names');
      setSensorNames([]);
    } finally {
      setLoadingSensorNames(false);
    }
  };

  const onAdd = async () => {
    form.resetFields();
    await fetchSensorNames();
    setIsAddOpen(true);
  };

  const onEdit = async (item: SensorItem) => {
    setEditing(item);
    form.setFieldsValue(item);
    await fetchSensorNames(item.sensorName);
    setIsEditOpen(true);
  };

  const onDelete = async (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this sensor?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await sensorService.deleteSensor({ id });
          message.success("Deleted successfully");
          fetchSensors();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete sensor');
        }
      },
    });
  };

  const submitAdd = async (values: SensorFormValues) => {
    try {
      await sensorService.createSensor({
        sensorName: values.sensorName,
        name: values.name,
        description: values.description,
        status: values.status,
      });
      message.success("Sensor added");
      setIsAddOpen(false);
      form.resetFields();
      fetchSensors();
    } catch (error: any) {
      message.error(error.message || 'Failed to create sensor');
    }
  };

  const submitEdit = async (values: SensorFormValues) => {
    if (!editing) return;
    try {
      await sensorService.updateSensor({
        id: editing.id,
        sensorName: values.sensorName,
        name: values.name,
        description: values.description,
        status: values.status,
      });
      message.success("Sensor updated");
      setIsEditOpen(false);
      setEditing(null);
      form.resetFields();
      fetchSensors();
    } catch (error: any) {
      message.error(error.message || 'Failed to update sensor');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sensor Management</h1>
        <div className="flex items-center gap-4">
          <Search
            placeholder="Search..."
            allowClear
            style={{ width: 260 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} className="bg-green-500 border-green-500" onClick={onAdd}>
            Add Sensor
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredSensors}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Show ${range[0]}-${range[1]} of ${total} entries`,
          }}
        />
      </div>

      {/* Add Modal */}
      <Modal title="Add Sensor" open={isAddOpen} onCancel={() => setIsAddOpen(false)} footer={null} width={520}>
        <Form layout="vertical" form={form} onFinish={submitAdd}>
          <Form.Item label="Sensor Name (Technical)" name="sensorName" rules={[{ required: true, message: "Please select sensor name" }]}> 
            <Select 
              placeholder="Select Sensor Name (Technical)" 
              loading={loadingSensorNames}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {sensorNames.map((name) => (
                <Option key={name} value={name} label={name}>
                  {name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Display Name" name="name" rules={[{ required: true, message: "Please input display name" }]}> 
            <Input placeholder="Input Display Name (e.g. Temperature)" />
          </Form.Item>
          <Form.Item label="Sensor Description" name="description" rules={[{ required: true, message: "Please input sensor description" }]}> 
            <Input placeholder="Input Sensor Description" />
          </Form.Item>
          <Form.Item label="Sensor Status" name="status" initialValue="OFF" rules={[{ required: true }]}> 
            <Select>
              <Option value="ON">ON</Option>
              <Option value="OFF">OFF</Option>
            </Select>
          </Form.Item>
          <div className="text-right">
            <Space>
              <Button onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" className="bg-green-500 border-green-500">Save</Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal title="Edit Sensor" open={isEditOpen} onCancel={() => { setIsEditOpen(false); setEditing(null); }} footer={null} width={520}>
        <Form layout="vertical" form={form} onFinish={submitEdit}>
          <Form.Item label="Sensor Name (Technical)" name="sensorName" rules={[{ required: true, message: "Please select sensor name" }]}> 
            <Select 
              placeholder="Select Sensor Name (Technical)" 
              loading={loadingSensorNames}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {sensorNames.map((name) => (
                <Option key={name} value={name} label={name}>
                  {name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Display Name" name="name" rules={[{ required: true, message: "Please input display name" }]}> 
            <Input placeholder="Display Name" />
          </Form.Item>
          <Form.Item label="Sensor Description" name="description" rules={[{ required: true, message: "Please input sensor description" }]}> 
            <Input placeholder="Sensor Description" />
          </Form.Item>
          <Form.Item label="Sensor Status" name="status" rules={[{ required: true }]}> 
            <Select>
              <Option value="ON">ON</Option>
              <Option value="OFF">OFF</Option>
            </Select>
          </Form.Item>
          <div className="text-right">
            <Space>
              <Button danger onClick={() => { if (editing) { onDelete(editing.id); setIsEditOpen(false); setEditing(null); } }}>Delete</Button>
              <Button onClick={() => { setIsEditOpen(false); setEditing(null); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" className="bg-green-500 border-green-500">Save</Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SensorManagementPage;

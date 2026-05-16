import React, { useMemo, useState, useEffect } from "react";
import { Table, Button, Input, Modal, Form, Select, Space, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import deviceService, { IDevice } from "@/services/deviceService";

const { Search } = Input;
const { Option } = Select;

interface DeviceItem {
  id: number;
  adaDevName: string;
  deviceName: string;
  description: string;
  status: string;
}

type DeviceFormValues = {
  adaDevName: string;
  deviceName: string;
  description: string;
  status: string;
};

const DeviceManagementPage: React.FC = () => {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<DeviceItem | null>(null);
  const [form] = Form.useForm();
  const [adaDevNames, setAdaDevNames] = useState<string[]>([]);
  const [loadingAdaDevNames, setLoadingAdaDevNames] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await deviceService.getAllDevices();
      setDevices(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = useMemo(() => {
    const lower = searchText.toLowerCase();
    return devices.filter((d) =>
      d.id.toString().includes(lower) ||
      d.deviceName.toLowerCase().includes(lower) ||
      d.adaDevName.toLowerCase().includes(lower) ||
      d.description.toLowerCase().includes(lower)
    );
  }, [devices, searchText]);

  const columns: ColumnsType<DeviceItem> = [
    { title: "Device ID", dataIndex: "id", key: "id", width: 100 },
    { title: "Adafruit Name", dataIndex: "adaDevName", key: "adaDevName", width: 150 },
    { title: "Device Name", dataIndex: "deviceName", key: "deviceName", width: 150 },
    { title: "Device Description", dataIndex: "description", key: "description" },
    {
      title: "Device Status",
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
      width: 120,
      render: (_: unknown, record: DeviceItem) => (
        <Space size="small">
          <Button type="text" icon={<DeleteOutlined />} danger onClick={() => onDelete(record.id, record.adaDevName)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
        </Space>
      ),
    },
  ];

  const fetchAdaDevNames = async (includeCurrent?: string) => {
    setLoadingAdaDevNames(true);
    try {
      const names = await deviceService.getNewDeviceFeedName();
      // Include current device name in edit mode if provided
      if (includeCurrent && !names.includes(includeCurrent)) {
        setAdaDevNames([includeCurrent, ...names]);
      } else {
        setAdaDevNames(names);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch device feed names');
      setAdaDevNames([]);
    } finally {
      setLoadingAdaDevNames(false);
    }
  };

  const onAdd = async () => {
    form.resetFields();
    await fetchAdaDevNames();
    setIsAddOpen(true);
  };

  const onEdit = async (item: DeviceItem) => {
    setEditing(item);
    form.setFieldsValue(item);
    await fetchAdaDevNames(item.adaDevName);
    setIsEditOpen(true);
  };

  const onDelete = async (_id: number, adaDevName: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this device?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await deviceService.deleteDevice({ adaDevName });
          message.success("Deleted successfully");
          fetchDevices();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete device');
        }
      },
    });
  };

  const submitAdd = async (values: DeviceFormValues) => {
    try {
      await deviceService.createDevice({
        adaDevName: values.adaDevName,
        deviceName: values.deviceName,
        description: values.description,
        status: values.status,
        mode: "MANUAL"
      });
      message.success("Device added");
      setIsAddOpen(false);
      form.resetFields();
      fetchDevices();
    } catch (error: any) {
      message.error(error.message || 'Failed to create device');
    }
  };

  const submitEdit = async (values: DeviceFormValues) => {
    if (!editing) return;
    try {
      await deviceService.updateDevice({
        id: editing.id,
        adaDevName: values.adaDevName,
        deviceName: values.deviceName,
        description: values.description,
        status: values.status,
      });
      message.success("Device updated");
      setIsEditOpen(false);
      setEditing(null);
      form.resetFields();
      fetchDevices();
    } catch (error: any) {
      message.error(error.message || 'Failed to update device');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Device Management</h1>
        <div className="flex items-center gap-4">
          <Search
            placeholder="Search..."
            allowClear
            style={{ width: 260 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} className="bg-green-500 border-green-500" onClick={onAdd}>
            Add Device
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredDevices}
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
      <Modal title="Add Device" open={isAddOpen} onCancel={() => setIsAddOpen(false)} footer={null} width={520}>
        <Form layout="vertical" form={form} onFinish={submitAdd}>
          <Form.Item label="Adafruit Device Name" name="adaDevName" rules={[{ required: true, message: "Please select Adafruit device name" }]}> 
            <Select 
              placeholder="Select Adafruit Device Name" 
              loading={loadingAdaDevNames}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {adaDevNames.map((name) => (
                <Option key={name} value={name} label={name}>
                  {name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Device Name" name="deviceName" rules={[{ required: true, message: "Please input device name" }]}> 
            <Input placeholder="Input Device Name" />
          </Form.Item>
          <Form.Item label="Device Description" name="description" rules={[{ required: true, message: "Please input device description" }]}> 
            <Input placeholder="Input Device Description" />
          </Form.Item>
          <Form.Item label="Device Status" name="status" initialValue="OFF" rules={[{ required: true }]}> 
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
      <Modal title="Edit Device" open={isEditOpen} onCancel={() => { setIsEditOpen(false); setEditing(null); }} footer={null} width={520}>
        <Form layout="vertical" form={form} onFinish={submitEdit}>
          <Form.Item label="Adafruit Device Name" name="adaDevName" rules={[{ required: true, message: "Please select Adafruit device name" }]}> 
            <Select 
              placeholder="Select Adafruit Device Name" 
              loading={loadingAdaDevNames}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {adaDevNames.map((name) => (
                <Option key={name} value={name} label={name}>
                  {name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Device Name" name="deviceName" rules={[{ required: true, message: "Please input device name" }]}> 
            <Input placeholder="Device Name" />
          </Form.Item>
          <Form.Item label="Device Description" name="description" rules={[{ required: true, message: "Please input device description" }]}> 
            <Input placeholder="Device Description" />
          </Form.Item>
          <Form.Item label="Device Status" name="status" rules={[{ required: true }]}> 
            <Select>
              <Option value="ON">ON</Option>
              <Option value="OFF">OFF</Option>
            </Select>
          </Form.Item>
          <div className="text-right">
            <Space>
              <Button danger onClick={() => { if (editing) { onDelete(editing.id, editing.adaDevName); setIsEditOpen(false); setEditing(null); } }}>Delete</Button>
              <Button onClick={() => { setIsEditOpen(false); setEditing(null); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" className="bg-green-500 border-green-500">Save</Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceManagementPage;

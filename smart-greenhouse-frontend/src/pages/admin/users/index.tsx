import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, Select, Space, Tag, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetIdentity } from '@refinedev/core';
import userService, { IUser, ICreateUserRequest, IUpdateUserRequest } from '@/services/userService';

const { Search } = Input;
const { Option } = Select;

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
}

type AddUserFormValues = {
  username: string;
  email: string;
  password: string;
  role: string;
  status?: string;
};

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const { data: currentUser } = useGetIdentity<{ email?: string }>();

  // Check if the user being edited is the current admin
  const isEditingSelf = Boolean(editingUser && currentUser && editingUser.email === currentUser.email);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'User ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'UserName',
      dataIndex: 'username',
      key: 'username',
      width: 200,
    },
    {
      title: 'User Email',
      dataIndex: 'email',
      key: 'email',
      width: 250,
    },
    {
      title: 'User Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
    },
    {
      title: 'User Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: User['status']) => {
        if (!status) return <span>-</span>;
        const isActive = status === 'ACTIVE';
        const displayStatus = status === 'UNACTIVE' ? 'BANNED' : status;
        return (
          <span
            style={{
              backgroundColor: isActive ? '#E9FFF3' : '#FFF1F1',
              color: isActive ? '#22A76F' : '#FF4D4F',
              padding: '4px 12px',
              borderRadius: '16px',
              fontWeight: 500,
              display: 'inline-block',
            }}
          >
            {displayStatus}
          </span>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_: unknown, record: User) => {
        const isCurrentUser = currentUser && record.email === currentUser.email;
        return (
        <Space size="small">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.email)}
              danger
              disabled={isCurrentUser}
          />
            <Switch
              checked={record.status === 'ACTIVE'}
              onChange={(checked) => handleToggleStatus(record, checked)}
              disabled={!record.status || isCurrentUser}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Space>
        );
      },
    },
  ];

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    user.id.toString().includes(searchText.toLowerCase())
  );

  const handleAdd = () => {
    setIsAddModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditModalVisible(true);
    // Map UNACTIVE to BANNED for form display
    const formData = {
      ...user,
      status: user.status === 'UNACTIVE' ? 'BANNED' : user.status,
    };
    form.setFieldsValue(formData);
  };

  const handleToggleStatus = async (user: User, checked: boolean) => {
    try {
      const newStatus = checked ? 'ACTIVE' : 'BANNED';
      await userService.updateUser({
        email: user.email,
        username: user.username,
        role: user.role,
        status: newStatus,
      });
      message.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update user status';
      if (errorMessage === 'Error') {
        message.error('Error');
      } else {
        message.error(errorMessage);
      }
      // Revert Switch state on error
      fetchUsers();
    }
  };

  const handleDelete = async (_userId: number, userEmail: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          await userService.deleteUser({ email: userEmail });
          message.success('User deleted successfully');
          fetchUsers();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete user');
        }
      },
    });
  };

  const handleAddSubmit = async (values: AddUserFormValues) => {
    try {
      const createData: ICreateUserRequest = {
        email: values.email,
        password: values.password,
        username: values.username,
        role: values.role,
        status: values.status ?? 'ACTIVE',
      };
      await userService.createUser(createData);
      message.success('User added successfully');
      setIsAddModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || 'Failed to create user');
    }
  };

  const handleEditSubmit = async (values: Partial<User>) => {
    if (!editingUser) return;
    
    // Prevent admin from editing their own role and status
    if (isEditingSelf) {
      if (values.role !== editingUser.role || values.status !== editingUser.status) {
        message.warning('You cannot change your own role or status');
        return;
      }
    }
    
    try {
      // Ensure all required fields are sent
      const updateData: IUpdateUserRequest = {
          email: editingUser.email,
          username: values.username || editingUser.username,
        // If editing self, keep original role and status
        role: isEditingSelf ? editingUser.role : (values.role || editingUser.role),
        status: isEditingSelf ? editingUser.status : (values.status || editingUser.status),
      };
      
      await userService.updateUser(updateData);
        message.success('User updated successfully');
        setIsEditModalVisible(false);
        setEditingUser(null);
        form.resetFields();
        fetchUsers();
      } catch (error: any) {
      const errorMessage = error.message || 'Failed to update user';
      if (errorMessage === 'Error') {
        message.error('Error');
      } else {
        message.error(errorMessage);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      </div>

      <div className="flex justify-between items-center">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600"
        >
          Add User
        </Button>
        <Search
          placeholder="Search..."
          allowClear
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Show ${range[0]}-${range[1]} of ${total} entries`,
          }}
          scroll={{ x: 800 }}
        />
      </div>

      {/* Add User Modal */}
      <Modal
        title="Add User"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSubmit}
        >
          <Form.Item
            name="username"
            label="Full Name"
            rules={[{ required: true, message: 'Please input full name!' }]}
          >
            <Input placeholder="Input Full Name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please input valid email!' }
            ]}
          >
            <Input placeholder="Input Email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input password!' }]}
          >
            <Input.Password placeholder="Input Password" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role!' }]}
          >
            <Select placeholder="Select role">
              <Option value="admin">Admin</Option>
              <Option value="user">User</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            initialValue="ACTIVE"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select placeholder="Select status">
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="BANNED">BANNED</Option>
            </Select>
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsAddModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600">
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="username"
            label="Full Name"
            rules={[{ required: true, message: 'Please input full name!' }]}
          >
            <Input placeholder="Input Full Name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please input valid email!' }
            ]}
          >
            <Input placeholder="Input Email" disabled />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role!' }]}
          >
            <Select 
              placeholder="Select role" 
              disabled={isEditingSelf}
            >
              <Option value="admin">Admin</Option>
              <Option value="user">User</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select 
              placeholder="Select status" 
              disabled={isEditingSelf}
            >
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="BANNED">BANNED</Option>
            </Select>
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button 
                danger
                onClick={() => {
                  if (editingUser) {
                    handleDelete(editingUser.id, editingUser.email);
                    setIsEditModalVisible(false);
                    setEditingUser(null);
                  }
                }}
                disabled={isEditingSelf}
              >
                Delete
              </Button>
              <Button onClick={() => {
                setIsEditModalVisible(false);
                setEditingUser(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600">
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;

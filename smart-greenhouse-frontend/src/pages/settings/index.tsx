import React, { useState } from 'react';
import { Avatar, Button, Modal, Form, Input, Divider, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { API_AVATAR } from '@/utils/constants';
import { useFetchUserProfile, useUpdateProfile } from './api';

export default function SettingsPage() {
  const { data: profile, isLoading, refetch } = useFetchUserProfile();
  const { updateProfile, isPending } = useUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const username = Form.useWatch('username', form);
  const teleChatID = Form.useWatch('teleChatID', form);

  const openEdit = () => {
    form.setFieldsValue({ username: profile?.username, teleChatID: profile?.teleChatID, avatar: profile?.avatar });
    setEditing(true);
  };

  const handleFinish = async (values: { username: string; teleChatID: string }) => {
    await updateProfile(values);
    await refetch();
    setEditing(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4 py-10">
      {isLoading ? (
        <Spin />
      ) : (
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <Avatar
            size={120}
            src={profile?.avatar || `${API_AVATAR}/?name=${profile?.username}&background=random&size=512`}
            className="bg-gray-200 shadow-md"
          />
          <div className='pt-4'>
            <h2 className="text-2xl font-semibold text-gray-900">
              {profile?.username}
            </h2>
          </div>
          <p className="text-sm text-gray-500">{profile?.email}</p>

          <Divider />

          <div className="mt-2 space-y-1">
            <div className="text-sm text-gray-600">Telegram Chat ID</div>
            <div className="text-base font-medium text-gray-800">
              {profile?.teleChatID || 'Not set'}
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={openEdit}
              className="px-5"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
      )}

      <Modal
        title="Update Profile"
        open={editing}
        onCancel={() => setEditing(false)}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ username: profile?.username, teleChatID: profile?.teleChatID }}
        >
          <Form.Item
            name="username"
            label="FullName"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input placeholder="Your full name" className='!h-10' />
          </Form.Item>

          <Form.Item
            name="teleChatID"
            label="Telegram Chat ID"
          >
            <Input placeholder="your_id" className='!h-10' />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button className='!h-10' onClick={() => setEditing(false)}>Cancel</Button>
            <Button
              className='!h-10'
              type="primary"
              htmlType="submit"
              disabled={
                username === profile?.username && teleChatID === profile?.teleChatID
              }
              loading={isPending}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

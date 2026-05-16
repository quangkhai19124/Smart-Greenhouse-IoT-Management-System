import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import {
  Layout as AntdLayout,
  Avatar,
  Input,
  theme,
  Button,
  Badge,
  Select,
  Popover,
  List,
  Typography,
  Divider,
} from "antd";
import React, { useMemo } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import { useFetchUserProfile } from "@/pages/settings/api";
import { useFetchNotifications, useMarkNotificationAsRead } from "./api";
import { API_AVATAR } from "@/utils/constants";


const { useToken } = theme;

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const { data: identity } = useFetchUserProfile();

  const displayName = identity?.username;
  const displayRole = identity?.role ? (identity.role.charAt(0).toUpperCase() + identity.role.slice(1)) : "Farmer";

  const { data: notificationsData, isLoading: isLoadingNotifications } = useFetchNotifications();
  const { markAsRead } = useMarkNotificationAsRead();
  const [localReadStatus, setLocalReadStatus] = React.useState<Record<number, boolean>>({});

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    }
  };

  const notifications = useMemo(() => {
    if (!notificationsData) return [];
    
    return notificationsData.map((notif) => {
      const isRead = localReadStatus[notif.notifID] ?? (notif.status === "READ");
      const datetime = new Date(notif.content.createdAt).toLocaleString('vi-VN');
      
      return {
        id: notif.notifID,
        message: notif.content.message || notif.content.title,
        title: notif.content.title,
        time: formatTimeAgo(notif.content.createdAt),
        datetime: datetime,
        isRead: isRead,
      };
    });
  }, [notificationsData, localReadStatus]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (id: number) => {
    setLocalReadStatus(prev => ({ ...prev, [id]: true }));
    
    try {
      await markAsRead(id);
    } catch {
      setLocalReadStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[id];
        return newStatus;
      });
    }
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    alignItems: "center",
    padding: "0px 24px",
    widows: "100%",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  return (
    <AntdLayout.Header style={headerStyles} className="justify-end sm:justify-between">
        <div className="hidden sm:block">
          <Input
            className="h-10 !max-w-96 !rounded-2xl !bg-gray-50 !border-gray-100 !shadow-none hidden sm:block"
            placeholder="Search..."
            prefix={<Search className="text-gray-300" size={16} />}
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center">
            <Select value={"en"} className="w-fit" bordered={false} size="large">
              <Select.Option value="en">
                <div className="flex items-center gap-2">
                  <Avatar
                    src="/usa-flag.webp"
                    alt="English"
                    size={20}
                    shape="circle"
                  />
                  <div className="font-semibold text-gray-700">English (US)</div>
                </div>
              </Select.Option>
            </Select>
          </div>
          <Popover
            placement="bottomRight"
            trigger={["click"]}
            overlayStyle={{ width: 360 }}
            content={
              <div>
                <div className="flex justify-between items-center">
                  <div className="font-semibold">Thông báo</div>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                {isLoadingNotifications ? (
                  <div className="text-center py-4 text-gray-500">Đang tải...</div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Không có thông báo</div>
                ) : (
                  <List
                    itemLayout="vertical"
                    dataSource={notifications}
                    renderItem={(item) => (
                    <List.Item 
                      key={item.id}
                      onClick={() => handleNotificationClick(item.id)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: item.isRead ? 'transparent' : '#f0f9ff',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '4px'
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <div className="flex items-start gap-2">
                            {!item.isRead && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                            )}
                            <Typography.Text strong={!item.isRead}>{item.message}</Typography.Text>
                          </div>
                        }
                        description={
                          <div className="flex flex-col gap-1" style={{ marginLeft: !item.isRead ? '12px' : '0' }}>
                            <Typography.Text type="secondary">{item.time}</Typography.Text>
                            <Typography.Text type="secondary" className="text-xs">
                              {item.datetime}
                            </Typography.Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                  />
                )}
              </div>
            }
          >
            <Badge count={unreadCount} overflowCount={99} size="small" offset={[-5, 5]}>
              <Button
                type="text"
                className="!rounded-xl flex items-center !h-10 !w-10 !justify-center"
                icon={<Bell className="text-gray-300" size={20} />}
              />
            </Badge>
          </Popover>

          <Popover
            placement="bottomRight"
            trigger={["click"]}
            content={
              <div className="min-w-56">
                <div className="flex items-center gap-3">
                  <Avatar shape="square" size={40} className="!rounded-xl" src={identity?.avatar || `${API_AVATAR}/?name=${identity?.username}&background=random&size=512`} />
                  <div>
                    <div className="font-semibold">{displayName}</div>
                    <div className="text-gray-500 text-sm">{displayRole}</div>
                  </div>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div className="flex flex-col gap-1 text-sm">
                  <div>Email: {identity?.email || "N/A"}</div>
                  <div>Role: {displayRole}</div>
                </div>
              </div>
            }
            >
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar
                shape="square"
                size={40}
                className="!rounded-xl"
                src={identity?.avatar || `${API_AVATAR}/?name=${identity?.username}&background=random&size=512`}
              />
              <div className="flex items-start gap-3">
                <div className="flex flex-col justify-center gap-1">
                  <div className="font-semibold leading-tight">{displayName}</div>
                  <div className="text-gray-500 leading-tight">{displayRole}</div>
                </div>
                <ChevronDown className="cursor-pointer" size={18} />
              </div>
            </div>
          </Popover>
        </div>
    </AntdLayout.Header>
  );
};

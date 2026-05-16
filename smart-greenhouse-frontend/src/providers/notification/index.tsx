import { App } from "antd";
import { OpenNotificationParams } from "@refinedev/core";
import SuccessIcon from "@/components/Icons/SuccessIcon";
import CloseCircleIcon from "@/components/Icons/CloseCircleIcon";
import InfoCircleIcon from "@/components/Icons/InfoCircleIcon";

interface NotificationProps extends OpenNotificationParams {
  placement?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  duration?: number;
  icon?: React.ReactNode;
}

export const useNotificationProvider = () => {
  const { notification } = App.useApp();

  return {
    open: (params: NotificationProps) => {
      const {
        key,
        type,
        message,
        description,
        icon,
        duration = 3,
        placement = "topRight",
      } = params;

      switch (type) {
        case "progress":
          notification.info({
            message: message ?? description,
            description,
            icon: icon ?? <InfoCircleIcon />,
            className: "notification-error-custom-dark",
            placement,
            duration,
            key,
          });
          break;
        case "success":
          notification.success({
            message: message ?? description,
            description,
            icon: icon ?? <SuccessIcon />,
            className: "notification-success-custom",
            placement,
            duration,
            key,
          });
          break;
        case "error":
        default:
          notification.error({
            message: message ?? description,
            description,
            icon: icon ?? <CloseCircleIcon />,
            className: "notification-error-custom",
            placement,
            duration,
            key,
          });
          break;
      }
    },
    close: (key?: string | number) => {
      if (key) {
        notification.destroy(key);
      } else {
        notification.destroy();
      }
    },
  };
};

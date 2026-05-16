import { API_GET_NOTIF, API_MARK_NOTIF_AS_READ } from "@/api";
import { useCustom, useCustomMutation } from "@refinedev/core";

export interface INotificationContent {
    title: string;
    message: string;
    createdAt: string;
}

export interface INotification {
    notifID: number;
    status: "UNREAD" | "READ";
    content: INotificationContent;
}

export const useFetchNotifications = () => {
    const url = API_GET_NOTIF;

    const { query } = useCustom<{ DT: INotification[] }>({
        url: url,
        method: 'get',
    });

    const response = query.data?.data?.DT;

    return {
        data: response,
        refetch: query.refetch,
        isLoading: query.isFetching
    };
}

export const useMarkNotificationAsRead = () => {
    const url = API_MARK_NOTIF_AS_READ;

    const { mutateAsync, mutation } = useCustomMutation();

    const markAsRead = async (notifID: number) => {
        return mutateAsync({
            url,
            method: 'post',
            values: { notifID },
            successNotification: false,
            errorNotification: () => false,
        });
    };

    return {
        markAsRead,
        isPending: mutation.isPending,
    };
}


import { API_GET_ALL_SENSOR_NOTIFS, API_UPDATE_SENSOR_NOTIF } from "@/api";
import { INotificationRules} from "@/models/observationdata.type";
import { useCustom, useCustomMutation } from "@refinedev/core";


export const useFetchNotificationRules = (sensorID: number) => {
  const url = API_GET_ALL_SENSOR_NOTIFS;

  const { query } = useCustom<INotificationRules[]>({
    url: url,
    method: 'get',
    queryOptions: {
      enabled: !!sensorID,
      refetchOnMount: 'always',
      staleTime: 0
    },
    config: {
      query: {
        sensorID
      }
    },
  });

  const response = query.data?.data;

  return {
    data: response,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching
  };
}

export const useUpdateNotificationRule = (id: number) => {
  const url = `${API_UPDATE_SENSOR_NOTIF}?sensorID=${id}`;

  const { mutateAsync, mutation } = useCustomMutation<INotificationRules>();

  const updateRule = async (data: Partial<INotificationRules>[]) => {
    return mutateAsync({
      url: url,
      method: 'put',
      values: {
        rules: data
      }
    });
  };

  return {
    updateRule,
    isPending: mutation.isPending, 
  };
};
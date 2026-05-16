import { API_GET_DEVICE_DATA_LOGS, API_GET_DEVICE_STATUS, API_GET_DEVICE_TOGGLE_COUNT } from "@/api";
import { IDeviceStatusData, IResDeviceDataLogs, IResDeviceToggleCount } from "@/models/deviceControl.type";
import { useCustom } from "@refinedev/core";

export const useFetchDeviceStatus = (id: string | undefined) => {
    const url = `${API_GET_DEVICE_STATUS}?id=${id}`;
  
  const { query } = useCustom<{ DT: IDeviceStatusData}>({
    url: url,
    method: 'get',
    queryOptions: {
      enabled: !!id,
    }
  });

  const response = query.data?.data?.DT;

  return {
    data: response,
    refetch: query.refetch,
    isLoading: query.isFetching
  };
}

export const useFetchDeviceDataLogs = (dev_Id: string | undefined, page: number = 1, timeStart: string, timeEnd: string) => {
    const url = API_GET_DEVICE_DATA_LOGS;
  
    const { query } = useCustom<{ DT: IResDeviceDataLogs }>({
      url: url,
      method: 'get',
      queryOptions: {
        enabled: !!dev_Id,
      },
      config: {
        query: {
          dev_Id,
          timeStart,
          timeEnd,
          page
        }
      },
    });
  
    const response = query.data?.data?.DT;
  
    return {
      data: response,
      refetch: query.refetch,
      isLoading: query.isLoading
    };
  }

  export const useFetchDeviceToggleCount = (id: string | undefined, timeStart: string, timeEnd: string) => {
    const url = API_GET_DEVICE_TOGGLE_COUNT;
  
    const { query } = useCustom<{ DT: IResDeviceToggleCount[] }>({
      url: url,
      method: 'get',
      queryOptions: {
        enabled: !!id,
      },
      config: {
        query: {
          id,
          timeStart,
          timeEnd,
        }
      },
    });
  
    const response = query.data?.data?.DT;
  
    return {
      data: response,
      refetch: query.refetch,
      isLoading: query.isLoading
    };
  }
import { API_GET_DAILY_SENSOR_DATA, API_GET_SENSOR_DATA, API_GET_SENSOR_DATA_LOGS } from "@/api";
import { IDailySensorData, IResSensorLogs, ISensorDetailData } from "@/models/observationdata.type";
import { useCustom } from "@refinedev/core";


export const useFetchSensorData = (id: string, timeStart: string, timeEnd: string) => {
  const url = API_GET_SENSOR_DATA;

  const { query } = useCustom<{ DT: ISensorDetailData }>({
    url: url,
    method: 'get',
    queryOptions: {
      enabled: !!id,
    },
    config: {
      query: {
        id,
        timeStart,
        timeEnd
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

export const useFetchDailySensorData = (sensorId: string, timeStart: string, timeEnd: string) => {
  const url = API_GET_DAILY_SENSOR_DATA;

  const { query } = useCustom<{ DT: IDailySensorData[] }>({
    url: url,
    method: 'get',
    queryOptions: {
      enabled: !!sensorId,
    },
    config: {
      query: {
        sensorId,
        timeStart,
        timeEnd
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

export const useFetchSensorDataLogs = (sensorId: string, page: number = 1, timeStart: string, timeEnd: string) => {
  const url = API_GET_SENSOR_DATA_LOGS;

  const { query } = useCustom<{ DT: IResSensorLogs }>({
    url: url,
    method: 'get',
    queryOptions: {
      enabled: !!sensorId,
    },
    config: {
      query: {
        sensorId,
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
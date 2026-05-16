import { API_GET_ALL_SENSORS } from "@/api";
import { ISensorData } from "@/models/observationdata.type";
import { useCustom } from "@refinedev/core";


export const useFetchAllSensors = () => {
    const url = API_GET_ALL_SENSORS;

  const { query } = useCustom<{ DT: ISensorData[] }>({
    url: url,
    method: 'get',
  });

  const response = query.data?.data?.DT;

  return {
    data: response,
    refetch: query.refetch,
    isLoading: query.isLoading
  };
}
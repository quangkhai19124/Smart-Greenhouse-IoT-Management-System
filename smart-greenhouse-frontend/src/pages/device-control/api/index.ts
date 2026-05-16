import { API_GET_ALL_DEVICES, API_TOGGLE_DEVICE } from "@/api";
import { IDeviceDashboardData } from "@/models/deviceControl.type";
import { useCustom, useCustomMutation } from "@refinedev/core";


export const useFetchAllDevices = () => {
    const url = API_GET_ALL_DEVICES;
  
  const { query } = useCustom<{ DT: IDeviceDashboardData[]}>({
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

export const useToggleDevice = () => {
    const url = API_TOGGLE_DEVICE;

    const { mutateAsync, mutation } = useCustomMutation();

  const toggleDevice = async (id: number | undefined) => {
    return mutateAsync({
      url: `${url}?id=${id}`,
      method: 'put',
      values: {}
    });
  };

  return {
    toggleDevice,
    isPending: mutation.isPending, 
  };
}
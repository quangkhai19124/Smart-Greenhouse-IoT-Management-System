import { API_CREATE_DEVICE_SCHEDULE, API_CREATE_SET_RULE, API_DELETE_DEVICE_SCHEDULE, API_DELETE_SET_RULE, API_GET_DEVICE_SETTING, API_UPDATE_DEVICE_MODE, API_UPDATE_DEVICE_SCHEDULE } from "@/api";
import { IChangeModeParams, IResChangeMode, IResDeviceSetting } from "@/models/deviceControl.type";
import { useCustom, useCustomMutation } from "@refinedev/core";
import { IDeleteSetRulePayload } from "../../AutomationModal/api";

export const useFetchDetailSetting = (id: number | undefined) => {
    const url = `${API_GET_DEVICE_SETTING}?id=${id}`;
  
  const { query } = useCustom<{ DT: IResDeviceSetting}>({
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
    isLoading: query.isLoading
  };
}

export const useUpdateDeviceMode = (id: number | undefined) => {
  const url = `${API_UPDATE_DEVICE_MODE}?id=${id}`;

  const { mutateAsync, mutation } = useCustomMutation<IResChangeMode>();

  const updateDeviceMode = async (data: IChangeModeParams) => {
    return mutateAsync({
      url: url,
      method: 'put',
      values: data
    });
  };

  return {
    updateDeviceMode,
    isPending: mutation.isPending, 
  };
};

export const useDeleteScheduleDevice = () => {
  const url = API_DELETE_DEVICE_SCHEDULE

  const { mutateAsync, mutation } = useCustomMutation<IResChangeMode>();

  const deleteScheduleDevice = async (schedId: number, dev_Id: number) => {
    return mutateAsync({
      url: url,
      method: 'delete',
      values: {
        schedId,
        dev_Id
      },
      // suppress default refine notifications; we'll handle manually
      successNotification: false,
      errorNotification: () => false,
    });
  };

  return {
    deleteScheduleDevice,
    isPending: mutation.isPending, 
  };
};


export const useUpdateScheduleDevice = (devId: number | undefined, schedId: number | undefined) => {
  const url = `${API_UPDATE_DEVICE_SCHEDULE}?dev_Id=${devId}&schedId=${schedId}`;

  const { mutateAsync, mutation } = useCustomMutation();

  const updateScheduleDevice = async (payload: {
    dev_id: number;
    schedId: number;
    actionDay: string[];
    timeStart: string; 
    timeEnd: string; 
  }) => {
    return mutateAsync({
      url,
      method: 'put',
      values: payload,
      successNotification: false,
      errorNotification: () => false,
    });
  };

  return {
    updateScheduleDevice,
    isPending: mutation.isPending,
  };
};

export const useCreateScheduleDevice = () => {
  const url = API_CREATE_DEVICE_SCHEDULE

  const { mutateAsync, mutation } = useCustomMutation();

  const createScheduleDevice = async (payload: {
    dev_Id: number;
    power: number;
  }) => {
    return mutateAsync({
      url,
      method: 'post',
      values: payload,
      successNotification: false,
      errorNotification: () => false,
    });
  };

  return {
    createScheduleDevice,
    isPending: mutation.isPending,
  };
};

export const useCreateSetRule = () => {
  const url = API_CREATE_SET_RULE;

  const { mutateAsync, mutation } = useCustomMutation();

  const createSetRule = async (payload: {
    status: 'ON' | 'OFF';
    dev_Id: number;
    power: number;
  }) => {
    return mutateAsync({
      url,
      method: 'post',
      values: {
        status: payload.status,
        dev_Id: payload.dev_Id,
        power: payload.power,
        setType: "AUTO_CONTROL"
      },
      successNotification: false,
      errorNotification: () => false,
    });
  };

  return {
    createSetRule,
    isPending: mutation.isPending,
  };
};

export const useDeleteSetRule = () => {
  const url = `${API_DELETE_SET_RULE}`;

  const { mutateAsync, mutation } = useCustomMutation();

  const deleteSetRule = async (payload: IDeleteSetRulePayload) => {
    return mutateAsync({
      url,
      method: 'delete',
      values: payload,
      successNotification: false,
      errorNotification: () => false,
    });
  };

  return {
    deleteSetRule,
    isPending: mutation.isPending,
  };
}
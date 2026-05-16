import { API_GET_RULES_OF_SET, API_UPDATE_RULES_OF_SET } from "@/api";
import { useCustom, useCustomMutation } from "@refinedev/core";

export interface IRuleData {
  id: number;
  logicOperator: string | null;
  operator: string;
  condition: number;
  sensorId: number;
  sensorName: string;
}

export interface ISetInfo {
  id: number;
  emailNotification: string;
}

export interface IAutoRulesResponse {
  rules: IRuleData[];
  setInfo: ISetInfo;
}

export interface IUpdateRulesPayload {
  emailNotification: string;
  rules: Array<{
    sensorID: number;
    logicOperator: string | null;
    operator: string;
    condition: number;
  }>;
}

export interface IDeleteSetRulePayload {
  setID: number | string | undefined;
}

export const useFetchAutoRules = (setId: number | string | undefined) => {
  const url = `${API_GET_RULES_OF_SET}?setId=${setId}`;
  
  const { query } = useCustom<IAutoRulesResponse>({
    url: url,
    method: 'get',
    queryOptions: {
      enabled: !!setId,
    }
  });

  const response = query.data?.data;

  return {
    data: response,
    refetch: query.refetch,
    isLoading: query.isLoading
  };
}

export const useUpdateAutoRules = (setId: number | string | undefined) => {
  const url = `${API_UPDATE_RULES_OF_SET}?setID=${setId}`;

  const { mutateAsync, mutation } = useCustomMutation();

  const updateAutoRules = async (payload: IUpdateRulesPayload) => {
    return mutateAsync({
      url,
      method: 'put',
      values: payload,
      successNotification: false,
      errorNotification: () => false,
    });
  };

  return {
    updateAutoRules,
    isPending: mutation.isPending,
  };
}
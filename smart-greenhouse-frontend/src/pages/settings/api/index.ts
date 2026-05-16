import { API_GET_ME, API_UPDATE_PROFILE } from "@/api";
import { IUserProfile } from "@/models/auth.type";
import { useCustom, useCustomMutation } from "@refinedev/core";


export const useFetchUserProfile = () => {
    const url = API_GET_ME;

  const { query } = useCustom<{ DT: IUserProfile }>({
    url: url,
    method: 'get'
  });

  const response = query.data?.data?.DT;

  return {
    data: response,
    refetch: query.refetch,
    isLoading: query.isLoading
  };
}

export const useUpdateProfile = () => {
  const url = API_UPDATE_PROFILE;

  const { mutateAsync, mutation } = useCustomMutation<IUserProfile>();

  const updateProfile = async (data: Partial<IUserProfile>) => {
    return mutateAsync({
      url: url,
      method: 'put',
      values: data
    });
  };

  return {
    updateProfile,
    isPending: mutation.isPending, 
  };
};
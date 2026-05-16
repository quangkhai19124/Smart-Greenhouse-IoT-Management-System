
import { useCustomMutation } from "@refinedev/core";
import { ISignInParams } from "@/models/auth.type";
import { API_LOGIN } from "@/api";

export const useSignIn = () => {
    const { mutateAsync, mutation } = useCustomMutation();

    const signIn = async (payload: ISignInParams) => {
        return mutateAsync({
            url: API_LOGIN,
            method: 'post',
            values: payload,
            errorNotification: (error) => {
                // Fix: Xử lý error message tốt hơn để tránh [object Object]
                let rawMessage = 'Something went wrong!';
                
                // Thử lấy message từ các nguồn khác nhau
                if (error?.response?.data?.EM) {
                    // Backend response format: { EC, EM, DT }
                    rawMessage = error.response.data.EM;
                } else if (error?.response?.data?.meta?.message) {
                    rawMessage = error.response.data.meta.message;
                } else if (error?.response?.data?.message) {
                    rawMessage = error.response.data.message;
                } else if (typeof error?.message === 'string') {
                    rawMessage = error.message;
                } else if (error?.statusText) {
                    rawMessage = error.statusText;
                }

                const message = typeof rawMessage === 'string' 
                    ? rawMessage.charAt(0).toUpperCase() + rawMessage.slice(1)
                    : 'Something went wrong!';

                return {
                    message,
                    type: 'error',
                };
            }
        });
    };

    return { signIn, isLoading: mutation.isPending };
};
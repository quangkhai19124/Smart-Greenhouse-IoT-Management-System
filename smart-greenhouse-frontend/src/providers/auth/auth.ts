import { AuthProvider } from "@refinedev/core";
import { IDENTIFY_KEY } from "@/utils/constants";
import { IUserIdentity } from "@/models/auth.type";

export const authProvider: AuthProvider = {
    login: async (token: IUserIdentity) => {
        // Normalize identity shape
        const email: string | undefined = token?.email || token?.user?.email;
        const name: string | undefined = token?.name || token?.user?.name;
        const role: string | undefined = token?.role || token?.user?.role;

        const identity: IUserIdentity = {
            ...token,
            email,
            name: name || email?.split("@")[0] || "User",
            role: role || "farmer",
        };

        localStorage.setItem(IDENTIFY_KEY, JSON.stringify(identity));
        return {
            success: true,
            redirectTo: '/dashboard',
        };
    },
    logout: async () => {
        // try {
        //     await axiosInstance.post(API_LOGOUT, {});
        // } catch (e) {
        // } finally {
        //     localStorage.setItem(CLIENT_LOGOUT_KEY, "1");
        //     return {
        //         success: true,
        //         redirectTo: '/auth/signin',
        //     };
        // }
        localStorage.removeItem(IDENTIFY_KEY);
        return {
            success: true,
            redirectTo: '/auth/signin',
        };
    },
    onError: async (error) => {
        if (error?.status === 401 || error?.response?.status === 401) {
    
          return {
            logout: true,
            redirectTo: '/auth/signin',
            error: {
              message: 'Session expired',
              name: 'Unauthorized',
            },
          };
        } else if (error?.status === 403 || error?.response?.status === 403) {

          return {
            redirectTo: '/404',
          };
        }
    
        return { error };
    },
    check: async () => {
        const raw = localStorage.getItem(IDENTIFY_KEY);
        if (!raw) {
          return { 
            authenticated: false,
            redirectTo: '/auth/signin' };

        }

        return { authenticated: true };
      },
    getPermissions: async () => {
        try {
            const raw = localStorage.getItem(IDENTIFY_KEY);
            if (!raw) return null;
            const identity = JSON.parse(raw);
            return identity?.role ?? null;
        } catch {
            return null;
        }
    },

    getIdentity: async () => {
        try {
            const raw = localStorage.getItem(IDENTIFY_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },
};
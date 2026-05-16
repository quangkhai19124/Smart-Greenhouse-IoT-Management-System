import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbarProvider } from "@refinedev/kbar";
import { useState } from "react";
import SplashScreen from "./components/SplashScreen";

import {
  ErrorComponent,
  ThemedLayout,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { dataProvider } from "./providers/auth/data";
import { App as AntdApp, ConfigProvider, theme as antdTheme } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { LandingPage } from "./pages/landing";
import { configProvider } from "./layout/config";
import { SignIn } from "./pages/auth/signin";
import { API_PROXY_NAME } from "./api";
import { authProvider } from "./providers/auth/auth";
import { useNotificationProvider } from "./providers/notification";
import DashboardPage from "./pages/dashboard";
import routerProvider from "@refinedev/react-router";
import { Header } from "./layout/header";
import Sider from "./layout/Sider";
import DeviceControlPage from "./pages/device-control";
import UserManagementPage from "./pages/admin/users";
import DeviceManagementPage from "./pages/admin/devices";
import SensorManagementPage from "./pages/admin/sensors";
import { DeviceControlDetailPage } from "./pages/device-control/components/DetailPage";
import ObservationPage from "./pages/observation-data";
import { ObservationDetailPage } from "./pages/observation-data/components/DetailPage";
import SettingsPage from "./pages/settings";
import ChatWidget from "./components/ChatWidget";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if(import.meta.env.MODE === "production") {
    console.log = () => {};
    console.info = () => {};
  }

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <BrowserRouter>
      <div className="font-gilroy">
        <RefineKbarProvider>
          <AntdApp>
            <ConfigProvider
              theme={{
                token: configProvider.token,
                algorithm: antdTheme.defaultAlgorithm,
              }}
            >
              <Refine
                dataProvider={{
                  default: dataProvider(API_PROXY_NAME),
                }}
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                authProvider={authProvider}
                resources={[
                  {
                    name: "dashboard",
                    list: "/dashboard",
                    meta: {
                      canDelete: true,
                    },
                  },
                  {
                    name: "device-control",
                    list: "/device-control",
                    show: "/device-control/:id",
                    meta: {
                      canDelete: true,
                    },
                  },
                  {
                    name: "observation-data",
                    list: "/observation-data",
                    show: "/observation-data/:id",
                    meta: {
                      canDelete: true,
                    },
                  },
                  {
                    name: "settings",
                    list: "/settings",
                    meta: {
                      canDelete: true,
                    },
                  },
                  {
                    name: "user-management",
                    list: "/admin/user-management",
                    meta: {
                      canDelete: true,
                    },
                  },
                  {
                    name: "device-management",
                    list: "/admin/device-management",
                    meta: {
                      canDelete: true,
                    },
                  },
                  {
                    name: "sensor-management",
                    list: "/admin/sensor-management",
                    meta: {
                      canDelete: true,
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "FWx6pf-rdGrnX-MG1PMA",
                }}
              >
                <Routes>
                  {/* Public routes */}
                  <Route path="/">
                    <Route
                      index
                      element={
                        <Authenticated key="landing" fallback={<LandingPage />}>
                          <CatchAllNavigate to='/dashboard' />
                        </Authenticated>
                      }
                    />
                    <Route
                      path="/auth/signin"
                      element={
                        <Authenticated key='/auth/signin' fallback={<SignIn />}>
                          <CatchAllNavigate to="/dashboard" />
                        </Authenticated>
                      }
                    />
                  </Route>

                  {/* Private routes */}
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/auth/signin" />}
                      >
                        <ThemedLayout
                          Header={Header}
                          Sider={Sider}
                        >
                          <Outlet />
                        </ThemedLayout>
                        <ChatWidget />
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="/dashboard" />}
                    />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/device-control" element={<DeviceControlPage />} />
                    <Route path="/device-control/:id" element={<DeviceControlDetailPage />} />
                    <Route path="/observation-data" element={<ObservationPage />} />
                    <Route path="/observation-data/:id" element={<ObservationDetailPage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    <Route path="/admin/user-management" element={<UserManagementPage />} />
                    <Route path="/admin/device-management" element={<DeviceManagementPage />} />
                    <Route path="/admin/sensor-management" element={<SensorManagementPage />} />

                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                </Routes>
                <UnsavedChangesNotifier />
                <DocumentTitleHandler
                  handler={() => {
                    return 'Smart Greenhouse';
                  }}
                />
              </Refine>
            </ConfigProvider>
          </AntdApp>
        </RefineKbarProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
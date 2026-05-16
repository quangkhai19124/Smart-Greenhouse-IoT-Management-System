import React, { useContext, useMemo } from "react";
import { Layout, Menu, Grid, Drawer, Button, theme, ConfigProvider } from "antd";
import { BarsOutlined, UnorderedListOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import {
  type TreeMenuItem,
  useIsExistAuthentication,
  useLogout,
  useMenu,
  useLink,
  useTranslate,
  CanAccess,
  useWarnAboutChange,
  useGetIdentity,
} from "@refinedev/core";
import { type RefineThemedLayoutSiderProps } from "@refinedev/antd";
import LogoHeader from "../components/LogoHeader";
import { ChartLine, ChartNoAxesColumn, ChartPie, LogOut, MonitorSmartphone, Settings, Users } from "lucide-react";

const Sider: React.FC<RefineThemedLayoutSiderProps> = () => {
  const width = 240;
  const collapsedWidth = 88;
  const fixed = false;
  
  const { token } = theme.useToken();
  const breakpoint = Grid.useBreakpoint();
  const isMobile = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;
  const direction = useContext(ConfigProvider.ConfigContext)?.direction;

  const { menuItems, selectedKey, defaultOpenKeys } = useMenu({});
  const Link = useLink();
  const translate = useTranslate();
  const { mutate: mutateLogout } = useLogout();
  const isExistAuthentication = useIsExistAuthentication();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const { data: identity } = useGetIdentity();

  const [collapsed, setCollapsed] = React.useState(false);

  const filteredMenuItems = useMemo(() => {
    const userRole = identity?.role || identity?.user?.role;
    const isAdmin = userRole === "admin";
    
    if (isAdmin) {
      return menuItems.filter(item => 
        item.name === "dashboard" || 
        item.name === "user-management" || 
        item.name === "device-management" || 
        item.name === "sensor-management"
      );
    }
    
    return menuItems.filter(item => 
      item.name === "dashboard" || 
      item.name === "device-control" || 
      item.name === "observation-data" || 
      item.name === "settings"
    );
  }, [menuItems, identity]);

  const handleLogout = () => {
    if (warnWhen) {
      const confirm = window.confirm(
        translate(
          "warnWhenUnsavedChanges",
          "Are you sure you want to leave? You have unsaved changes.",
        ),
      );

      if (confirm) {
        setWarnWhen(false);
        mutateLogout();
      }
    } else {
      mutateLogout();
    }
  };

  const logoutItem = isExistAuthentication && (
    <Menu.Item key="logout" onClick={handleLogout} icon={<LogOut className="h-5 w-5" />}
    >
      {translate("buttons.logout", "Logout")}
    </Menu.Item>
  );

  const getMenuIcon = (name?: string) => {
    switch (name) {
      case "dashboard":
        return <ChartPie className="h-5 w-5" />
      case "device-control":
        return <ChartNoAxesColumn className="h-5 w-5" />;
      case "observation-data":
        return <ChartLine className="h-5 w-5" />;
      case "settings":
        return <Settings className="h-5 w-5" />;
      case "user-management":
        return <Users className="h-5 w-5" />;
      case "device-management":
        return <MonitorSmartphone className="h-5 w-5" />;
      case "sensor-management":
        return <ChartLine className="h-5 w-5" />;
      default:
        return <UnorderedListOutlined />;
    }
  };

  const renderTreeView = (tree: TreeMenuItem[], selected?: string) => {
    return tree.map((item) => {
      const { key, name, children, meta, list } = item;
      const label = item?.label ?? meta?.label ?? name;
      const icon = getMenuIcon(name);
      const route = list;

      if (children.length > 0) {
        return (
          <CanAccess key={key} resource={name} action="list" params={{ resource: item }}>
            <Menu.SubMenu key={key} icon={icon ?? <UnorderedListOutlined />} title={label}>
              {renderTreeView(children, selected)}
            </Menu.SubMenu>
          </CanAccess>
        );
      }

      const isSelected = key === selected;
      const linkStyle: React.CSSProperties = isSelected ? {} : {};

      return (
        <CanAccess key={key} resource={name} action="list" params={{ resource: item }}>
          <Menu.Item key={key} icon={icon ?? <UnorderedListOutlined />} style={linkStyle}>
            <Link to={route ?? ""} style={linkStyle}>
              {label}
            </Link>
            {!collapsed && isSelected && <div className="ant-menu-tree-arrow" />}
          </Menu.Item>
        </CanAccess>
      );
    });
  };

  const defaultExpandMenuItems = useMemo(() => [], []);
  const items = renderTreeView(filteredMenuItems, selectedKey);

  const triggerIcon = () => {
    const iconProps = { style: { color: token.colorPrimary } } as const;
    const OpenIcon = direction === "rtl" ? RightOutlined : LeftOutlined;
    const CollapsedIcon = direction === "rtl" ? LeftOutlined : RightOutlined;
    const IconComponent = collapsed ? CollapsedIcon : OpenIcon;
    return <IconComponent {...iconProps} />;
  };

  const header = (
    <div
      style={{
        width: collapsed ? collapsedWidth : width,
        padding: collapsed ? "0" : "0 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 64,
        backgroundColor: token.colorBgElevated,
      }}
    >
      <LogoHeader size="medium" hiddenText={collapsed} />
    </div>
  );

  const menu = (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: "#08F08C",
            itemSelectedColor: "#fff",
          },
        },
      }}
    >
      <Menu
        selectedKeys={selectedKey ? [selectedKey] : []}
        defaultOpenKeys={[...defaultOpenKeys, ...defaultExpandMenuItems]}
        mode="inline"
        className="app-sider-menu"
        style={{
          paddingTop: 20,
          paddingBottom: 8,
          paddingLeft: collapsed ? 5 : 10,
          paddingRight: collapsed ? 5 : 10,
          border: "none",
          overflow: "auto",
          height: "calc(100% - 72px)",
        }}
        onClick={() => {
          if (isMobile) setCollapsed(true);
        }}
      >
        {[...items, logoutItem].filter(Boolean) as React.ReactNode[]}
      </Menu>
    </ConfigProvider>
  );



  if (isMobile) {
    return (
      <>
        <Drawer
          open={!collapsed}
          onClose={() => setCollapsed(true)}
          placement={direction === "rtl" ? "right" : "left"}
          closable={false}
          width={width}
          styles={{ body: { padding: 0 } }}
          maskClosable
        >
          <Layout>
            <Layout.Sider
              width={width}
              style={{
                height: "100vh",
                backgroundColor: token.colorBgContainer,
                borderRight: `1px solid ${token.colorBgElevated}`,
              }}
            >
              {header}
              {menu}
            </Layout.Sider>
          </Layout>
        </Drawer>
        <Button
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1000,
          }}
          size="large"
          onClick={() => setCollapsed(false)}
          icon={<BarsOutlined />}
        />
      </>
    );
  }

  const siderStyles: React.CSSProperties = {
    backgroundColor: token.colorBgContainer,
    borderRight: `1px solid ${token.colorBgElevated}`,
  };

  if (fixed) {
    siderStyles.position = "fixed";
    siderStyles.top = 0;
    siderStyles.height = "100vh";
    siderStyles.zIndex = 999;
  }

  return (
    <>
      {fixed && (
        <div style={{ width: collapsed ? collapsedWidth : width, transition: "all 0.2s" }} />
      )}
      <Layout.Sider
        width={width}
        collapsedWidth={collapsedWidth}
        style={siderStyles}
        collapsible
        collapsed={collapsed}
        onCollapse={(c) => setCollapsed(c)}
        breakpoint="lg"
        trigger={
          <Button
            type="text"
            style={{ borderRadius: 0, height: "100%", width: "100%", backgroundColor: token.colorBgElevated }}
          >
            {triggerIcon()}
          </Button>
        }
      >
        {header}
        {menu}
      </Layout.Sider>
    </>
  );
};

export default Sider;



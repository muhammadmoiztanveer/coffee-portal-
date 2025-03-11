import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Spin, Button } from "antd";
import Logo from "@/assets/logo.png";
import User from "@/assets/user.png";
import { fetchAuthSession } from "aws-amplify/auth";
import SignOutModal from "../../components/modals/signOutModal/signOutModal";
import "@/main.css";

const Layout = () => {
  const [appName, setAppName] = useState("Stamps & Deposits");
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(1);
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  async function currentAuthenticatedUser() {
    try {
      const userInfo = await fetchAuthSession();
      const userName = userInfo.tokens?.idToken?.payload.name;
      const customType = userInfo.tokens?.idToken?.payload["custom:type"];

      setUsername(userName);
      setUserType(customType);

      setLoading(false);
    } catch (err) {
      console.error("Error fecthing currentAuthenticatedUser in layout", err);
      navigate("/login");
    }
  }

  function showSignOutModal() {
    setIsSignOutModalVisible(true);
  }

  function hideSignOutModal() {
    setIsSignOutModalVisible(false);
  }

  useEffect(() => {
    currentAuthenticatedUser();
    navigate("/store");
  }, []);

  useEffect(() => {
    if (location.pathname === "/store") {
      setActiveMenuId(1);
    }
  }, [location]);

  const menuItems = [
    {
      id: 1,
      name: "Store Managment",
      icon: AppstoreAddOutlined,
      route: "store",
    },
    {
      id: 2,
      name: "User Managment",
      icon: UserOutlined,
      route: "users",
    },
    {
      id: 3,
      name: "Payment Managment",
      icon: CreditCardOutlined,
      route: "payments",
    },
    {
      id: 4,
      name: "Payments History",
      icon: HistoryOutlined,
      route: "history",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="h-screen">
      <div className="w-full px-8 py-4 bg-white border-0 border-b border-slate-200 text-black flex justify-between items-center">
        <div className="flex justify-center gap-3 items-center">
          <img src={Logo} alt="Logo" className="size-10" />
          <span className="font-bold text-2xl text-black">{appName}</span>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col text-end justify-center">
            <span className="text-sm font-semibold">{username}</span>
            <span className="text-sm">{userType}</span>
          </div>

          <img src={User} alt="user" className="size-10" />
        </div>
      </div>

      <div className="w-full h-full grid grid-flow-col grid-cols-12 fixed">
        <div className="col-span-2 w-full h-full bg-white flex flex-col justify-between px-8 text-white border-0 border-r border-slate-200">
          <div className="mt-8 w-full flex flex-col gap-6 border">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.route}
                className={
                  activeMenuId === item.id
                    ? "rounded-xl w-full py-3 border bg-black text-white px-4  flex gap-3 items-center font-medium"
                    : "rounded-xl w-full py-3 border text-black px-4 hover:bg-black/80 hover:text-white flex gap-3 items-center font-medium"
                }
                onClick={() => setActiveMenuId(item.id)}
              >
                <item.icon className="text-xl" />
                {item.name}
              </Link>
            ))}
          </div>

          <Button
            color="default"
            variant="solid"
            size="large"
            className="mb-24"
            onClick={showSignOutModal}
          >
            Sign Out
          </Button>
        </div>

        <div className="col-span-10 w-full bg-gray-100 overflow-y-auto px-10 pb-20">
          <Outlet />
        </div>
      </div>

      <SignOutModal
        isVisible={isSignOutModalVisible}
        onCancel={hideSignOutModal}
      />
    </div>
  );
};

export default Layout;

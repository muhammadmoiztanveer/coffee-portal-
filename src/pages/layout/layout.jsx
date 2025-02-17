import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  DollarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Outlet, Link, useNavigate } from "react-router-dom";
import Coffee from "@/assets/ice-coffee.png";
import User from "@/assets/user.png";
import { getCurrentUser } from "aws-amplify/auth";
import { useNavigation } from "react-router-dom";
import "@/main.css";

const Layout = () => {
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  async function currentAuthenticatedUser() {
    try {
      const { username, userId, signInDetails } = await getCurrentUser();
      // console.log(`The username: ${username}`);
      // console.log(`The userId: ${userId}`);
      // console.log(`The signInDetails: ${signInDetails}`);

      setLoading(false);
    } catch (err) {
      console.error("Error fecthing currentAuthenticatedUser in layout", err);
      navigate("/signin");
    }
  }

  useEffect(() => {
    currentAuthenticatedUser();
    navigate("/users");
  }, []);

  return (
    // bg-gradient-to-r from-black to-[#5e0b16]
    <>
      <div className="w-full px-4 py-4 bg-white border-0 border-b border-slate-200 text-black flex justify-between items-center">
        <div className="flex justify-center gap-3 items-center">
          <img src={Coffee} alt="Coffee" className="size-10" />
          <span className="font-bold text-2xl text-black">Caffeine Patch</span>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col text-end justify-center">
            <span className="text-sm font-semibold">Muhammad Moiz</span>
            <span className="text-sm">Admin</span>
          </div>

          <img src={User} alt="user" className="size-10" />
        </div>
      </div>

      <div className="w-screen h-screen grid grid-flow-col grid-cols-12 fixed">
        <div className="col-span-2 w-full h-full bg-white flex flex-col px-8 text-white border-0 border-r border-slate-200">
          <div className="mt-8 w-full flex flex-col gap-6">
            <Link
              to="users"
              className="rounded-xl w-full py-3 border  text-black px-4 hover:bg-black hover:text-white active:text-white active:bg-black flex gap-3 items-center font-medium"
            >
              <UserOutlined className="text-xl" /> User Managment
            </Link>

            <Link
              to="payments"
              className="rounded-xl w-full py-3 border border-black text-black px-4 hover:bg-black hover:text-white active:text-white active:bg-black flex gap-3 items-center font-medium"
            >
              <CreditCardOutlined className="text-xl" /> Payment Managment
            </Link>

            <Link
              to="history"
              className="rounded-xl w-full py-3 border border-black text-black px-4 hover:bg-black hover:text-white active:text-white active:bg-black flex gap-3 items-center font-medium"
            >
              <HistoryOutlined className="text-xl" /> Payment History
            </Link>
          </div>
        </div>

        <div className="col-span-10 w-full h-full bg-gray-100 overflow-y-auto">
          <div className="px-10">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;

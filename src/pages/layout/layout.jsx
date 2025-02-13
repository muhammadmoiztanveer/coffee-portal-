import React from "react";
import {
  UserOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  DollarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Outlet, Link } from "react-router-dom";
import Coffee from "@/assets/ice-coffee.png";
import User from "@/assets/user.png";

const Layout = () => {
  return (
    <div className="w-screen h-screen grid grid-flow-col grid-cols-12 fixed">
      <div className="col-span-2 w-full h-full bg-gradient-to-r from-[#600912] to-[#5e0b16] flex flex-col p-8 text-white">
        <div className="flex gap-3 items-center bg-white rounded-md py-2 px-4">
          <img src={Coffee} alt="Coffee" className="size-10" />
          <span className="font-bold text-2xl text-[#600912]">
            Caffeine Patch
          </span>
        </div>

        <div className="mt-8 w-full flex flex-col gap-6">
          <Link
            to="users"
            className="rounded-md w-full py-2 text-white px-4 hover:bg-white/80 hover:text-[#600912] active:text-white active:bg-[#600912] flex gap-3 items-center font-medium"
          >
            <UserOutlined className="text-xl" /> User Managment
          </Link>

          <Link
            to="deposits"
            className="rounded-md w-full py-2 text-white px-4 hover:bg-white/80 hover:text-[#600912] active:text-white active:bg-[#600912] flex gap-3 items-center font-medium"
          >
            <CreditCardOutlined className="text-xl" /> Deposit Managment
          </Link>

          <Link
            to="deposits-history"
            className="rounded-md w-full py-2 text-white px-4 hover:bg-white/80 hover:text-[#600912] active:text-white active:bg-[#600912] flex gap-3 items-center font-medium"
          >
            <HistoryOutlined className="text-xl" /> Deposit History
          </Link>

          <Link
            to="payments-processing"
            className="rounded-md w-full py-2 text-white px-4 hover:bg-white/80 hover:text-[#600912] active:text-white active:bg-[#600912] flex gap-3 items-center font-medium"
          >
            <DollarOutlined className="text-xl" /> Payment Processing
          </Link>
        </div>
      </div>

      <div className="col-span-10 w-full h-full bg-gray-100 overflow-y-auto">
        <div className="w-full px-4 py-4 bg-white border-0 border-b border-slate-200 text-black flex justify-end items-center">
          <div className="flex gap-3">
            <div className="flex flex-col text-end justify-center">
              <span className="text-sm font-semibold">Muhammad Moiz</span>
              <span className="text-sm">Admin</span>
            </div>

            <img src={User} alt="user" className="size-10" />
          </div>
        </div>

        <div className="px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

import React from "react";
import { Button } from "antd";

const ErrorPage = () => {
  return (
    <div className="flex flex-col gap-10 px-4 xl:px-10 2xl:px-16 py-10">
      <div className="py-40 flex flex-col gap-16 justify-center items-center">
        <div className="font-bold text-2xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">404 Page Not Found</div>
        <div className="text-sm sm:text-xl text-center">
          Your visited page not found. You may go home page.
        </div>

        <Button
          variant="solid"
          shape="default"
          color="default"
          className="text-lg w-fit p-6"
        >
          Back to Home Page
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;

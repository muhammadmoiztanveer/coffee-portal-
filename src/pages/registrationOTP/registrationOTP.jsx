import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button, message } from "antd";
import { confirmSignUp } from "aws-amplify/auth";

const registrationOTPPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get("email");

    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handlePaste = (event) => {
    const pasteData = event.clipboardData.getData("text");
    if (/^\d{6}$/.test(pasteData)) {
      setOtp(pasteData.split(""));
      inputRefs.current.forEach((input, index) => {
        if (input) input.value = pasteData[index] || "";
      });
      inputRefs.current[5]?.focus();
    }
    event.preventDefault();
  };

  const handleChange = (index, value) => {
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      alert("OTP must be 6 digits");
      return;
    }
    try {
      setIsSubmitting(true);
      console.log("Confirming sign-up for email:", email);
      await confirmSignUp({
        username: email,
        confirmationCode: otpString,
      });
      setOtp(["", "", "", "", "", ""]);
      messageApi.open({
        type: "success",
        content: "Account has been verified successfully!",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error during confirmation:", error);
      messageApi.open({
        type: "error",
        content: "Verification failed or Incorrect OTP",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}

      <div className="flex justify-center items-center h-screen bg-slate-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-center">Enter OTP</h2>

          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-12 text-center text-xl border rounded-[8px]"
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm text-center mt-2">
              {errorMessage}
            </p>
          )}

          <div>
            <Button
              size="large"
              color="default"
              variant="solid"
              htmlType="submit"
              block
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying OTP..." : "Verify OTP"}
            </Button>
          </div>

          {/* Link for existing users */}
          <div className="mt-2 text-center">
            <Link
              to="/signup"
              className="text-blue-500 underline hover:text-blue-950"
            >
              Go Back to SignUp ?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default registrationOTPPage;

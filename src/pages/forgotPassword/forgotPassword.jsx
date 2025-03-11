import React, { useRef, useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Input, Button, Result, message } from "antd";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { Link } from "react-router-dom";

const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
});

const PasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const resend_otp_timeout = 30;

const ForgotPasswordPage = () => {
  const inputRefs = useRef([]);
  const [currentStep, setCurrentStep] = useState("EMAIL");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [email, setEmail] = useState("");
  const [resendTimeLeft, setResendTimeLeft] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    let timer;
    if (resendTimeLeft > 0) {
      timer = setInterval(() => {
        setResendTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimeLeft]);

  const handleSendOtp = async (email) => {
    try {
      setIsResending(true);
      await resetPassword({ username: email });
      messageApi.open({
        type: "success",
        content: "Verification code sent to your email",
      });

      setCurrentStep("OTP");
      setResendTimeLeft(resend_otp_timeout);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: `${error}` || "Failed to send verification code",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      await resetPassword({ username: email });

      messageApi.open({
        type: "success",
        content: "New verification code sent",
      });

      setResendTimeLeft(resend_otp_timeout);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: `${error}` || "Failed to resend code",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsVerifying(true);
      const code = otp.join("");

      // await confirmResetPassword({
      //   username: email,
      //   confirmationCode: code,
      //   newPassword: "TempPassword123!",
      // });

      setVerificationCode(code);
      setCurrentStep("PASSWORD");
      // messageApi.open({
      //   type: "success",
      //   content: "Verification successful",
      // });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: `${error}` || "Invalid verification code",
      });
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordReset = async (values) => {
    try {
      setIsVerifying(true);
      await confirmResetPassword({
        username: email,
        confirmationCode: verificationCode,
        newPassword: values.newPassword,
      });
      messageApi.open({
        type: "success",
        content: "Password reset successfully!",
      });
      setCurrentStep("SUCCESS");
    } catch (error) {
      messageApi.open({
        type: "error",
        content: `${error}` || "Password reset failed",
      });

      setCurrentStep("OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split("").slice(0, 6);
      setOtp(newOtp);
      newOtp.forEach((digit, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index].value = digit;
        }
      });
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  return (
    <>
      {contextHolder}

      <div className="flex justify-center items-center h-screen bg-slate-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg">
          {currentStep === "SUCCESS" ? (
            <Result
              status="success"
              title="Password Reset Successful!"
              subTitle="You can now login with your new password"
              extra={[
                <Button
                  color="default"
                  variant="solid"
                  key="login"
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Login
                </Button>,
              ]}
            />
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-2 text-center">
                Forgot Password
              </h2>
              <p className="text-gray-500 text-center mb-6">
                {currentStep === "EMAIL"
                  ? "Enter your email to reset your password"
                  : currentStep === "OTP"
                  ? "Enter the verification code sent to your email"
                  : "Enter your new password"}
              </p>

              {currentStep === "EMAIL" && (
                <Formik
                  initialValues={{ email: "" }}
                  validationSchema={EmailSchema}
                  onSubmit={({ email }) => {
                    setEmail(email);
                    handleSendOtp(email);
                  }}
                >
                  {({ isValid, handleChange, handleBlur, values }) => (
                    <Form>
                      <div className="mb-4">
                        <Field
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.email}
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <Button
                        color="default"
                        variant="solid"
                        htmlType="submit"
                        block
                        size="large"
                        loading={isResending}
                        disabled={!isValid || isResending}
                        className="bg-blue-600 hover:bg-blue-700 h-12 rounded-lg"
                      >
                        {isResending ? "Sending..." : "Continue"}
                      </Button>

                      <div className="mt-6 text-end">
                        <Link
                          to="/login"
                          className="text-black underline hover:text-black"
                        >
                          Go Back to Login ?
                        </Link>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}

              {currentStep === "OTP" && (
                <div className="space-y-6">
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    <Button
                      type="link"
                      onClick={handleResendOtp}
                      loading={isResending}
                      disabled={resendTimeLeft > 0 || isResending}
                      className="text-blue-600"
                    >
                      {isResending
                        ? "Resending..."
                        : resendTimeLeft > 0
                        ? `Resend code in ${resendTimeLeft}s`
                        : "Resend verification code"}
                    </Button>
                  </div>

                  <Button
                    color="default"
                    variant="solid"
                    block
                    size="large"
                    onClick={handleVerifyOtp}
                    loading={isVerifying}
                    disabled={otp.join("").length !== 6 || isVerifying}
                    className="bg-blue-600 hover:bg-blue-700 h-12 rounded-lg"
                  >
                    {isVerifying ? "Verifying..." : "Verify Code"}
                  </Button>

                  <div className="mt-6 text-end">
                    <Link
                      to="/login"
                      className="text-black underline hover:text-black"
                    >
                      Go Back to Login ?
                    </Link>
                  </div>
                </div>
              )}

              {currentStep === "PASSWORD" && (
                <Formik
                  initialValues={{ newPassword: "", confirmPassword: "" }}
                  validationSchema={PasswordSchema}
                  onSubmit={handlePasswordReset}
                >
                  {({ isValid }) => (
                    <Form className="space-y-4">
                      <div className="mb-4">
                        <Field name="newPassword">
                          {({ field }) => (
                            <Input.Password
                              {...field}
                              placeholder="New password"
                              iconRender={(visible) =>
                                visible ? (
                                  <EyeOutlined />
                                ) : (
                                  <EyeInvisibleOutlined />
                                )
                              }
                              size="large"
                              className="w-full p-3 border-gray-300 rounded-lg"
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="newPassword"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div className="mb-6">
                        <Field name="confirmPassword">
                          {({ field }) => (
                            <Input.Password
                              {...field}
                              placeholder="Confirm new password"
                              iconRender={(visible) =>
                                visible ? (
                                  <EyeOutlined />
                                ) : (
                                  <EyeInvisibleOutlined />
                                )
                              }
                              size="large"
                              className="w-full p-3 border-gray-300 rounded-lg"
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <Button
                        color="default"
                        variant="solid"
                        htmlType="submit"
                        block
                        size="large"
                        loading={isVerifying}
                        disabled={!isValid || isVerifying}
                        className="bg-blue-600 hover:bg-blue-700 h-12 rounded-lg"
                      >
                        {isVerifying ? "Updating..." : "Reset Password"}
                      </Button>
                    </Form>
                  )}
                </Formik>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;

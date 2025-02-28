import React, { useRef, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Input, Button, Result } from "antd";
// import {resetPassword, confirmResetPassword} from 'aws-amplify/auth';

// Email Validation Schema
const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
});

// Password Reset Validation Schema
const ForgotPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const ForgotPasswordPage = () => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [resetStep, setResetStep] = useState(null);
  const [otpStatus, setOtpStatus] = useState(null);
  const [passwordResetStatus, setPasswordResetStatus] = useState(null);

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
    if (e.key === "Backspace") {
      if (otp[index] === "") {
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  // Handle paste event to allow pasting a full OTP
  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      newOtp.forEach((digit, index) => {
        inputRefs.current[index].value = digit;
      });
      inputRefs.current[5]?.focus(); // Move focus to the last box
    }
    e.preventDefault(); // Prevent default paste behavior
  };

  // Handle Send OTP Button Click
  const handleSendOtp = async (email) => {
    try {
      // const output = await resetPassword({username: email});
      // handleResetPasswordNextSteps(output);
    } catch (error) {
      setOtpStatus("error");
      console.log(error);
    }
  };

  // Handle password reset next steps
  const handleResetPasswordNextSteps = (output) => {
    // const {nextStep} = output;
    // switch (nextStep.resetPasswordStep) {
    //   case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
    //     const codeDeliveryDetails = nextStep.codeDeliveryDetails;
    //     console.log(`Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`);
    //     setIsOtpSent(true); // Show OTP input after sending the OTP
    //     setOtpStatus('success');
    //     setResetStep('CONFIRM_RESET_PASSWORD_WITH_CODE');
    //     break;
    //   case 'DONE':
    //     console.log('Successfully reset password.');
    //     setPasswordResetStatus('success');
    //     break;
    //   default:
    //     setOtpStatus('error');
    //     console.log('An unknown error occurred. Please try again later.');
    // }
  };

  // Handle final password reset and confirm OTP
  const handlePasswordReset = async (values) => {
    // try {
    //   const {newPassword} = values;
    //   await confirmResetPassword({
    //     username: email,
    //     confirmationCode: otp.join(''),
    //     newPassword
    //   });
    //   console.log('Password reset successful');
    //   setPasswordResetStatus('success');
    // } catch (error) {
    //   setPasswordResetStatus('error');
    //   console.log(error);
    // }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Forgot your password?
        </h2>
        <div className="text-center mb-6">
          <p className="text-gray-500">Don't worry we got you covered</p>
        </div>

        {/* Display Success or Error Result for OTP */}
        {otpStatus === "success" && !passwordResetStatus && (
          <Result
            status="success"
            title="OTP sent successfully!"
            subTitle={`Please check your email ${email}  and enter the OTP to reset your password.`}
            extra={[]}
          />
        )}

        {/* Display Success or Error Result for Password Reset */}
        {passwordResetStatus === "success" && (
          <Result
            status="success"
            title="Password changed successfully!"
            subTitle="Your password has been successfully updated. You can now log in with your new password."
            extra={[
              <Button
                type="primary"
                key="console"
                href="/login"
                className="bg-amber-950 text-white hover:bg-amber-700"
              >
                Go to Login
              </Button>,
            ]}
          />
        )}

        {/* Email Field and Send OTP Button */}
        {!isOtpSent && otpStatus !== "success" && (
          <Formik
            initialValues={{ email }}
            validationSchema={EmailSchema}
            onSubmit={(values) => {
              setEmail(values.email); // Store email when valid
              handleSendOtp(values.email); // Trigger OTP screen after email is valid
            }}
          >
            {({ isValid, handleChange, handleBlur, values }) => (
              <Form>
                <div className="mb-4">
                  <Field
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full mt-6 p-2 border border-gray-300 rounded-[8px]"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <Button
                  size="large"
                  color="default"
                  variant="solid"
                  htmlType="submit"
                  block
                  disabled={!isValid}
                >
                  Request for OTP
                </Button>
              </Form>
            )}
          </Formik>
        )}

        {isOtpSent && resetStep === "CONFIRM_RESET_PASSWORD_WITH_CODE" && (
          <div className="flex justify-center gap-2 mt-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-12 text-center text-xl border border-[#600912] rounded-md focus:outline-none focus:ring-2 focus:ring-[#600912]"
                ref={(el) => (inputRefs.current[index] = el)}
                value={otp[index]}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
              />
            ))}
          </div>
        )}

        {/* Password Reset Form */}
        {isOtpSent &&
          resetStep === "CONFIRM_RESET_PASSWORD_WITH_CODE" &&
          otpStatus !== "error" && (
            <Formik
              initialValues={{
                newPassword: "",
                confirmPassword: "",
              }}
              validationSchema={ForgotPasswordSchema}
              onSubmit={(values) => handlePasswordReset(values)}
            >
              {() => (
                <Form className="space-y-4 mt-4">
                  {/* New Password */}
                  <div className="relative">
                    <Field name="newPassword">
                      {({ field }) => (
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="New Password"
                          />
                          <div
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1 cursor-pointer"
                          >
                            {showPassword ? (
                              <EyeOutlined />
                            ) : (
                              <EyeInvisibleOutlined />
                            )}
                          </div>
                        </div>
                      )}
                    </Field>
                    <ErrorMessage
                      name="newPassword"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <Field name="confirmPassword">
                      {({ field }) => (
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="Confirm Password"
                          />
                          <div
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1 cursor-pointer"
                          >
                            {showConfirmPassword ? (
                              <EyeOutlined />
                            ) : (
                              <EyeInvisibleOutlined />
                            )}
                          </div>
                        </div>
                      )}
                    </Field>
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <Button
                    size="large"
                    color="default"
                    variant="solid"
                    htmlType="submit"
                    block
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Reseting..." : "Reset Password"}
                  </Button>
                </Form>
              )}
            </Formik>
          )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

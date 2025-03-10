import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Input, Button } from "antd";
import { Link } from "react-router-dom";
import { signUp } from "aws-amplify/auth";
import { getCurrentUser } from "aws-amplify/auth";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Validation schema using Yup
const SignupSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  name: Yup.string().required("Name is required"),
  phone: Yup.string().required("Phone number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [phoneNumberWithoutCountryCode, setPhoneNumberWithoutCountryCode] =
    useState("");

  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        await getCurrentUser();
        navigate("/users");
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    checkAuthSession();
  }, [navigate]);

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // Handle form submission
  const handleSignup = async (values, { setSubmitting, setErrors }) => {
    try {
      console.log("Form values:", values);
      const combinedPhoneNumber = `+${phoneNumber.replace(/\D/g, "")}`;

      // console.log(
      //   "phone numberr",
      //   combinedPhoneNumber,
      //   selectedCountryCode,
      //   phoneNumberWithoutCountryCode
      // );

      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: values.email,
        password: values.password,
        options: {
          userAttributes: {
            email: values.email,
            phone_number: combinedPhoneNumber,
            name: values.name,
            "custom:type": "Admin",
            "custom:countryCode": `${selectedCountryCode}`,
            "custom:phoneNumber": `${phoneNumberWithoutCountryCode}`,
          },
          autoSignIn: true,
        },
      });
      
      console.log("SignUp complete:", isSignUpComplete);
      console.log("User ID:", userId);

      navigate(`/verification-otp?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      console.error("Error signing up:", error);
      setErrors({ email: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 bg-white shadow-none rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

        <Formik
          initialValues={{
            email: "",
            name: "",
            phone: "", // This will be used only for validation
            password: "",
            confirmPassword: "",
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSignup}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form className="mt-6 space-y-4">
              {/* Email Field */}
              <div>
                <Field name="email">
                  {({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      placeholder="Email Address"
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Name Field */}
              <div>
                <Field name="name">
                  {({ field }) => (
                    <Input {...field} size="large" placeholder="Username" />
                  )}
                </Field>
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Phone Field */}
              <div>
                <PhoneInput
                  country={"us"}
                  value={phoneNumber}
                  onChange={(phone, data) => {
                    const rawPhone = phone.replace(/\D/g, "");
                    setPhoneNumber(phone);
                    setFieldValue("phone", rawPhone);

                    if (data && data.dialCode && rawPhone) {
                      const dialCode = data.dialCode;
                      const number = rawPhone.startsWith(dialCode)
                        ? rawPhone.slice(dialCode.length)
                        : rawPhone;
                      const code = `+${dialCode}`;
                      const phoneNumberWithoutCountryCode = number;

                      setSelectedCountryCode(code);
                      setPhoneNumberWithoutCountryCode(
                        phoneNumberWithoutCountryCode
                      );
                    }
                  }}
                  inputStyle={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "10px",
                    borderTopRightRadius: "8px",
                    borderBottomRightRadius: "8px",
                    borderLeft: "none",
                    paddingLeft: "55px",
                  }}
                  buttonStyle={{
                    borderTopLeftRadius: "8px",
                    borderBottomLeftRadius: "8px",
                    padding: "5px",
                  }}
                />
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Password Field */}
              <div>
                <Field name="password">
                  {({ field }) => (
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        size="large"
                        placeholder="Password*"
                      />
                      <div
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
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
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <Field name="confirmPassword">
                  {({ field }) => (
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        size="large"
                        placeholder="Confirm Password*"
                      />
                      <div
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
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

              {/* Submit Button */}
              <div className="mt-8">
                <Button
                  size="large"
                  color="default"
                  variant="solid"
                  htmlType="submit"
                  block
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing Up..." : "Sign Up"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>

        {/* Link for existing users */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-black underline hover:text-black"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

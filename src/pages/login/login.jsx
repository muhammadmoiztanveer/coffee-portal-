import React, { useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Input, Button } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { signIn } from "aws-amplify/auth";
import { getCurrentUser } from "aws-amplify/auth";

// Validation schema using Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Hook to redirect on success

  const [loading, setLoading] = useState(true);

  // Function to check if the user is already authenticated
  const checkAuthentication = async () => {
    try {
      await getCurrentUser();
      navigate("/users");
    } catch (err) {
      console.log(err);
      setLoading(false); // Allow sign-in form to render if not authenticated
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Handle form submission
  const handleLogin = async (values, { setSubmitting }) => {
    const { email, password } = values;
    try {
      console.log("Form values:", values);
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      });

      if (isSignedIn) {
        navigate("/");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setErrorMessage(
        "Failed to sign in. Please check your credentials and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Welcome Back!</h2>
          <p className="text-gray-500">Sign in to continue exploring.</p>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4 mt-6">
              {/* Email Field */}
              <div>
                <Field name="email">
                  {({ field }) => (
                    <Input {...field} size="large" placeholder="Email" />
                  )}
                </Field>
                <ErrorMessage
                  name="email"
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
                        placeholder="Password"
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

              {/* Error Message */}
              {errorMessage && (
                <p className="text-red-500 text-sm text-center">
                  {errorMessage}
                </p>
              )}

              {/* Link for existing users */}
              <div className="mt-4 text-end">
                  <Link
                    to="/forgot-password"
                    className="text-black underline hover:text-black"
                  >
                    Forgot Password ?
                  </Link>
              </div>

              {/* Link for existing users */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account ?{" "}
                  <Link
                    to="/signup"
                    className="text-black underline hover:text-black"
                  >
                    SignUp
                  </Link>
                </p>
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  size="large"
                  color="default"
                  variant="solid"
                  htmlType="submit"
                  block
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging In..." : "Login"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;

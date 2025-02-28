import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/layout/layout";
import LogInPage from "./pages/login/login";
import SignUpPage from "./pages/signup/signup";
import ForgotPasswordPage from "./pages/forgotPassword/forgotPassword";
import StoreManagmentPage from "./pages/storeManagment/storeManagment";
import UserManagmentPage from "./pages/userManagment/userManagment";
import PaymentManagmentPage from "./pages/paymentManagment/paymentManagment";
import PaymentHistory from "./pages/paymentHistory/paymentHistory";
import RegistrationOTPPage from "./pages/registrationOTP/registrationOTP";
import ErrorPage from "@/pages/error/error";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LogInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verification-otp" element={<RegistrationOTPPage />} />

        <Route path="/" element={<Layout />}>
          <Route path="/store" element={<StoreManagmentPage />} />
          <Route path="/users" element={<UserManagmentPage />} />
          <Route path="/payments" element={<PaymentManagmentPage />} />
          <Route path="/history" element={<PaymentHistory />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

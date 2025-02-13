import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/layout/layout";
import LogIn from "./pages/login/login";
import SignUp from "./pages/signup/signup";
import UserManagmentPage from "./pages/userManagment/userManagment";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Layout />}>
          <Route path="/users" element={<UserManagmentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

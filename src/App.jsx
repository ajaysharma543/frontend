import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./authentication/login";
import Signup from "./authentication/signup";
import Dashboard from "./chat/dashboard";
import AuthRedirect from "./authentication/protectroute";
import { Toaster } from "react-hot-toast";
import Rightchat from "./chat/rightchat";

function App() {
 
  return (
      <>
          <Toaster position="bottom-center" reverseOrder={false} />

    <Routes>

      <Route
        path="/"
        element={
          <AuthRedirect>
            <Signup />
          </AuthRedirect>
        }
      />

      <Route
        path="/login"
        element={
          <AuthRedirect>
            <Login />
          </AuthRedirect>
        }
      />

      <Route path="/dashboard" element={<Dashboard />} />
     

    </Routes>
      </>
  );
}

export default App;
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
const token = localStorage.getItem("token");

  if (!token) {
    alert("You need to be logged in to access this page.");
    return <Navigate to="/" />; // Redirect to login
  }

  return children; // Render the protected route if the user is authenticated

}
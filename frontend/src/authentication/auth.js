import {jwtDecode} from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("token"); // or sessionStorage if you're using that
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded token:", decoded);
    return decoded.user; // returns an object with the user’s ID and more
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};
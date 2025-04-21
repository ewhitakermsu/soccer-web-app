import React from "react";
import { Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";
export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Button
      variant="outline"
      color="red"
      size="sm"
      style={{ position: "absolute", top: 20, right: 20 }}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}
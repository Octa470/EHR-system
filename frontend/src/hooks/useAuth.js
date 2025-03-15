import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token");

        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          method: "GET"
        });

        if (!response.ok) throw new Error("Authentication failed");

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("User not authenticated:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  return { user, loading, updateUser };
};

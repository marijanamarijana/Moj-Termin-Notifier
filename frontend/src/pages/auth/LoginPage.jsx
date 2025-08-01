import { useState, useEffect } from "react";
import LoginForm from "../../components/auth/LoginForm";

function LoginPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="container">
      {user ? (
        <>
           <div className="d-flex justify-content-center align-items-center vh-100">
              <div className="border p-4 rounded shadow" style={{ minWidth: "200px" }}>
              <h4>Welcome, {user.username}</h4>
              <button className="btn btn-danger mt-3 w-100" onClick={handleLogout}>
                Logout
              </button>
              </div>
           </div>
        </>
      ) : (
        <LoginForm onLogin={setUser} />
      )}
    </div>
  );
}

export default LoginPage;
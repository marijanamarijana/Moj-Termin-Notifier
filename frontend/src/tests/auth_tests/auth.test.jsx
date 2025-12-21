import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { AuthProvider } from "../../auth/AuthContext";
import { useContext } from "react";
import AuthContext from "../../auth/AuthContext";

const TestComponent = () => {
  const { user, handleLogin, handleLogout } = useContext(AuthContext);
  return (
    <div>
      <span data-testid="user">{user ? user.name : "null"}</span>
      <button onClick={() => handleLogin({ name: "Alice" })}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("handles login and logout", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const userSpan = screen.getByTestId("user");
    const loginBtn = screen.getByText("Login");
    const logoutBtn = screen.getByText("Logout");

    expect(userSpan.textContent).toBe("null");

    act(() => loginBtn.click());
    expect(userSpan.textContent).toBe("Alice");
    expect(localStorage.getItem("user")).toBe(JSON.stringify({ name: "Alice" }));

    act(() => logoutBtn.click());
    expect(userSpan.textContent).toBe("null");
    expect(localStorage.getItem("user")).toBeNull();
  });
});

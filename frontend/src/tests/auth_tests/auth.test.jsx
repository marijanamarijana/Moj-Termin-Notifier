import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../../auth/AuthContext";
import { useContext } from "react";
import AuthContext from "../../auth/AuthContext";

const TestComponent = () => {
  const { user, handleLogin, handleLogout } = useContext(AuthContext);

  return (
    <div>
      <span data-testid="user">
        {user && user.name ? user.name : "null"}
      </span>

      <button onClick={() => handleLogin({ name: "Alice" })}>
        Login
      </button>

      <button onClick={() => handleLogin(null)}>
        Login Null
      </button>

      <button onClick={() => handleLogin({})}>
        Login Empty
      </button>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initially has no logged in user", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("logs in a valid user and saves it to localStorage", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText("Login"));

    expect(screen.getByTestId("user").textContent).toBe("Alice");
    expect(localStorage.getItem("user")).toBe(
      JSON.stringify({ name: "Alice" })
    );
  });

  it("logs out user and clears localStorage", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText("Login"));
    await userEvent.click(screen.getByText("Logout"));

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("handles login with null user safely (edge case)", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText("Login Null"));

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(localStorage.getItem("user")).toBe("null");
  });

  it("handles login with empty object safely (edge case)", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText("Login Empty"));

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(localStorage.getItem("user")).toBe(
      JSON.stringify({})
    );
  });

  it("loads user from localStorage on initial render", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ name: "StoredUser" })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user").textContent).toBe("StoredUser");
  });
});

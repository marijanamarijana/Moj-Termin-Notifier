import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DoctorForm from "../../../components/doctor/DoctorAddForm";

describe("DoctorForm Component Testing", () => {
  let onAddMock;

  beforeEach(() => {
    onAddMock = vi.fn();
    render(<DoctorForm onAdd={onAddMock} />);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders the form correctly", () => {
    expect(
      screen.getByRole("heading", { name: /add a new doctor/i })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter doctor's ID")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /add doctor/i })
    ).toBeInTheDocument();

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("updates input field correctly when typing", () => {
    const input = screen.getByPlaceholderText("Enter doctor's ID");

    fireEvent.change(input, { target: { value: "12345" } });

    expect(input.value).toBe("12345");
  });

  it("calls onAdd with doctor_id when submitted", () => {
    const input = screen.getByPlaceholderText("Enter doctor's ID");
    const button = screen.getByRole("button", { name: /add doctor/i });

    fireEvent.change(input, { target: { value: "12345" } });
    fireEvent.click(button);

    expect(onAddMock).toHaveBeenCalledTimes(1);
    expect(onAddMock).toHaveBeenCalledWith({ doctor_id: "12345" });
    expect(input.value).toBe("");
  });

  it("does not call onAdd if input is empty", () => {
    const button = screen.getByRole("button", { name: /add doctor/i });

    fireEvent.click(button);

    expect(onAddMock).not.toHaveBeenCalled();
  });

  it("submits the form when pressing Enter", async () => {
    const user = userEvent.setup();
    const input = screen.getByRole("textbox");

    await user.type(input, "12345{enter}");

    expect(onAddMock).toHaveBeenCalledTimes(1);
    expect(onAddMock).toHaveBeenCalledWith({ doctor_id: "12345" });
  });

  it("does not submit again after input is cleared", async () => {
    const user = userEvent.setup();
    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /add doctor/i });

    await user.type(input, "12345");
    await user.click(button);
    await user.click(button);

    expect(onAddMock).toHaveBeenCalledTimes(1);
  });
});

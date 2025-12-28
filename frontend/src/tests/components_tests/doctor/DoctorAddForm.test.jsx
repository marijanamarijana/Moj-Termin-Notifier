import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DoctorForm from "../../../components/doctor/DoctorAddForm";

describe("DoctorForm Component", () => {
  it("renders the form correctly", () => {
    render(<DoctorForm onAdd={vi.fn()} />);
    expect(screen.getByText("Add a New Doctor")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter doctor's ID")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Doctor/i })).toBeInTheDocument();
  });

  it("updates input field correctly when typing", () => {
    render(<DoctorForm onAdd={vi.fn()} />);
    const input = screen.getByPlaceholderText("Enter doctor's ID");

    fireEvent.change(input, { target: { value: "12345" } });
    expect(input.value).toBe("12345");
  });

  it("calls onAdd with doctor_id when submitted", () => {
    const onAddMock = vi.fn();
    render(<DoctorForm onAdd={onAddMock} />);

    const input = screen.getByPlaceholderText("Enter doctor's ID");
    const button = screen.getByRole("button", { name: /Add Doctor/i });

    fireEvent.change(input, { target: { value: "12345" } });
    fireEvent.click(button);

    expect(onAddMock).toHaveBeenCalledTimes(1);
    expect(onAddMock).toHaveBeenCalledWith({ doctor_id: "12345" });
    expect(input.value).toBe(""); // input should be cleared after submit
  });

  it("does not call onAdd if input is empty", () => {
    const onAddMock = vi.fn();
    render(<DoctorForm onAdd={onAddMock} />);

    const button = screen.getByRole("button", { name: /Add Doctor/i });
    fireEvent.click(button);

    expect(onAddMock).not.toHaveBeenCalled();
  });
});

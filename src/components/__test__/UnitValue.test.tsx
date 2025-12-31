import {
  act,
  fireEvent,
  render,
  screen
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UnitValue from "../UnitValue";

describe("UnitValue Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders correctly with default values", () => {
    render(<UnitValue />);
    // Check default unit is %
    const percentButton = screen.getByText("%");
    expect(percentButton.closest("button")).toHaveClass("bg-[#3B3B3B]"); // Selected class

    // Check default value is 1.0 (or 1)
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("1");
  });

  it("switches units correctly", () => {
    render(<UnitValue />);
    const pxButton = screen.getByText("px");
    fireEvent.click(pxButton);

    expect(pxButton.closest("button")).toHaveClass("bg-[#3B3B3B]");
    const percentButton = screen.getByText("%");
    expect(percentButton.closest("button")).not.toHaveClass("bg-[#3B3B3B]");
  });

  it("increments and decrements value via buttons", () => {
    render(<UnitValue />);
    const input = screen.getByRole("textbox");
    const increaseBtn = screen.getByLabelText("Increase value");
    const decreaseBtn = screen.getByLabelText("Decrease value");

    // Default 1.0 -> 1.1
    fireEvent.click(increaseBtn);
    expect(input).toHaveValue("1.1");

    // 1.1 -> 1.0
    fireEvent.click(decreaseBtn);
    expect(input).toHaveValue("1");
  });

  describe("Input Validation", () => {
    it("replaces comma with dot", () => {
      render(<UnitValue />);
      const input = screen.getByRole("textbox");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "12,3" } });
      fireEvent.blur(input);

      expect(input).toHaveValue("12.3");
    });

    it("handles trailing invalid characters", () => {
      render(<UnitValue />);
      const input = screen.getByRole("textbox");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "15" } });
      fireEvent.blur(input);

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "123a" } });
      fireEvent.blur(input);

      expect(input).toHaveValue("15");
    });

    it("handles embedded invalid characters (12a3 -> 12)", () => {
      render(<UnitValue />);
      const input = screen.getByRole("textbox");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "12a3" } });
      fireEvent.blur(input);

      expect(input).toHaveValue("12");
    });

    it("reverts on completely invalid input (a123 -> revert)", () => {
      render(<UnitValue />);
      const input = screen.getByRole("textbox");

      // Initial valid value
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "10" } });
      fireEvent.blur(input);
      expect(input).toHaveValue("10");

      // Invalid input
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "a123" } });
      fireEvent.blur(input);

      expect(input).toHaveValue("10");
    });

    it("handles multiple dots/complex invalid input (12.4.5 -> 12.4)", () => {
      render(<UnitValue />);
      const input = screen.getByRole("textbox");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "12.4.5" } });
      fireEvent.blur(input);

      expect(input).toHaveValue("12.4");
    });
  });

  describe("Value Constraints", () => {
    it("clamps value < 0 to 0", () => {
      render(<UnitValue />);
      const input = screen.getByRole("textbox");

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "-5" } });
      fireEvent.blur(input);

      expect(input).toHaveValue("0");
    });

    it("reverts value > 100 when unit is %", () => {
      render(<UnitValue />); // Unit is %
      const input = screen.getByRole("textbox");

      // Set valid value first
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "50" } });
      fireEvent.blur(input);
      expect(input).toHaveValue("50");

      // Try > 100
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "150" } });
      fireEvent.blur(input);

      expect(input).toHaveValue("50");
    });

    it("allows value > 100 when unit is px", () => {
      render(<UnitValue />);
      fireEvent.click(screen.getByText("px"));

      const input = screen.getByRole("textbox");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "150" } });
      fireEvent.blur(input);

      expect(input).toHaveValue("150");
    });

    it("updates value to 100 if > 100 when switching from px to %", () => {
      render(<UnitValue />);
      fireEvent.click(screen.getByText("px"));

      const input = screen.getByRole("textbox");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "150" } });
      fireEvent.blur(input);
      expect(input).toHaveValue("150");

      fireEvent.click(screen.getByText("%"));
      expect(input).toHaveValue("100");
    });
  });

  describe("Button States and Tooltips", () => {
    it("disables minus button at 0 and shows tooltip", async () => {
      render(<UnitValue />);
      const input = screen.getByRole("textbox");

      // Set to 0
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "0" } });
      fireEvent.blur(input);

      const decreaseBtn = screen.getByLabelText("Decrease value");
      expect(decreaseBtn).toBeDisabled();

      // Check Tooltip
      const tooltipTrigger = decreaseBtn.parentElement!;
      fireEvent.mouseEnter(tooltipTrigger);

      // Advance timers to trigger setTimeout
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByText("Value must greater than 0");
      expect(tooltip).toBeInTheDocument();
    });

    it("disables plus button at 100 (in %) and shows tooltip", async () => {
      render(<UnitValue />);
      const input = screen.getByRole("textbox");

      // Set to 100
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "100" } });
      fireEvent.blur(input);

      const increaseBtn = screen.getByLabelText("Increase value");
      expect(increaseBtn).toBeDisabled();

      // Check Tooltip
      const tooltipTrigger = increaseBtn.parentElement!;
      fireEvent.mouseEnter(tooltipTrigger);

      // Advance timers to trigger setTimeout
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const tooltip = screen.getByText("Value must smaller than 100");
      expect(tooltip).toBeInTheDocument();
    });
  });
});

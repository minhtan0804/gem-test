import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, describe } from "vitest";
import App from "../App";

describe("App Component", () => {
  it("renders correctly and matches snapshot", () => {
    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
  });

  it("should handle percent button click and show active class", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole("textbox");
    await user.type(input, "100");

    const percentButton = screen.getByRole("button", { name: "%" });

    await user.click(percentButton);

    expect(percentButton).toHaveClass("bg-[#3B3B3B]");
  });
});

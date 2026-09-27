import { describe, expect, vi, test, beforeEach } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";

import { App } from "./App";

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("starts transition with file picker", async () => {
    const screen = await render(<App />);
    await userEvent.click(
      screen.getByRole("button").filter({ hasText: "Initialize blob" }),
    );
    await userEvent.type(screen.getByRole("textbox"), "Hello world!");
    expect(screen.getByRole("textbox").element()).toMatchTextContent(
      "Hello world!",
    );

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName !== null &&
          mutation.target.nodeType === Node.ELEMENT_NODE
        ) {
          console.log(
            new Date().toISOString(),
            `- ${mutation.attributeName} has updated:`,
            (mutation.target as Element).getAttribute(mutation.attributeName),
          );
        }
      });
    });
    observer.observe(screen.getByTestId("save-button").first().element(), {
      attributes: true,
    });

    await userEvent.click(screen.getByTestId("save-button"));
    expect(screen.getByTestId("save-button")).toHaveAttribute(
      "data-pending",
      "true",
    );
    await expect
      .element(screen.getByTestId("save-button"))
      .toHaveAttribute("data-pending", "false");
    observer.disconnect();
  });
}, 50_000);

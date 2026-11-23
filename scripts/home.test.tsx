// @vitest-environment jsdom
import { StrictMode } from "react";
import { test, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import PartnershipForm from "../components/home/PartnershipForm";
import Navbar from "../components/Navbar";
import {
  PARTNERSHIP_COMPANIES,
  PARTNERSHIP_EXAMPLES_STORAGE_KEY,
  selectPartnershipExamples,
} from "../lib/partnership-companies";
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("../components/LanguageSwitcher", () => ({ default: () => null }));
afterEach(() => {
  cleanup();
  sessionStorage.clear();
});
test("300 distinct companies span the world and each refreshed set excludes the previous set", () => {
  expect(PARTNERSHIP_COMPANIES).toHaveLength(300);
  expect(new Set(PARTNERSHIP_COMPANIES.map((c) => c.name)).size).toBe(300);
  expect(
    new Set(PARTNERSHIP_COMPANIES.map((c) => c.country)).size,
  ).toBeGreaterThan(40);
  let previous: string[] = [];
  const seen = new Set<string>();
  let seed = 21;
  const random = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 3000; i++) {
    const next = selectPartnershipExamples(previous, random);
    expect(new Set(next).size).toBe(3);
    expect(next.some((n) => previous.includes(n))).toBe(false);
    next.forEach((n) => seen.add(n));
    previous = next;
  }
  expect(seen.size).toBe(300);
});
test("refreshing the form changes all suggestions, including in Strict Mode, and suggestions still fill the input", () => {
  render(
    <StrictMode>
      <PartnershipForm locale="ja" />
    </StrictMode>,
  );
  const first = JSON.parse(
    sessionStorage.getItem(PARTNERSHIP_EXAMPLES_STORAGE_KEY)!,
  );
  expect(first).toHaveLength(3);
  fireEvent.click(screen.getByRole("button", { name: first[0] }));
  expect((screen.getByLabelText("社名") as HTMLInputElement).value).toBe(
    first[0],
  );
  cleanup();
  render(
    <StrictMode>
      <PartnershipForm locale="ja" />
    </StrictMode>,
  );
  const next = JSON.parse(
    sessionStorage.getItem(PARTNERSHIP_EXAMPLES_STORAGE_KEY)!,
  );
  expect(next.some((n: string) => first.includes(n))).toBe(false);
  next.forEach((n: string) =>
    expect(screen.getByRole("button", { name: n })).toBeTruthy(),
  );
});
test("desktop and mobile headers contain only the four requested navigation links", () => {
  const { container } = render(<Navbar locale="ja" />);
  for (const selector of [".nav-links", ".nav-panel"]) {
    expect(
      [...container.querySelectorAll(selector + " a")].map(
        (a) => a.textContent,
      ),
    ).toEqual(["about", "blog", "research", "club"]);
  }
  expect(container.querySelector('a[href="/blog"]')).toBeTruthy();
});

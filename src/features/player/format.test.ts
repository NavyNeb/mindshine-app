import { formatTime, formatRemaining } from "./format";
test("formats seconds as M:SS", () => {
  expect(formatTime(0)).toBe("0:00");
  expect(formatTime(134)).toBe("2:14");
  expect(formatTime(75)).toBe("1:15");
});
test("formats remaining as negative", () => {
  expect(formatRemaining(134, 209)).toBe("-1:15");
  expect(formatRemaining(10, 10)).toBe("-0:00");
});

import { greetingForHour } from "./greeting";
test("greets by time of day", () => {
  expect(greetingForHour(8)).toBe("Good morning");
  expect(greetingForHour(14)).toBe("Good afternoon");
  expect(greetingForHour(21)).toBe("Good evening");
});

import { mapAuthError } from "./auth.api";

test("maps common supabase auth errors to friendly copy", () => {
  expect(mapAuthError({ message: "Invalid login credentials" } as any))
    .toBe("That email or password doesn't look right.");
  expect(mapAuthError({ message: "User already registered" } as any))
    .toBe("An account with this email already exists.");
  expect(mapAuthError(null)).toBe("");
});

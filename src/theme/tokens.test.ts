import { colors, radii, fontFamily } from "./tokens";

test("brand colors match Figma variables", () => {
  expect(colors.primary.DEFAULT).toBe("#22D795");
  expect(colors.secondary.DEFAULT).toBe("#D3F761");
  expect(colors.ink.DEFAULT).toBe("#0D1101");
});

test("exposes a card radius and heading font", () => {
  expect(radii.card).toBe(24);
  expect(fontFamily.heading).toBe("MPLUSRounded1c_700Bold");
});

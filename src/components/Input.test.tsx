import { render, fireEvent } from "@testing-library/react-native";
import { Input } from "./Input";

test("renders label + placeholder and reports text changes", () => {
  const onChangeText = jest.fn();
  const { getByText, getByPlaceholderText } = render(
    <Input label="Email" placeholder="Enter your email" value="" onChangeText={onChangeText} />
  );
  getByText("Email");
  fireEvent.changeText(getByPlaceholderText("Enter your email"), "a@b.com");
  expect(onChangeText).toHaveBeenCalledWith("a@b.com");
});

test("password input toggles visibility via the eye control", () => {
  const { getByLabelText, getByPlaceholderText } = render(
    <Input label="Password" placeholder="Create a password" value="x" onChangeText={() => {}} secure />
  );
  const field = getByPlaceholderText("Create a password");
  expect(field.props.secureTextEntry).toBe(true);
  fireEvent.press(getByLabelText("Toggle password visibility"));
  expect(field.props.secureTextEntry).toBe(false);
});

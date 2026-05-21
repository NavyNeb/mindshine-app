import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "./Button";

test("renders label and fires onPress", () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button label="Play Now" onPress={onPress} />);
  fireEvent.press(getByText("Play Now"));
  expect(onPress).toHaveBeenCalledTimes(1);
});

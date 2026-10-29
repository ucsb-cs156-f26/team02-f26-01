import { onDeleteSuccess } from "main/utils/restaurantUtils";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({ toast: vi.fn() }));

test("restaurant deletion logs and toasts the backend success message", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const message = { message: "Restaurant deleted" };
  try {
    onDeleteSuccess(message);
    expect(log).toHaveBeenCalledWith(message);
    expect(toast).toHaveBeenCalledWith(message);
  } finally {
    log.mockRestore();
  }
});

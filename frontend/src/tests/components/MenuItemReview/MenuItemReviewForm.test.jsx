import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const testId = "MenuItemReviewForm";

  const renderForm = (props = {}) => {
    render(
      <Router>
        <MenuItemReviewForm {...props} />
      </Router>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders correctly with no initialContents", () => {
    renderForm();

    expect(screen.getByText("Item ID")).toBeInTheDocument();
    expect(screen.getByText("Reviewer Email")).toBeInTheDocument();
    expect(screen.getByText("Stars")).toBeInTheDocument();
    expect(screen.getByText("Date Reviewed")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();

    expect(screen.getByTestId(testId + "-submit")).toHaveTextContent("Create");
    expect(screen.queryByTestId(testId + "-id")).not.toBeInTheDocument();
  });

  test("renders correctly with initialContents", () => {
    renderForm({
      initialContents: menuItemReviewFixtures.oneMenuItemReview,
      buttonLabel: "Update",
    });

    expect(screen.getByTestId(testId + "-id")).toHaveValue("1");
    expect(screen.getByTestId(testId + "-id")).toHaveAttribute("readonly");

    expect(screen.getByTestId(testId + "-itemId")).toHaveValue(1);
    expect(screen.getByTestId(testId + "-stars")).toHaveValue(5);
    expect(screen.getByTestId(testId + "-comments")).toHaveValue("So yummy");

    expect(screen.getByTestId(testId + "-submit")).toHaveTextContent("Update");
  });

  test("Cancel button navigates back", async () => {
    renderForm();

    fireEvent.click(screen.getByTestId(testId + "-cancel"));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });

  test("required fields show validation errors", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.submit(screen.getByTestId(testId + "-submit").closest("form"));

    expect(await screen.findByText("Item ID is required.")).toBeInTheDocument();
    expect(screen.getByText("Reviewer Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Stars is required.")).toBeInTheDocument();
    expect(screen.getByText("Date Reviewed is required.")).toBeInTheDocument();
    expect(screen.getByText("Comments are required.")).toBeInTheDocument();

    expect(submitAction).not.toHaveBeenCalled();
  });

  test("stars must be between 1 and 5", async () => {
    renderForm({ submitAction: vi.fn() });

    const starsInput = screen.getByTestId(testId + "-stars");
    const form = screen.getByTestId(testId + "-submit").closest("form");

    fireEvent.change(starsInput, { target: { value: "6" } });
    fireEvent.submit(form);

    expect(
      await screen.findByText("Stars cannot be more than 5."),
    ).toBeInTheDocument();

    fireEvent.change(starsInput, { target: { value: "0" } });
    fireEvent.submit(form);

    expect(
      await screen.findByText("Stars must be at least 1."),
    ).toBeInTheDocument();
  });

  test("submits valid review data", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.change(screen.getByTestId(testId + "-itemId"), {
      target: { value: "1" },
    });

    fireEvent.change(screen.getByTestId(testId + "-reviewerEmail"), {
      target: { value: "student@ucsb.edu" },
    });

    fireEvent.change(screen.getByTestId(testId + "-stars"), {
      target: { value: "4" },
    });

    fireEvent.change(screen.getByTestId(testId + "-dateReviewed"), {
      target: { value: "2026-10-22T17:50:00" },
    });

    fireEvent.change(screen.getByTestId(testId + "-comments"), {
      target: { value: "Good food" },
    });

    fireEvent.submit(screen.getByTestId(testId + "-submit").closest("form"));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalled();
    });

    expect(submitAction.mock.calls[0][0]).toMatchObject({
      itemId: 1,
      reviewerEmail: "student@ucsb.edu",
      stars: 4,
      dateReviewed: "2026-10-22T17:50",
      comments: "Good food",
    });
  });

  test("item ID must be a whole number", async () => {
    renderForm({ submitAction: vi.fn() });

    fireEvent.change(screen.getByTestId(testId + "-itemId"), {
      target: { value: "1.5" },
    });

    fireEvent.submit(screen.getByTestId(testId + "-submit").closest("form"));

    expect(
      await screen.findByText("Item ID must be a whole number."),
    ).toBeInTheDocument();
  });

  test("stars must be a whole number", async () => {
    renderForm({ submitAction: vi.fn() });

    fireEvent.change(screen.getByTestId(testId + "-stars"), {
      target: { value: "2.5" },
    });

    fireEvent.submit(screen.getByTestId(testId + "-submit").closest("form"));

    expect(
      await screen.findByText("Stars must be a whole number."),
    ).toBeInTheDocument();
  });

  test("comments cannot be only spaces", async () => {
    renderForm({ submitAction: vi.fn() });

    fireEvent.change(screen.getByTestId(testId + "-comments"), {
      target: { value: "   " },
    });

    fireEvent.submit(screen.getByTestId(testId + "-submit").closest("form"));

    expect(
      await screen.findByText("Comments cannot be blank."),
    ).toBeInTheDocument();
  });
});

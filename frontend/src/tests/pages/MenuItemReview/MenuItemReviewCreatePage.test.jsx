import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockToast = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("MenuItemReviewCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = (storybook) => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage storybook={storybook} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const fillForm = () => {
    fireEvent.change(screen.getByLabelText("Item ID"), {
      target: { value: "1" },
    });

    fireEvent.change(screen.getByLabelText("Reviewer Email"), {
      target: { value: "student@ucsb.edu" },
    });

    fireEvent.change(screen.getByLabelText("Stars"), {
      target: { value: "5" },
    });

    fireEvent.change(screen.getByLabelText("Date Reviewed"), {
      target: { value: "2026-10-22T17:50" },
    });

    fireEvent.change(screen.getByLabelText("Comments"), {
      target: { value: "Great food" },
    });
  };

  test("renders the Create page correctly", async () => {
    renderPage();

    expect(screen.getByText("Create New MenuItemReview")).toBeInTheDocument();

    expect(screen.getByLabelText("Item ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Reviewer Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Stars")).toBeInTheDocument();
    expect(screen.getByLabelText("Date Reviewed")).toBeInTheDocument();
    expect(screen.getByLabelText("Comments")).toBeInTheDocument();

    expect(screen.getByTestId("MenuItemReviewForm-submit")).toHaveTextContent(
      "Create",
    );
  });

  test("valid submission creates a review and redirects", async () => {
    const newReview = {
      id: 3,
      itemId: 1,
      reviewerEmail: "student@ucsb.edu",
      stars: 5,
      dateReviewed: "2026-10-22T17:50:00",
      comments: "Great food",
    };

    axiosMock.onPost("/api/MenuItemReview/post").reply(200, newReview);

    renderPage();
    fillForm();

    fireEvent.submit(
      screen.getByTestId("MenuItemReviewForm-submit").closest("form"),
    );

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: 1,
      reviewerEmail: "student@ucsb.edu",
      stars: 5,
      dateReviewed: "2026-10-22T17:50",
      comments: "Great food",
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New MenuItemReview Created - id: 3 itemId: 1",
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/menuitemreview",
      });
    });
  });

  test("invalid submission shows errors and does not create review", async () => {
    renderPage();

    fireEvent.submit(
      screen.getByTestId("MenuItemReviewForm-submit").closest("form"),
    );

    expect(await screen.findByText("Item ID is required.")).toBeInTheDocument();

    expect(screen.getByText("Reviewer Email is required.")).toBeInTheDocument();

    expect(screen.getByText("Stars is required.")).toBeInTheDocument();

    expect(screen.getByText("Date Reviewed is required.")).toBeInTheDocument();

    expect(screen.getByText("Comments are required.")).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("storybook mode does not redirect after submission", async () => {
    axiosMock.onPost("/api/MenuItemReview/post").reply(200, {
      id: 4,
      itemId: 1,
      reviewerEmail: "student@ucsb.edu",
      stars: 5,
      dateReviewed: "2026-10-22T17:50:00",
      comments: "Great food",
    });

    renderPage(true);
    fillForm();

    fireEvent.submit(
      screen.getByTestId("MenuItemReviewForm-submit").closest("form"),
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    expect(axiosMock.history.post.length).toBe(1);
    expect(mockNavigate).not.toHaveBeenCalled();

    expect(screen.getByText("Create New MenuItemReview")).toBeInTheDocument();
  });
});

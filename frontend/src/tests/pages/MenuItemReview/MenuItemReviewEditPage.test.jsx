import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
const mockNavigate = vi.fn();
const mockGoBack = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({ id: 1 })),
    useNavigate: () => mockGoBack,
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("MenuItemReviewEditPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "MenuItemReviewForm";

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  afterAll(() => {
    axiosMock.restore();
  });

  const setupReview = () => {
    axiosMock
      .onGet("/api/MenuItemReview", { params: { id: 1 } })
      .reply(200, menuItemReviewFixtures.oneMenuItemReview);
  };

  const renderPage = (storybook) => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {storybook === undefined ? (
            <MenuItemReviewEditPage />
          ) : (
            <MenuItemReviewEditPage storybook={storybook} />
          )}
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders header when no review data is returned", async () => {
    axiosMock
      .onGet("/api/MenuItemReview", { params: { id: 1 } })
      .reply(200, null);

    renderPage();

    expect(await screen.findByText("Edit MenuItemReview")).toBeInTheDocument();
    expect(screen.queryByTestId(testId + "-id")).not.toBeInTheDocument();
  });

  test("loads existing review and updates it", async () => {
    setupReview();

    axiosMock.onPut("/api/MenuItemReview").reply(200, {
      ...menuItemReviewFixtures.oneMenuItemReview,
      stars: 4,
      comments: "Updated review",
    });

    renderPage();

    const idField = await screen.findByTestId(testId + "-id");
    const itemIdField = screen.getByTestId(testId + "-itemId");
    const emailField = screen.getByTestId(testId + "-reviewerEmail");
    const starsField = screen.getByTestId(testId + "-stars");
    const dateField = screen.getByTestId(testId + "-dateReviewed");
    const commentsField = screen.getByTestId(testId + "-comments");
    const submitButton = screen.getByTestId(testId + "-submit");

    expect(idField).toHaveValue("1");
    expect(idField).toHaveAttribute("readonly");
    expect(itemIdField).toHaveValue(1);
    expect(emailField).toHaveValue("nathanshih@ucsb.edu");
    expect(starsField).toHaveValue(5);
    expect(commentsField).toHaveValue("So yummy");
    expect(submitButton).toHaveTextContent("Update");

    fireEvent.change(starsField, {
      target: { value: "4" },
    });

    fireEvent.change(dateField, {
      target: { value: "2026-10-22T17:50" },
    });

    fireEvent.change(commentsField, {
      target: { value: "Updated review" },
    });

    fireEvent.submit(submitButton.closest("form"));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });

    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      itemId: 1,
      reviewerEmail: "nathanshih@ucsb.edu",
      stars: 4,
      dateReviewed: "2026-10-22T17:50",
      comments: "Updated review",
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("MenuItemReview Updated - id: 1");
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/menuitemreview",
      });
    });
  });

  test("invalid data shows an error and does not update", async () => {
    setupReview();
    renderPage();

    const starsField = await screen.findByTestId(testId + "-stars");

    fireEvent.change(starsField, {
      target: { value: "6" },
    });

    fireEvent.submit(screen.getByTestId(testId + "-submit").closest("form"));

    expect(
      await screen.findByText("Stars cannot be more than 5."),
    ).toBeInTheDocument();

    expect(axiosMock.history.put.length).toBe(0);
    expect(mockToast).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("Cancel goes back without saving", async () => {
    setupReview();
    renderPage();

    const commentsField = await screen.findByTestId(testId + "-comments");

    fireEvent.change(commentsField, {
      target: { value: "Changed but not saved" },
    });

    fireEvent.click(screen.getByTestId(testId + "-cancel"));

    expect(mockGoBack).toHaveBeenCalledWith(-1);
    expect(axiosMock.history.put.length).toBe(0);
    expect(mockToast).not.toHaveBeenCalled();
  });

  test("storybook mode does not redirect after updating", async () => {
    setupReview();

    axiosMock.onPut("/api/MenuItemReview").reply(200, {
      ...menuItemReviewFixtures.oneMenuItemReview,
    });

    renderPage(true);

    const submitButton = await screen.findByTestId(testId + "-submit");

    fireEvent.submit(submitButton.closest("form"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    expect(axiosMock.history.put.length).toBe(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Edit MenuItemReview")).toBeInTheDocument();
  });
});

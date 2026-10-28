import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import MenuItemReviewIndexPage from "main/pages/MenuItemReview/MenuItemReviewIndexPage";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockedNavigate = vi.fn();
const mockToast = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

describe("MenuItemReviewIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "MenuItemReviewTable";

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const setupUser = (user) => {
    axiosMock.onGet("/api/currentUser").reply(200, user);
  };

  const renderPage = () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders Create button for admin user", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);

    axiosMock.onGet("/api/MenuItemReview/all").reply(200, []);

    renderPage();

    const button = await screen.findByText("Create MenuItemReview");

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("href", "/menuitemreview/create");
    expect(button).toHaveAttribute("style", "float: right;");

    expect(screen.getByText("MenuItemReviews")).toBeInTheDocument();
  });

  test("renders three reviews correctly for regular user", async () => {
    setupUser(apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet("/api/MenuItemReview/all")
      .reply(200, menuItemReviewFixtures.threeMenuItemReviews);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );

    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    expect(screen.getByText("So yummy")).toBeInTheDocument();
    expect(screen.getByText("Good food and service")).toBeInTheDocument();
    expect(screen.getByText("Food was okay")).toBeInTheDocument();

    expect(screen.getByText("nathanshih@ucsb.edu")).toBeInTheDocument();

    expect(screen.queryByText("Create MenuItemReview")).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("admin can see reviews and Edit and Delete buttons", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet("/api/MenuItemReview/all")
      .reply(200, menuItemReviewFixtures.threeMenuItemReviews);

    renderPage();

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");

    expect(screen.getByText("Create MenuItemReview")).toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).toBeInTheDocument();
  });

  test("Edit button navigates to the correct page", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet("/api/MenuItemReview/all")
      .reply(200, menuItemReviewFixtures.threeMenuItemReviews);

    renderPage();

    const editButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );

    fireEvent.click(editButton);

    expect(mockedNavigate).toHaveBeenCalledWith("/menuitemreview/edit/1");
  });

  test("Delete button removes a review and refreshes the table", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);

    let reviews = [...menuItemReviewFixtures.threeMenuItemReviews];

    axiosMock.onGet("/api/MenuItemReview/all").reply(() => {
      return [200, reviews];
    });

    axiosMock.onDelete("/api/MenuItemReview").reply((config) => {
      reviews = reviews.filter(
        (review) => review.id !== Number(config.params.id),
      );

      return [200, { message: "MenuItemReview deleted" }];
    });

    renderPage();

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    expect(screen.getByText("So yummy")).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("MenuItemReview deleted");
    });

    await waitFor(() => {
      expect(screen.queryByText("So yummy")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Good food and service")).toBeInTheDocument();
  });
});

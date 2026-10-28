import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import MenuItemReviewTable from "main/components/MenuItemReview/MenuItemReviewTable";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewTable tests", () => {
  const testId = "MenuItemReviewTable";

  const expectedHeaders = [
    "ID",
    "Item ID",
    "Reviewer Email",
    "Stars",
    "Date Reviewed",
    "Comments",
  ];

  const expectedFields = [
    "id",
    "itemId",
    "reviewerEmail",
    "stars",
    "dateReviewed",
    "comments",
  ];

  let axiosMock;

  const renderTable = (menuItemReviews, currentUser) => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable
            menuItemReviews={menuItemReviews}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  afterEach(() => {
    vi.clearAllMocks();
    if (axiosMock) {
      axiosMock.restore();
      axiosMock = undefined;
    }
  });

  test("renders an empty table correctly", () => {
    renderTable([], currentUserFixtures.adminUser);

    expectedHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${field}`),
      ).not.toBeInTheDocument();
    });
  });

  test("renders the correct data and buttons for an admin", () => {
    renderTable(
      menuItemReviewFixtures.threeMenuItemReviews,
      currentUserFixtures.adminUser,
    );

    expectedHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-reviewerEmail`),
    ).toHaveTextContent("nathanshih@ucsb.edu");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-stars`),
    ).toHaveTextContent("5");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-comments`),
    ).toHaveTextContent("So yummy");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("renders data without admin buttons for a regular user", () => {
    renderTable(
      menuItemReviewFixtures.threeMenuItemReviews,
      currentUserFixtures.userOnly,
    );

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-stars`),
    ).toHaveTextContent("4");

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    renderTable(
      menuItemReviewFixtures.threeMenuItemReviews,
      currentUserFixtures.adminUser,
    );

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );

    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/menuitemreview/edit/1");
    });
  });

  test("Delete button calls the backend", async () => {
    axiosMock = new AxiosMockAdapter(axios);

    axiosMock
      .onDelete("/api/MenuItemReview")
      .reply(200, { message: "MenuItemReview deleted" });

    renderTable(
      menuItemReviewFixtures.threeMenuItemReviews,
      currentUserFixtures.adminUser,
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});

import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { render as rtlRender } from "@testing-library/react";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

const render = (ui, queryClient = new QueryClient()) =>
  rtlRender(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );

describe("RecommendationRequestTable tests", () => {
  const expectedHeaders = [
    "ID",
    "Requester Email",
    "Professor Email",
    "Explanation",
    "Date Requested",
    "Date Needed",
    "Done",
  ];
  const expectedFields = [
    "id",
    "requesterEmail",
    "professorEmail",
    "explanation",
    "dateRequested",
    "dateNeeded",
    "done",
  ];

  test("renders all headers and no data rows for an empty table", () => {
    render(<RecommendationRequestTable recommendationRequests={[]} />);

    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toEqual(expectedHeaders);
    expect(screen.getAllByRole("row")).toHaveLength(1);
    expect(screen.queryByRole("cell")).not.toBeInTheDocument();
  });

  test("renders all seven fields for every fixture, including true and false Done values", () => {
    const requests = recommendationRequestFixtures.threeRecommendationRequests;
    render(
      <RecommendationRequestTable
        recommendationRequests={requests}
        currentUser={currentUserFixtures.userOnly}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
    const table = screen.getByTestId("RecommendationRequestTable");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(expectedHeaders);
    expect(within(table).getAllByRole("row")).toHaveLength(requests.length + 1);
    requests.forEach((request, rowIndex) => {
      const row = screen.getByTestId(
        `RecommendationRequestTable-row-${rowIndex}`,
      );
      expect(within(row).getAllByRole("cell")).toHaveLength(7);
      expectedFields.forEach((field) => {
        expect(
          screen.getByTestId(
            `RecommendationRequestTable-cell-row-${rowIndex}-col-${field}`,
          ).textContent,
        ).toBe(String(request[field]));
      });
    });
    expect(within(table).getAllByText("false")).toHaveLength(2);
    expect(within(table).getByText("true")).toBeInTheDocument();
  });
  test("admins can edit and delete the selected request", async () => {
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/RecommendationRequest", { params: { id: 2 } })
      .reply(200, {});
    mockedNavigate.mockClear();

    try {
      render(
        <RecommendationRequestTable
          recommendationRequests={
            recommendationRequestFixtures.threeRecommendationRequests
          }
          currentUser={currentUserFixtures.adminUser}
        />,
        queryClient,
      );
      expect(
        screen.getAllByRole("columnheader").map((header) => header.textContent),
      ).toEqual([...expectedHeaders, "Edit", "Delete"]);
      expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(3);
      expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(3);
      const editButton = screen.getByTestId(
        "RecommendationRequestTable-cell-row-1-col-Edit-button",
      );
      const deleteButton = screen.getByTestId(
        "RecommendationRequestTable-cell-row-1-col-Delete-button",
      );
      expect(editButton).toHaveClass("btn-primary");
      expect(deleteButton).toHaveClass("btn-danger");
      fireEvent.click(editButton);
      expect(mockedNavigate).toHaveBeenCalledExactlyOnceWith(
        "/recommendationrequest/edit/2",
      );
      fireEvent.click(deleteButton);
      await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
      expect(axiosMock.history.delete[0].url).toBe(
        "/api/RecommendationRequest",
      );
      expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
      await waitFor(() =>
        expect(invalidateQueries).toHaveBeenCalledExactlyOnceWith({
          queryKey: ["/api/RecommendationRequest/all"],
        }),
      );
    } finally {
      axiosMock.restore();
      queryClient.clear();
    }
  });
});

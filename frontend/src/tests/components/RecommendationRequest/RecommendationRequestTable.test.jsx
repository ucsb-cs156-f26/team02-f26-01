import { render, screen, within } from "@testing-library/react";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

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
    render(<RecommendationRequestTable recommendationRequests={requests} />);

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
});

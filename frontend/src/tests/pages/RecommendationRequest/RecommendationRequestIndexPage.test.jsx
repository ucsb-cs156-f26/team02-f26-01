import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router";
import RecommendationRequestIndexPage from "main/pages/RecommendationRequest/RecommendationRequestIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const requests = recommendationRequestFixtures.threeRecommendationRequests;
const table = "RecommendationRequestTable";
const endpoint = "/api/RecommendationRequest/all";

describe("RecommendationRequestIndexPage", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  beforeEach(() => {
    axiosMock.reset();
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });
  const setup = (role, data = requests) => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures[role]);
    axiosMock.onGet(endpoint).reply(200, data);
  };
  const renderPage = () =>
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <MemoryRouter initialEntries={["/recommendationrequest"]}>
          <Routes>
            <Route
              path="/recommendationrequest"
              element={<RecommendationRequestIndexPage />}
            />
            <Route
              path="/recommendationrequest/edit/2"
              element={<p>Editing request 2</p>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  test("ordinary users see every field of every record without action buttons", async () => {
    setup("userOnly");
    renderPage();
    await screen.findByText(requests[2].requesterEmail);
    expect(
      screen.getByRole("heading", { name: "Recommendation Requests" }),
    ).toBeInTheDocument();
    requests.forEach((request, row) => {
      Object.entries(request).forEach(([field, value]) => {
        expect(
          screen.getByTestId(`${table}-cell-row-${row}-col-${field}`)
            .textContent,
        ).toBe(String(value));
      });
    });
    expect(
      screen.queryByText("Create RecommendationRequest"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Recommendation Requests" })
        .parentElement,
    ).toHaveClass("pt-2");
  });
  test("admins see create and row actions and can navigate to edit", async () => {
    setup("adminUser");
    renderPage();
    const create = await screen.findByText("Create RecommendationRequest");
    expect(create).toHaveAttribute("href", "/recommendationrequest/create");
    expect(create).toHaveAttribute("style", "float: right;");
    expect(create).toHaveClass("btn-primary");
    await screen.findByTestId(`${table}-cell-row-2-col-Edit-button`);
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(3);
    expect(
      screen.getByTestId(`${table}-cell-row-1-col-Edit-button`),
    ).toHaveClass("btn-primary");
    expect(
      screen.getByTestId(`${table}-cell-row-1-col-Delete-button`),
    ).toHaveClass("btn-danger");
    fireEvent.click(screen.getByTestId(`${table}-cell-row-1-col-Edit-button`));
    expect(await screen.findByText("Editing request 2")).toBeInTheDocument();
  });
  test("delete sends the selected id and refetches to remove only that record", async () => {
    setup("adminUser");
    axiosMock
      .onDelete("/api/RecommendationRequest", { params: { id: 2 } })
      .reply(() => {
        axiosMock.onGet(endpoint).reply(
          200,
          requests.filter((r) => r.id !== 2),
        );
        return [200, { message: "RecommendationRequest with id 2 deleted" }];
      });
    renderPage();
    fireEvent.click(
      await screen.findByTestId(`${table}-cell-row-1-col-Delete-button`),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(requests[1].requesterEmail),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText(requests[0].requesterEmail)).toBeInTheDocument();
    expect(screen.getByText(requests[2].requesterEmail)).toBeInTheDocument();
    expect(
      axiosMock.history.get.filter((r) => r.url === "/api/currentUser"),
    ).toHaveLength(1);
    expect(
      axiosMock.history.get.filter((r) => r.url === "/api/systemInfo"),
    ).toHaveLength(1);
    expect(axiosMock.history.delete).toHaveLength(1);
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
    expect(
      axiosMock.history.get.filter((r) => r.url === endpoint),
    ).toHaveLength(2);
  });
  test("empty results show table headers without records", async () => {
    setup("userOnly", []);
    renderPage();
    await waitFor(() =>
      expect(axiosMock.history.get.some((r) => r.url === endpoint)).toBe(true),
    );
    expect(
      screen.getByRole("columnheader", { name: "Requester Email" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("cell")).not.toBeInTheDocument();
  });
  test("backend failure leaves an empty table", async () => {
    setup("userOnly");
    axiosMock.onGet(endpoint).timeout();
    const restore = mockConsole();
    try {
      renderPage();
      await waitFor(() =>
        expect(console.error).toHaveBeenCalledWith(
          `Error communicating with backend via GET on ${endpoint}`,
          expect.anything(),
        ),
      );
      expect(screen.queryByRole("cell")).not.toBeInTheDocument();
    } finally {
      restore();
    }
  });
});

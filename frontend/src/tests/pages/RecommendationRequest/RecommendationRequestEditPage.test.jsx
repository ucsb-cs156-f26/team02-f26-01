import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.hoisted(() => vi.fn());
vi.mock("react-toastify", async (importOriginal) => ({
  ...(await importOriginal()),
  toast: (message) => mockToast(message),
}));

const record = {
  ...recommendationRequestFixtures.threeRecommendationRequests[1],
  id: 17,
};
const endpoint = "/api/RecommendationRequest";
const field = (name) => screen.getByTestId(`RecommendationRequestForm-${name}`);
let axiosMock;
let queryClient;

function renderPage(storybook, id = 17) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={["/previous", `/recommendationrequest/edit/${id}`]}
        initialIndex={1}
      >
        <Routes>
          <Route path="/previous" element={<div>Previous page</div>} />
          <Route
            path="/recommendationrequest"
            element={<div>Request index</div>}
          />
          <Route
            path="/recommendationrequest/edit/:id"
            element={<RecommendationRequestEditPage storybook={storybook} />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  axiosMock = new AxiosMockAdapter(axios);
  axiosMock
    .onGet("/api/currentUser")
    .reply(200, apiCurrentUserFixtures.adminUser);
  axiosMock
    .onGet("/api/systemInfo")
    .reply(200, systemInfoFixtures.showingNeither);
  axiosMock.onGet(endpoint, { params: { id: "17" } }).reply(200, record);
  axiosMock
    .onPut(endpoint)
    .reply((config) => [200, { ...JSON.parse(config.data), id: 17 }]);
});

afterEach(() => {
  axiosMock.restore();
  queryClient.clear();
  vi.clearAllMocks();
});

test("waits for the route's record before mounting and prefilling every field", async () => {
  let resolveRecord;
  axiosMock.onGet(endpoint, { params: { id: "42" } }).reply(
    () =>
      new Promise((resolve) => {
        resolveRecord = resolve;
      }),
  );
  renderPage(false, 42);
  expect(
    screen.getByRole("heading", { name: "Edit RecommendationRequest" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByTestId("RecommendationRequestForm-submit"),
  ).not.toBeInTheDocument();
  await waitFor(() => expect(resolveRecord).toBeDefined());
  resolveRecord([200, { ...record, id: 42 }]);
  await screen.findByTestId("RecommendationRequestForm-id");
  expect(
    queryClient.getQueryData(["/api/RecommendationRequest?id=42"]),
  ).toEqual({ ...record, id: 42 });
  expect(field("id")).toHaveValue("42");
  expect(field("id")).toBeDisabled();
  for (const name of ["requesterEmail", "professorEmail", "explanation"]) {
    expect(field(name)).toHaveValue(record[name]);
  }
  expect(field("dateRequested")).toHaveValue("2026-10-28T10:00");
  expect(field("dateNeeded")).toHaveValue("2026-11-15T10:00");
  expect(field("done")).toBeChecked();
  expect(field("submit")).toHaveTextContent("Update");
  expect(screen.getByRole("heading").parentElement).toHaveClass("pt-2");
});

test.each([undefined, true])(
  "updates all changed fields and handles success (storybook=%s)",
  async (storybook) => {
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    renderPage(storybook);
    await screen.findByTestId("RecommendationRequestForm-id");
    const changed = {
      requesterEmail: "changed@example.com",
      professorEmail: "other@example.com",
      explanation: "Updated application",
      dateRequested: "2026-10-29T12:30",
      dateNeeded: "2026-12-01T15:45",
      done: false,
    };
    for (const [name, value] of Object.entries(changed)) {
      if (name === "done") fireEvent.click(field(name));
      else fireEvent.change(field(name), { target: { value } });
    }
    fireEvent.click(field("submit"));
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "RecommendationRequest Updated - id: 17",
      ),
    );
    expect(axiosMock.history.put).toHaveLength(1);
    expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual(changed);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["/api/RecommendationRequest?id=17"],
    });
    await screen.findByText(
      storybook ? "Edit RecommendationRequest" : "Request index",
    );
    expect(
      Boolean(
        screen.queryByRole("heading", { name: "Edit RecommendationRequest" }),
      ),
    ).toBe(Boolean(storybook));
    expect(Boolean(screen.queryByText("Request index"))).toBe(!storybook);
  },
);

test("invalid values show errors without updating or navigating", async () => {
  renderPage();
  await screen.findByTestId("RecommendationRequestForm-id");
  fireEvent.change(field("requesterEmail"), { target: { value: "invalid" } });
  for (const name of [
    "professorEmail",
    "explanation",
    "dateRequested",
    "dateNeeded",
  ]) {
    fireEvent.change(field(name), { target: { value: "" } });
  }
  fireEvent.click(field("submit"));
  await screen.findByText("Enter a valid email address.");
  for (const label of [
    "Professor Email",
    "Explanation",
    "Date Requested",
    "Date Needed",
  ]) {
    expect(screen.getByText(`${label} is required.`)).toBeInTheDocument();
  }
  expect(axiosMock.history.put).toHaveLength(0);
  expect(mockToast).not.toHaveBeenCalled();
  expect(field("submit")).toBeInTheDocument();
});

test("cancel returns to the previous page without saving edits", async () => {
  renderPage();
  await screen.findByTestId("RecommendationRequestForm-id");
  fireEvent.change(field("explanation"), {
    target: { value: "Unsaved changes" },
  });
  fireEvent.click(field("cancel"));
  await screen.findByText("Previous page");
  expect(axiosMock.history.put).toHaveLength(0);
  expect(mockToast).not.toHaveBeenCalled();
});

test("a failed fetch uses existing error handling and leaves the form unmounted", async () => {
  const restoreConsole = mockConsole();
  try {
    axiosMock.onGet(endpoint, { params: { id: "17" } }).timeout();
    renderPage();
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "Error communicating with backend via GET on /api/RecommendationRequest",
      ),
    );
    expect(
      screen.getByRole("heading", { name: "Edit RecommendationRequest" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("RecommendationRequestForm-submit"),
    ).not.toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(0);
  } finally {
    restoreConsole();
  }
});

test("a failed update keeps the edit form available", async () => {
  axiosMock.onPut(endpoint).reply(500);
  renderPage();
  await screen.findByTestId("RecommendationRequestForm-id");
  fireEvent.click(field("submit"));
  await waitFor(() =>
    expect(mockToast).toHaveBeenCalledWith(
      "Error: Request failed with status code 500",
    ),
  );
  expect(field("submit")).toBeInTheDocument();
  expect(screen.queryByText("Request index")).not.toBeInTheDocument();
});

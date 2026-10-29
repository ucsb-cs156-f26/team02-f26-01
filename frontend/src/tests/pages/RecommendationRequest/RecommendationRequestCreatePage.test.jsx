import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, useLocation } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => ({
  ...(await importOriginal()),
  toast: vi.fn((message) => mockToast(message)),
}));

function Location() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

describe("RecommendationRequestCreatePage", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const endpoint = "/api/RecommendationRequest/post";
  const request = recommendationRequestFixtures.oneRecommendationRequest;
  const params = {
    requesterEmail: request.requesterEmail,
    professorEmail: request.professorEmail,
    explanation: request.explanation,
    dateRequested: "2026-10-27T14:00",
    dateNeeded: "2026-11-10T14:00",
    done: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  afterAll(() => axiosMock.restore());

  function setup(props = {}) {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/recommendationrequest/create"]}>
          <Location />
          <Routes>
            <Route
              path="/recommendationrequest/create"
              element={<RecommendationRequestCreatePage {...props} />}
            />
            <Route
              path="/recommendationrequest"
              element={<div>Recommendation requests</div>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    return invalidate;
  }

  function fillForm() {
    for (const [field, value] of Object.entries(params)) {
      if (field !== "done") {
        fireEvent.change(
          screen.getByTestId(`RecommendationRequestForm-${field}`),
          { target: { value } },
        );
      }
    }
  }

  function submit() {
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
  }

  function expectCreatePage() {
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/recommendationrequest/create",
    );
    expect(
      screen.getByRole("heading", { name: "Create New RecommendationRequest" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Create New RecommendationRequest" })
        .parentElement,
    ).toHaveClass("pt-2");
  }

  test("renders the create form at the create route", () => {
    setup();
    expectCreatePage();
    expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Professor Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Explanation")).toBeInTheDocument();
    expect(screen.getByLabelText("Date Requested")).toHaveAttribute(
      "type",
      "datetime-local",
    );
    expect(screen.getByLabelText("Date Needed")).toHaveAttribute(
      "type",
      "datetime-local",
    );
    expect(screen.getByLabelText("Done")).not.toBeChecked();
    expect(axiosMock.history.post).toHaveLength(0);
  });

  test.each([false, true])(
    "creates a request with done=%s and navigates after success",
    async (done) => {
      let respond;
      axiosMock.onPost(endpoint).reply(
        () =>
          new Promise((resolve) => {
            respond = resolve;
          }),
      );
      const invalidate = setup();
      fillForm();
      if (done) fireEvent.click(screen.getByLabelText("Done"));
      submit();
      await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
      expect(axiosMock.history.post[0].params).toEqual({ ...params, done });
      expect(axiosMock.history.post[0].data).toBeUndefined();
      expectCreatePage();
      expect(mockToast).not.toHaveBeenCalled();
      respond([200, { ...request, id: 42, done }]);
      await screen.findByText("Recommendation requests");
      expect(screen.getByTestId("location").textContent).toBe(
        "/recommendationrequest",
      );
      expect(mockToast).toHaveBeenCalledExactlyOnceWith(
        "New RecommendationRequest Created - id: 42",
      );
      expect(invalidate).toHaveBeenCalledExactlyOnceWith({
        queryKey: ["/api/RecommendationRequest/all"],
      });
    },
  );

  test("empty submission shows all required errors without posting or navigating", async () => {
    setup();
    submit();
    for (const label of [
      "Requester Email",
      "Professor Email",
      "Explanation",
      "Date Requested",
      "Date Needed",
    ]) {
      expect(
        await screen.findByText(`${label} is required.`),
      ).toBeInTheDocument();
    }
    expect(axiosMock.history.post).toHaveLength(0);
    expect(mockToast).not.toHaveBeenCalled();
    expectCreatePage();
  });

  test("invalid emails prevent submission and keep the create page", async () => {
    setup();
    fillForm();
    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "invalid" },
    });
    fireEvent.change(screen.getByLabelText("Professor Email"), {
      target: { value: "invalid" },
    });
    submit();
    expect(
      await screen.findAllByText("Enter a valid email address."),
    ).toHaveLength(2);
    expect(axiosMock.history.post).toHaveLength(0);
    expectCreatePage();
  });

  test("server errors use the shared error toast and retain the form for retry", async () => {
    axiosMock.onPost(endpoint).replyOnce(500);
    setup();
    fillForm();
    submit();
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledExactlyOnceWith(
        "Error: Request failed with status code 500",
      ),
    );
    expectCreatePage();
    expect(screen.getByLabelText("Requester Email")).toHaveValue(
      params.requesterEmail,
    );
    expect(axiosMock.history.post).toHaveLength(1);
    axiosMock.onPost(endpoint).reply(200, request);
    submit();
    await screen.findByText("Recommendation requests");
    expect(axiosMock.history.post).toHaveLength(2);
  });

  test("storybook submissions show success and keep the form visible", async () => {
    axiosMock.onPost(endpoint).reply(200, request);
    setup({ storybook: true });
    fillForm();
    submit();
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledExactlyOnceWith(
        "New RecommendationRequest Created - id: 1",
      ),
    );
    expectCreatePage();
  });
});

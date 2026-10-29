import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticleEditPage from "main/pages/Articles/ArticleEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("ArticleEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/article", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticleEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(screen.queryByTestId("Article-name")).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/article", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "City Never Sleeps",
        url: "https://www.playdeadlock.com/cityneversleeps",
        explanation:
          "The Cursed Apple is ever changing, and these streets are nothing like you remember.",
        email: "gaben@valvesoftware.com",
        dateAdded: "2026-09-29T14:00",
      });
      axiosMock.onPut("/api/article").reply(200, {
        id: 17,
        title: "City Never Sleeps - edited",
        url: "https://www.playdeadlock-edited.com/cityneversleeps",
        explanation:
          "The Cursed Apple is ever changing, and these streets are nothing like you remember. - edited",
        email: "gaben-edited@valvesoftware.com",
        dateAdded: "2026-09-29T14:11",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticleEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticleForm-id");
      const idField = screen.getByTestId("ArticleForm-id");
      const titleField = screen.getByTestId("ArticleForm-title");
      const urlField = screen.getByTestId("ArticleForm-url");
      const explanationField = screen.getByTestId("ArticleForm-explanation");
      const emailField = screen.getByTestId("ArticleForm-email");
      const dateAddedField = screen.getByTestId("ArticleForm-dateAdded");
      const submitButton = screen.getByTestId("ArticleForm-submit");

      expect(idField).toHaveValue("17");
      expect(titleField).toHaveValue("City Never Sleeps");
      expect(urlField).toHaveValue(
        "https://www.playdeadlock.com/cityneversleeps",
      );
      expect(explanationField).toHaveValue(
        "The Cursed Apple is ever changing, and these streets are nothing like you remember.",
      );
      expect(emailField).toHaveValue("gaben@valvesoftware.com");
      expect(dateAddedField).toHaveValue("2026-09-29T14:00");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: { value: "City Never Sleeps - edited" },
      });
      fireEvent.change(urlField, {
        target: {
          value: "https://www.playdeadlock-edited.com/cityneversleeps",
        },
      });
      fireEvent.change(explanationField, {
        target: {
          value:
            "The Cursed Apple is ever changing, and these streets are nothing like you remember. - edited",
        },
      });
      fireEvent.change(emailField, {
        target: { value: "gaben-edited@valvesoftware.com" },
      });
      fireEvent.change(dateAddedField, {
        target: { value: "2026-09-29T14:11" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: City Never Sleeps - edited",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "City Never Sleeps - edited",
          url: "https://www.playdeadlock-edited.com/cityneversleeps",
          explanation:
            "The Cursed Apple is ever changing, and these streets are nothing like you remember. - edited",
          email: "gaben-edited@valvesoftware.com",
          dateAdded: "2026-09-29T14:11",
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticleEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticleForm-id");
      const idField = screen.getByTestId("ArticleForm-id");
      const titleField = screen.getByTestId("ArticleForm-title");
      const urlField = screen.getByTestId("ArticleForm-url");
      const explanationField = screen.getByTestId("ArticleForm-explanation");
      const emailField = screen.getByTestId("ArticleForm-email");
      const dateAddedField = screen.getByTestId("ArticleForm-dateAdded");
      const submitButton = screen.getByTestId("ArticleForm-submit");

      expect(idField).toHaveValue("17");
      expect(titleField).toHaveValue("City Never Sleeps");
      expect(urlField).toHaveValue(
        "https://www.playdeadlock.com/cityneversleeps",
      );
      expect(explanationField).toHaveValue(
        "The Cursed Apple is ever changing, and these streets are nothing like you remember.",
      );
      expect(emailField).toHaveValue("gaben@valvesoftware.com");
      expect(dateAddedField).toHaveValue("2026-09-29T14:00");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(titleField, {
        target: { value: "City Never Sleeps - edited" },
      });
      fireEvent.change(urlField, {
        target: {
          value: "https://www.playdeadlock-edited.com/cityneversleeps",
        },
      });
      fireEvent.change(explanationField, {
        target: {
          value:
            "The Cursed Apple is ever changing, and these streets are nothing like you remember. - edited",
        },
      });
      fireEvent.change(emailField, {
        target: { value: "gaben-edited@valvesoftware.com" },
      });
      fireEvent.change(dateAddedField, {
        target: { value: "2026-09-29T14:11" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: City Never Sleeps - edited",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });
    });
  });
});

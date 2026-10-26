import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticleCreatePage from "main/pages/Articles/ArticleCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { expect } from "vitest";

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
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("ArticleCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticleCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticleForm-title")).toBeInTheDocument();
    });
  });

  //TODO DONE
  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 17,
      title: "City Never Sleeps",
      url: "https://www.playdeadlock.com/cityneversleeps",
      explanation:
        "The Cursed Apple is ever changing, and these streets are nothing like you remember.",
      email: "gaben@valvesoftware.com",
      dateAdded: "2026-09-29T14:00:00",
    };

    axiosMock.onPost("/api/article/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticleCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticleForm-title")).toBeInTheDocument();
    });

    await screen.findByTestId("ArticleForm-dateAdded");
    const titleField = screen.getByTestId("ArticleForm-title");
    const urlField = screen.getByTestId("ArticleForm-url");
    const explanationField = screen.getByTestId("ArticleForm-explanation");
    const emailField = screen.getByTestId("ArticleForm-email");
    const dateAddedField = screen.getByTestId("ArticleForm-dateAdded");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.change(titleField, { target: { value: "City Never Sleeps" } });
    fireEvent.change(urlField, {
      target: { value: "https://www.playdeadlock.com/cityneversleeps" },
    });
    fireEvent.change(explanationField, {
      target: {
        value:
          "The Cursed Apple is ever changing, and these streets are nothing like you remember.",
      },
    });
    fireEvent.change(emailField, {
      target: { value: "gaben@valvesoftware.com" },
    });
    fireEvent.change(dateAddedField, {
      target: { value: "2026-09-29T14:00:00" },
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "City Never Sleeps",
      url: "https://www.playdeadlock.com/cityneversleeps",
      explanation:
        "The Cursed Apple is ever changing, and these streets are nothing like you remember.",
      email: "gaben@valvesoftware.com",
      dateAdded: "2026-09-29T14:00", // trims seconds for some reason
    });

    expect(mockToast).toBeCalledWith(
      "New Article Created - id: 17 title: City Never Sleeps",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/article" });
  });
});

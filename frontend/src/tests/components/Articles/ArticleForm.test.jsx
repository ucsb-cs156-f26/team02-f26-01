import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticleForm from "main/components/Articles/ArticleForm";
import { articleFixtures } from "fixtures/articleFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticleForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByText(/Title/);
    await screen.findByText(/Url/);
    await screen.findByText(/Explanation/);
    await screen.findByText(/Email/);
    await screen.findByText(/Date Added/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Date Added/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a Article", async () => {
    render(
      <Router>
        <ArticleForm initialContents={articleFixtures.oneDate} />
      </Router>,
    );
    await screen.findByTestId(/ArticleForm-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/ArticleForm-id/)).toHaveValue("1");
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-dateAdded");
    const dateAddedField = screen.getByTestId("ArticleForm-dateAdded");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.change(dateAddedField, { target: { value: "bad-input" } });
    fireEvent.click(submitButton);

    await screen.findByText(
      /Date Added must be in the format YYYY-MM-DDTHH:MM:SS \(ex: 2000-01-01T00:00:00 for New Year's Day, 2000\)/,
    );
    expect(
      screen.getByText(
        /Date Added must be in the format YYYY-MM-DDTHH:MM:SS \(ex: 2000-01-01T00:00:00 for New Year's Day, 2000\)/,
      ),
    ).toBeInTheDocument();
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-submit");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Title is required./);
    expect(screen.getByText(/Url is required./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Added is required./)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <ArticleForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-quarterYYYYQ");

    const dateAddedField = screen.getByTestId("ArticleForm-dateAdded");
    const titleField = screen.getByTestId("ArticleForm-title");
    const urlField = screen.getByTestId("ArticleForm-url");
    const explanationField = screen.getByTestId("ArticleForm-explanation");
    const emailField = screen.getByTestId("ArticleForm-email");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.change(titleField, { target: { value: "" } });
    fireEvent.change(urlField, { target: { value: "" } });
    fireEvent.change(explanationField, { target: { value: "" } });
    fireEvent.change(emailField, { target: { value: "" } });
    fireEvent.change(dateAddedField, {
      target: { value: "1111-11-11T11:11:11" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/Title is required./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Url is required./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Explanation is required./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Email is required./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Email format was incorrect./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Date Added is required./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Date Added must be in the format YYYY-MM-DDTHH:MM:SS \(ex: 2000-01-01T00:00:00 for New Year's Day, 2000\)/)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-cancel");
    const cancelButton = screen.getByTestId("ArticleForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});

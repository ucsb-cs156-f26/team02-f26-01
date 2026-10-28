import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

const fields = {
  requesterEmail: "Requester Email",
  professorEmail: "Professor Email",
  explanation: "Explanation",
  dateRequested: "Date Requested",
  dateNeeded: "Date Needed",
};
const input = (field) =>
  screen.getByTestId(`RecommendationRequestForm-${field}`);
const renderForm = (props = {}) =>
  render(
    <Router>
      <RecommendationRequestForm {...props} />
    </Router>,
  );

function fillForm(record) {
  Object.keys(fields).forEach((field) =>
    fireEvent.change(input(field), { target: { value: record[field] } }),
  );
}

describe("RecommendationRequestForm", () => {
  test("renders an empty create form with accessible labels", () => {
    renderForm();
    expect(screen.queryByLabelText("Id")).not.toBeInTheDocument();
    Object.entries(fields).forEach(([field, label]) => {
      expect(screen.getByLabelText(label)).toBe(input(field));
      expect(input(field)).toHaveValue("");
      expect(input(field)).not.toHaveClass("is-invalid");
      expect(input(field).closest(".mb-3")).toBeInTheDocument();
      expect(input(field)).toHaveAttribute(
        "type",
        field.startsWith("date") ? "datetime-local" : "text",
      );
    });
    expect(screen.getByLabelText("Done")).toBe(input("done"));
    expect(input("done")).toHaveAttribute("type", "checkbox");
    expect(input("done")).not.toBeChecked();
    expect(input("done").closest(".mb-3")).toBeInTheDocument();
    expect(input("submit")).toHaveTextContent("Create");
    expect(input("submit")).toHaveAttribute("type", "submit");
    expect(input("cancel")).toHaveTextContent("Cancel");
    expect(input("cancel")).toHaveClass("btn-Secondary");
  });

  test.each(recommendationRequestFixtures.threeRecommendationRequests)(
    "populates and submits update $id",
    async (record) => {
      const submitAction = vi.fn();
      renderForm({
        initialContents: record,
        submitAction,
        buttonLabel: "Update",
      });
      expect(screen.getByLabelText("Id")).toBe(input("id"));
      expect(input("id")).toHaveValue(String(record.id));
      expect(input("id")).toBeDisabled();
      expect(input("id")).toHaveAttribute("type", "text");
      expect(input("id").closest(".mb-3")).toBeInTheDocument();
      Object.keys(fields).forEach((field) => {
        expect(input(field)).toHaveValue(
          field.startsWith("date") ? record[field].slice(0, 16) : record[field],
        );
      });
      expect(input("done").checked).toBe(record.done);
      expect(input("submit")).toHaveTextContent("Update");
      fireEvent.change(input("explanation"), {
        target: { value: "Updated explanation" },
      });
      fireEvent.click(input("done"));
      fireEvent.click(input("submit"));
      await waitFor(() => expect(submitAction).toHaveBeenCalled());
      expect(submitAction.mock.calls[0][0]).toEqual({
        ...record,
        explanation: "Updated explanation",
        done: !record.done,
      });
    },
  );

  test("requires every text and date field and accepts a completed request with done false", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });
    fireEvent.click(input("submit"));
    for (const [field, label] of Object.entries(fields)) {
      expect(await screen.findByText(`${label} is required.`)).toHaveClass(
        "invalid-feedback",
      );
      expect(input(field)).toHaveClass("is-invalid");
    }
    expect(submitAction).not.toHaveBeenCalled();
    const { id: _id, ...record } =
      recommendationRequestFixtures.oneRecommendationRequest;
    fillForm(record);
    fireEvent.click(input("submit"));
    await waitFor(() => expect(submitAction).toHaveBeenCalled());
    expect(submitAction.mock.calls[0][0]).toEqual({
      ...record,
      dateRequested: record.dateRequested.slice(0, 16),
      dateNeeded: record.dateNeeded.slice(0, 16),
    });
    Object.keys(fields).forEach((field) =>
      expect(input(field)).not.toHaveClass("is-invalid"),
    );
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
  });

  test.each([
    "missing-at.example.com",
    "missing-domain@",
    "missing.dot@example",
    "two@@example.com",
    "space name@example.com",
    "@example.com",
    "a@.com",
    "a@example.",
    "a@space name.com",
    "a@example.c om",
    "a@b@c.com",
    "a@b.c@d",
    " name@example.com",
    "name@example.com ",
  ])("rejects invalid emails: %s", async (email) => {
    const submitAction = vi.fn();
    renderForm({ submitAction });
    fillForm({
      ...recommendationRequestFixtures.oneRecommendationRequest,
      requesterEmail: email,
      professorEmail: email,
    });
    fireEvent.click(input("submit"));
    expect(
      await screen.findAllByText("Enter a valid email address."),
    ).toHaveLength(2);
    expect(input("requesterEmail")).toHaveClass("is-invalid");
    expect(input("professorEmail")).toHaveClass("is-invalid");
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("invalid date input cannot be submitted", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });
    fillForm({
      ...recommendationRequestFixtures.oneRecommendationRequest,
      dateRequested: "bad-date",
      dateNeeded: "bad-date",
    });
    fireEvent.click(input("submit"));
    expect(
      await screen.findByText("Date Requested is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Date Needed is required.")).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("cancel navigates back without submitting", () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });
    fireEvent.click(input("cancel"));
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
    expect(submitAction).not.toHaveBeenCalled();
  });
});

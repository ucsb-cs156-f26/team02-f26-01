import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestForm from "main/components/HelpRequests/HelpRequestForm";
import { helpRequestsFixtures } from "fixtures/helpRequestsFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect, vi } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    await screen.findByText(/Email/);
    await screen.findByText(/Create/);
    expect(screen.getByTestId("HelpRequestForm-requesterEmail")).toHaveValue(
      "",
    );
  });

  test("renders correctly when passing in a HelpRequest", async () => {
    render(
      <Router>
        <HelpRequestForm
          initialContents={helpRequestsFixtures.oneHelpRequest}
        />
      </Router>,
    );
    await screen.findByTestId(/HelpRequestForm-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/HelpRequestForm-id/)).toHaveValue("1");
  });

  test("Correct Error messages on missing input", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-requestTime");
    const requestTime = screen.getByTestId("HelpRequestForm-requestTime");
    await screen.findByTestId("HelpRequestForm-submit");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Email is required./);
    expect(screen.getByText(/Team ID is required./)).toBeInTheDocument();
    expect(
      screen.getByText(/Table or Breakout Room is required./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();

    fireEvent.change(requestTime, { target: { value: "bad-input" } });

    await screen.findByText(/Request Time must be in ISO format./);
    expect(
      screen.getByText(/Request Time must be in ISO format./),
    ).toBeInTheDocument();
  });

  test("Submits form using default initialContents fallback", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <HelpRequestForm submitAction={mockSubmitAction} />
      </Router>,
    );

    await screen.findByTestId("HelpRequestForm-requesterEmail");

    fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), {
      target: { value: "s22-5pm-3" },
    });
    fireEvent.change(
      screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
      {
        target: { value: "7" },
      },
    );
    fireEvent.change(screen.getByTestId("HelpRequestForm-requestTime"), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
      target: { value: "Dokku issue" },
    });

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalledTimes(1));

    expect(
      screen.queryByText(/Request Time must be in ISO format./),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("HelpRequestForm-requestTime"), {
      target: { value: "2024-01-15T10:30:00.123" },
    });

    expect(
      screen.queryByText(/Request Time must be in ISO format./),
    ).not.toBeInTheDocument();

    // fireEvent.change(screen.getByTestId("HelpRequestForm-requestTime"), {
    //   target: { value: "2022-01-02T12:00:00.000" },
    // });

    // expect(screen.queryByText(/Request Time must be in ISO format./)).not.toBeInTheDocument();
  });

  // it("shows an error for an invalid datetime", () => {
  //   render(<HelpRequestForm />);
  //   fireEvent.change(screen.getByLabelText(/datetime/i), {
  //     target: { value: "not-a-date" },
  //   });
  //   expect(screen.getByText(/invalid/i)).toBeInTheDocument();

  //   it("accepts each supported ISO datetime format", () => {
  //     for (const ts of [
  //       "2024-01-15T10:30:00.123",
  //       "2024-01-15T10:30:00",
  //       "2024-01-15T10:30",
  //     ]) {
  //       const { container } = render(
  //         <HelpRequestForm initialContents={{ datetime: ts }} />,
  //       );
  //       expect(screen.getByLabelText(/datetime/i)).toHaveValue(ts); // or expect no error
  //     }
  //   });
  // });

  test("Submits form when passing initialContents", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <HelpRequestForm
          initialContents={helpRequestsFixtures.oneHelpRequest}
          submitAction={mockSubmitAction}
        />
      </Router>,
    );

    await screen.findByTestId("HelpRequestForm-submit");
    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalledTimes(1));

    expect(
      screen.queryByText(/Request Time must be in ISO format./),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-cancel");
    fireEvent.click(screen.getByTestId("HelpRequestForm-cancel"));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});

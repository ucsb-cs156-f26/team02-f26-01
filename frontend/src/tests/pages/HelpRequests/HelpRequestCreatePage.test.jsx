import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestsCreatePage from "main/pages/HelpRequests/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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

describe("HelpRequestsCreatePage tests", () => {
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
          <HelpRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("HelpRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const helpRequest = {
      id: 17,
      requesterEmail: "test@ucsb.edu",
      teamId: "01",
      tableOrBreakoutRoom: "table",
      requestTime: "2022-02-02T00:00",
      explanation: "None",
      solved: true,
    };

    axiosMock.onPost("/api/helprequests/post").reply(202, helpRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("HelpRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    const requesterEmail = screen.getByTestId("HelpRequestForm-requesterEmail");
    const teamId = screen.getByTestId("HelpRequestForm-teamId");
    const tableOrBreakoutRoom = screen.getByTestId(
      "HelpRequestForm-tableOrBreakoutRoom",
    );
    const requestTime = screen.getByTestId("HelpRequestForm-requestTime");
    const explanation = screen.getByTestId("HelpRequestForm-explanation");
    const solved = screen.getByTestId("HelpRequestForm-solved");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.change(requesterEmail, { target: { value: "test2@ucsb.edu" } });
    fireEvent.change(teamId, { target: { value: "02" } });
    fireEvent.change(tableOrBreakoutRoom, {
      target: { value: "breakout room" },
    });
    fireEvent.change(requestTime, { target: { value: "2022-02-02T00:00" } });
    fireEvent.change(explanation, { target: { value: "Some explanation" } });
    fireEvent.change(solved, { target: { value: false } });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      solved: false,
      explanation: "Some explanation",
      requestTime: "2022-02-02T00:00",
      tableOrBreakoutRoom: "breakout room",
      teamId: "02",
      requesterEmail: "test2@ucsb.edu",
    });

    expect(mockToast).toBeCalledWith("New Help Request Created - id: 17");
    expect(mockNavigate).toBeCalledWith({ to: "/helprequests" });
  });
});

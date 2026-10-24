import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBOrganizationForm, {
  getDefaultValues,
} from "main/components/UCSBOrganizations/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Organization Code",
    "Organization Name",
    "Short Organization Name",
    "Inactive",
  ];
  const testId = "UCSBOrganizationForm";

  test("that getDefaultValues works with initialContents", () => {
    const organization = ucsbOrganizationFixtures.oneOrganization;
    expect(getDefaultValues(organization)).toEqual(organization);
  });

  test("that getDefaultValues works without initialContents", () => {
    expect(getDefaultValues(undefined)).toEqual({
      inactive: false,
    });
  });

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm
            initialContents={ucsbOrganizationFixtures.oneOrganization}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-orgCode`)).toBeInTheDocument();
    expect(screen.getByText(`Organization Code`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Organization Code is required/);
    expect(
      screen.getByText(/^Organization Name is required/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Short Organization Name is required/),
    ).toBeInTheDocument();

    const orgTranslationInput = screen.getByTestId(`${testId}-orgTranslation`);
    fireEvent.change(orgTranslationInput, {
      target: { value: "a".repeat(256) },
    });

    const orgTranslationShortInput = screen.getByTestId(
      `${testId}-orgTranslationShort`,
    );
    fireEvent.change(orgTranslationShortInput, {
      target: { value: "a".repeat(256) },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Max length 255 characters/)).toHaveLength(2);
    });
  });
});

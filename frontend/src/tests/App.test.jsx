import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import App from "../App";
import { useCurrentUser } from "main/utils/useCurrentUser";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

vi.mock("main/utils/useCurrentUser", async (importOriginal) => ({
  ...(await importOriginal()),
  useCurrentUser: vi.fn(),
}));
vi.mock("main/pages/HomePage", () => ({ default: () => <div>HomePage</div> }));
vi.mock("main/pages/ProfilePage", () => ({
  default: () => <div>ProfilePage</div>,
}));
vi.mock("main/pages/AdminUsersPage", () => ({
  default: () => <div>AdminUsersPage</div>,
}));
vi.mock("main/pages/UCSBDates/UCSBDatesIndexPage", () => ({
  default: () => <div>UCSBDatesIndexPage</div>,
}));
vi.mock("main/pages/UCSBDates/UCSBDatesCreatePage", () => ({
  default: () => <div>UCSBDatesCreatePage</div>,
}));
vi.mock("main/pages/UCSBDates/UCSBDatesEditPage", () => ({
  default: () => <div>UCSBDatesEditPage</div>,
}));
vi.mock("main/pages/Restaurants/RestaurantIndexPage", () => ({
  default: () => <div>RestaurantIndexPage</div>,
}));
vi.mock("main/pages/Restaurants/RestaurantCreatePage", () => ({
  default: () => <div>RestaurantCreatePage</div>,
}));
vi.mock("main/pages/Restaurants/RestaurantEditPage", () => ({
  default: () => <div>RestaurantEditPage</div>,
}));
vi.mock("main/pages/UCSBOrganizations/UCSBOrganizationsIndexPage", () => ({
  default: () => <div>UCSBOrganizationsIndexPage</div>,
}));
vi.mock("main/pages/UCSBOrganizations/UCSBOrganizationsCreatePage", () => ({
  default: () => <div>UCSBOrganizationsCreatePage</div>,
}));
vi.mock("main/pages/UCSBOrganizations/UCSBOrganizationsEditPage", () => ({
  default: () => <div>UCSBOrganizationsEditPage</div>,
}));
vi.mock("main/pages/Placeholder/PlaceholderIndexPage", () => ({
  default: () => <div>PlaceholderIndexPage</div>,
}));
vi.mock("main/pages/Placeholder/PlaceholderCreatePage", () => ({
  default: () => <div>PlaceholderCreatePage</div>,
}));
vi.mock("main/pages/Placeholder/PlaceholderEditPage", () => ({
  default: () => <div>PlaceholderEditPage</div>,
}));
vi.mock(
  "main/pages/RecommendationRequest/RecommendationRequestIndexPage",
  () => ({ default: () => <div>RecommendationRequestIndexPage</div> }),
);
vi.mock(
  "main/pages/RecommendationRequest/RecommendationRequestCreatePage",
  () => ({ default: () => <div>RecommendationRequestCreatePage</div> }),
);
vi.mock(
  "main/pages/RecommendationRequest/RecommendationRequestEditPage",
  () => ({ default: () => <div>RecommendationRequestEditPage</div> }),
);
vi.mock("main/pages/Articles/ArticleIndexPage", () => ({
  default: () => <div>ArticleIndexPage</div>,
}));
vi.mock("main/pages/Articles/ArticleCreatePage", () => ({
  default: () => <div>ArticleCreatePage</div>,
}));
vi.mock("main/pages/Articles/ArticleEditPage", () => ({
  default: () => <div>ArticleEditPage</div>,
}));

describe("App routes", () => {
  const routes = [
    ["/", "HomePage"],
    ["/profile", "ProfilePage"],
    ["/admin/users", "AdminUsersPage"],
    ["/ucsbdates", "UCSBDatesIndexPage"],
    ["/ucsbdates/edit/1", "UCSBDatesEditPage"],
    ["/ucsbdates/create", "UCSBDatesCreatePage"],
    ["/ucsborganizations", "UCSBOrganizationsIndexPage"],
    ["/ucsborganizations/edit/org", "UCSBOrganizationsEditPage"],
    ["/ucsborganizations/create", "UCSBOrganizationsCreatePage"],
    ["/restaurants", "RestaurantIndexPage"],
    ["/restaurants/edit/1", "RestaurantEditPage"],
    ["/restaurants/create", "RestaurantCreatePage"],
    ["/placeholder", "PlaceholderIndexPage"],
    ["/placeholder/edit/1", "PlaceholderEditPage"],
    ["/placeholder/create", "PlaceholderCreatePage"],
    ["/recommendationrequest", "RecommendationRequestIndexPage"],
    ["/recommendationrequest/edit/1", "RecommendationRequestEditPage"],
    ["/recommendationrequest/create", "RecommendationRequestCreatePage"],
    ["/articles", "ArticleIndexPage"],
    ["/articles/edit/1", "ArticleEditPage"],
    ["/articles/create", "ArticleCreatePage"],
  ];

  test.each(routes)("admin can visit %s", (path, page) => {
    useCurrentUser.mockReturnValue(currentUserFixtures.adminUser);
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(page)).toBeInTheDocument();
  });

  test.each(["userOnly", "notLoggedIn"])(
    "%s has the expected route access",
    (user) => {
      useCurrentUser.mockReturnValue(currentUserFixtures[user]);
      const { unmount } = render(
        <MemoryRouter>
          <App />
        </MemoryRouter>,
      );
      expect(screen.getByText("HomePage")).toBeInTheDocument();
      unmount();
    },
  );

  test.each([
    [
      "userOnly",
      "/recommendationrequest",
      "RecommendationRequestIndexPage",
      true,
    ],
    [
      "userOnly",
      "/recommendationrequest/create",
      "RecommendationRequestCreatePage",
      false,
    ],
    [
      "userOnly",
      "/recommendationrequest/edit/1",
      "RecommendationRequestEditPage",
      false,
    ],
    [
      "notLoggedIn",
      "/recommendationrequest",
      "RecommendationRequestIndexPage",
      false,
    ],
    [
      "notLoggedIn",
      "/recommendationrequest/create",
      "RecommendationRequestCreatePage",
      false,
    ],
    [
      "notLoggedIn",
      "/recommendationrequest/edit/1",
      "RecommendationRequestEditPage",
      false,
    ],
  ])("%s access to %s is %s (%s)", (user, path, page, allowed) => {
    useCurrentUser.mockReturnValue(currentUserFixtures[user]);
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.queryByText(page) !== null).toBe(allowed);
  });
});

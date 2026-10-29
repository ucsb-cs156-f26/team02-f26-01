import React from "react";
import { Route, Routes } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { http, HttpResponse } from "msw";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

export default {
  title: "pages/RecommendationRequest/RecommendationRequestEditPage",
  component: RecommendationRequestEditPage,
};

const Template = () => (
  <Routes location="/recommendationrequest/edit/1">
    <Route
      path="/recommendationrequest/edit/:id"
      element={<RecommendationRequestEditPage storybook={true} />}
    />
  </Routes>
);

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.adminUser),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither),
    ),
    http.get("/api/RecommendationRequest", () =>
      HttpResponse.json(recommendationRequestFixtures.oneRecommendationRequest),
    ),
    http.put("/api/RecommendationRequest", async ({ request }) => {
      const id = Number(new URL(request.url).searchParams.get("id"));
      return HttpResponse.json({ ...(await request.json()), id });
    }),
  ],
};

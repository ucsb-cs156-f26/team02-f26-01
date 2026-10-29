import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import UCSBDiningCommonsMenuItemsEditPage from "main/pages/UCSBDiningCommonsMenuItems/UCSBDiningCommonsMenuItemsEditPage";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

export default {
  title: "pages/UCSBDiningCommonsMenuItems/UCSBDiningCommonsMenuItemsEditPage",
  component: UCSBDiningCommonsMenuItemsEditPage,
};

const Template = () => <UCSBDiningCommonsMenuItemsEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/UCSBDiningCommonsMenuItem", () => {
      return HttpResponse.json(
        ucsbDiningCommonsMenuItemFixtures.threeMenuItems[0],
        {
          status: 200,
        },
      );
    }),
    http.put("/api/UCSBDiningCommonsMenuItem", () => {
      // window.alert("PUT: " + req.url + " and body: " + req.body);
      return HttpResponse.json(
        {
          id: 17,
          diningCommonsCode: "DLG",
          name: "DietCoke",
          station: "Drink",
        },
        { status: 200 },
      );
    }),
  ],
};

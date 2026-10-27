import React from "react";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

export default {
  title: "components/RecommendationRequest/RecommendationRequestTable",
  component: RecommendationRequestTable,
};

const Template = (args) => <RecommendationRequestTable {...args} />;

export const Empty = Template.bind({});
Empty.args = { recommendationRequests: [] };

export const OneItem = Template.bind({});
OneItem.args = {
  recommendationRequests: [
    recommendationRequestFixtures.oneRecommendationRequest,
  ],
};

export const ThreeItems = Template.bind({});
ThreeItems.args = {
  recommendationRequests:
    recommendationRequestFixtures.threeRecommendationRequests,
};

const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 1,
    requesterEmail: "student1@example.com",
    professorEmail: "professor1@example.com",
    explanation: "Graduate school application",
    dateRequested: "2026-10-27T14:00:00",
    dateNeeded: "2026-11-10T14:00:00",
    done: false,
  },
  threeRecommendationRequests: [
    {
      id: 1,
      requesterEmail: "student1@example.com",
      professorEmail: "professor1@example.com",
      explanation: "Graduate school application",
      dateRequested: "2026-10-27T14:00:00",
      dateNeeded: "2026-11-10T14:00:00",
      done: false,
    },
    {
      id: 2,
      requesterEmail: "student2@example.com",
      professorEmail: "professor2@example.com",
      explanation: "Internship application",
      dateRequested: "2026-10-28T10:00:00",
      dateNeeded: "2026-11-15T10:00:00",
      done: true,
    },
    {
      id: 3,
      requesterEmail: "student3@example.com",
      professorEmail: "professor3@example.com",
      explanation: "Scholarship application",
      dateRequested: "2026-10-29T09:00:00",
      dateNeeded: "2026-11-20T09:00:00",
      done: false,
    },
  ],
};

export { recommendationRequestFixtures };

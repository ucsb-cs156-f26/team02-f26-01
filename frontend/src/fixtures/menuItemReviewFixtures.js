const menuItemReviewFixtures = {
  oneMenuItemReview: {
    id: 1,
    itemId: 1,
    reviewerEmail: "nathanshih@ucsb.edu",
    stars: 5,
    dateReviewed: "2026-10-22T17:50:00",
    comments: "So yummy",
  },

  threeMenuItemReviews: [
    {
      id: 1,
      itemId: 1,
      reviewerEmail: "nathanshih@ucsb.edu",
      stars: 5,
      dateReviewed: "2026-10-22T17:50:00",
      comments: "So yummy",
    },
    {
      id: 2,
      itemId: 2,
      reviewerEmail: "student1@ucsb.edu",
      stars: 4,
      dateReviewed: "2026-10-21T12:30:00",
      comments: "Good food and service",
    },
    {
      id: 3,
      itemId: 3,
      reviewerEmail: "student2@ucsb.edu",
      stars: 3,
      dateReviewed: "2026-10-20T14:15:00",
      comments: "Food was okay",
    },
  ],
};

export { menuItemReviewFixtures };

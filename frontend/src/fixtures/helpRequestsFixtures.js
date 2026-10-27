const helpRequestsFixtures = {
  oneHelpRequest: [
    {
      id: 1,
      requesterEmail: "test@ucsb.edu",
      teamId: "01",
      tableOrBreakoutRoom: "table",
      requestTime: "2026-10-22T12:00:00",
      explanation: "None",
      solved: false,
    },
  ],
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "testa@ucsb.edu",
      teamId: "01",
      tableOrBreakoutRoom: "table",
      requestTime: "2026-10-22T12:00:00",
      explanation: "First problem",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "testb@ucsb.edu",
      teamId: "02",
      tableOrBreakoutRoom: "breakout",
      requestTime: "2026-10-22T14:00:00",
      explanation: "Second problem",
      solved: false,
    },
    {
      id: 3,
      requesterEmail: "testc@ucsb.edu",
      teamId: "03",
      tableOrBreakoutRoom: "table",
      requestTime: "2026-11-22T12:00:00",
      explanation: "First problem",
      solved: true,
    },
  ],
};

export { helpRequestsFixtures };

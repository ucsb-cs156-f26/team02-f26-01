import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function RecommendationRequestTable({
  recommendationRequests,
  currentUser,
}) {
  const navigate = useNavigate();
  const editCallback = (cell) => {
    navigate(`/recommendationrequest/edit/${cell.row.original.id}`);
  };
  const deleteMutation = useBackendMutation(
    (cell) => ({
      method: "DELETE",
      url: "/api/RecommendationRequest",
      params: { id: cell.row.original.id },
    }),
    {},
    ["/api/RecommendationRequest/all"],
  );
  const deleteCallback = (cell) => {
    deleteMutation.mutate(cell);
  };
  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Requester Email", accessorKey: "requesterEmail" },
    { header: "Professor Email", accessorKey: "professorEmail" },
    { header: "Explanation", accessorKey: "explanation" },
    { header: "Date Requested", accessorKey: "dateRequested" },
    { header: "Date Needed", accessorKey: "dateNeeded" },
    {
      header: "Done",
      accessorKey: "done",
      cell: ({ getValue }) => String(getValue()),
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn(
        "Edit",
        "primary",
        editCallback,
        "RecommendationRequestTable",
      ),
    );
    columns.push(
      ButtonColumn(
        "Delete",
        "danger",
        deleteCallback,
        "RecommendationRequestTable",
      ),
    );
  }

  return (
    <OurTable
      data={recommendationRequests}
      columns={columns}
      testid="RecommendationRequestTable"
    />
  );
}

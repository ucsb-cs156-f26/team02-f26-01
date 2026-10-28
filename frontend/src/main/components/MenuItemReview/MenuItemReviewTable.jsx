import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";
import { toast } from "react-toastify";

export default function MenuItemReviewTable({
  menuItemReviews,
  currentUser,
  testIdPrefix = "MenuItemReviewTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/menuitemreview/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching
  const deleteMutation = useBackendMutation(
    (cell) => ({
      url: "/api/MenuItemReview",
      method: "DELETE",
      params: {
        id: cell.row.original.id,
      },
    }),
    {
      onSuccess: (message) => toast(message.message),
    },
    ["/api/MenuItemReview/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : hard to test mutation callback
  const deleteCallback = (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Item ID",
      accessorKey: "itemId",
    },
    {
      header: "Reviewer Email",
      accessorKey: "reviewerEmail",
    },
    {
      header: "Stars",
      accessorKey: "stars",
    },
    {
      header: "Date Reviewed",
      accessorKey: "dateReviewed",
    },
    {
      header: "Comments",
      accessorKey: "comments",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
    );
  }

  return (
    <OurTable data={menuItemReviews} columns={columns} testid={testIdPrefix} />
  );
}

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, Navigate } from "react-router";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function MenuItemReviewEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: menuItemReview,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching
    [`/api/MenuItemReview?id=${id}`],
    {
      // Stryker disable next-line StringLiteral: Empty method defaults to GET in Axios
      method: "GET",
      url: "/api/MenuItemReview",
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (menuItemReview) => ({
    url: "/api/MenuItemReview",
    method: "PUT",
    params: {
      id: menuItemReview.id,
    },
    data: {
      itemId: menuItemReview.itemId,
      reviewerEmail: menuItemReview.reviewerEmail,
      stars: menuItemReview.stars,
      dateReviewed: menuItemReview.dateReviewed,
      comments: menuItemReview.comments,
    },
  });

  const onSuccess = (menuItemReview) => {
    toast(`MenuItemReview Updated - id: ${menuItemReview.id}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to test query caching
    ["/api/MenuItemReview/all"],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/menuitemreview" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit MenuItemReview</h1>
        {menuItemReview && (
          <MenuItemReviewForm
            initialContents={menuItemReview}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}

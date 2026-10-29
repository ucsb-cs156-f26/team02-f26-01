import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RecommendationRequestEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: request,
    _error,
    _status,
  } = useBackend([`/api/RecommendationRequest?id=${id}`], {
    method: "GET",
    url: `/api/RecommendationRequest`,
    params: {
      id,
    },
  });

  const objectToAxiosPutParams = (request) => ({
    url: "/api/RecommendationRequest",
    method: "PUT",
    params: {
      id: request.id,
    },
    data: {
      requesterEmail: request.requesterEmail,
      professorEmail: request.professorEmail,
      explanation: request.explanation,
      dateRequested: request.dateRequested,
      dateNeeded: request.dateNeeded,
      done: request.done,
    },
  });

  const onSuccess = (request) => {
    toast(`RecommendationRequest Updated - id: ${request.id}`);
  };

  const mutation = useBackendMutation(objectToAxiosPutParams, { onSuccess }, [
    `/api/RecommendationRequest?id=${id}`,
  ]);

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/recommendationrequest" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit RecommendationRequest</h1>
        {request && (
          <RecommendationRequestForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={request}
          />
        )}
      </div>
    </BasicLayout>
  );
}

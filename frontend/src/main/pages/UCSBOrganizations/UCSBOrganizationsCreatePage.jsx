import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBOrganizationForm from "main/components/UCSBOrganizations/UCSBOrganizationForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationsCreatePage({ storybook = false }) {
  const objectToAxiosParams = (organization) => ({
    url: "/api/ucsborganizations/post",
    method: "POST",
    params: {
      orgCode: organization.orgCode,
      orgTranslationShort: organization.orgTranslationShort,
      orgTranslation: organization.orgTranslation,
      inactive: organization.inactive,
    },
  });

  const onSuccess = (organization) => {
    toast(
      `New organization Created - orgCode: ${organization.orgCode} orgTranslationShort: ${organization.orgTranslation}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/ucsborganizations/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/ucsborganizations" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New Organization</h1>
        <UCSBOrganizationForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}


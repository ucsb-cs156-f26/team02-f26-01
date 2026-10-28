import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItems/UCSBDiningCommonsMenuItemForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBDiningCommonsMenuItemCreatePage({
  storybook = false,
}) {
  const objectToAxiosParams = (ucsbDiningCommonsMenuItem) => ({
    url: "/api/UCSBDiningCommonsMenuItem/post",
    method: "POST",
    params: {
      diningCommonsCode: ucsbDiningCommonsMenuItem.diningCommonsCode,
      name: ucsbDiningCommonsMenuItem.name,
      station: ucsbDiningCommonsMenuItem.station,
    },
  });

  const onSuccess = (ucsbDiningCommonsMenuItem) => {
    toast(
      `New UCSBDiningCommonsMenuItem Created - id: ${ucsbDiningCommonsMenuItem.id} diningCommonsCode: ${ucsbDiningCommonsMenuItem.diningCommonsCode}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/UCSBDiningCommonsMenuItem/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/UCSBDiningCommonsMenuItem" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New UCSBDiningCommonsMenuItem</h1>
        <UCSBDiningCommonsMenuItemForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import ArticleForm from "main/components/Articles/ArticleForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function ArticleEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: article,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/article?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/article`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (article) => ({
    url: "/api/article",
    method: "PUT",
    params: {
      id: article.id,
    },
    data: {
      title: article.title,
      url: article.url,
      explanation: article.explanation,
      email: article.email,
      dateAdded: article.dateAdded,
    },
  });

  const onSuccess = (article) => {
    toast(`Article Updated - id: ${article.id} title: ${article.title}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/article?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/articles" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Article</h1>
        {article && (
          <ArticleForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={article}
          />
        )}
      </div>
    </BasicLayout>
  );
}

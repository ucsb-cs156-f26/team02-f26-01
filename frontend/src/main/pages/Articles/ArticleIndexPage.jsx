import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ArticleTable from "main/components/Articles/ArticleTable";
import { Button } from "react-bootstrap";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";

export default function ArticleIndexPage() {
  const currentUser = useCurrentUser();
  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/articles/create"
          style={{ float: "right" }}
        >
          Create Article
        </Button>
      );
    }
  };

  const {
    data: articles,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/article/all"],
    { method: "GET", url: "/api/article/all" },
    [],
  );

  // Stryker disable all : placeholder for future implementation
  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>Articles</h1>
        <ArticleTable articles={articles} currentUser={currentUser} />
      </div>
    </BasicLayout>
  );
}

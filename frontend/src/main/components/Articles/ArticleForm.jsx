import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function ArticleForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  // For explanation, see: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
  // Note that even this complex regex may still need some tweaks

  // Stryker disable Regex
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
  
  // adapted from: https://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url
  const url_regex = 
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
  
  // from: https://regexr.com/3e48o
  const email_regex = 
    /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  // Stryker restore Regex

  // Stryker disable next-line all

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid="ArticleForm-id"
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="title">Title</Form.Label>
            <Form.Control
              data-testid="ArticleForm-title"
              id="title"
              type="text"
              isInvalid={Boolean(errors.title)}
              {...register("title", {
                required: "Title is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="url">Url</Form.Label>
            <Form.Control
              data-testid="ArticleForm-url"
              id="url"
              type="text"
              isInvalid={Boolean(errors.url)}
              {...register("url", {
                required: "Url is required.",
                pattern: url_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.url?.message}
              {errors.url?.type === "pattern" &&
                "URL format was incorrect"}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="explanation">Explanation</Form.Label>
            <Form.Control
              data-testid="ArticleForm-explanation"
              id="explanation"
              type="text"
              isInvalid={Boolean(errors.explanation)}
              {...register("explanation", {
                required: "Explanation is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.explanation?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="email">Email (of article author OR poster)</Form.Label>
            <Form.Control
              data-testid="ArticleForm-email"
              id="email"
              type="text"
              isInvalid={Boolean(errors.email)}
              {...register("email", {
                required: "Explanation is required.",
                pattern: email_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
              {errors.email?.type === "pattern" &&
                "Email format was incorrect"}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dateAdded">Date Added (iso format)</Form.Label>
            <Form.Control
              data-testid="ArticleForm-dateAdded"
              id="dateAdded"
              type="datetime-local"
              isInvalid={Boolean(errors.dateAdded)}
              {...register("dateAdded", {
                required: true,
                pattern: isodate_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dateAdded && "Date Added is required. "}
              {errors.dateAdded?.type === "pattern" &&
                "Date Added must be in the format YYYY-MM-DDTHH:MM:SS (ex: 2000-01-01T00:00:00 for New Year's Day, 2000)"}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid="UCSBDateForm-submit">
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid="UCSBDateForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default ArticleForm;

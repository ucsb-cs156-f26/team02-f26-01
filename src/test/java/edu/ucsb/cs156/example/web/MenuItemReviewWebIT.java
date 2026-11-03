package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewWebIT extends WebTestCase {

  @Test
  public void adminCanCreateMenuItemReview() {
    setupUser(true);

    // Go to MenuItemReview page
    page.getByText("MenuItemReview").click();
    page.getByText("Create MenuItemReview").click();

    assertThat(page.getByText("Create New MenuItemReview")).isVisible();

    // Fill out the form
    page.getByTestId("MenuItemReviewForm-itemId").fill("1");
    page.getByTestId("MenuItemReviewForm-reviewerEmail").fill("jpa04@ucsb.edu");
    page.getByTestId("MenuItemReviewForm-stars").fill("5");
    page.getByTestId("MenuItemReviewForm-dateReviewed").fill("2026-10-20T18:00");
    page.getByTestId("MenuItemReviewForm-comments").fill("JPA04 test review");

    // Submit the form
    page.getByTestId("MenuItemReviewForm-submit").click();

    // Verify the new review appears in the table
    assertThat(page.getByTestId("MenuItemReviewTable").getByText("JPA04 test review")).isVisible();
    assertThat(page.getByTestId("MenuItemReviewTable").getByText("jpa04@ucsb.edu")).isVisible();
  }
}

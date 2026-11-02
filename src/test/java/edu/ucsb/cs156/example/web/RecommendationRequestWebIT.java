package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestWebIT extends WebTestCase {
  @Autowired RecommendationRequestRepository recommendationRequestRepository;

  @LocalServerPort private int port;

  @Test
  public void admin_user_can_delete_a_recommendation_request() throws Exception {
    // arrange
    RecommendationRequest request = new RecommendationRequest();
    request.setRequesterEmail("student@ucsb.edu");
    request.setProfessorEmail("professor@ucsb.edu");
    request.setExplanation("Graduate school recommendation");
    request.setDateRequested(LocalDateTime.parse("2026-11-01T12:00:00"));
    request.setDateNeeded(LocalDateTime.parse("2026-12-01T12:00:00"));
    request.setDone(false);
    recommendationRequestRepository.save(request);

    setupUser(true);
    page.navigate(String.format("http://localhost:%d/recommendationrequest", port));

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("student@ucsb.edu");

    // act
    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();

    // assert
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }
}

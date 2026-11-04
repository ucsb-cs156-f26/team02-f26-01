package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.UCSBOrganization;
import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationWebIT extends WebTestCase {

  @Autowired UCSBOrganizationRepository ucsbOrganizationRepository;

  @Test
  public void admin_user_can_create_edit_delete_UCSBorganization() throws Exception {

    UCSBOrganization ucsbOrganization1 =
        UCSBOrganization.builder()
            .orgCode("ZPR")
            .orgTranslationShort("ZETA PHI RHO")
            .orgTranslation("ZETA PHI RHO")
            .inactive(false)
            .build();

    ucsbOrganizationRepository.save(ucsbOrganization1);

    setupUser(true);

    page.getByText("UCSB Organizations").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslationShort"))
        .hasText("ZETA PHI RHO");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslationShort"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_UCSBorganization() throws Exception {
    setupUser(false);

    page.getByText("UCSB Organizations").click();

    assertThat(page.getByText("Create UCSBOrganization")).not().isVisible();
  }

  @Test
  public void admin_user_can_see_create_UCSBorganization_button() throws Exception {
    setupUser(true);

    page.getByText("UCSB Organizations").click();

    assertThat(page.getByText("Create UCSBOrganization")).isVisible();
  }
}

package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.Article;
import edu.ucsb.cs156.example.repositories.ArticleRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired ArticleRepository articleRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
    // arrange

    Article article =
        Article.builder()
            .title("Fairfax Industries Employee Spotlight")
            .url("https://store.steampowered.com/news/app/1422450/view/703281660030880788")
            .explanation("Deadman Danny takes to the skies")
            .email("yoshi@valvesoftware.com")
            .dateAdded(LocalDateTime.parse("2026-10-13T14:03:00"))
            .build();

    articleRepository.save(article);

    // act
    MvcResult response =
        mockMvc.perform(get("/api/article?id=1")).andExpect(status().isOk()).andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(article);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_article() throws Exception {
    // arrange

    // burn id 0
    Article.builder()
        .title("filler")
        .url("filler.filler.filler")
        .explanation("filler")
        .email("filler@filler.com")
        .dateAdded(LocalDateTime.parse("2026-10-13T14:03:00"))
        .build();

    Article article1 =
        Article.builder()
            .id(1)
            .title("City Never Sleeps")
            .url("https://www.playdeadlock.com/cityneversleeps")
            .explanation("The biggest update the game's map has ever seen! And more!")
            .email("gaben@valvesoftware.com")
            .dateAdded(LocalDateTime.parse("2026-09-29T14:00:00"))
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/article/post?title=City Never Sleeps&url=https://www.playdeadlock.com/cityneversleeps&explanation=The biggest update the game's map has ever seen! And more!&email=gaben@valvesoftware.com&dateAdded=2026-09-29T14:00:00")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(article1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }
}

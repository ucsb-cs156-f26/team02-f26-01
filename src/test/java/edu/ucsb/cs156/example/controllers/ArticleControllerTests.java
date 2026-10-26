package edu.ucsb.cs156.example.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.Article;
import edu.ucsb.cs156.example.repositories.ArticleRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = ArticleController.class)
@Import(TestConfig.class)
public class ArticleControllerTests extends ControllerTestCase {
  @MockitoBean ArticleRepository articleRepository;

  @MockitoBean UserRepository userRepository;

  // #region Create
  /*
   *
   *
   *
   * Filler space to keep the minimap legible
   *
   *
   */
  // #region POST
  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/article/post")
                .param("title", "City Never Sleeps")
                .param("url", "https://www.playdeadlock.com/cityneversleeps")
                .param("explanation", "The biggest update the game's map has ever seen! And more!")
                .param("email", "gaben@valvesoftware.com")
                .param("localDateTime", "2026-09-29T02:00:00")
                .with(csrf()))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/article/post")
                .param("title", "City Never Sleeps")
                .param("url", "https://www.playdeadlock.com/cityneversleeps")
                .param("explanation", "The biggest update the game's map has ever seen! And more!")
                .param("email", "gaben@valvesoftware.com")
                .param("localDateTime", "2026-09-29T02:00:00")
                .with(csrf()))
        .andExpect(status().is(403)); // only admins can post
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_article() throws Exception {
    // arrange

    String localTimeOfArticle = "2026-09-29T02:00:00";
    LocalDateTime ldt1 = LocalDateTime.parse(localTimeOfArticle);

    Article article1 =
        Article.builder()
            .title("City Never Sleeps")
            .url("https://www.playdeadlock.com/cityneversleeps")
            .explanation("The biggest update the game's map has ever seen! And more!")
            .email("gaben@valvesoftware.com")
            .dateAdded(ldt1)
            .build();

    when(articleRepository.save(eq(article1))).thenReturn(article1);

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/article/post")
                    .param("title", "City Never Sleeps")
                    .param("url", "https://www.playdeadlock.com/cityneversleeps")
                    .param(
                        "explanation", "The biggest update the game's map has ever seen! And more!")
                    .param("email", "gaben@valvesoftware.com")
                    .param("localDateTime", localTimeOfArticle)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(articleRepository, times(1)).save(article1);
    String expectedJson = mapper.writeValueAsString(article1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  // #endregion

  // #region Read
  /*
   *
   *
   *
   * Filler space to keep the minimap legible
   *
   *
   */
  // #region GET all
  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc
        .perform(get("/api/article/all"))
        .andExpect(status().is(403)); // logged out users can't get all
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    mockMvc.perform(get("/api/article/all")).andExpect(status().is(200)); // logged
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_can_get_all_articles() throws Exception {

    // arrange
    LocalDateTime ldt1 = LocalDateTime.parse("2026-09-29T02:00:00");

    Article article1 =
        Article.builder()
            .title("City Never Sleeps")
            .url("https://www.playdeadlock.com/cityneversleeps")
            .explanation("The biggest update the game's map has ever seen! And more!")
            .email("gaben@valvesoftware.com")
            .dateAdded(ldt1)
            .build();

    LocalDateTime ldt2 = LocalDateTime.parse("2026-10-13T02:03:00");

    Article article2 =
        Article.builder()
            .title("Deadman Danny latest hero added to Valve's deadlock")
            .url("https://store.steampowered.com/news/app/1422450/view/703281660030880788")
            .explanation("The latest and greatest hero from Valve")
            .email("yoshi@valvesoftware.com")
            .dateAdded(ldt2)
            .build();

    ArrayList<Article> expectedArticles = new ArrayList<>();
    expectedArticles.addAll(Arrays.asList(article1, article2));

    when(articleRepository.findAll()).thenReturn(expectedArticles);

    // act
    MvcResult response =
        mockMvc.perform(get("/api/article/all")).andExpect(status().isOk()).andReturn();

    // assert

    verify(articleRepository, times(1)).findAll();
    String expectedJson = mapper.writeValueAsString(expectedArticles);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  // #endregion

  // #region GET by id
  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc
        .perform(get("/api/article").param("id", "1"))
        .andExpect(status().is(403)); // logged out users can't get by id
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

    // arrange
    LocalDateTime ldt = LocalDateTime.parse("2026-09-29T02:00:00");

    Article article =
        Article.builder()
            .title("City Never Sleeps")
            .url("https://www.playdeadlock.com/cityneversleeps")
            .explanation("The biggest update the game's map has ever seen! And more!")
            .email("gaben@valvesoftware.com")
            .dateAdded(ldt)
            .build();

    final long TESTED_ID = 1;
    final String ID_STR = String.valueOf(TESTED_ID);
    when(articleRepository.findById(eq(TESTED_ID))).thenReturn(Optional.of(article));

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/article").param("id", ID_STR))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    assert (ID_STR.equals("" + TESTED_ID));
    verify(articleRepository, times(1)).findById(eq(TESTED_ID));
    String expectedJson = mapper.writeValueAsString(article);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

    // arrange
    final long TESTED_ID = 1337;
    final String ID_STR = String.valueOf(TESTED_ID);
    when(articleRepository.findById(eq(TESTED_ID))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/article").param("id", ID_STR))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    assert (ID_STR.equals("" + TESTED_ID));
    verify(articleRepository, times(1)).findById(eq(TESTED_ID));
    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("Article with id " + ID_STR + " not found", json.get("message"));
  }

  // #endregion

  // #region Update
  /*
   *
   *
   *
   * Filler space to keep the minimap legible
   *
   *
   */
  // #region PUT by id
  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_edit_an_existing_article() throws Exception {
    // arrange

    LocalDateTime ldt1 = LocalDateTime.parse("2026-09-29T02:00:00");

    Article articleOriginal =
        Article.builder()
            .title("City Never Sleeps")
            .url("https://www.playdeadlock.com/cityneversleeps")
            .explanation("The biggest update the game's map has ever seen! And more!")
            .email("gaben@valvesoftware.com")
            .dateAdded(ldt1)
            .build();

    LocalDateTime ldt2 = LocalDateTime.parse("1955-11-12T22:04:00");

    Article articleEdited =
        Article.builder()
            .title("Save The Clock Tower!")
            .url("https://www.youtube.com/watch?v=36j1im0M0jo")
            .explanation(
                "Whatever you've got to tell me, I'll find out through the natural course of time.")
            .email("docbrown@delorean.com")
            .dateAdded(ldt2)
            .build();

    String requestBody = mapper.writeValueAsString(articleEdited);

    when(articleRepository.findById(eq(1337L))).thenReturn(Optional.of(articleOriginal));

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/article")
                    .param("id", "1337")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(articleRepository, times(1)).findById(1337L);
    verify(articleRepository, times(1)).save(articleEdited); // should be saved with correct user
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_edit_article_that_does_not_exist() throws Exception {
    // arrange

    LocalDateTime ldt1 = LocalDateTime.parse("1955-11-12T22:04:00");

    Article articleEdit =
        Article.builder()
            .title("Save The Clock Tower!")
            .url("https://www.youtube.com/watch?v=36j1im0M0jo")
            .explanation(
                "Whatever you've got to tell me, I'll find out through the natural course of time.")
            .email("docbrown@delorean.com")
            .dateAdded(ldt1)
            .build();

    String requestBody = mapper.writeValueAsString(articleEdit);

    when(articleRepository.findById(eq(121L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/article")
                    .param("id", "121")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(articleRepository, times(1)).findById(121L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("Article with id 121 not found", json.get("message"));
  }

  // #endregion
  // #endregion

  // #region Delete
  /*
   *
   *
   *
   * Filler space to keep the minimap legible
   *
   *
   */
  // #region DELETE by id
  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_an_article() throws Exception {
    // arrange

    LocalDateTime ldt1 = LocalDateTime.parse("2026-09-29T02:00:00");

    Article article1 =
        Article.builder()
            .title("City Never Sleeps")
            .url("https://www.playdeadlock.com/cityneversleeps")
            .explanation("The biggest update the game's map has ever seen! And more!")
            .email("gaben@valvesoftware.com")
            .dateAdded(ldt1)
            .build();

    when(articleRepository.findById(eq(1337L))).thenReturn(Optional.of(article1));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/article").param("id", "1337").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(articleRepository, times(1)).findById(1337L);
    verify(articleRepository, times(1)).delete(any());

    Map<String, Object> json = responseToJson(response);
    assertEquals("Article with id 1337 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_tries_to_delete_non_existant_article_and_gets_right_error_message()
      throws Exception {
    // arrange

    when(articleRepository.findById(eq(1337L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/article").param("id", "1337").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(articleRepository, times(1)).findById(1337L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("Article with id 1337 not found", json.get("message"));
  }
  // #endregion
}

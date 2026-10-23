package edu.ucsb.cs156.example.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = MenuItemReviewController.class)
@Import(TestConfig.class)
public class MenuItemReviewControllerTests extends ControllerTestCase {

  @MockitoBean MenuItemReviewRepository menuItemReviewRepository;

  @MockitoBean UserRepository userRepository;

  @Test
  public void loggedOutUsersCannotGetAll() throws Exception {
    mockMvc.perform(get("/api/MenuItemReview/all")).andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void loggedInUsersCanGetAll() throws Exception {
    LocalDateTime dateReviewed = LocalDateTime.parse("2026-10-20T18:00:00");

    MenuItemReview review =
        MenuItemReview.builder()
            .id(1L)
            .itemId(1L)
            .reviewerEmail("nathanshih@ucsb.edu")
            .stars(5)
            .dateReviewed(dateReviewed)
            .comments("Great food")
            .build();

    List<MenuItemReview> reviews = Arrays.asList(review);

    when(menuItemReviewRepository.findAll()).thenReturn(reviews);

    MvcResult response =
        mockMvc.perform(get("/api/MenuItemReview/all")).andExpect(status().isOk()).andReturn();

    verify(menuItemReviewRepository, times(1)).findAll();

    String expectedJson = mapper.writeValueAsString(reviews);
    String actualJson = response.getResponse().getContentAsString();

    assertEquals(expectedJson, actualJson);
  }

  @Test
  public void loggedOutUsersCannotPost() throws Exception {
    mockMvc
        .perform(
            post("/api/MenuItemReview/post")
                .param("itemId", "1")
                .param("reviewerEmail", "nathanshih@ucsb.edu")
                .param("stars", "5")
                .param("dateReviewed", "2026-10-20T18:00:00")
                .param("comments", "Great food")
                .with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regularUsersCannotPost() throws Exception {
    mockMvc
        .perform(
            post("/api/MenuItemReview/post")
                .param("itemId", "1")
                .param("reviewerEmail", "nathanshih@ucsb.edu")
                .param("stars", "5")
                .param("dateReviewed", "2026-10-20T18:00:00")
                .param("comments", "Great food")
                .with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void adminCanPostReview() throws Exception {
    LocalDateTime dateReviewed = LocalDateTime.parse("2026-10-20T18:00:00");

    MenuItemReview newReview =
        MenuItemReview.builder()
            .itemId(1L)
            .reviewerEmail("nathanshih@ucsb.edu")
            .stars(5)
            .dateReviewed(dateReviewed)
            .comments("Great food")
            .build();

    MenuItemReview savedReview =
        MenuItemReview.builder()
            .id(1L)
            .itemId(1L)
            .reviewerEmail("nathanshih@ucsb.edu")
            .stars(5)
            .dateReviewed(dateReviewed)
            .comments("Great food")
            .build();

    when(menuItemReviewRepository.save(eq(newReview))).thenReturn(savedReview);

    MvcResult response =
        mockMvc
            .perform(
                post("/api/MenuItemReview/post")
                    .param("itemId", "1")
                    .param("reviewerEmail", "nathanshih@ucsb.edu")
                    .param("stars", "5")
                    .param("dateReviewed", "2026-10-20T18:00:00")
                    .param("comments", "Great food")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(menuItemReviewRepository, times(1)).save(newReview);

    String expectedJson = mapper.writeValueAsString(savedReview);
    String actualJson = response.getResponse().getContentAsString();

    assertEquals(expectedJson, actualJson);
  }

  // GET by ID tests - Issue #28

  @Test
  public void loggedOutUsersCannotGetById() throws Exception {
    mockMvc.perform(get("/api/MenuItemReview").param("id", "1")).andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void loggedInUsersCanGetById() throws Exception {
    LocalDateTime dateReviewed = LocalDateTime.parse("2026-10-20T18:00:00");

    MenuItemReview review =
        MenuItemReview.builder()
            .id(1L)
            .itemId(1L)
            .reviewerEmail("nathanshih@ucsb.edu")
            .stars(5)
            .dateReviewed(dateReviewed)
            .comments("Great food")
            .build();

    when(menuItemReviewRepository.findById(eq(1L))).thenReturn(Optional.of(review));

    MvcResult response =
        mockMvc
            .perform(get("/api/MenuItemReview").param("id", "1"))
            .andExpect(status().isOk())
            .andReturn();

    verify(menuItemReviewRepository, times(1)).findById(eq(1L));

    String expectedJson = mapper.writeValueAsString(review);
    String actualJson = response.getResponse().getContentAsString();

    assertEquals(expectedJson, actualJson);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void getByIdReturns404WhenNotFound() throws Exception {
    when(menuItemReviewRepository.findById(eq(999L))).thenReturn(Optional.empty());

    mockMvc
        .perform(get("/api/MenuItemReview").param("id", "999"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.type").value("EntityNotFoundException"))
        .andExpect(jsonPath("$.message").value("MenuItemReview with id 999 not found"));

    verify(menuItemReviewRepository, times(1)).findById(eq(999L));
  }

  // PUT tests - Issue #29

  @Test
  public void loggedOutUsersCannotPut() throws Exception {
    mockMvc
        .perform(
            put("/api/MenuItemReview")
                .param("id", "1")
                .contentType("application/json")
                .content("{}")
                .with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regularUsersCannotPut() throws Exception {
    mockMvc
        .perform(
            put("/api/MenuItemReview")
                .param("id", "1")
                .contentType("application/json")
                .content("{}")
                .with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void adminCanUpdateReview() throws Exception {
    LocalDateTime oldDate = LocalDateTime.parse("2026-10-20T18:00:00");
    LocalDateTime newDate = LocalDateTime.parse("2026-10-21T12:00:00");

    MenuItemReview existingReview =
        MenuItemReview.builder()
            .id(1L)
            .itemId(1L)
            .reviewerEmail("nathanshih@ucsb.edu")
            .stars(5)
            .dateReviewed(oldDate)
            .comments("Great food")
            .build();

    MenuItemReview incomingReview =
        MenuItemReview.builder()
            .itemId(2L)
            .reviewerEmail("updated@ucsb.edu")
            .stars(4)
            .dateReviewed(newDate)
            .comments("Good food")
            .build();

    MenuItemReview expectedReview =
        MenuItemReview.builder()
            .id(1L)
            .itemId(2L)
            .reviewerEmail("updated@ucsb.edu")
            .stars(4)
            .dateReviewed(newDate)
            .comments("Good food")
            .build();

    when(menuItemReviewRepository.findById(eq(1L))).thenReturn(Optional.of(existingReview));

    MvcResult response =
        mockMvc
            .perform(
                put("/api/MenuItemReview")
                    .param("id", "1")
                    .contentType("application/json")
                    .content(mapper.writeValueAsString(incomingReview))
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(menuItemReviewRepository, times(1)).findById(eq(1L));
    verify(menuItemReviewRepository, times(1)).save(eq(expectedReview));

    String expectedJson = mapper.writeValueAsString(expectedReview);
    String actualJson = response.getResponse().getContentAsString();

    assertEquals(expectedJson, actualJson);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void putReturns404WhenNotFound() throws Exception {
    LocalDateTime dateReviewed = LocalDateTime.parse("2026-10-20T18:00:00");

    MenuItemReview incomingReview =
        MenuItemReview.builder()
            .itemId(1L)
            .reviewerEmail("nathanshih@ucsb.edu")
            .stars(4)
            .dateReviewed(dateReviewed)
            .comments("Good food")
            .build();

    when(menuItemReviewRepository.findById(eq(999L))).thenReturn(Optional.empty());

    mockMvc
        .perform(
            put("/api/MenuItemReview")
                .param("id", "999")
                .contentType("application/json")
                .content(mapper.writeValueAsString(incomingReview))
                .with(csrf()))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.type").value("EntityNotFoundException"))
        .andExpect(jsonPath("$.message").value("MenuItemReview with id 999 not found"));

    verify(menuItemReviewRepository, times(1)).findById(eq(999L));
  }

  // DELETE tests - Issue #30

  @Test
  public void loggedOutUsersCannotDelete() throws Exception {
    mockMvc
        .perform(delete("/api/MenuItemReview").param("id", "1").with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regularUsersCannotDelete() throws Exception {
    mockMvc
        .perform(delete("/api/MenuItemReview").param("id", "1").with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void adminCanDeleteReview() throws Exception {
    LocalDateTime dateReviewed = LocalDateTime.parse("2026-10-20T18:00:00");

    MenuItemReview review =
        MenuItemReview.builder()
            .id(1L)
            .itemId(1L)
            .reviewerEmail("nathanshih@ucsb.edu")
            .stars(5)
            .dateReviewed(dateReviewed)
            .comments("Great food")
            .build();

    when(menuItemReviewRepository.findById(eq(1L))).thenReturn(Optional.of(review));

    mockMvc
        .perform(delete("/api/MenuItemReview").param("id", "1").with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("MenuItemReview with id 1 deleted"));

    verify(menuItemReviewRepository, times(1)).findById(eq(1L));
    verify(menuItemReviewRepository, times(1)).delete(eq(review));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void deleteReturns404WhenNotFound() throws Exception {
    when(menuItemReviewRepository.findById(eq(999L))).thenReturn(Optional.empty());

    mockMvc
        .perform(delete("/api/MenuItemReview").param("id", "999").with(csrf()))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.type").value("EntityNotFoundException"))
        .andExpect(jsonPath("$.message").value("MenuItemReview with id 999 not found"));

    verify(menuItemReviewRepository, times(1)).findById(eq(999L));
  }
}

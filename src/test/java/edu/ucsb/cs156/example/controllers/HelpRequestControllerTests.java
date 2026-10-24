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
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
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

@WebMvcTest(controllers = HelpRequestController.class)
@Import(TestConfig.class)
public class HelpRequestControllerTests extends ControllerTestCase {

  @MockitoBean HelpRequestRepository helprequestrepository;

  @MockitoBean UserRepository userRepository;

  // Authorization tests for /api/helprequest/admin/all

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc
        .perform(get("/api/helprequest/all"))
        .andExpect(status().is(403)); // logged out users can't get all
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest helpRequest1 =
        HelpRequest.builder()
            .requesterEmail("test1@ucsb.edu")
            .teamId("10111")
            .tableOrBreakoutRoom("breakout")
            .requestTime(ldt1)
            .explanation("first request")
            .solved(true)
            .build();

    LocalDateTime ldt2 = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest helpRequest2 =
        HelpRequest.builder()
            .requesterEmail("test2@ucsb.edu")
            .teamId("20222")
            .tableOrBreakoutRoom("table")
            .requestTime(ldt2)
            .explanation("second request")
            .solved(false)
            .build();

    ArrayList<HelpRequest> expectedRequests = new ArrayList<>();
    expectedRequests.addAll(Arrays.asList(helpRequest1, helpRequest2));

    when(helprequestrepository.findAll()).thenReturn(expectedRequests);

    MvcResult response =
        mockMvc.perform(get("/api/helprequest/all")).andExpect(status().isOk()).andReturn();

    verify(helprequestrepository, times(1)).findAll();
    String expectedJson = mapper.writeValueAsString(expectedRequests);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
    // mockMvc.perform(get("/api/helprequest/all")).andExpect(status().is(200)); // logged
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc
        .perform(get("/api/helprequest").param("id", "1"))
        .andExpect(status().is(403)); // logged out users can't get by id
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

    // arrange
    LocalDateTime ldt = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest helpRequest =
        HelpRequest.builder()
            .requesterEmail("test@ucsb.edu")
            .teamId("20222")
            .tableOrBreakoutRoom("table")
            .requestTime(ldt)
            .explanation("none")
            .solved(false)
            .build();

    when(helprequestrepository.findById(eq(1L))).thenReturn(Optional.of(helpRequest));

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/helprequest").param("id", "1"))
            .andExpect(status().isOk())
            .andReturn();

    // assert

    verify(helprequestrepository, times(1)).findById(eq(1L));
    String expectedJson = mapper.writeValueAsString(helpRequest);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

    // arrange

    when(helprequestrepository.findById(eq(7L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/helprequest").param("id", "7"))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert

    verify(helprequestrepository, times(1)).findById(eq(7L));
    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("HelpRequest with id 7 not found", json.get("message"));
  }

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/helprequest/post")
                .param("requesterEmail", "test@mail.com")
                .param("teamId", "20222")
                .param("tableOrBreakoutRoom", "table")
                .param("explanation", "solution")
                .param("solved", "false")
                .param("requestTime", "2026-01-03T00:00:00")
                .with(csrf()))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/helprequest/post")
                .param("requesterEmail", "test@mail.com")
                .param("teamId", "20222")
                .param("tableOrBreakoutRoom", "table")
                .param("explanation", "solution")
                .param("solved", "false")
                .param("requestTime", "2026-01-03T00:00:00")
                .with(csrf()))
        .andExpect(status().is(403)); // only admins can post
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_helprequest() throws Exception {
    // arrange

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest helpRequest1 =
        HelpRequest.builder()
            .requesterEmail("csdiez@ucsb.edu")
            .teamId("20222")
            .tableOrBreakoutRoom("table")
            .requestTime(ldt1)
            .explanation("none")
            .solved(true)
            .build();

    when(helprequestrepository.save(eq(helpRequest1))).thenReturn(helpRequest1);

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/helprequest/post")
                    .param("requesterEmail", "csdiez@ucsb.edu")
                    .param("teamId", "20222")
                    .param("tableOrBreakoutRoom", "table")
                    .param("requestTime", "2022-01-03T00:00:00")
                    .param("explanation", "none")
                    .param("solved", "true")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(helprequestrepository, times(1)).save(helpRequest1);
    String expectedJson = mapper.writeValueAsString(helpRequest1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_a_helprequest() throws Exception {
    // arrange

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest helpRequest1 =
        HelpRequest.builder()
            .requesterEmail("csdiez@ucsb.edu")
            .teamId("20222")
            .tableOrBreakoutRoom("table")
            .requestTime(ldt1)
            .explanation("none")
            .solved(true)
            .build();
    when(helprequestrepository.findById(eq(15L))).thenReturn(Optional.of(helpRequest1));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/helprequest").param("id", "15").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(helprequestrepository, times(1)).findById(15L);
    verify(helprequestrepository, times(1)).delete(any());

    Map<String, Object> json = responseToJson(response);
    assertEquals("HelpRequest with id 15 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_tries_to_delete_non_existant_ucsbdate_and_gets_right_error_message()
      throws Exception {
    // arrange

    when(helprequestrepository.findById(eq(15L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/helprequest").param("id", "15").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(helprequestrepository, times(1)).findById(15L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("HelpRequest with id 15 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_edit_an_existing_helprequest() throws Exception {
    // arrange

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
    LocalDateTime ldt2 = LocalDateTime.parse("2023-01-03T00:00:00");

    HelpRequest helpRequestOrig =
        HelpRequest.builder()
            .requesterEmail("test1@ucsb.edu")
            .teamId("10111")
            .tableOrBreakoutRoom("breakout")
            .requestTime(ldt1)
            .explanation("first request")
            .solved(true)
            .build();

    HelpRequest helpRequestEdited =
        HelpRequest.builder()
            .requesterEmail("test2@ucsb.edu")
            .teamId("20222")
            .tableOrBreakoutRoom("table")
            .requestTime(ldt2)
            .explanation("second request")
            .solved(false)
            .build();
    String requestBody = mapper.writeValueAsString(helpRequestEdited);

    when(helprequestrepository.findById(eq(67L))).thenReturn(Optional.of(helpRequestOrig));

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/helprequest")
                    .param("id", "67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(helprequestrepository, times(1)).findById(67L);
    verify(helprequestrepository, times(1))
        .save(helpRequestEdited); // should be saved with correct user
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_edit_ucsbdate_that_does_not_exist() throws Exception {
    // arrange

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

    HelpRequest editedHelpRequest =
        HelpRequest.builder()
            .requesterEmail("test1@ucsb.edu")
            .teamId("10111")
            .tableOrBreakoutRoom("breakout")
            .requestTime(ldt1)
            .explanation("first request")
            .solved(true)
            .build();

    String requestBody = mapper.writeValueAsString(editedHelpRequest);

    when(helprequestrepository.findById(eq(67L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/helprequest")
                    .param("id", "67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(helprequestrepository, times(1)).findById(67L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("HelpRequest with id 67 not found", json.get("message"));
  }
}

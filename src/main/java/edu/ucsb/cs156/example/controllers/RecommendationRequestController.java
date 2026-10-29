package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "RecommendationRequest")
@RequestMapping("/api/RecommendationRequest")
@RestController
@Slf4j
public class RecommendationRequestController extends ApiController {

  @Autowired RecommendationRequestRepository recommendationRequestRepository;

  @Operation(summary = "List all recommendation requests")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<RecommendationRequest> allRecommendationRequests() {
    return recommendationRequestRepository.findAll();
  }

  @Operation(summary = "Get a recommendation request by ID")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public RecommendationRequest getRecommendationRequest(
      @Parameter(description = "ID of the recommendation request") @RequestParam long id) {

    return recommendationRequestRepository
        .findById(id)
        .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));
  }

  @Operation(summary = "Create a new recommendation request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public RecommendationRequest postRecommendationRequest(
      @Parameter(description = "Email of the person requesting a recommendation") @RequestParam
          String requesterEmail,
      @Parameter(description = "Email of the professor") @RequestParam String professorEmail,
      @Parameter(description = "Reason for the recommendation") @RequestParam String explanation,
      @Parameter(description = "Date requested in ISO format")
          @RequestParam
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime dateRequested,
      @Parameter(description = "Date needed in ISO format")
          @RequestParam
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime dateNeeded,
      @Parameter(description = "Whether the request is complete") @RequestParam boolean done) {

    RecommendationRequest request = new RecommendationRequest();
    request.setRequesterEmail(requesterEmail);
    request.setProfessorEmail(professorEmail);
    request.setExplanation(explanation);
    request.setDateRequested(dateRequested);
    request.setDateNeeded(dateNeeded);
    request.setDone(done);

    return recommendationRequestRepository.save(request);
  }

  @Operation(summary = "Delete a recommendation request by ID")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteRecommendationRequest(
      @Parameter(description = "ID of the recommendation request") @RequestParam long id) {

    RecommendationRequest request =
        recommendationRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

    recommendationRequestRepository.delete(request);

    return genericMessage("RecommendationRequest with id %s deleted".formatted(id));
  }

  @Operation(summary = "Update a recommendation request by ID")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public RecommendationRequest updateRecommendationRequest(
      @Parameter(description = "ID of the recommendation request") @RequestParam long id,
      @RequestBody RecommendationRequest incoming) {

    RecommendationRequest request =
        recommendationRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

    request.setRequesterEmail(incoming.getRequesterEmail());
    request.setProfessorEmail(incoming.getProfessorEmail());
    request.setExplanation(incoming.getExplanation());
    request.setDateRequested(incoming.getDateRequested());
    request.setDateNeeded(incoming.getDateNeeded());
    request.setDone(incoming.getDone());

    return recommendationRequestRepository.save(request);
  }
}

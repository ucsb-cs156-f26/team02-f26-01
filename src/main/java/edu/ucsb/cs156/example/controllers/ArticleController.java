package edu.ucsb.cs156.example.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import edu.ucsb.cs156.example.entities.Article;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.ArticleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

@Tag(name = "Article")
@RequestMapping("/api/article")
@RestController
@Slf4j
public class ArticleController extends ApiController {
  // Autowired
  // Springboot auto invoke the constructor
  // also auto-switch between localhost and production environment
  @Autowired ArticleRepository articleRepository;

  // #region Create
  @Operation(summary = "Create a new article")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public Article postArticles(
      @Parameter(name = "title") @RequestParam String title,
      @Parameter(name = "url") @RequestParam String url,
      @Parameter(name = "explanation") @RequestParam String explanation,
      @Parameter(name = "email", description = "Author email: should be ...@ucsb.edu") @RequestParam
          String email,
      @Parameter(
              name = "localDateTime",
              description =
                  "date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)")
          @RequestParam("localDateTime")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime localDateTime)
      throws JsonProcessingException {

    // For an explanation of @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    // See: https://www.baeldung.com/spring-date-parameters

    log.info("localDateTime={}", localDateTime);

    Article article = new Article();
    article.setTitle(title);
    article.setUrl(url);
    article.setExplanation(explanation);
    article.setEmail(email);
    article.setDateAdded(localDateTime); // might need updating?

    Article savedArticle = articleRepository.save(article);

    return savedArticle;
  }

  // #endregion

  // #region Read
  /**
   * List all article
   *
   * @return an iterable of Article
   */
  @Operation(summary = "List all article")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<Article> allArticles() {
    Iterable<Article> articles = articleRepository.findAll();
    return articles;
  }

  /**
   * Get a single date by id
   *
   * @param id the id of the date
   * @return an article
   */
  @Operation(summary = "Get a single article by id")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public Article getById(@Parameter(name = "id") @RequestParam Long id) {
    Article article =
        articleRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(Article.class, id));

    return article;
  }

  // #endregion

  // #region Update
  /**
   * Update a single date
   *
   * @param id id of the article to update
   * @param incoming the new article
   * @return the updated date object
   */
  @Operation(summary = "Update a single article")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public Article updateArticle(
      @Parameter(name = "id") @RequestParam Long id, @RequestBody @Valid Article incoming) {

    Article article =
        articleRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(Article.class, id));

    article.setTitle(incoming.getTitle());
    article.setUrl(incoming.getUrl());
    article.setExplanation(incoming.getExplanation());
    article.setEmail(incoming.getEmail());
    article.setDateAdded(incoming.getDateAdded());

    articleRepository.save(article);

    return article;
  }

  // #endregion

  // #region Delete
  /**
   * Delete an Article
   *
   * @param id the id of the article to delete
   * @return a message indicating the article was deleted
   */
  @Operation(summary = "Delete an Article")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteArticle(@Parameter(name = "id") @RequestParam Long id) {
    Article article =
        articleRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(Article.class, id));

    articleRepository.delete(article);
    return genericMessage("Article with id %s deleted".formatted(id));
  }
  // #endregion
}

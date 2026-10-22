package edu.ucsb.cs156.example.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Lombok
@Data // auto generate getters, setters, toString, hashCode, equals
@AllArgsConstructor // auto gens all arg constructor, sometimes annoying to use
@NoArgsConstructor // allows bean generation
@Builder // allow construction via method chain
/* Example:
UCSBDiningCommons commons = UCSBDiningCommons.builder()
      .name("Carrillo")
      .code("carrillo")
      .hasSackMeal(false)
      .hasTakeOutMeal(false)
      .hasDiningCam(true)
      .latitude(34.409953)
      .longitude(-119.85277)
      .build();                          */

// This will be a row in a database table
// name = "nameoftable" <-- all lowercase, no hyphens/underscores
@Entity(name = "articles")
public class Article {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  private String title;
  private String url;
  private String explanation;
  private String email; // of person who submitted it
  private LocalDateTime dateAdded;
}

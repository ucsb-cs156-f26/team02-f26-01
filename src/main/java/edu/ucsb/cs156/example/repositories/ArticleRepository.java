package edu.ucsb.cs156.example.repositories;

import edu.ucsb.cs156.example.entities.Article;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

// Spring
@Repository
@RepositoryRestResource(exported = false)
// extends CrudRepository<Article, long>
// Article <-- type that will be stored
// long    <-- indexing (@id) type
public interface ArticleRepository extends CrudRepository<Article, Long> {}

// This is an interface
// SpringBoot auto generates the code for the implementing class automatically

// specify methods in the interface to implement queries
// read more here:
// https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#jdbc.query-methods

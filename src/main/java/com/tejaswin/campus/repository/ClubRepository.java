package com.tejaswin.campus.repository;

import com.tejaswin.campus.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    Optional<Club> findBySlug(String slug);
    Optional<Club> findByName(String name);
}

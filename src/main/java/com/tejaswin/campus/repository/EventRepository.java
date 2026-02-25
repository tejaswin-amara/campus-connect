package com.tejaswin.campus.repository;

import com.tejaswin.campus.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByOrderByDateTimeDesc();

    Page<Event> findAllByOrderByDateTimeDesc(Pageable pageable);

    long countByDateTimeAfter(LocalDateTime dateTime);

    List<Event> findByTitleContainingIgnoreCaseOrVenueContainingIgnoreCase(String title, String venue);

    Page<Event> findByTitleContainingIgnoreCaseOrVenueContainingIgnoreCase(String title, String venue,
            Pageable pageable);

    List<Event> findByCategoryOrderByDateTimeDesc(String category);

    Page<Event> findByCategoryOrderByDateTimeDesc(String category, Pageable pageable);

    @Query("SELECT e.category, COUNT(e) FROM Event e GROUP BY e.category")
    List<Object[]> countEventsByCategory();

    @Query("SELECT COUNT(e) FROM Event e WHERE e.dateTime <= :now AND e.endDateTime IS NOT NULL AND e.endDateTime > :now")
    long countOngoingEvents(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(e) FROM Event e WHERE (e.endDateTime IS NOT NULL AND e.endDateTime < :now) OR (e.endDateTime IS NULL AND e.dateTime < :now)")
    long countPastEvents(@Param("now") LocalDateTime now);
}

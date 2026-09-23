package com.tejaswin.campus.repository;

import com.tejaswin.campus.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    @Query("SELECT r FROM Registration r JOIN FETCH r.event WHERE r.user.id = :userId ORDER BY r.registrationDate DESC")
    List<Registration> findByUserIdWithEvent(@Param("userId") Long userId);

    long countByEventId(Long eventId);

    @Transactional
    void deleteByEventId(Long eventId);

    @Query("SELECT r.event.id, COUNT(r) FROM Registration r GROUP BY r.event.id")
    List<Object[]> countRegistrationsGroupedByEvent();

    @Query("SELECT r FROM Registration r JOIN FETCH r.user WHERE r.event.id = :eventId ORDER BY r.registrationDate DESC")
    List<Registration> findByEventIdWithUser(@Param("eventId") Long eventId);

    Optional<Registration> findByEventIdAndTicketCode(Long eventId, String ticketCode);

    @Query("SELECT r FROM Registration r WHERE r.event.id = :eventId AND r.user.rollNumber = :rollNumber")
    Optional<Registration> findByEventIdAndRollNumber(@Param("eventId") Long eventId, @Param("rollNumber") String rollNumber);

    long countByEvent_Club_Id(Long clubId);

    long countByEvent_Club_IdAndCheckedInTrue(Long clubId);

    long countByEventIdAndCheckedInTrue(Long eventId);
}

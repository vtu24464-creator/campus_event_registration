package com.campusx.repository;

import com.campusx.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

       /** All registrations for a user, joined with event data, newest first */
       @Query(value = """
                     SELECT r.id, r.user_id, r.event_id, r.phone, r.status, r.registered_at, r.updated_at,
                            e.title, e.category, e.event_date, e.venue, e.icon_emoji
                     FROM registrations r
                     JOIN events e ON e.id = r.event_id
                     WHERE r.user_id = :userId
                     ORDER BY r.registered_at DESC
                     """, nativeQuery = true)
       List<Object[]> findRegistrationsWithEventByUserId(@Param("userId") Long userId);

       Optional<Registration> findByUserIdAndEventId(Long userId, Long eventId);

       /** Count non-cancelled registrations for a user */
       @Query("SELECT COUNT(r) FROM Registration r WHERE r.userId = :userId AND r.status != 'cancelled'")
       long countActiveByUserId(@Param("userId") Long userId);

       /** Count upcoming confirmed registrations (event_date >= today) */
       @Query(value = """
                     SELECT COUNT(*) FROM registrations r
                     JOIN events e ON e.id = r.event_id
                     WHERE r.user_id = :userId AND e.event_date >= :today AND r.status = 'confirmed'
                     """, nativeQuery = true)
       long countUpcomingByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);

       /** All registrations for a specific event — for admin panel */
       @Query(value = """
                     SELECT r.id, r.user_id, u.first_name, u.last_name, u.email,
                            u.roll_number, u.department, r.phone, r.status, r.registered_at
                     FROM registrations r
                     JOIN users u ON u.id = r.user_id
                     WHERE r.event_id = :eventId
                     ORDER BY r.registered_at DESC
                     """, nativeQuery = true)
       List<Object[]> findRegistrationsByEventId(@Param("eventId") Long eventId);

       /** Pending payment registrations for admin verification panel */
       @Query(value = """
                     SELECT r.id, u.first_name, u.last_name, r.roll_number, u.email,
                            e.title, r.amount_paid, r.transaction_id, r.payment_status, r.registered_at
                     FROM registrations r
                     JOIN users  u ON u.id = r.user_id
                     JOIN events e ON e.id = r.event_id
                     WHERE r.payment_status IN ('pending_verification','rejected')
                     ORDER BY r.registered_at DESC
                     """, nativeQuery = true)
       List<Object[]> findPaymentPendingRegistrations();

       /** Total revenue from paid registrations */
       @Query(value = "SELECT SUM(amount_paid) FROM registrations WHERE payment_status = 'paid'", nativeQuery = true)
       Object totalRevenue();

       Optional<Registration> findByTransactionId(String transactionId);
}

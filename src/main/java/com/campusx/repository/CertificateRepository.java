package com.campusx.repository;

import com.campusx.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    /** Certificates for user with event details, newest first */
    @Query(value = """
            SELECT c.id, c.user_id, c.event_id, c.certificate_url, c.issued_at,
                   e.title, e.category, e.icon_emoji,
                   c.participation_type, c.position
            FROM certificates c
            JOIN events e ON e.id = c.event_id
            WHERE c.user_id = :userId
            ORDER BY c.issued_at DESC
            """, nativeQuery = true)
    List<Object[]> findCertificatesWithEventByUserId(@Param("userId") Long userId);

    long countByUserId(Long userId);

    /** Full detail for a single certificate — for the preview page */
    @Query(value = """
            SELECT c.id, c.user_id, c.issued_at, c.participation_type, c.position,
                   e.title, e.category, e.event_date, e.venue, e.organizer,
                   u.first_name, u.last_name, u.roll_number, u.department, u.year
            FROM certificates c
            JOIN events e ON e.id = c.event_id
            JOIN users  u ON u.id = c.user_id
            WHERE c.id = :certId
            """, nativeQuery = true)
    List<Object[]> findCertificateDetailById(@Param("certId") Long certId);

    /** All certificates — for admin dashboard */
    @Query(value = """
            SELECT c.id, c.user_id, u.first_name, u.last_name, u.roll_number,
                   e.title, e.category, c.participation_type, c.issued_at
            FROM certificates c
            JOIN users  u ON u.id = c.user_id
            JOIN events e ON e.id = c.event_id
            ORDER BY c.issued_at DESC
            """, nativeQuery = true)
    List<Object[]> findAllCertificatesForAdmin();
}

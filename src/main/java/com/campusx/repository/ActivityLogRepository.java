package com.campusx.repository;

import com.campusx.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    /** Latest 10 activity entries for a user with optional event title */
    @Query(value = """
            SELECT a.id, a.user_id, a.action_type, a.description, a.event_id, a.created_at,
                   e.title AS event_title
            FROM activity_log a
            LEFT JOIN events e ON e.id = a.event_id
            WHERE a.user_id = :userId
            ORDER BY a.created_at DESC
            LIMIT 10
            """, nativeQuery = true)
    List<Object[]> findRecentActivityByUserId(@Param("userId") Long userId);
}

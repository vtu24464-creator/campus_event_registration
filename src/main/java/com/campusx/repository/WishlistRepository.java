package com.campusx.repository;

import com.campusx.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    /** Wishlist items for a user with event details, newest first */
    @Query(value = """
            SELECT w.id, w.saved_at, e.id AS event_id, e.title, e.category,
                   e.event_date, e.venue, e.icon_emoji, e.status
            FROM wishlist w
            JOIN events e ON e.id = w.event_id
            WHERE w.user_id = :userId
            ORDER BY w.saved_at DESC
            """, nativeQuery = true)
    List<Object[]> findWishlistWithEventByUserId(@Param("userId") Long userId);

    Optional<Wishlist> findByUserIdAndEventId(Long userId, Long eventId);

    void deleteByUserIdAndEventId(Long userId, Long eventId);
}

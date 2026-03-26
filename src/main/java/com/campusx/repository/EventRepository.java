package com.campusx.repository;

import com.campusx.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * EventRepository — supports dynamic filtering via JpaSpecificationExecutor.
 * Used by EventController for ?category=&status=&search=&month= query params.
 */
@Repository
public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {
}

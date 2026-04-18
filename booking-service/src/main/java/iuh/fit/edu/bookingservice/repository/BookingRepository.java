package iuh.fit.edu.bookingservice.repository;

import iuh.fit.edu.bookingservice.domain.entity.Booking;
import iuh.fit.edu.bookingservice.domain.enums.BookingStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
            SELECT b
            FROM Booking b
            WHERE (:userId IS NULL OR b.userId = :userId)
              AND (:status IS NULL OR b.status = :status)
            ORDER BY b.createdAt DESC, b.id DESC
            """)
    List<Booking> findByFilters(@Param("userId") Long userId, @Param("status") BookingStatus status);
}

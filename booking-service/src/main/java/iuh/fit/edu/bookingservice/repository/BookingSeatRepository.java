package iuh.fit.edu.bookingservice.repository;

import iuh.fit.edu.bookingservice.domain.entity.BookingSeat;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    @Query("""
            SELECT bs.seatId
            FROM BookingSeat bs
            WHERE bs.showtimeId = :showtimeId
              AND bs.seatId IN :seatIds
            """)
    List<Long> findBookedSeatIds(@Param("showtimeId") Long showtimeId, @Param("seatIds") Collection<Long> seatIds);

    List<BookingSeat> findByBookingIdIn(Collection<Long> bookingIds);

    void deleteByBookingId(Long bookingId);
}

package iuh.fit.edu.bookingservice.repository;

import iuh.fit.edu.bookingservice.domain.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatRepository extends JpaRepository<Seat, Long> {
}

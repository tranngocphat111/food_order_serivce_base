package iuh.fit.edu.bookingservice.dto.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingCreatedEvent {
    private String eventType;
    private Long bookingId;
    private String bookingCode;
    private Long userId;
    private Long showtimeId;
    private Integer totalSeats;
    private BigDecimal totalAmount;
    private List<String> seats;
    private LocalDateTime createdAt;
}

package iuh.fit.edu.bookingservice.dto.response;

import iuh.fit.edu.bookingservice.domain.enums.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long userId;
    private Long showtimeId;
    private Integer totalSeats;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private String notes;
    private List<String> seatLabels;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

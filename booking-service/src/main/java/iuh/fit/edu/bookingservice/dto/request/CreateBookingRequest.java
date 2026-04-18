package iuh.fit.edu.bookingservice.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBookingRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotNull(message = "showtimeId is required")
    private Long showtimeId;

    @NotEmpty(message = "seatIds must not be empty")
    private List<@NotNull(message = "seatId must not be null") Long> seatIds;

    @Size(max = 255, message = "notes must be <= 255 characters")
    private String notes;
}

package iuh.fit.edu.bookingservice.service;

import iuh.fit.edu.bookingservice.domain.entity.Booking;
import iuh.fit.edu.bookingservice.domain.entity.BookingSeat;
import iuh.fit.edu.bookingservice.domain.entity.Seat;
import iuh.fit.edu.bookingservice.domain.entity.Showtime;
import iuh.fit.edu.bookingservice.domain.enums.BookingStatus;
import iuh.fit.edu.bookingservice.domain.enums.ShowtimeStatus;
import iuh.fit.edu.bookingservice.dto.event.BookingCreatedEvent;
import iuh.fit.edu.bookingservice.dto.request.CreateBookingRequest;
import iuh.fit.edu.bookingservice.dto.response.BookingResponse;
import iuh.fit.edu.bookingservice.exception.BadRequestException;
import iuh.fit.edu.bookingservice.exception.ConflictException;
import iuh.fit.edu.bookingservice.exception.NotFoundException;
import iuh.fit.edu.bookingservice.repository.BookingRepository;
import iuh.fit.edu.bookingservice.repository.BookingSeatRepository;
import iuh.fit.edu.bookingservice.repository.SeatRepository;
import iuh.fit.edu.bookingservice.repository.ShowtimeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private static final DateTimeFormatter BOOKING_DATE_FMT = DateTimeFormatter.BASIC_ISO_DATE;

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final BookingEventPublisher bookingEventPublisher;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        List<Long> seatIds = validateAndNormalizeSeatIds(request.getSeatIds());

        Showtime showtime = showtimeRepository.findByIdForUpdate(request.getShowtimeId())
                .orElseThrow(() -> new NotFoundException("Showtime not found: " + request.getShowtimeId()));

        if (showtime.getStatus() != ShowtimeStatus.ACTIVE) {
            throw new BadRequestException("Showtime is not active");
        }

        List<Seat> seats = seatRepository.findAllById(seatIds);
        if (seats.size() != seatIds.size()) {
            throw new NotFoundException("One or more seats do not exist");
        }

        for (Seat seat : seats) {
            if (!Boolean.TRUE.equals(seat.getIsActive())) {
                throw new BadRequestException("Seat is inactive: " + seat.getId());
            }
            if (!Objects.equals(seat.getHallId(), showtime.getHallId())) {
                throw new BadRequestException("Seat does not belong to showtime hall: " + seat.getId());
            }
        }

        List<Long> bookedSeatIds = bookingSeatRepository.findBookedSeatIds(showtime.getId(), seatIds);
        if (!bookedSeatIds.isEmpty()) {
            throw new ConflictException("Some seats have already been booked: " + bookedSeatIds);
        }

        if (showtime.getAvailableSeats() < seatIds.size()) {
            throw new ConflictException("Not enough available seats");
        }

        BigDecimal totalAmount = showtime.getPrice().multiply(BigDecimal.valueOf(seatIds.size()));

        Booking booking = new Booking();
        booking.setBookingCode(generateBookingCode());
        booking.setUserId(request.getUserId());
        booking.setShowtimeId(showtime.getId());
        booking.setTotalSeats(seatIds.size());
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.PENDING);
        booking.setNotes(request.getNotes());

        Booking savedBooking;
        try {
            savedBooking = bookingRepository.save(booking);
            List<BookingSeat> bookingSeats = seatIds.stream().map(seatId -> {
                BookingSeat bookingSeat = new BookingSeat();
                bookingSeat.setBookingId(savedBooking.getId());
                bookingSeat.setSeatId(seatId);
                bookingSeat.setShowtimeId(showtime.getId());
                return bookingSeat;
            }).toList();
            bookingSeatRepository.saveAll(bookingSeats);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("Seat conflict detected while booking. Please retry with different seats.");
        }

        showtime.setAvailableSeats(showtime.getAvailableSeats() - seatIds.size());
        showtimeRepository.save(showtime);

        List<String> seatLabels = seats.stream().map(Seat::getSeatLabel).toList();
        BookingCreatedEvent event = BookingCreatedEvent.builder()
                .eventType("BOOKING_CREATED")
                .bookingId(savedBooking.getId())
                .bookingCode(savedBooking.getBookingCode())
                .userId(savedBooking.getUserId())
                .showtimeId(savedBooking.getShowtimeId())
                .totalSeats(savedBooking.getTotalSeats())
                .totalAmount(savedBooking.getTotalAmount())
                .seats(seatLabels)
                .createdAt(LocalDateTime.now())
                .build();
        bookingEventPublisher.publishBookingCreatedAfterCommit(event);

        log.info("Created booking id={} code={} and published BOOKING_CREATED", savedBooking.getId(), savedBooking.getBookingCode());
        return mapToResponse(savedBooking, seatLabels);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookings(Long userId, BookingStatus status) {
        List<Booking> bookings = bookingRepository.findByFilters(userId, status);
        if (bookings.isEmpty()) {
            return List.of();
        }

        Map<Long, List<String>> seatLabelsByBookingId = loadSeatLabelsByBooking(bookings);
        return bookings.stream()
                .map(booking -> mapToResponse(booking, seatLabelsByBookingId.getOrDefault(booking.getId(), List.of())))
                .toList();
    }

    private List<Long> validateAndNormalizeSeatIds(Collection<Long> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            throw new BadRequestException("seatIds must not be empty");
        }

        Set<Long> unique = new LinkedHashSet<>(seatIds);
        if (unique.size() != seatIds.size()) {
            throw new BadRequestException("Duplicate seatIds are not allowed");
        }
        return new ArrayList<>(unique);
    }

    private Map<Long, List<String>> loadSeatLabelsByBooking(List<Booking> bookings) {
        List<Long> bookingIds = bookings.stream().map(Booking::getId).toList();
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingIdIn(bookingIds);
        if (bookingSeats.isEmpty()) {
            return Map.of();
        }

        Set<Long> seatIds = bookingSeats.stream().map(BookingSeat::getSeatId).collect(Collectors.toSet());
        Map<Long, String> seatLabelMap = seatRepository.findAllById(seatIds).stream()
                .collect(Collectors.toMap(Seat::getId, Seat::getSeatLabel));

        Map<Long, List<String>> result = new HashMap<>();
        for (BookingSeat bookingSeat : bookingSeats) {
            String label = seatLabelMap.get(bookingSeat.getSeatId());
            if (label == null) {
                continue;
            }
            result.computeIfAbsent(bookingSeat.getBookingId(), key -> new ArrayList<>()).add(label);
        }
        return result;
    }

    private BookingResponse mapToResponse(Booking booking, List<String> seatLabels) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUserId())
                .showtimeId(booking.getShowtimeId())
                .totalSeats(booking.getTotalSeats())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .notes(booking.getNotes())
                .seatLabels(seatLabels)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private String generateBookingCode() {
        String datePart = LocalDate.now().format(BOOKING_DATE_FMT);
        int random = ThreadLocalRandom.current().nextInt(10000, 100000);
        return "BK-" + datePart + "-" + random;
    }
}

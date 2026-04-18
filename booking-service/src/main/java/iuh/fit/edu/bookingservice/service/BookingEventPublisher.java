package iuh.fit.edu.bookingservice.service;

import iuh.fit.edu.bookingservice.config.MessagingProperties;
import iuh.fit.edu.bookingservice.dto.event.BookingCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final MessagingProperties props;

    public void publishBookingCreatedAfterCommit(BookingCreatedEvent event) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publishBookingCreated(event);
                }
            });
            return;
        }
        publishBookingCreated(event);
    }

    private void publishBookingCreated(BookingCreatedEvent event) {
        rabbitTemplate.convertAndSend(
                props.getExchange(),
            props.getBookingCreatedRoutingKey(),
                event
        );
        log.info("Published BOOKING_CREATED event for bookingId={}", event.getBookingId());
    }
}

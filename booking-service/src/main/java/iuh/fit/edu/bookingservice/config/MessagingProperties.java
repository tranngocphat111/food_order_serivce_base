package iuh.fit.edu.bookingservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.rabbitmq")
public class MessagingProperties {

    private String exchange;
    private String bookingCreatedRoutingKey;
}

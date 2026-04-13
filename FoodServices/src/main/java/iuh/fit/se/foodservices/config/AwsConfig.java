package iuh.fit.se.foodservices.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

/**
 * AWS Configuration: Load credentials from .env file
 * Called automatically during Spring startup
 */
@Configuration
public class AwsConfig {

    public AwsConfig() {
        // Load .env file and set system properties for AWS SDK
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String s3Bucket = dotenv.get("S3_BUCKET");
        if (s3Bucket != null) {
            System.setProperty("S3_BUCKET", s3Bucket);
            System.setProperty("aws.s3.bucket", s3Bucket);
        }

        String awsBucket = dotenv.get("AWS_S3_BUCKET");
        if (awsBucket != null) {
            System.setProperty("AWS_S3_BUCKET", awsBucket);
            System.setProperty("aws.s3.bucket", awsBucket);
        }

        String awsRegion = dotenv.get("AWS_REGION");
        if (awsRegion != null) {
            System.setProperty("AWS_REGION", awsRegion);
            System.setProperty("aws.region", awsRegion);
        }

        String awsAccessKeyId = dotenv.get("AWS_ACCESS_KEY_ID");
        if (awsAccessKeyId != null) {
            System.setProperty("AWS_ACCESS_KEY_ID", awsAccessKeyId);
        }

        String awsSecretAccessKey = dotenv.get("AWS_SECRET_ACCESS_KEY");
        if (awsSecretAccessKey != null) {
            System.setProperty("AWS_SECRET_ACCESS_KEY", awsSecretAccessKey);
        }
    }
}

package iuh.fit.se.foodservices.service;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Utilities;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@Slf4j
public class S3Service {

    private static final String FOOD_IMAGE_PREFIX = "meals/";

    private final S3Client s3;

    @Value("${aws.s3.bucket:food-service-images}")
    private String bucket;

    @Value("${aws.region:ap-southeast-1}")
    private String region;

    public S3Service(@Value("${aws.region:ap-southeast-1}") String region) {
        String accessKey = firstNonBlank(
                System.getenv("AWS_ACCESS_KEY_ID"),
                System.getProperty("AWS_ACCESS_KEY_ID")
        );
        String secretKey = firstNonBlank(
                System.getenv("AWS_SECRET_ACCESS_KEY"),
                System.getProperty("AWS_SECRET_ACCESS_KEY")
        );

        if ((accessKey == null || accessKey.isBlank()) || (secretKey == null || secretKey.isBlank())) {
            Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
            if (accessKey == null || accessKey.isBlank()) {
                accessKey = dotenv.get("AWS_ACCESS_KEY_ID");
            }
            if (secretKey == null || secretKey.isBlank()) {
                secretKey = dotenv.get("AWS_SECRET_ACCESS_KEY");
            }
        }

        if (accessKey != null && secretKey != null) {
            // Build S3Client with explicit credentials from .env
            AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, secretKey);
            this.s3 = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                    .build();
        } else {
            // Fallback: use default credential provider chain (env vars, shared credentials file, IAM role, etc.)
            this.s3 = S3Client.builder()
                    .region(Region.of(region))
                    .build();
        }
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String key = FOOD_IMAGE_PREFIX + fileName;
        log.info("Uploading file to S3 with key: {}", key);
        PutObjectRequest por = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3.putObject(por, RequestBody.fromBytes(file.getBytes()));
        return fileName;
    }

    public String getFileUrl(String key) {
        S3Utilities utilities = s3.utilities();
        GetUrlRequest request = GetUrlRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        return utilities.getUrl(request).toExternalForm();
    }

    public void deleteFile(String key) {
        String normalizedKey = key == null ? "" : key.trim();
        if (!normalizedKey.isEmpty() && !normalizedKey.startsWith(FOOD_IMAGE_PREFIX)) {
            normalizedKey = FOOD_IMAGE_PREFIX + normalizedKey;
        }

        DeleteObjectRequest dor = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(normalizedKey)
                .build();
        s3.deleteObject(dor);
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        if (second != null && !second.isBlank()) {
            return second;
        }
        return null;
    }
}

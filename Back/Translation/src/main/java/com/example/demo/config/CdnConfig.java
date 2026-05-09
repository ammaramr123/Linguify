package com.example.demo.config;

import com.example.demo.strategy.CdnStategy.CdnBase;
import com.example.demo.strategy.CdnStategy.CloudinaryStrategy;
import com.example.demo.strategy.CdnStategy.S3Strategy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class CdnConfig {

    @Bean
    @ConditionalOnProperty(name = "cdn.provider", havingValue = "cloudinary")
    public CdnBase cloudinaryCdn() {
        return new CloudinaryStrategy();
    }

    @Bean
    @ConditionalOnProperty(name = "cdn.provider", havingValue = "s3")
    public CdnBase s3Cdn(
            S3Client s3Client,

            @Value("${aws.s3.bucket-name}") String bucketName,
            @Value("${aws.s3.region}") String region,
            @Value("${aws.s3.base-prefix:uploads}") String basePrefix
    ) {
        System.out.println(">>> BUCKET: [" + bucketName + "]");
        System.out.println(">>> REGION: [" + region + "]");
        System.out.println(">>> PREFIX: [" + basePrefix + "]");

        return new S3Strategy(s3Client, bucketName, region, basePrefix);
    }
}
const VERCEL_BLOB_STORE_ID = process.env.BLOB_READ_WRITE_TOKEN?.match(
  /^vercel_blob_rw_([a-z0-9]+)_[a-z0-9]+$/i,
)?.[1].toLowerCase();

const VERCEL_BLOB_HOSTNAME = VERCEL_BLOB_STORE_ID
  ? `${VERCEL_BLOB_STORE_ID}.public.blob.vercel-storage.com`
  : undefined;

const AWS_S3_HOSTNAME =
  process.env.NEXT_PUBLIC_AWS_S3_BUCKET &&
  process.env.NEXT_PUBLIC_AWS_S3_REGION
    // eslint-disable-next-line max-len
    ? `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}`
    : undefined;

const NEXT_PUBLIC_UPYUN_HOSTNAME =
  process.env.NEXT_PUBLIC_UPYUN_SERVICE_NAME &&
    process.env.UPYUN_OPERATOR_NAME &&
    process.env.UPYUN_OPERATOR_PASSWORD &&
    process.env.NEXT_PUBLIC_UPYUN_HOSTNAME ? process.env.NEXT_PUBLIC_UPYUN_HOSTNAME : undefined;

const createRemotePattern = (hostname) => hostname
  ? {
    protocol: 'https',
    hostname,
    port: '',
    pathname: '/**',
  }
  : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    imageSizes: [200],
    remotePatterns: []
      .concat(createRemotePattern(VERCEL_BLOB_HOSTNAME))
      .concat(createRemotePattern(AWS_S3_HOSTNAME))
      .concat(createRemotePattern(NEXT_PUBLIC_UPYUN_HOSTNAME)),
    minimumCacheTTL: 31536000,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

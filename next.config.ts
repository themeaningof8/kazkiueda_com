import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { codecovNextJSWebpackPlugin } from "@codecov/nextjs-webpack-plugin";

const nextConfig: NextConfig = {
  reactCompiler: false,
  // ビルドキャッシュの設定（CI環境での高速化）
  outputFileTracingRoot: process.cwd(),
  generateBuildId: async () => {
    // ビルドIDを安定化してキャッシュを有効活用
    return 'build-cache-' + process.env.NODE_ENV || 'development';
  },
  images: {
    // WebP形式を優先的に使用（ブラウザ対応状況に応じて自動選択）
    formats: ["image/webp", "image/avif"],
    // レスポンシブ画像のサイズ設定（デスクトップ）
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // ソース画像のサイズ設定（モバイル・タブレット）
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // キャッシュの最小TTL（1時間）
    minimumCacheTTL: 3600,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "76af08db67636a04c9430454243759ba.r2.cloudflarestorage.com",
        pathname: "/kazkiueda/**",
      },
      // ローカル開発用
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  webpack: (config, options) => {
    config.plugins.push(
      codecovNextJSWebpackPlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
        bundleName: "kazkiueda_com",
        uploadToken: process.env.CODECOV_TOKEN,
        webpack: options.webpack,
      }),
    );
    return config;
  },
};

export default withPayload(nextConfig);

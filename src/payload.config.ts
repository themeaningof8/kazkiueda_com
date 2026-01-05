import { buildConfig, type Config } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { env, isProduction, isDevelopment } from './lib/env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

console.log(`[Payload Config] Running with isDevelopment=${isDevelopment}, isProduction=${isProduction}`)

/**
 * R2ストレージ設定の構築
 * 環境変数が全て設定されている場合のみ設定を返す
 */
function buildStorageConfig() {
  const hasFullR2Config =
    env.S3_BUCKET &&
    env.S3_ENDPOINT &&
    env.S3_ACCESS_KEY_ID &&
    env.S3_SECRET_ACCESS_KEY

  if (!hasFullR2Config) {
    return null
  }

  // env.tsで検証済みのため、非nullアサーションは安全
  return {
    bucket: env.S3_BUCKET!,
    endpoint: env.S3_ENDPOINT!,
    accessKeyId: env.S3_ACCESS_KEY_ID!,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
    region: env.S3_REGION || 'auto',
  }
}

/**
 * R2ストレージプラグインの構築（環境変数が設定されている場合のみ有効化）
 */
const buildPlugins = (): ReturnType<typeof s3Storage>[] => {
  const plugins: ReturnType<typeof s3Storage>[] = []
  const storageConfig = buildStorageConfig()

  if (storageConfig) {
    plugins.push(
      s3Storage({
        collections: {
          media: true,
        },
        bucket: storageConfig.bucket,
        config: {
          endpoint: storageConfig.endpoint,
          credentials: {
            accessKeyId: storageConfig.accessKeyId,
            secretAccessKey: storageConfig.secretAccessKey,
          },
          region: storageConfig.region,
          forcePathStyle: true,
        },
      }),
    )
  }

  return plugins
}

// メールアダプターの設定（環境変数が設定されている場合のみ）
function getEmailAdapter() {
  if (env.RESEND_API_KEY) {
    return resendAdapter({
      defaultFromAddress: env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      defaultFromName: env.RESEND_FROM_NAME || 'Your App',
      apiKey: env.RESEND_API_KEY,
    });
  }
  return undefined;
}

// ベース設定
const baseConfig: Config = {
  // Rich Text Editor configuration
  editor: lexicalEditor({}),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
      // 本番環境でのパフォーマンス最適化
      ...(isProduction && {
        max: 20, // 最大プールサイズ
        idleTimeoutMillis: 30000, // アイドル接続のタイムアウト（30秒）
        connectionTimeoutMillis: 2000, // 接続タイムアウト（2秒）
      }),
    },
    push: isDevelopment,
  }),
  // Define your collections here - you'll probably need at least one
  collections: [Users, Media, Posts],
  // Define your globals here - these are singletons across your application
  globals: [],
  // Your Payload secret - should be a long, random string in production
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: buildPlugins(),
  sharp,
  onInit: async (payload) => {
    // 初回ユーザー作成の案内
    const usersCount = await payload.count({ collection: 'users' });
    if (usersCount.totalDocs === 0) {
      console.warn('No users found. Please create your first admin user at /admin');
    }
    // ストレージ設定の確認
    const storageConfig = buildStorageConfig();
    if (storageConfig) {
      console.info({ storageType: 'r2' }, 'Cloudflare R2 storage is configured');
    } else {
      console.info({ storageType: 'local' }, 'Using local storage (set R2 environment variables to use Cloudflare R2)');
    }
  },
};

// メールアダプターが設定されている場合のみ追加
const emailAdapter = getEmailAdapter();
const config: Config = emailAdapter ? { ...baseConfig, email: emailAdapter } : baseConfig;

export default buildConfig(config);

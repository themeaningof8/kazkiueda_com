import type { CollectionConfig } from "payload";
import { getSiteUrl } from "@/lib/config/site";
import { env } from "@/lib/env";
import { generateSlugFromTitle, validateSlug } from "@/lib/validators/slug";
import { validateTag, validateTagsArray } from "@/lib/validators/tag";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: {
    singular: "記事",
    plural: "記事",
  },
  admin: {
    useAsTitle: "title",
    // _status は Payload drafts 機能で自動管理されるため、status は表示しない
    // 代わりに updatedAt を表示（_status は UI で自動表示される）
    defaultColumns: ["title", "author", "publishedDate", "updatedAt"],
    group: "コンテンツ",
    description: "ブログ記事を管理します",
    listSearchableFields: ["title", "slug"],
    preview: (doc) => {
      const previewSecret = env.PAYLOAD_PREVIEW_SECRET;

      if (!doc?.slug || !previewSecret) {
        return null;
      }

      const baseUrl = getSiteUrl();

      const params = new URLSearchParams({
        slug: String(doc.slug),
        collection: "posts",
        path: `/posts/${doc.slug}`,
        previewSecret,
      });

      return `${baseUrl}/preview?${params.toString()}`;
    },
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req }) => {
      // 未ログインは公開済みのみ。ログイン済みは全件アクセス可（drafts含む）
      if (req.user) {
        return true;
      }

      return {
        _status: {
          equals: "published",
        },
      };
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "タイトル",
      index: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      label: "スラッグ",
      admin: {
        position: "sidebar",
        description: "URLに使用される文字列（例: my-blog-post）",
      },
      validate: validateSlug,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // スラッグが未入力の場合のみ、タイトルから自動生成を試みる
            if (value) return value; // 既存のスラッグを保持

            if (!data?.title) return undefined;

            return generateSlugFromTitle(data.title);
          },
        ],
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      label: "抜粋",
      admin: {
        description: "記事の要約（SEOや一覧表示に使用）",
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
      label: "本文",
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      label: "アイキャッチ画像",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "publishedDate",
      type: "date",
      label: "公開日",
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            // 公開状態になったときに自動的に公開日を設定
            // _status は Payload drafts 機能で管理される標準フィールド
            if (siblingData._status === "published" && !value) {
              return new Date();
            }
            return value;
          },
        ],
      },
    },
    {
      name: "tags",
      type: "array",
      label: "タグ",
      admin: {
        position: "sidebar",
      },
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
          validate: validateTag,
        },
      ],
      validate: validateTagsArray,
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      required: true,
      label: "作成者",
      admin: {
        position: "sidebar",
      },
      defaultValue: ({ user }) => (user ? user.id : undefined),
    },
  ],
  defaultSort: "-createdAt",
  timestamps: true,
  indexes: [
    // 公開記事の一覧取得を最適化（_statusとpublishedDateの組み合わせ）
    // _status は Payload drafts 機能で管理される標準フィールド
    {
      fields: ["_status", "publishedDate"],
    },
  ],
};

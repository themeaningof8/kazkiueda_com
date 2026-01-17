/**
 * Post Entity - ドメイン層の記事エンティティ
 *
 * ビジネスルール:
 * - 記事は公開状態（draft/published）を持つ
 * - 公開済み記事は公開日を持つ
 * - すべての記事はタイトルとコンテンツを持つ
 * - スラグは一意で、URL構成に使用される
 */

export type PostStatus = "draft" | "published";

export type PostId = number;

export interface PostContent {
  root: {
    type: string;
    children: Array<{
      type: unknown;
      version: number;
      [k: string]: unknown;
    }>;
    direction: ("ltr" | "rtl") | null;
    format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    indent: number;
    version: number;
  };
  [k: string]: unknown;
}

export interface PostTag {
  tag: string;
  id?: string;
}

export interface PostProps {
  id: PostId;
  title: string;
  slug: string;
  excerpt?: string;
  content: PostContent;
  featuredImageId?: number;
  publishedDate?: Date;
  tags: PostTag[];
  authorId: number;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Post エンティティクラス
 */
export class Post {
  private constructor(private readonly props: PostProps) {}

  /**
   * ファクトリーメソッド: 新規記事作成
   */
  static create(props: Omit<PostProps, "id" | "createdAt" | "updatedAt">): Post {
    return new Post({
      ...props,
      id: 0, // インフラ層で採番
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * ファクトリーメソッド: 既存記事の再構築（リポジトリから取得時）
   */
  static reconstruct(props: PostProps): Post {
    return new Post(props);
  }

  // ゲッター
  get id(): PostId {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get slug(): string {
    return this.props.slug;
  }

  get excerpt(): string | undefined {
    return this.props.excerpt;
  }

  get content(): PostContent {
    return this.props.content;
  }

  get featuredImageId(): number | undefined {
    return this.props.featuredImageId;
  }

  get publishedDate(): Date | undefined {
    return this.props.publishedDate;
  }

  get tags(): PostTag[] {
    return this.props.tags;
  }

  get authorId(): number {
    return this.props.authorId;
  }

  get status(): PostStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ビジネスロジック

  /**
   * 記事が公開済みかどうか
   */
  isPublished(): boolean {
    return this.props.status === "published";
  }

  /**
   * 記事がドラフトかどうか
   */
  isDraft(): boolean {
    return this.props.status === "draft";
  }

  /**
   * 特定のタグを持っているかチェック
   */
  hasTag(tagName: string): boolean {
    return this.props.tags.some((t) => t.tag === tagName);
  }

  /**
   * アイキャッチ画像を持っているかチェック
   */
  hasFeaturedImage(): boolean {
    return this.props.featuredImageId !== undefined;
  }

  /**
   * 記事を公開する
   * - ステータスをpublishedに変更
   * - 公開日を設定（初回公開時のみ）
   */
  publish(): Post {
    const publishedDate = this.props.publishedDate ?? new Date();

    return new Post({
      ...this.props,
      status: "published",
      publishedDate,
      updatedAt: new Date(),
    });
  }

  /**
   * 記事をドラフトに戻す
   */
  unpublish(): Post {
    return new Post({
      ...this.props,
      status: "draft",
      updatedAt: new Date(),
    });
  }

  /**
   * タイトルを更新
   */
  updateTitle(title: string): Post {
    return new Post({
      ...this.props,
      title,
      updatedAt: new Date(),
    });
  }

  /**
   * コンテンツを更新
   */
  updateContent(content: PostContent): Post {
    return new Post({
      ...this.props,
      content,
      updatedAt: new Date(),
    });
  }

  /**
   * タグを追加
   */
  addTag(tag: PostTag): Post {
    // 既に同じタグがあれば追加しない
    if (this.hasTag(tag.tag)) {
      return this;
    }

    return new Post({
      ...this.props,
      tags: [...this.props.tags, tag],
      updatedAt: new Date(),
    });
  }

  /**
   * タグを削除
   */
  removeTag(tagName: string): Post {
    return new Post({
      ...this.props,
      tags: this.props.tags.filter((t) => t.tag !== tagName),
      updatedAt: new Date(),
    });
  }

  /**
   * エンティティの等価性チェック
   */
  equals(other: Post): boolean {
    if (!(other instanceof Post)) {
      return false;
    }
    return this.props.id === other.props.id;
  }

  /**
   * エンティティのコピー（イミュータブル）
   */
  clone(): Post {
    return new Post({ ...this.props });
  }
}

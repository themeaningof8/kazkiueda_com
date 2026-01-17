/**
 * Media Entity - ドメイン層のメディアエンティティ
 *
 * ビジネスルール:
 * - メディアはファイル（画像等）を表現する
 * - メディアは複数のサイズ（thumbnail, card）を持つ場合がある
 * - altテキストは画像のアクセシビリティに重要
 */

export type MediaId = number;

export interface MediaTag {
  tag: string;
  id?: string;
}

export interface MediaSize {
  url: string;
  width: number;
  height: number;
  mimeType: string;
  filesize: number;
  filename: string;
}

export interface MediaSizes {
  thumbnail?: MediaSize;
  card?: MediaSize;
}

export interface MediaProps {
  id: MediaId;
  url: string;
  filename: string;
  mimeType: string;
  filesize: number;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  credit?: string;
  tags: MediaTag[];
  thumbnailURL?: string;
  sizes?: MediaSizes;
  focalX?: number;
  focalY?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Media エンティティクラス
 */
export class Media {
  private constructor(private readonly props: MediaProps) {}

  /**
   * ファクトリーメソッド: 新規メディア作成
   */
  static create(props: Omit<MediaProps, "id" | "createdAt" | "updatedAt">): Media {
    return new Media({
      ...props,
      id: 0, // インフラ層で採番
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * ファクトリーメソッド: 既存メディアの再構築（リポジトリから取得時）
   */
  static reconstruct(props: MediaProps): Media {
    return new Media(props);
  }

  // ゲッター
  get id(): MediaId {
    return this.props.id;
  }

  get url(): string {
    return this.props.url;
  }

  get filename(): string {
    return this.props.filename;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get filesize(): number {
    return this.props.filesize;
  }

  get width(): number | undefined {
    return this.props.width;
  }

  get height(): number | undefined {
    return this.props.height;
  }

  get alt(): string | undefined {
    return this.props.alt;
  }

  get caption(): string | undefined {
    return this.props.caption;
  }

  get credit(): string | undefined {
    return this.props.credit;
  }

  get tags(): MediaTag[] {
    return this.props.tags;
  }

  get thumbnailURL(): string | undefined {
    return this.props.thumbnailURL;
  }

  get sizes(): MediaSizes | undefined {
    return this.props.sizes;
  }

  get focalX(): number | undefined {
    return this.props.focalX;
  }

  get focalY(): number | undefined {
    return this.props.focalY;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ビジネスロジック

  /**
   * 画像かどうか
   */
  isImage(): boolean {
    return this.props.mimeType.startsWith("image/");
  }

  /**
   * altテキストを持っているかチェック
   */
  hasAlt(): boolean {
    return this.props.alt !== undefined && this.props.alt.trim().length > 0;
  }

  /**
   * サムネイルを持っているかチェック
   */
  hasThumbnail(): boolean {
    return this.props.thumbnailURL !== undefined || this.props.sizes?.thumbnail !== undefined;
  }

  /**
   * サムネイルURLを取得（優先順位: sizes.thumbnail.url > thumbnailURL）
   */
  getThumbnailURL(): string | undefined {
    return this.props.sizes?.thumbnail?.url ?? this.props.thumbnailURL;
  }

  /**
   * カードサイズの画像を持っているかチェック
   */
  hasCardSize(): boolean {
    return this.props.sizes?.card !== undefined;
  }

  /**
   * 特定のタグを持っているかチェック
   */
  hasTag(tagName: string): boolean {
    return this.props.tags.some((t) => t.tag === tagName);
  }

  /**
   * アスペクト比を計算
   */
  getAspectRatio(): number | undefined {
    if (this.props.width && this.props.height) {
      return this.props.width / this.props.height;
    }
    return undefined;
  }

  /**
   * altテキストを更新
   */
  updateAlt(alt: string): Media {
    return new Media({
      ...this.props,
      alt,
      updatedAt: new Date(),
    });
  }

  /**
   * キャプションを更新
   */
  updateCaption(caption: string): Media {
    return new Media({
      ...this.props,
      caption,
      updatedAt: new Date(),
    });
  }

  /**
   * タグを追加
   */
  addTag(tag: MediaTag): Media {
    // 既に同じタグがあれば追加しない
    if (this.hasTag(tag.tag)) {
      return this;
    }

    return new Media({
      ...this.props,
      tags: [...this.props.tags, tag],
      updatedAt: new Date(),
    });
  }

  /**
   * タグを削除
   */
  removeTag(tagName: string): Media {
    return new Media({
      ...this.props,
      tags: this.props.tags.filter((t) => t.tag !== tagName),
      updatedAt: new Date(),
    });
  }

  /**
   * エンティティの等価性チェック
   */
  equals(other: Media): boolean {
    if (!(other instanceof Media)) {
      return false;
    }
    return this.props.id === other.props.id;
  }

  /**
   * エンティティのコピー（イミュータブル）
   */
  clone(): Media {
    return new Media({ ...this.props });
  }
}

/**
 * Pagination Value Object
 *
 * ページネーション情報をカプセル化
 * - ページ番号は1から開始
 * - 不正な値はエラー
 */

export interface PaginationProps {
  page: number;
  limit: number;
  totalDocs: number;
}

export class Pagination {
  private readonly props: PaginationProps;

  private constructor(props: PaginationProps) {
    this.props = props;
  }

  /**
   * Paginationを作成（バリデーション付き）
   */
  static create(page: number, limit: number, totalDocs: number): Pagination {
    if (page < 1) {
      throw new Error("ページ番号は1以上である必要があります");
    }

    if (limit < 1) {
      throw new Error("1ページあたりの件数は1以上である必要があります");
    }

    if (totalDocs < 0) {
      throw new Error("総件数は0以上である必要があります");
    }

    return new Pagination({ page, limit, totalDocs });
  }

  /**
   * 現在のページ番号
   */
  get page(): number {
    return this.props.page;
  }

  /**
   * 1ページあたりの件数
   */
  get limit(): number {
    return this.props.limit;
  }

  /**
   * 総件数
   */
  get totalDocs(): number {
    return this.props.totalDocs;
  }

  /**
   * 総ページ数を計算
   */
  get totalPages(): number {
    return Math.ceil(this.props.totalDocs / this.props.limit);
  }

  /**
   * 次のページがあるか
   */
  hasNextPage(): boolean {
    return this.props.page < this.totalPages;
  }

  /**
   * 前のページがあるか
   */
  hasPrevPage(): boolean {
    return this.props.page > 1;
  }

  /**
   * 最初のページか
   */
  isFirstPage(): boolean {
    return this.props.page === 1;
  }

  /**
   * 最後のページか
   */
  isLastPage(): boolean {
    return this.props.page === this.totalPages;
  }

  /**
   * スキップする件数（offset）
   */
  getOffset(): number {
    return (this.props.page - 1) * this.props.limit;
  }

  /**
   * 次のページ番号を取得
   */
  getNextPage(): number | undefined {
    return this.hasNextPage() ? this.props.page + 1 : undefined;
  }

  /**
   * 前のページ番号を取得
   */
  getPrevPage(): number | undefined {
    return this.hasPrevPage() ? this.props.page - 1 : undefined;
  }

  /**
   * 値オブジェクトの等価性チェック
   */
  equals(other: Pagination): boolean {
    if (!(other instanceof Pagination)) {
      return false;
    }
    return (
      this.props.page === other.props.page &&
      this.props.limit === other.props.limit &&
      this.props.totalDocs === other.props.totalDocs
    );
  }
}

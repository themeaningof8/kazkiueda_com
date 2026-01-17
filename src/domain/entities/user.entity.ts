/**
 * User Entity - ドメイン層のユーザーエンティティ
 *
 * ビジネスルール:
 * - ユーザーはロール（admin/editor/user）を持つ
 * - すべてのユーザーはメールアドレスを持つ（一意）
 * - 名前はオプション
 */

export type UserId = number;

export type UserRole = "admin" | "editor" | "user";

export interface UserProps {
  id: UserId;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User エンティティクラス
 */
export class User {
  private constructor(private readonly props: UserProps) {}

  /**
   * ファクトリーメソッド: 新規ユーザー作成
   */
  static create(props: Omit<UserProps, "id" | "createdAt" | "updatedAt">): User {
    return new User({
      ...props,
      id: 0, // インフラ層で採番
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * ファクトリーメソッド: 既存ユーザーの再構築（リポジトリから取得時）
   */
  static reconstruct(props: UserProps): User {
    return new User(props);
  }

  // ゲッター
  get id(): UserId {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string | undefined {
    return this.props.name;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ビジネスロジック

  /**
   * 管理者かどうか
   */
  isAdmin(): boolean {
    return this.props.role === "admin";
  }

  /**
   * 編集者かどうか
   */
  isEditor(): boolean {
    return this.props.role === "editor";
  }

  /**
   * 一般ユーザーかどうか
   */
  isUser(): boolean {
    return this.props.role === "user";
  }

  /**
   * 記事の編集権限を持つか（adminまたはeditor）
   */
  canEditPosts(): boolean {
    return this.isAdmin() || this.isEditor();
  }

  /**
   * 名前を持っているかチェック
   */
  hasName(): boolean {
    return this.props.name !== undefined && this.props.name.trim().length > 0;
  }

  /**
   * 表示名を取得（名前がない場合はメールアドレス）
   */
  getDisplayName(): string {
    return this.hasName() ? (this.props.name as string) : this.props.email;
  }

  /**
   * 名前を更新
   */
  updateName(name: string): User {
    return new User({
      ...this.props,
      name,
      updatedAt: new Date(),
    });
  }

  /**
   * ロールを変更
   */
  changeRole(role: UserRole): User {
    return new User({
      ...this.props,
      role,
      updatedAt: new Date(),
    });
  }

  /**
   * エンティティの等価性チェック
   */
  equals(other: User): boolean {
    if (!(other instanceof User)) {
      return false;
    }
    return this.props.id === other.props.id;
  }

  /**
   * エンティティのコピー（イミュータブル）
   */
  clone(): User {
    return new User({ ...this.props });
  }
}

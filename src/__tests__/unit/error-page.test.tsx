import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ErrorPage } from "@/components/error-page";

describe("ErrorPage", () => {
  // navigator.onLineのモック用
  let onLineSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // navigator.onLineをモック
    onLineSpy = vi.spyOn(window.navigator, "onLine", "get");
    onLineSpy.mockReturnValue(true);
  });

  afterEach(() => {
    onLineSpy.mockRestore();
  });

  describe("エラータイプごとの表示", () => {
    test("networkエラーの場合、接続エラーが表示される", () => {
      render(<ErrorPage error={{ type: "network" }} />);
      expect(screen.getByText("接続エラー")).toBeInTheDocument();
      expect(
        screen.getByText("ネットワークに接続できません。インターネット接続を確認してください。"),
      ).toBeInTheDocument();
    });

    test("serverエラーの場合、サーバーエラーが表示される", () => {
      render(<ErrorPage error={{ type: "server" }} />);
      expect(screen.getByText("サーバーエラー")).toBeInTheDocument();
      expect(
        screen.getByText("サーバーで問題が発生しました。しばらく経ってから再度お試しください。"),
      ).toBeInTheDocument();
    });

    test("timeoutエラーの場合、タイムアウトが表示される", () => {
      render(<ErrorPage error={{ type: "timeout" }} />);
      expect(screen.getByText("タイムアウト")).toBeInTheDocument();
      expect(
        screen.getByText("読み込みに時間がかかっています。ネットワーク接続を確認してください。"),
      ).toBeInTheDocument();
    });

    test("not_foundエラーの場合、ページが見つかりませんが表示される", () => {
      render(<ErrorPage error={{ type: "not_found" }} />);
      expect(screen.getByText("ページが見つかりません")).toBeInTheDocument();
      expect(
        screen.getByText("お探しのページは存在しないか、移動した可能性があります。"),
      ).toBeInTheDocument();
    });

    test("unknownエラーの場合、デフォルトのエラーメッセージが表示される", () => {
      render(<ErrorPage error={{ type: "unknown" }} />);
      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
      expect(
        screen.getByText("予期しないエラーが発生しました。再度お試しください。"),
      ).toBeInTheDocument();
    });

    test("エラーが指定されていない場合、デフォルトのエラーメッセージが表示される", () => {
      render(<ErrorPage />);
      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
      expect(
        screen.getByText("予期しないエラーが発生しました。再度お試しください。"),
      ).toBeInTheDocument();
    });
  });

  describe("オフライン状態の処理", () => {
    test("オフライン状態の場合、オフラインメッセージが表示される", () => {
      onLineSpy.mockReturnValue(false);
      render(<ErrorPage error={{ type: "server" }} />);

      expect(screen.getByText("オフライン")).toBeInTheDocument();
      expect(
        screen.getByText("インターネットに接続されていません。接続を確認して再度お試しください。"),
      ).toBeInTheDocument();
    });

    test("オンラインイベントが発生すると、エラーメッセージが表示される", async () => {
      onLineSpy.mockReturnValue(false);
      render(<ErrorPage error={{ type: "server" }} />);

      // 最初はオフライン状態
      expect(screen.getByText("オフライン")).toBeInTheDocument();

      // オンラインイベントを発火
      onLineSpy.mockReturnValue(true);
      window.dispatchEvent(new Event("online"));

      // サーバーエラーが表示される
      await waitFor(() => {
        expect(screen.getByText("サーバーエラー")).toBeInTheDocument();
      });
    });

    test("オフラインイベントが発生すると、オフラインメッセージが表示される", async () => {
      onLineSpy.mockReturnValue(true);
      render(<ErrorPage error={{ type: "server" }} />);

      // 最初はサーバーエラー
      expect(screen.getByText("サーバーエラー")).toBeInTheDocument();

      // オフラインイベントを発火
      onLineSpy.mockReturnValue(false);
      window.dispatchEvent(new Event("offline"));

      // オフラインメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText("オフライン")).toBeInTheDocument();
      });
    });
  });

  describe("オプショナルなエラーメッセージ", () => {
    test("error.messageが指定されている場合、追加メッセージが表示される", () => {
      render(<ErrorPage error={{ type: "server", message: "詳細なエラーメッセージ" }} />);
      expect(screen.getByText("詳細なエラーメッセージ")).toBeInTheDocument();
      expect(
        screen.getByText("サーバーで問題が発生しました。しばらく経ってから再度お試しください。"),
      ).toBeInTheDocument();
    });

    test("error.messageが指定されていない場合、追加メッセージは表示されない", () => {
      const { container } = render(<ErrorPage error={{ type: "server" }} />);
      const paragraphs = container.querySelectorAll("p");
      // メインメッセージのみ表示される（追加メッセージなし）
      expect(paragraphs).toHaveLength(1);
    });
  });

  describe("リトライボタンの動作", () => {
    test("onRetryが指定されている場合、リトライボタンが表示される", () => {
      const onRetry = vi.fn();
      render(<ErrorPage error={{ type: "server" }} onRetry={onRetry} />);
      expect(screen.getByRole("button", { name: "再読み込み" })).toBeInTheDocument();
    });

    test("リトライボタンをクリックすると、onRetryが呼ばれる", () => {
      const onRetry = vi.fn();
      render(<ErrorPage error={{ type: "server" }} onRetry={onRetry} />);

      const retryButton = screen.getByRole("button", { name: "再読み込み" });
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    test("各エラータイプで適切なアクションテキストが表示される", () => {
      const onRetry = vi.fn();

      const { rerender } = render(<ErrorPage error={{ type: "network" }} onRetry={onRetry} />);
      expect(screen.getByRole("button", { name: "再接続" })).toBeInTheDocument();

      rerender(<ErrorPage error={{ type: "server" }} onRetry={onRetry} />);
      expect(screen.getByRole("button", { name: "再読み込み" })).toBeInTheDocument();

      rerender(<ErrorPage error={{ type: "timeout" }} onRetry={onRetry} />);
      expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();

      rerender(<ErrorPage error={{ type: "not_found" }} onRetry={onRetry} />);
      expect(screen.getByRole("button", { name: "ホームに戻る" })).toBeInTheDocument();
    });
  });

  describe("自動リロードボタンの動作", () => {
    test("timeoutエラーでonRetryがない場合、再読み込みボタンが表示される", () => {
      render(<ErrorPage error={{ type: "timeout" }} />);
      expect(screen.getByRole("button", { name: "再読み込み" })).toBeInTheDocument();
    });

    test("networkエラーでonRetryがない場合、再読み込みボタンが表示される", () => {
      render(<ErrorPage error={{ type: "network" }} />);
      expect(screen.getByRole("button", { name: "再読み込み" })).toBeInTheDocument();
    });

    test("serverエラーでonRetryがない場合、再読み込みボタンは表示されない", () => {
      render(<ErrorPage error={{ type: "server" }} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    test("再読み込みボタンをクリックすると、window.location.reloadが呼ばれる", () => {
      const reloadSpy = vi.spyOn(window.location, "reload").mockImplementation(() => {});

      render(<ErrorPage error={{ type: "timeout" }} />);

      const reloadButton = screen.getByRole("button", { name: "再読み込み" });
      fireEvent.click(reloadButton);

      expect(reloadSpy).toHaveBeenCalledTimes(1);

      reloadSpy.mockRestore();
    });
  });

  describe("イベントリスナーのクリーンアップ", () => {
    test("コンポーネントのアンマウント時にイベントリスナーが削除される", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = render(<ErrorPage error={{ type: "server" }} />);

      // イベントリスナーが追加されている
      expect(addEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));

      unmount();

      // イベントリスナーが削除されている
      expect(removeEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
});

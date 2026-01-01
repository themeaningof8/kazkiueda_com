"use client";

import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ErrorPageProps {
  error?: {
    type: 'network' | 'server' | 'timeout' | 'not_found' | 'unknown';
    message?: string;
  };
  onRetry?: () => void;
}

/**
 * 汎用エラーページコンポーネント
 * Error Handlingテストに対応したエラーメッセージを表示
 */
export function ErrorPage({ error, onRetry }: ErrorPageProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // ネットワーク状態の監視
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初期状態を設定
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getErrorContent = () => {
    // オフライン状態の場合はネットワークエラーを優先
    if (!isOnline) {
      return {
        icon: <WifiOff className="h-12 w-12 text-red-500" />,
        title: "オフライン",
        message: "インターネットに接続されていません。接続を確認して再度お試しください。",
        actionText: "再接続",
      };
    }

    switch (error?.type) {
      case 'network':
        return {
          icon: <WifiOff className="h-12 w-12 text-red-500" />,
          title: "接続エラー",
          message: "ネットワークに接続できません。インターネット接続を確認してください。",
          actionText: "再接続",
        };
      case 'server':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-orange-500" />,
          title: "サーバーエラー",
          message: "サーバーで問題が発生しました。しばらく経ってから再度お試しください。",
          actionText: "再読み込み",
        };
      case 'timeout':
        return {
          icon: <RefreshCw className="h-12 w-12 text-yellow-500" />,
          title: "タイムアウト",
          message: "読み込みに時間がかかっています。ネットワーク接続を確認してください。",
          actionText: "再試行",
        };
      case 'not_found':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-gray-500" />,
          title: "ページが見つかりません",
          message: "お探しのページは存在しないか、移動した可能性があります。",
          actionText: "ホームに戻る",
        };
      default:
        return {
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          title: "エラーが発生しました",
          message: "予期しないエラーが発生しました。再度お試しください。",
          actionText: "再読み込み",
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6">
        {content.icon}
      </div>

      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {content.title}
      </h1>

      <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
        {content.message}
      </p>

      {error?.message && (
        <p className="mb-8 max-w-md text-sm text-gray-500 dark:text-gray-500">
          {error.message}
        </p>
      )}

      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          {content.actionText}
        </Button>
      )}

      {/* リトライボタンの追加表示（特定のエラータイプの場合） */}
      {(error?.type === 'timeout' || error?.type === 'network') && !onRetry && (
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          再読み込み
        </Button>
      )}
    </div>
  );
}

/**
 * ネットワークエラー専用のコンポーネント
 * Error Handlingテストの「ネットワーク完全遮断時の挙動」に対応
 */
export function NetworkErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorPage
      error={{ type: 'network' }}
      onRetry={onRetry}
    />
  );
}

/**
 * サーバーエラー専用のコンポーネント
 * Error Handlingテストの「500エラー時の挙動」に対応
 */
export function ServerErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorPage
      error={{ type: 'server' }}
      onRetry={onRetry}
    />
  );
}

/**
 * タイムアウトエラー専用のコンポーネント
 * Error Handlingテストの「タイムアウト時の挙動」に対応
 */
export function TimeoutErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorPage
      error={{ type: 'timeout' }}
      onRetry={onRetry}
    />
  );
}
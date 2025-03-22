import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('有効なメールアドレスを入力してください');
      return;
    }

    setStatus('loading');

    try {
      // ここではダミーのAPIコールをシミュレートしています
      await new Promise(resolve => setTimeout(resolve, 800));

      // サインアップ成功
      setStatus('success');
      setEmail('');
    } catch (error) {
      // エラー処理
      setStatus('error');
      setErrorMessage('サインアップ中にエラーが発生しました。後でもう一度お試しください。');
      console.error('Newsletter signup error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {status === 'success' ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="font-medium">サインアップありがとうございます！</p>
          <p className="text-sm mt-1">最新情報をお届けします。</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              メールアドレス
            </label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={status === 'loading'}
                className={status === 'error' ? 'border-red-300' : ''}
              />
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="whitespace-nowrap"
              >
                {status === 'loading' ? (
                  <>
                    <span className="mr-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                    </span>
                    送信中...
                  </>
                ) : (
                  '登録する'
                )}
              </Button>
            </div>
            {status === 'error' && (
              <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            登録することにより、当社の
            <a href="/privacy" className="underline hover:text-primary">
              プライバシーポリシー
            </a>
            に同意したことになります。
          </p>
        </form>
      )}
    </div>
  );
} 
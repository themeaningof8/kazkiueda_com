import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export function SearchIsland() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string, title: string, url: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);

    try {
      // ここでは実際の検索ロジックを実装します
      // 例として、3秒後にダミーの結果を返すシミュレーションをしています
      await new Promise(resolve => setTimeout(resolve, 300));

      setResults([
        { id: '1', title: 'フロントエンドの最適化技術', url: '/blog/frontend-optimization' },
        { id: '2', title: 'アイランドアーキテクチャ入門', url: '/blog/island-architecture' },
        { id: '3', title: 'パフォーマンスとUXのバランス', url: '/blog/performance-ux-balance' },
      ].filter(item => item.title.toLowerCase().includes(query.toLowerCase())));
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="記事を検索..."
            className="w-full pr-10"
            aria-label="検索"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            disabled={isSearching}
            aria-label="検索実行"
          >
            {isSearching ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            )}
          </Button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y">
            {results.map((result) => (
              <li key={result.id}>
                <a
                  href={result.url}
                  className="block p-4 hover:bg-muted transition-colors"
                >
                  {result.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {query && results.length === 0 && !isSearching && (
        <div className="text-center p-4 text-muted-foreground">
          検索結果が見つかりませんでした
        </div>
      )}
    </div>
  );
} 
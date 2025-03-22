/**
 * Cloudflare Workers向けのエントリーポイント
 * Astroで構築されたアプリケーションをCloudflare環境で実行するためのスクリプト
 */

export { onRequest } from '../dist/_worker.js'; 
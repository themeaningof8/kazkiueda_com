import type { Payload } from "payload";
import * as payloadClientFns from "./payload-client";
import type { PayloadClient } from "./types";

/**
 * PayloadClientファクトリー関数
 *
 * @param payloadInstance - 注入するPayloadインスタンス（テスト用、Phase 3で実装予定）
 * @returns PayloadClient型のオブジェクト
 */
export function createPayloadClient(_payloadInstance?: Payload | null): PayloadClient {
  // Phase 2: 既存関数をそのまま使用
  // Phase 3でpayloadInstanceの注入ロジックを実装予定

  return {
    findPayload: payloadClientFns.findPayload,
    findPostBySlug: payloadClientFns.findPostBySlug,
    findPosts: payloadClientFns.findPosts,
    findPublishedPostSlugs: payloadClientFns.findPublishedPostSlugs,
  };
}

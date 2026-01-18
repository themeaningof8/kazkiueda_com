import type { Payload } from "payload";
import * as payloadClientFns from "./payload-client";
import { clearPayloadCache, setPayloadInstance } from "./payload-client";
import type { PayloadClient } from "./types";

/**
 * PayloadClientファクトリー関数（完全版）
 *
 * @param payloadInstance - 注入するPayloadインスタンス（テスト用）
 * @returns PayloadClient型のオブジェクト
 */
export function createPayloadClient(payloadInstance?: Payload | null): PayloadClient {
  // テスト時にインスタンスを注入
  if (payloadInstance !== undefined) {
    setPayloadInstance(payloadInstance);
  }

  return {
    findPayload: payloadClientFns.findPayload,
    findPostBySlug: payloadClientFns.findPostBySlug,
    findPosts: payloadClientFns.findPosts,
    findPublishedPostSlugs: payloadClientFns.findPublishedPostSlugs,
  };
}

/**
 * PayloadClientのクリーンアップ（テスト用）
 */
export function resetPayloadClient(): void {
  clearPayloadCache();
}

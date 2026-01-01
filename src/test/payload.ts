import config from "@payload-config";
import { getPayload, type Payload } from "payload";

// テスト用途: プロセス内でPayloadインスタンスをキーごとに管理
// - キーはテストファイル名など「意図が明確な文字列」を推奨
// - vitestを複数回起動する運用（package.jsonのtest）とも相性が良い
const payloadInstances = new Map<string, Payload>();

export async function getTestPayload(testKey = "default"): Promise<Payload> {
  if (!payloadInstances.has(testKey)) {
    payloadInstances.set(testKey, await getPayload({ config }));
  }

  return payloadInstances.get(testKey)!;
}

export async function destroyTestPayload(testKey = "default") {
  const payload = payloadInstances.get(testKey);
  if (!payload) return;

  await payload.destroy();
  payloadInstances.delete(testKey);
}


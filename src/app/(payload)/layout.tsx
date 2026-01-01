import config from "@payload-config";
import { handleServerFunctions, RootLayout as PayloadRootLayout } from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import { importMap } from "./admin/importMap";
import "@payloadcms/next/css";
import "./custom.scss";

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({
    config,
    importMap,
    ...args,
  });
};

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <PayloadRootLayout config={config} serverFunction={serverFunction} importMap={importMap}>
      {children}
    </PayloadRootLayout>
  );
}

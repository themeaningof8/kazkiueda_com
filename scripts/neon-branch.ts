#!/usr/bin/env bun

/**
 * Neon Database Branch Management for GitHub Actions CI/CD
 *
 * Note: This script is used ONLY for GitHub Actions workflows (CI/E2E/Mutation tests).
 * Vercel Preview environments use Neon Vercel Integration for automatic DB branching.
 *
 * Usage:
 *   bun scripts/neon-branch.ts create                    # Create a new test branch
 *   bun scripts/neon-branch.ts delete                    # Delete a test branch
 *   bun scripts/neon-branch.ts delete-preview <branch>   # Delete a preview branch by git branch name
 *   bun scripts/neon-branch.ts list                      # List all branches
 *   bun scripts/neon-branch.ts list-preview              # List preview branches only
 *
 * DB Branch Naming:
 *   - GitHub Actions: ci-<run-id>-<attempt>-<random>
 *   - Vercel Preview: preview/<git-branch-name> (managed by Vercel Integration)
 */

export {};

const NEON_API_KEY = process.env.NEON_API_KEY;
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID;
const NEON_PARENT_BRANCH_ID = process.env.NEON_PARENT_BRANCH_ID;
const RUN_ID = process.env.GITHUB_RUN_ID || Date.now();
const RUN_ATTEMPT = process.env.GITHUB_RUN_ATTEMPT ? `-${process.env.GITHUB_RUN_ATTEMPT}` : "";
// Add random suffix to ensure uniqueness even on manual retries or overlaps
const RANDOM_SUFFIX = Math.random().toString(36).substring(2, 7);
const BRANCH_NAME = `ci-${RUN_ID}${RUN_ATTEMPT}-${RANDOM_SUFFIX}`;

if (!NEON_API_KEY || !NEON_PROJECT_ID || !NEON_PARENT_BRANCH_ID) {
  console.error("❌ Missing required environment variables:");
  console.error("   - NEON_API_KEY");
  console.error("   - NEON_PROJECT_ID");
  console.error("   - NEON_PARENT_BRANCH_ID");
  process.exit(1);
}

const API_BASE = "https://console.neon.tech/api/v2";

interface NeonBranch {
  id: string;
  name: string;
  project_id: string;
  parent_id?: string;
  created_at: string;
}

interface NeonEndpoint {
  id: string;
  host: string;
}

interface CreateBranchResponse {
  branch: NeonBranch;
  endpoints: NeonEndpoint[];
  connection_uris: Array<{
    connection_uri: string;
    connection_parameters: {
      database: string;
      password: string;
      role: string;
      host: string;
      port: number;
    };
  }>;
}

async function testConnection(uri: string): Promise<boolean> {
  try {
    const { default: pg } = await import("pg");
    const client = new pg.Client({ connectionString: uri });
    await client.connect();
    await client.query("SELECT 1");
    await client.end();
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`   ⚠️  Connection attempt failed: ${message}`);
    return false;
  }
}

async function createBranch(): Promise<void> {
  console.log(`🌿 Creating Neon branch: ${BRANCH_NAME}`);

  const response = await fetch(`${API_BASE}/projects/${NEON_PROJECT_ID}/branches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NEON_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      branch: {
        name: BRANCH_NAME,
        // Use development branch as parent (contains test data/schema)
        parent_id: NEON_PARENT_BRANCH_ID,
      },
      endpoints: [
        {
          type: "read_write",
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let error: { message?: string } | null = null;
    try {
      error = JSON.parse(errorText) as { message?: string };
    } catch {
      console.error("❌ Failed to create branch:", errorText);
      process.exit(1);
    }

    if (error?.message?.includes("branch already exists")) {
      console.error(
        `❌ Branch already exists: ${BRANCH_NAME}. This should not happen with unique run attempts.`,
      );
      process.exit(1);
    }

    console.error("❌ Failed to create branch:", errorText);
    process.exit(1);
  }

  const data = (await response.json()) as CreateBranchResponse;
  const connectionUri = data.connection_uris[0]?.connection_uri;

  if (!connectionUri) {
    console.error("❌ No connection URI returned");
    process.exit(1);
  }

  console.log("✅ Branch created successfully");
  console.log(`   Branch ID: ${data.branch.id}`);
  console.log(`   Branch Name: ${data.branch.name}`);

  // Debug connection string safely
  try {
    const uri = new URL(connectionUri);
    console.log(`   Connection: ${uri.protocol}//${uri.username}:****@${uri.host}${uri.pathname}`);
  } catch {
    console.log("   Connection URI format is non-standard, skipping debug log.");
  }

  // Wait for endpoint to be fully ready (Neon sometimes takes a few seconds)
  console.log("⏳ Waiting for database endpoint to stabilize (up to 3 minutes)...");
  let connected = false;
  const maxAttempts = 36; // 36 * 5s = 180s = 3 minutes
  const initialDelay = 10000; // Give it 10s before even trying
  const standardDelay = 5000;

  await new Promise((resolve) => setTimeout(resolve, initialDelay));

  for (let i = 1; i <= maxAttempts; i++) {
    console.log(`   Attempt ${i}/${maxAttempts}...`);
    connected = await testConnection(connectionUri);

    if (connected) {
      console.log("✅ Database is ready and authenticated");
      break;
    }

    if (i < maxAttempts) {
      // After 10 attempts, increase delay to 10s to reduce load/noise
      const currentDelay = i > 10 ? 10000 : standardDelay;
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
    }
  }

  if (!connected) {
    console.error("❌ Database failed to become ready within timeout");
    process.exit(1);
  }

  // Export environment variables for GitHub Actions
  if (process.env.GITHUB_ENV) {
    const fs = await import("node:fs");
    fs.appendFileSync(
      process.env.GITHUB_ENV,
      `NEON_DATABASE_URL=${connectionUri}\n` +
        `NEON_BRANCH_ID=${data.branch.id}\n` +
        `NEON_BRANCH_NAME=${data.branch.name}\n`,
    );
    console.log("✅ Environment variables exported to $GITHUB_ENV");
  } else {
    // Local development
    console.log("\n📋 Connection Info:");
    console.log(`   DATABASE_URL=${connectionUri}`);
    console.log(`   BRANCH_ID=${data.branch.id}`);
  }
}

async function _deleteExistingBranch(branchId: string): Promise<void> {
  console.log(`🗑️  Deleting existing Neon branch: ${branchId}`);
  const response = await fetch(`${API_BASE}/projects/${NEON_PROJECT_ID}/branches/${branchId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${NEON_API_KEY}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    console.warn("⚠️  Failed to delete existing branch:", await response.text());
  }
}

async function deleteBranch(): Promise<void> {
  const branchId = process.env.NEON_BRANCH_ID;

  if (!branchId) {
    console.error("❌ NEON_BRANCH_ID not set. Cannot delete branch.");
    process.exit(1);
  }

  console.log(`🗑️  Deleting Neon branch: ${branchId}`);

  const response = await fetch(`${API_BASE}/projects/${NEON_PROJECT_ID}/branches/${branchId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${NEON_API_KEY}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("❌ Failed to delete branch:", error);
    process.exit(1);
  }

  console.log("✅ Branch deleted successfully");
}

async function listBranches(): Promise<void> {
  console.log("📋 Listing all branches...\n");

  const response = await fetch(`${API_BASE}/projects/${NEON_PROJECT_ID}/branches`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${NEON_API_KEY}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("❌ Failed to list branches:", error);
    process.exit(1);
  }

  const data = (await response.json()) as { branches: NeonBranch[] };

  data.branches.forEach((branch) => {
    console.log(`  • ${branch.name}`);
    console.log(`    ID: ${branch.id}`);
    console.log(`    Parent: ${branch.parent_id || "none (main)"}`);
    console.log(`    Created: ${new Date(branch.created_at).toLocaleString()}`);
    console.log("");
  });

  console.log(`Total: ${data.branches.length} branches`);
}

async function deletePreviewBranch(gitBranchName: string): Promise<void> {
  const branchName = `preview/${gitBranchName}`;
  console.log(`🗑️  Deleting preview Neon branch: ${branchName}`);

  // First, find the branch by name
  const listResponse = await fetch(`${API_BASE}/projects/${NEON_PROJECT_ID}/branches`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${NEON_API_KEY}`,
      Accept: "application/json",
    },
  });

  if (!listResponse.ok) {
    const error = await listResponse.text();
    console.error("❌ Failed to list branches:", error);
    process.exit(1);
  }

  const data = (await listResponse.json()) as { branches: NeonBranch[] };
  const branch = data.branches.find((b) => b.name === branchName);

  if (!branch) {
    console.log(`⚠️  Preview branch ${branchName} not found - may have already been deleted`);
    return;
  }

  // Delete the branch
  const deleteResponse = await fetch(
    `${API_BASE}/projects/${NEON_PROJECT_ID}/branches/${branch.id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${NEON_API_KEY}`,
        Accept: "application/json",
      },
    },
  );

  if (!deleteResponse.ok) {
    const error = await deleteResponse.text();
    console.error("❌ Failed to delete preview branch:", error);
    process.exit(1);
  }

  console.log("✅ Preview branch deleted successfully");
}

async function listPreviewBranches(): Promise<void> {
  console.log("📋 Listing preview branches...\n");

  const response = await fetch(`${API_BASE}/projects/${NEON_PROJECT_ID}/branches`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${NEON_API_KEY}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("❌ Failed to list branches:", error);
    process.exit(1);
  }

  const data = (await response.json()) as { branches: NeonBranch[] };
  const previewBranches = data.branches.filter((branch) => branch.name.startsWith("preview/"));

  if (previewBranches.length === 0) {
    console.log("No preview branches found");
    return;
  }

  previewBranches.forEach((branch) => {
    console.log(`  • ${branch.name}`);
    console.log(`    ID: ${branch.id}`);
    console.log(`    Parent: ${branch.parent_id || "none (main)"}`);
    console.log(`    Created: ${new Date(branch.created_at).toLocaleString()}`);
    console.log("");
  });

  console.log(`Total preview branches: ${previewBranches.length}`);
}

// Main
const command = process.argv[2];

switch (command) {
  case "create":
    await createBranch();
    break;
  case "delete":
    await deleteBranch();
    break;
  case "delete-preview": {
    const gitBranchName = process.argv[3];
    if (!gitBranchName) {
      console.error("❌ Git branch name required for delete-preview command");
      console.error("Usage: bun scripts/neon-branch.ts delete-preview <git-branch-name>");
      process.exit(1);
    }
    await deletePreviewBranch(gitBranchName);
    break;
  }
  case "list":
    await listBranches();
    break;
  case "list-preview":
    await listPreviewBranches();
    break;
  default:
    console.error(
      "Usage: bun scripts/neon-branch.ts <create|delete|delete-preview|list|list-preview>",
    );
    process.exit(1);
}

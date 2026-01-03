#!/usr/bin/env bun

/**
 * Neon Database Branch Management for CI/CD
 *
 * Usage:
 *   bun scripts/neon-branch.ts create   # Create a new test branch
 *   bun scripts/neon-branch.ts delete   # Delete a test branch
 */

export {};

const NEON_API_KEY = process.env.NEON_API_KEY;
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID;
const NEON_PARENT_BRANCH_ID = process.env.NEON_PARENT_BRANCH_ID;
const BRANCH_NAME = `ci-${process.env.GITHUB_RUN_ID || Date.now()}`;

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
    const error = await response.text();
    console.error("❌ Failed to create branch:", error);
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

  // Export environment variables for GitHub Actions
  if (process.env.GITHUB_ENV) {
    const fs = await import("fs");
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

// Main
const command = process.argv[2];

switch (command) {
  case "create":
    await createBranch();
    break;
  case "delete":
    await deleteBranch();
    break;
  case "list":
    await listBranches();
    break;
  default:
    console.error("Usage: bun scripts/neon-branch.ts <create|delete|list>");
    process.exit(1);
}

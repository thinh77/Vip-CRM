import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { app } from "../app.js";
import { createCustomersRepository } from "../customers/customers.repository.js";
import { pool } from "../db/pool.js";
import type { CustomerInput } from "../shared/types.js";

const CUSTOMER_COUNT = 5000;
const TARGET_MS = 9000;
const prefix = `BENCH${Date.now().toString(36).toUpperCase()}`;

function buildCustomers(): CustomerInput[] {
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  return Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
    const sequence = String(index + 1).padStart(5, "0");
    return {
      maKH: `${prefix}${sequence}`,
      tenKH: `Đơn vị benchmark ${sequence}`,
      canBoQuanLy: `Cán bộ ${index % 20}`,
      ngayThanhLap: `2018-${month}-12`,
      vips: [
        {
          hoTen: `Lãnh đạo ${sequence}`,
          chucVu: "Lãnh đạo đơn vị",
          ngaySinh: `1985-${month}-15`,
          soDienThoai: `090${String(index).padStart(7, "0")}`
        },
        {
          hoTen: `Kế toán ${sequence}`,
          chucVu: "Kế toán trưởng",
          ngaySinh: `1990-${month}-25`,
          soDienThoai: `091${String(index).padStart(7, "0")}`
        }
      ]
    };
  });
}

async function listen(): Promise<{ server: Server; baseUrl: string }> {
  return await new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address() as AddressInfo;
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

const customers = buildCustomers();
const { server, baseUrl } = await listen();

try {
  const repository = createCustomersRepository(pool);
  const duplicateCustomer = {
    ...customers[0],
    maKH: `${prefix}ROLLBACK`
  };
  await repository.createMany([duplicateCustomer, duplicateCustomer])
    .then(() => {
      throw new Error("Expected duplicate batch to fail.");
    })
    .catch((error) => {
      if (!(error instanceof Error) || !/đã tồn tại/.test(error.message)) {
        throw error;
      }
    });
  const rollbackResult = await pool.query<{ count: string }>(
    "select count(*) from customers where ma_kh = $1",
    [duplicateCustomer.maKH]
  );
  if (Number(rollbackResult.rows[0].count) !== 0) {
    throw new Error("Atomic rollback check left partial customer data.");
  }

  const importStartedAt = performance.now();
  const importResponse = await fetch(`${baseUrl}/api/customers/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customers })
  });
  const importBody = await importResponse.json();
  const importMs = performance.now() - importStartedAt;

  if (!importResponse.ok) {
    throw new Error(`Import failed (${importResponse.status}): ${JSON.stringify(importBody)}`);
  }
  if (importBody.importedCount !== CUSTOMER_COUNT) {
    throw new Error(`Expected ${CUSTOMER_COUNT} imported customers, received ${importBody.importedCount}.`);
  }

  const refreshStartedAt = performance.now();
  const responses = await Promise.all([
    fetch(`${baseUrl}/api/customers`),
    fetch(`${baseUrl}/api/events?month=${new Date().getMonth() + 1}`),
    fetch(`${baseUrl}/api/stats`)
  ]);
  const payloads = await Promise.all(responses.map(async (response) => {
    if (!response.ok) {
      throw new Error(`Refresh failed (${response.status}): ${await response.text()}`);
    }
    return response.json();
  }));
  const refreshMs = performance.now() - refreshStartedAt;
  const totalMs = importMs + refreshMs;

  if (!Array.isArray(payloads[0]) || payloads[0].length < CUSTOMER_COUNT) {
    throw new Error("Customer refresh did not return the imported benchmark data.");
  }
  if (totalMs >= TARGET_MS) {
    throw new Error(`Backend import and refresh took ${totalMs.toFixed(1)}ms; target is under ${TARGET_MS}ms.`);
  }

  console.log(JSON.stringify({
    customerCount: CUSTOMER_COUNT,
    atomicRollbackVerified: true,
    importMs: Number(importMs.toFixed(1)),
    refreshMs: Number(refreshMs.toFixed(1)),
    totalMs: Number(totalMs.toFixed(1))
  }));
} finally {
  await pool.query("delete from customers where starts_with(ma_kh, $1)", [prefix]);
  await closeServer(server);
  await pool.end();
}

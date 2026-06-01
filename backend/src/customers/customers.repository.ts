import pg from "pg";
import type {
  CustomerIdentity,
  CustomerListFilters,
  CustomerRecord,
  CustomersRepositoryPort,
  InteractionRecord,
  NoteRecord
} from "./customers.service.js";
import type { ChucVu, CustomerInput, InteractionInput, InteractionType } from "../shared/types.js";

type Queryable = {
  query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    values?: unknown[]
  ): Promise<pg.QueryResult<T>>;
};

type CustomerRow = {
  id: string;
  ma_kh: string;
  ten_kh: string;
  ngay_thanh_lap: string | Date;
  can_bo_quan_ly: string;
};

type VipRow = {
  id: string;
  ho_ten: string;
  chuc_vu: ChucVu;
  ngay_sinh: string | Date;
  so_dien_thoai: string;
};

type InteractionRow = {
  id: string;
  ngay_thang: string | Date;
  loai_hinh: InteractionType;
  chi_tiet: string;
};

type NoteRow = {
  id: string;
  ngay_tao: string | Date;
  noi_dung: string;
};

function toIsoDate(value: string | Date): string {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapVip(row: VipRow): CustomerInput["vips"][number] {
  return {
    id: row.id,
    hoTen: row.ho_ten,
    chucVu: row.chuc_vu,
    ngaySinh: toIsoDate(row.ngay_sinh),
    soDienThoai: row.so_dien_thoai
  };
}

function mapInteraction(row: InteractionRow): InteractionRecord {
  return {
    id: row.id,
    ngayThang: toIsoDate(row.ngay_thang),
    loaiHinh: row.loai_hinh,
    chiTiet: row.chi_tiet
  };
}

function mapNote(row: NoteRow): NoteRecord {
  return {
    id: row.id,
    ngayTao: toIsoDate(row.ngay_tao),
    noiDung: row.noi_dung
  };
}

async function findById(queryable: Queryable, id: string): Promise<CustomerRecord | null> {
  const customerResult = await queryable.query<CustomerRow>(
    `
      select id, ma_kh, ten_kh, ngay_thanh_lap, can_bo_quan_ly
      from customers
      where id = $1
    `,
    [id]
  );
  const customer = customerResult.rows[0];
  if (!customer) {
    return null;
  }

  const vipResult = await queryable.query<VipRow>(
    `
      select id, ho_ten, chuc_vu, ngay_sinh, so_dien_thoai
      from vips
      where customer_id = $1
      order by position asc
    `,
    [id]
  );
  const interactionResult = await queryable.query<InteractionRow>(
    `
      select id, ngay_thang, loai_hinh, chi_tiet
      from interactions
      where customer_id = $1
      order by ngay_thang desc, created_at desc
    `,
    [id]
  );
  const noteResult = await queryable.query<NoteRow>(
    `
      select id, ngay_tao, noi_dung
      from notes
      where customer_id = $1
      order by ngay_tao desc, created_at desc
    `,
    [id]
  );

  const vips = vipResult.rows.map(mapVip);
  if (vips.length !== 2) {
    throw new Error(`Customer ${id} has ${vips.length} VIP records; expected 2.`);
  }

  return {
    id: customer.id,
    maKH: customer.ma_kh,
    tenKH: customer.ten_kh,
    ngayThanhLap: toIsoDate(customer.ngay_thanh_lap),
    canBoQuanLy: customer.can_bo_quan_ly,
    vips: [vips[0], vips[1]],
    lichSuTuongTac: interactionResult.rows.map(mapInteraction),
    ghiChuList: noteResult.rows.map(mapNote)
  };
}

async function requireCustomer(queryable: Queryable, id: string): Promise<CustomerRecord> {
  const customer = await findById(queryable, id);
  if (!customer) {
    throw new Error(`Customer ${id} was not found after write.`);
  }
  return customer;
}

export function createCustomersRepository(db: pg.Pool): CustomersRepositoryPort {
  async function withTransaction<T>(operation: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await db.connect();
    try {
      await client.query("begin");
      const result = await operation(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async function findByCode(maKH: string): Promise<CustomerIdentity | null> {
    const result = await db.query<CustomerIdentity>(
      "select id from customers where ma_kh = $1",
      [maKH]
    );
    return result.rows[0] ?? null;
  }

  async function list(filters: CustomerListFilters = {}): Promise<CustomerRecord[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.search?.trim()) {
      values.push(`%${filters.search.trim()}%`);
      const searchParam = `$${values.length}`;
      conditions.push(`
        (
          c.ma_kh ilike ${searchParam}
          or c.ten_kh ilike ${searchParam}
          or c.can_bo_quan_ly ilike ${searchParam}
          or exists (
            select 1
            from vips sv
            where sv.customer_id = c.id
              and sv.ho_ten ilike ${searchParam}
          )
        )
      `);
    }

    const manager = filters.manager?.trim();
    if (manager && manager !== "All") {
      values.push(manager);
      conditions.push(`c.can_bo_quan_ly = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
    const result = await db.query<{ id: string }>(
      `
        select c.id
        from customers c
        ${whereClause}
        order by c.ma_kh asc
      `,
      values
    );

    const customers = await Promise.all(result.rows.map((row) => findById(db, row.id)));
    return customers.filter((customer): customer is CustomerRecord => customer !== null);
  }

  async function create(input: CustomerInput): Promise<CustomerRecord> {
    return withTransaction(async (client) => {
      const customerResult = await client.query<{ id: string }>(
        `
          insert into customers (ma_kh, ten_kh, ngay_thanh_lap, can_bo_quan_ly, updated_at)
          values ($1, $2, $3, $4, now())
          returning id
        `,
        [input.maKH, input.tenKH, input.ngayThanhLap, input.canBoQuanLy]
      );
      const customerId = customerResult.rows[0].id;

      for (const [index, vip] of input.vips.entries()) {
        await client.query(
          `
            insert into vips (customer_id, position, ho_ten, chuc_vu, ngay_sinh, so_dien_thoai)
            values ($1, $2, $3, $4, $5, $6)
          `,
          [customerId, index + 1, vip.hoTen, vip.chucVu, vip.ngaySinh, vip.soDienThoai]
        );
      }

      return requireCustomer(client, customerId);
    });
  }

  async function update(id: string, input: CustomerInput): Promise<CustomerRecord> {
    return withTransaction(async (client) => {
      await client.query(
        `
          update customers
          set ma_kh = $2,
              ten_kh = $3,
              ngay_thanh_lap = $4,
              can_bo_quan_ly = $5,
              updated_at = now()
          where id = $1
        `,
        [id, input.maKH, input.tenKH, input.ngayThanhLap, input.canBoQuanLy]
      );

      for (const [index, vip] of input.vips.entries()) {
        await client.query(
          `
            insert into vips (customer_id, position, ho_ten, chuc_vu, ngay_sinh, so_dien_thoai)
            values ($1, $2, $3, $4, $5, $6)
            on conflict (customer_id, position) do update set
              ho_ten = excluded.ho_ten,
              chuc_vu = excluded.chuc_vu,
              ngay_sinh = excluded.ngay_sinh,
              so_dien_thoai = excluded.so_dien_thoai,
              updated_at = now()
          `,
          [id, index + 1, vip.hoTen, vip.chucVu, vip.ngaySinh, vip.soDienThoai]
        );
      }

      return requireCustomer(client, id);
    });
  }

  async function deleteCustomer(id: string): Promise<boolean> {
    const result = await db.query("delete from customers where id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async function createInteraction(customerId: string, input: InteractionInput): Promise<InteractionRecord> {
    const result = await db.query<InteractionRow>(
      `
        insert into interactions (customer_id, ngay_thang, loai_hinh, chi_tiet)
        values ($1, $2, $3, $4)
        returning id, ngay_thang, loai_hinh, chi_tiet
      `,
      [customerId, input.ngayThang, input.loaiHinh, input.chiTiet]
    );
    return mapInteraction(result.rows[0]);
  }

  async function deleteInteraction(customerId: string, interactionId: string): Promise<boolean> {
    const result = await db.query(
      "delete from interactions where customer_id = $1 and id = $2",
      [customerId, interactionId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async function createNote(customerId: string, noiDung: string): Promise<NoteRecord> {
    const result = await db.query<NoteRow>(
      `
        insert into notes (customer_id, noi_dung)
        values ($1, $2)
        returning id, ngay_tao, noi_dung
      `,
      [customerId, noiDung]
    );
    return mapNote(result.rows[0]);
  }

  async function deleteNote(customerId: string, noteId: string): Promise<boolean> {
    const result = await db.query(
      "delete from notes where customer_id = $1 and id = $2",
      [customerId, noteId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  return {
    findByCode,
    findById: (id) => findById(db, id),
    list,
    create,
    update,
    delete: deleteCustomer,
    createInteraction,
    deleteInteraction,
    createNote,
    deleteNote
  };
}

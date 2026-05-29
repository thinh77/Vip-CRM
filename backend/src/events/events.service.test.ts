import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCareEvents } from "./events.service.js";

test("buildCareEvents returns founding and VIP birthday events sorted by day", () => {
    const events = buildCareEvents(
        [
            {
                id: "cust-1",
                maKH: "KH201",
                tenKH: "Công ty A",
                ngayThanhLap: "2018-05-12",
                canBoQuanLy: "Nguyễn Minh Anh",
                vips: [
                    { id: "vip-1", hoTen: "VIP 1", chucVu: "Giám đốc", ngaySinh: "1985-08-15", soDienThoai: "0912345678" },
                    { id: "vip-2", hoTen: "VIP 2", chucVu: "Kế toán trưởng", ngaySinh: "1990-05-25", soDienThoai: "0987654321" }
                ],
                lichSuTuongTac: [],
                ghiChuList: []
            }
        ],
        5,
        new Date("2026-05-20T08:00:00+07:00")
    );

    assert.equal(events.length, 2);
    assert.equal(events[0].type, "FOUNDING");
    assert.equal(events[0].age, 8);
    assert.equal(events[1].type, "VIP_BIRTHDAY");
    assert.equal(events[1].daysRemaining, 5);
});
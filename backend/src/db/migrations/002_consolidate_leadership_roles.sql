update vips
set chuc_vu = 'Lãnh đạo đơn vị'
where chuc_vu in ('Giám đốc', 'Hiệu trưởng');

alter table vips
drop constraint if exists vips_chuc_vu_check;

alter table vips
add constraint vips_chuc_vu_check
check (chuc_vu in ('Lãnh đạo đơn vị', 'Kế toán trưởng'));

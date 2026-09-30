# Quy tắc làm việc cho Claude

## Git

- **Không tự `git push`.** Chỉ push khi người dùng yêu cầu rõ ràng. Làm xong thì commit (nếu phù hợp) và báo lại, chờ người dùng bảo mới push.
- Commit message **không** được có dòng ghi công Claude (`Co-Authored-By: Claude…`, "Generated with Claude Code"…).
- Dùng **pnpm**; thêm / đổi package thì commit kèm `pnpm-lock.yaml` (Vercel build bằng `pnpm install --frozen-lockfile`).

## Dự án

- Xem [README.md](README.md) để biết cấu trúc, lệnh chạy và asset pipeline.
- Giao diện trong game chỉ dùng tiếng Anh; từ vựng chỉ lấy phần Phonics của resource pack (không dùng phần ESL).

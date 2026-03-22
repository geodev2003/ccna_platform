# Hướng dẫn Deploy — Laptop Windows + Domain riêng

## Tổng quan kiến trúc

```
Internet → Router nhà → Windows Laptop
                          ├── Docker Desktop
                          │     ├── nginx  (port 80/443)  ← nhận request
                          │     ├── frontend (Next.js)
                          │     ├── backend  (Express API)
                          │     └── postgres (PostgreSQL)
                          └── GitHub Actions (CI/CD tự động)
```

---

## BƯỚC 1 — Kiểm tra loại Internet của bạn

Mở Command Prompt và chạy:
```cmd
curl https://api.ipify.org
```
Ghi lại IP này. Sau đó truy cập https://whatismyip.com — nếu trùng nhau → bạn có IP public.

**Kiểm tra IP tĩnh hay động:**
```cmd
ipconfig /all
```
Xem "DHCP Enabled" → Yes = IP động (cần DDNS), No = IP tĩnh.

> **Nếu IP động:** Đăng ký Cloudflare (miễn phí) và dùng Cloudflare Tunnel — không cần IP tĩnh, không cần port forwarding. Xem Bước 5B.

---

## BƯỚC 2 — Cài đặt phần mềm cần thiết

### 2.1 Cài Docker Desktop for Windows
1. Tải tại: https://www.docker.com/products/docker-desktop/
2. Cài đặt, khởi động lại máy
3. Bật WSL2 integration nếu được hỏi
4. Kiểm tra: mở PowerShell → `docker --version`

### 2.2 Cài Git
1. Tải tại: https://git-scm.com/download/win
2. Kiểm tra: `git --version`

### 2.3 Cài Node.js (cho dev local)
1. Tải Node.js 20 LTS tại: https://nodejs.org
2. Kiểm tra: `node --version`

---

## BƯỚC 3 — Clone và cấu hình project

Mở PowerShell as Administrator:

```powershell
# Tạo thư mục app
mkdir C:\opt\ccna-platform
cd C:\opt\ccna-platform

# Clone repo (sau khi bạn push code lên GitHub)
git clone https://github.com/YOUR_USERNAME/ccna-platform.git .

# Tạo file .env từ template
copy .env.example .env
```

### 3.1 Tạo JWT secrets
Mở PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Chạy 2 lần — dùng cho `JWT_SECRET` và `JWT_REFRESH_SECRET`.

### 3.2 Sửa file .env
Mở Notepad hoặc VS Code:
```
POSTGRES_USER=ccna_user
POSTGRES_PASSWORD=MatKhauManhCuaBan123!
POSTGRES_DB=ccna_platform
JWT_SECRET=<output lần 1>
JWT_REFRESH_SECRET=<output lần 2>
ANTHROPIC_API_KEY=sk-ant-api03-...   ← lấy tại console.anthropic.com
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1
NODE_ENV=production
PORT=3001
```

### 3.3 Sửa nginx.conf — thay domain
Mở `nginx/nginx.conf`, tìm và thay tất cả `your-domain.com` bằng domain thật của bạn.

---

## BƯỚC 4 — Cấu hình Domain

### 4.1 Trỏ DNS về IP laptop của bạn
Vào trang quản lý DNS của nhà đăng ký domain (ví dụ: Namecheap, GoDaddy, Tên miền Việt):

Tạo 2 DNS record:
```
Type: A    Name: @              Value: <IP public của bạn>   TTL: 300
Type: A    Name: www            Value: <IP public của bạn>   TTL: 300
```

Đợi 5-30 phút để DNS propagate. Kiểm tra:
```powershell
nslookup your-domain.com
```

---

## BƯỚC 5A — Port Forwarding (nếu có IP tĩnh)

Vào trang quản lý router (thường là 192.168.1.1 hoặc 192.168.0.1):
1. Tìm mục "Port Forwarding" hoặc "NAT"
2. Thêm rule:
   - External Port: 80 → Internal IP: <IP LAN của laptop> → Internal Port: 80
   - External Port: 443 → Internal IP: <IP LAN của laptop> → Internal Port: 443

**Tìm IP LAN của laptop:**
```powershell
ipconfig | findstr "IPv4"
```

**Cố định IP LAN cho laptop** (để port forwarding không bị mất):
- Vào router → DHCP → Static Lease → gán IP cố định cho MAC address của laptop.

---

## BƯỚC 5B — Cloudflare Tunnel (nếu IP động, KHUYẾN NGHỊ)

Đây là cách đơn giản hơn, không cần mở port router:

```powershell
# Cài cloudflared
winget install Cloudflare.cloudflared

# Đăng nhập
cloudflared tunnel login

# Tạo tunnel
cloudflared tunnel create ccna-platform

# Cấu hình tunnel
# Tạo file: C:\Users\<user>\.cloudflared\config.yml
```

Nội dung `config.yml`:
```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\<user>\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: your-domain.com
    service: http://localhost:80
  - hostname: www.your-domain.com
    service: http://localhost:80
  - service: http_status:404
```

```powershell
# Chạy tunnel (lần đầu để test)
cloudflared tunnel run ccna-platform

# Cài như Windows Service để tự chạy khi khởi động
cloudflared service install
```

Vào Cloudflare Dashboard → DNS → Thêm CNAME:
```
your-domain.com → <TUNNEL_ID>.cfargotunnel.com
```

---

## BƯỚC 6 — Lấy SSL Certificate (Let's Encrypt)

**Nếu dùng Cloudflare Tunnel:** SSL tự động, bỏ qua bước này.

**Nếu dùng Port Forwarding:**

```powershell
# Tạm thời dùng nginx không SSL để lấy cert
# Sửa nginx.conf: comment block SSL, chỉ giữ port 80

# Start nginx trước
docker compose up -d nginx

# Lấy cert
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d your-domain.com -d www.your-domain.com --email your@email.com --agree-tos --no-eff-email

# Bật lại SSL trong nginx.conf
# Sau đó restart nginx
docker compose restart nginx
```

---

## BƯỚC 7 — Khởi động toàn bộ hệ thống

```powershell
cd C:\opt\ccna-platform

# Build và chạy tất cả service
docker compose up -d --build

# Xem logs
docker compose logs -f

# Seed dữ liệu ban đầu
docker compose exec backend npx tsx prisma/seed.ts
```

Kiểm tra trạng thái:
```powershell
docker compose ps
```

Tất cả service phải ở trạng thái `Up (healthy)` hoặc `Up`.

---

## BƯỚC 8 — Cấu hình CI/CD (GitHub Actions)

### 8.1 Push code lên GitHub
```powershell
cd C:\opt\ccna-platform
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ccna-platform.git
git push -u origin main
```

### 8.2 Tạo SSH key để GitHub Actions SSH vào laptop

```powershell
# Tạo SSH key pair
ssh-keygen -t ed25519 -C "github-actions" -f C:\Users\<user>\.ssh\github_actions
```

Copy public key vào authorized_keys:
```powershell
type C:\Users\<user>\.ssh\github_actions.pub >> C:\Users\<user>\.ssh\authorized_keys
```

Bật OpenSSH Server trên Windows:
- Settings → Apps → Optional Features → Add a feature → OpenSSH Server
- Services → OpenSSH SSH Server → Start + Automatic

### 8.3 Thêm GitHub Secrets
Vào repo GitHub → Settings → Secrets and variables → Actions:

| Secret | Giá trị |
|--------|---------|
| `SERVER_HOST` | IP public của bạn hoặc domain |
| `SERVER_USER` | Windows username |
| `SERVER_SSH_KEY` | Nội dung file `github_actions` (private key) |
| `NEXT_PUBLIC_API_URL` | `https://your-domain.com/api/v1` |

### 8.4 Test CI/CD
Push một commit nhỏ → vào tab Actions trên GitHub → xem pipeline chạy.

---

## BƯỚC 9 — Windows: Tự khởi động khi restart

Tạo file `C:\opt\ccna-platform\start-ccna.bat`:
```bat
@echo off
cd /d C:\opt\ccna-platform
docker compose up -d
```

Thêm vào Task Scheduler:
1. Mở Task Scheduler → Create Basic Task
2. Trigger: When computer starts
3. Action: Start a program → `C:\opt\ccna-platform\start-ccna.bat`
4. Chạy với quyền Administrator

---

## BƯỚC 10 — Firewall Windows

Mở PowerShell as Administrator:
```powershell
# Cho phép port 80 và 443
New-NetFirewallRule -DisplayName "CCNA HTTP"  -Direction Inbound -Protocol TCP -LocalPort 80  -Action Allow
New-NetFirewallRule -DisplayName "CCNA HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

## Kiểm tra cuối cùng

1. Mở trình duyệt → https://your-domain.com → thấy trang landing page ✓
2. Đăng ký tài khoản mới ✓
3. Đăng nhập với admin: `admin@ccna.local` / `Admin@123456` ✓
4. Vào Admin Panel → Tạo bài học bằng AI ✓
5. Học một bài, làm quiz ✓
6. Xem Dashboard analytics ✓

---

## Lệnh quản lý hàng ngày

```powershell
# Xem status
docker compose ps

# Xem logs realtime
docker compose logs -f backend

# Restart một service
docker compose restart backend

# Cập nhật code (sau khi CI/CD deploy)
docker compose pull && docker compose up -d

# Backup database
docker exec ccna_db pg_dump -U ccna_user ccna_platform > backup_$(date +%Y%m%d).sql

# Xem disk usage
docker system df
```

---

## Troubleshooting

| Vấn đề | Nguyên nhân | Cách sửa |
|--------|-------------|----------|
| Domain không vào được | DNS chưa propagate | Đợi 30 phút, kiểm tra `nslookup` |
| Port 80 bị từ chối | Firewall chặn | Chạy lại lệnh firewall ở Bước 10 |
| Container không start | .env thiếu biến | Kiểm tra `docker compose logs` |
| SSL lỗi | Cert chưa lấy | Chạy lại certbot hoặc dùng Cloudflare |
| AI không generate | API key sai | Kiểm tra `ANTHROPIC_API_KEY` trong .env |
| Database không connect | Postgres chưa healthy | `docker compose restart postgres` |

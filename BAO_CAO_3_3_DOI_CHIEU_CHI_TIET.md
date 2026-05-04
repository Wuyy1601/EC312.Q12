# DOI CHIEU BAO CAO 3.3 (CHI TIET) - GIFTNITY SECURITY LAB

Tai lieu nay dung de ban doi chieu va sua lai muc 3.3 theo code hien tai trong project.
Pham vi doi chieu:

- BackEnd/src/shared/utils/helpers.js
- BackEnd/src/services/user/controllers/user.controller.js
- BackEnd/src/services/user/routes/user.routes.js
- BackEnd/src/services/order/routes/order.routes.js
- BackEnd/src/services/order/controllers/order.controller.js
- FrontEnd/src/components/ProductReviews.jsx

---

## 1) Ket luan doi chieu nhanh (quan trong)

Ban dang di dung huong, nhung can sua 7 diem de bao cao khop code thuc te:

1. JWT: hien tai **khong thay endpoint /jwks.json** trong code. Public key dang nam o file `BackEnd/src/shared/keys/public_key.pem`.
2. File `BackEnd/attacker/exploit_jwt.py` hien tai **khong co** trong repo.
3. NoSQL Injection nam o endpoint `POST /api/auth/login-v2` (ham `loginVulnerable`), khong phai login thuong.
4. SSRF nam o `POST /api/auth/fetch-avatar`, endpoint nay co `authMiddleware` (can token).
5. IDOR: chi them `authMiddleware` la chua du, can them **ownership check** trong controller.
6. CSRF: voi code hien tai, case `quick-cancel` thuc te la **unsafe state-changing GET + thieu auth/ownership**, khong can cookie van khai thac duoc.
7. Co them mot lo hong quyen truy cap nen dua vao bao cao: `GET /api/orders/user/:userId` dang public.

---

## 2) Dat ten ky thuat cho dung rubric "Attack Technique vs Defense Technique"

| #   | Attack Technique (de trong bao cao)        | Defense Technique (de trong bao cao)                       |
| --- | ------------------------------------------ | ---------------------------------------------------------- |
| 1   | JWT Algorithm Confusion                    | JWT Algorithm Allowlisting + Key/Algorithm Binding         |
| 2   | Password Spraying via Array Payload        | Strict Input Type Validation + Per-Attempt Control         |
| 3   | IDOR/BOLA on Order Resource                | Object-Level Authorization (Ownership Check)               |
| 4   | Stored XSS via Unsafe HTML Rendering       | Output Encoding / Safe Rendering                           |
| 5   | Payment Workflow Tampering                 | Business Rule Enforcement + Privileged Route Guard         |
| 6   | Broken Access Control (Admin APIs Exposed) | RBAC + Deny-by-Default Middleware                          |
| 7   | NoSQL Operator Injection                   | Query Allowlist + Type Coercion + Password Re-Verification |
| 8   | Authenticated SSRF to Internal Services    | URL Canonicalization + Internal Network Blocking           |
| 9   | Unsafe GET State Change (CSRF-enabler)     | Safe HTTP Method + AuthZ + Anti-CSRF Design                |

Goi y viet trong bao cao: "Phong thu o day la **ky thuat bao mat ung dung duoc trien khai bang code**, khong phai chi sua code co hoc."

---

## 3) Noi dung goi y viet lai 3.3.1 - Trien khai ky thuat tan cong

### 3.3.1.1 JWT Algorithm Confusion

- **Vi tri code:** `BackEnd/src/shared/utils/helpers.js`, ham `verifyToken()`.
- **Dau hieu lo hong:** `jwt.verify(token, publicKey, { algorithms: ["RS256", "HS256"] })`.
- **Nguyen ly:** server cho phep ca RS256 va HS256; ke tan cong co the doi `alg` sang HS256 de ky token bang khoa cong khai.
- **Kich ban lab:**
  1. Lay public key (tu file `public_key.pem` hoac kenh public neu project expose).
  2. Tao JWT gia `role: admin` voi `alg: HS256`.
  3. Gui token vao route admin (vd `/api/admin/orders`).
- **Bang chung can chup:** doan `algorithms: ["RS256", "HS256"]`, request Burp, response 200.

### 3.3.1.2 Password Spraying via Array Payload

- **Vi tri code:** `BackEnd/src/services/user/controllers/user.controller.js`, ham `login()`.
- **Dau hieu lo hong:** block `if (Array.isArray(password)) { for (...) comparePassword(...) }`.
- **Nguyen ly:** 1 request co the thu nhieu mat khau, trong khi rate limiter dem theo request, khong dem theo so lan do.
- **Kich ban lab:** `POST /api/auth/login` voi `password: ["wrong1","wrong2","correct"]`.
- **Bang chung can chup:** payload mang password, response 200 login thanh cong.

### 3.3.1.3 IDOR/BOLA tren don hang

- **Vi tri code:** `BackEnd/src/services/order/routes/order.routes.js`.
- **Dau hieu lo hong:** `router.get("/:orderCode", getOrder);` (khong auth middleware).
- **Nguyen ly:** API truy xuat theo `orderCode` ma khong xac thuc chu the va quyen so huu.
- **Kich ban lab:** goi `GET /api/orders/{orderCode_nguoi_khac}` de xem PII.
- **Bang chung can chup:** route khong middleware + response co thong tin nguoi khac.

### 3.3.1.4 Stored XSS

- **Vi tri code:** `FrontEnd/src/components/ProductReviews.jsx`.
- **Dau hieu lo hong:** `<p dangerouslySetInnerHTML={{ __html: review.comment }} />`.
- **Nguyen ly:** binh luan luu DB duoc render lai dang HTML thuc thi.
- **Kich ban lab:** submit comment co payload script/event handler.
- **Bang chung can chup:** payload luu thanh cong + trang hien popup/script.

### 3.3.1.5 Business Logic Tampering (Simulate Payment)

- **Vi tri code:** `BackEnd/src/services/order/routes/order.routes.js`.
- **Dau hieu lo hong:** `router.post("/:orderCode/simulate-payment", simulatePayment);` (public).
- **Nguyen ly:** chuc nang noi bo test thanh toan bi expose cho client thuong.
- **Kich ban lab:** dat don -> goi route simulate-payment -> don chuyen `paid`.
- **Bang chung can chup:** request simulate-payment + status payment thay doi.

### 3.3.1.6 Broken Access Control (Admin APIs Exposed)

- **Vi tri code:** `order.routes.js`.
- **Dau hieu lo hong:** `/all`, `PUT /:orderCode/status`, `DELETE /:orderCode` dang mo.
- **Nguyen ly:** endpoint nghiep vu quan tri khong duoc bao ve boi RBAC.
- **Kich ban lab:** user thuong truy cap endpoint admin, xem/chinh sua/xoa don.
- **Bang chung can chup:** route khong admin middleware + response thanh cong.

### 3.3.1.7 NoSQL Operator Injection

- **Vi tri code:** `user.controller.js`, ham `loginVulnerable()`.
- **Dau hieu lo hong:** `const user = await User.findOne(req.body)...`.
- **Endpoint:** `POST /api/auth/login-v2`.
- **Nguyen ly:** filter query nhan truc tiep JSON tu client cho phep toan tu Mongo (`$ne`, `$gt`, ...).
- **Kich ban lab:** `{"email":"admin@x.com","password":{"$ne":""}}`.
- **Bang chung can chup:** payload operator + response 200 co token.

### 3.3.1.8 Authenticated SSRF

- **Vi tri code:** `user.controller.js`, ham `fetchAvatar()`.
- **Endpoint:** `POST /api/auth/fetch-avatar` (co `authMiddleware`).
- **Dau hieu lo hong:** `const response = await fetch(url);` khong kiem tra dich.
- **Nguyen ly:** server bi dung lam proxy goi tai nguyen noi bo.
- **Kich ban lab:** user da dang nhap gui URL noi bo, vd `http://localhost:5001/api/orders/all`.
- **Bang chung can chup:** payload URL noi bo + response tra ve du lieu noi bo.

### 3.3.1.9 Unsafe GET State Change (CSRF-enabler)

- **Vi tri code:** `order.routes.js`.
- **Dau hieu lo hong:** `router.get("/:orderCode/quick-cancel", cancelOrder);`.
- **Nguyen ly:** GET khong duoc dung de thay doi trang thai. Co the bi trigger cheo site (img/link/script) hoac truy cap truc tiep.
- **Kich ban lab:** mo file `BackEnd/attacker/csrf_attack.html` co `<img src=".../quick-cancel">`.
- **Bang chung can chup:** route GET nhanh + don bi huy.
- **Luu y hoc thuat:** trong project nay, day khong chi la CSRF; con la lo hong thieu auth/ownership.

---

## 4) Noi dung goi y viet lai 3.3.2 - Trien khai ky thuat phong thu

### 3.3.2.1 JWT Algorithm Allowlisting

- Chi cho phep `RS256`.
- De xuat cau hinh: `jwt.verify(token, publicKey, { algorithms: ["RS256"] })`.
- Y nghia ky thuat: rang buoc thuat toan ky (algorithm pinning), ngan confusion.

### 3.3.2.2 Strict Input Type Validation (Password)

- Bat buoc `password` la chuoi:
  - `if (typeof password !== "string") return 400;`
- Loai bo branch `Array.isArray(password)`.
- Y nghia ky thuat: schema validation + anti abuse payload shape.

### 3.3.2.3 Object-Level Authorization (IDOR)

- Bat `authMiddleware` cho route lay don.
- Them ownership check trong controller:
  - neu khong phai admin va `order.userId !== req.user.id` -> 403.
- Y nghia ky thuat: authorization dua tren doi tuong (BOLA), khong chi route-level auth.

### 3.3.2.4 Safe Rendering chong Stored XSS

- Bo `dangerouslySetInnerHTML`.
- Render text thuong: `<p>{review.comment}</p>`.
- Y nghia ky thuat: output encoding (React auto-escape).

### 3.3.2.5 Business Rule Enforcement (Simulate Payment)

- Gioi han route test thanh toan cho admin:
  - `authMiddleware + adminMiddleware`.
- Hoac tat han endpoint nay tren production.
- Y nghia ky thuat: tach biet endpoint noi bo/test va endpoint public.

### 3.3.2.6 RBAC cho endpoint quan tri

- Bao ve `/all`, `PUT status`, `DELETE order` bang `authMiddleware + adminMiddleware`.
- Bo sung ca `GET /api/orders/user/:userId` (chi owner hoac admin duoc xem).
- Y nghia ky thuat: deny-by-default + least privilege.

### 3.3.2.7 Query Allowlist chong NoSQL Injection

- Khong truyen `req.body` vao query.
- Truy van theo field allowlist:
  - `safeEmail = String(req.body.email || "")`
  - `User.findOne({ email: safeEmail })`
- Bat buoc verify password bang bcrypt voi chuoi an toan.
- Y nghia ky thuat: input canonicalization + safe query construction.

### 3.3.2.8 SSRF Defense

- Parse URL bang `new URL(url)`, chi cho `http/https`.
- Chan host/IP noi bo (`localhost`, `127.0.0.1`, dải private, link-local).
- Kiem soat redirect va timeout.
- Tot hon nua: allowlist domain hop le.

### 3.3.2.9 Safe HTTP Method + Anti-CSRF Design

- Xoa GET `quick-cancel`, chi dung POST/DELETE cho thay doi trang thai.
- Bat auth + ownership khi huy don.
- Neu dung cookie auth, bo sung CSRF token va SameSite.
- Y nghia ky thuat: chong cross-site state change + dung semantic HTTP method.

---

## 5) Noi dung goi y viet lai 3.3.3 - Kiem thu doi chung truoc/sau va tieu chi dat

Mau viet nen dung:

- **Truoc va:** mo ta payload + ket qua khai thac thanh cong.
- **Sau va:** cung payload do, he thong tra ve loi/bi chan.
- **Ket luan:** "giam thieu duoc lo hong trong pham vi test", khong ghi "an toan tuyet doi".

Bang tieu chi pass de ban dua vao bao cao:

| #   | Test case                   | Ket qua mong doi sau phong thu    |
| --- | --------------------------- | --------------------------------- |
| 1   | JWT HS256 forged token      | 401 Unauthorized                  |
| 2   | password la array           | 400 Bad Request                   |
| 3   | lay order nguoi khac        | 403 Forbidden                     |
| 4   | comment chua HTML/script    | hien text thuong, khong thuc thi  |
| 5   | guest goi simulate-payment  | 403 Forbidden                     |
| 6   | guest goi admin order APIs  | 403 Forbidden                     |
| 7   | payload `$ne` vao login-v2  | 401 Unauthorized                  |
| 8   | URL noi bo qua fetch-avatar | 403 Forbidden                     |
| 9   | GET quick-cancel            | 404/405, don khong doi trang thai |

---

## 6) Cac cau nen sua trong bao cao hien tai

1. Sua "chi sua code" thanh: "**trien khai ky thuat phong thu ung dung thong qua thay doi code va middleware**".
2. Sua phan JWT: bo chi tiet `/jwks.json` neu code khong co endpoint nay.
3. NoSQLi phai chi ro endpoint `login-v2`.
4. SSRF phai ghi ro "authenticated SSRF".
5. IDOR phai nhan manh ownership check trong controller.
6. CSRF phai ghi dung ban chat hien tai: unsafe GET + thieu auth/ownership.
7. Them phat hien BAC phu: `/api/orders/user/:userId` dang public.

---

## 7) Mau cau ket luan cho muc 3.3 (co the copy vao bao cao)

"Qua qua trinh doi chung truoc/sau, nhom da trien khai 9 cap ky thuat tan cong va ky thuat phong thu tuong ung tren ung dung Giftnity. Cac bien phap phong thu khong chi dung o muc sua code cu the, ma la ap dung cac nguyen tac an toan he thong nhu algorithm allowlisting, object-level authorization, RBAC, input validation, output encoding, va SSRF/CSRF hardening. Ket qua kiem thu lai cho thay cac payload khai thac truoc day deu bi chan hoac bi giam tac dong dang ke trong pham vi moi truong lab."

---

## 8) Checklist anh chup de bao cao trong 1 lan

Ban nen chup moi ky thuat 3 anh:

1. **Anh A (Code vulnerable)**: dong code lo hong.
2. **Anh B (Attack success)**: request + response thanh cong khai thac.
3. **Anh C (Defense + Retest)**: code da bat defense + response bi chan.

Neu lam du 9 ky thuat: tong 27 anh, bao cao se rat "chat" va de dat diem rubric.

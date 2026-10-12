# 🚀 Mindmap24h

Ứng dụng lập sơ đồ tư duy (Mind Mapping) trực quan, hiện đại và thời gian thực, hỗ trợ tổ chức ý tưởng, phân cấp thư mục khoa học và tự động tối ưu hóa bố cục đồ thị.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

---

## 📌 Bảng mục lục (Table of Contents)
- [Giới thiệu](#-giới-thiệu)
  - [Bối cảnh ra đời](#bối-cảnh-ra-đời)
  - [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
  - [Cách 1: Khởi chạy nhanh với Docker Compose (Khuyên dùng)](#cách-1-khởi-chạy-nhanh-với-docker-compose-khuyên-dùng)
  - [Cách 2: Khởi chạy thủ công ở môi trường Local Development](#cách-2-khởi-chạy-thủ-công-ở-môi-trường-local-development)
- [Cấu hình](#-cấu-hình)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
  - [Bảng phím tắt (Keyboard Shortcuts)](#bảng-phím-tắt-keyboard-shortcuts)
  - [Nhập dữ liệu thông minh (Smart Outline Import)](#nhập-dữ-liệu-thông-minh-smart-outline-import)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)

---

## 📖 Giới thiệu

### Bối cảnh ra đời
Khi thực hiện brainstorming, lên ý tưởng dự án hoặc học tập kiến thức mới, việc ghi chú dạng dòng chữ thông thường dễ làm đứt gãy luồng tư duy và khó thấy được mối tương quan giữa các chủ đề. **Mindmap24h** được xây dựng như một công cụ lập sơ đồ tư duy trên nền web tối giản, tốc độ cao, hỗ trợ thao tác hoàn toàn bằng bàn phím và tự động giải quyết các bài toán về sắp xếp vị trí, phân bổ màu sắc và lưu trữ theo thời gian thực.

### Tính năng chính
- ✨ **Trình biên tập sơ đồ tư duy tương tác cao:**
  - Được xây dựng trên thư viện `@xyflow/react` (React Flow v12) với canvas vô cực, khả năng thu phóng (zoom) và di chuyển (pan) mượt mà.
  - Hỗ trợ đổi tên nút trực tiếp (Inline edit / Double click).
- ✨ **Thao tác siêu tốc bằng phím tắt:**
  - Thêm nút con ngay lập tức bằng phím `Tab`.
  - Thêm nút ngang hàng cùng cấp bằng phím `Enter`.
  - Xóa nút cùng toàn bộ nhánh con bằng `Delete` hoặc `Backspace`.
  - Hỗ trợ đầy đủ lịch sử thao tác hoàn tác (`Ctrl + Z`) và làm lại (`Ctrl + Y`).
- ✨ **Tự động phân nhánh màu sắc & Bố cục thông minh (Auto-layout):**
  - Tự động gán dải màu riêng biệt cho từng nhánh lớn (Branch coloring) xuất phát từ nút gốc.
  - Thuật toán dàn trang cây động (Tree Layout kết hợp Dagre) tính toán chiều cao và độ rộng nội dung của các nút, đảm bảo các nhánh không bao giờ bị đè lấn lên nhau.
- ✨ **Thu gọn & Mở rộng nhánh (Collapse / Expand):**
  - Ẩn/hiện nhánh linh hoạt bằng nút tròn `+` / `-` để tập trung vào ý tưởng chính.
- ✨ **Hệ thống Quản lý Thư mục & Bảng vẽ (Folder & Board System):**
  - Tạo thư mục để phân loại theo dự án, chủ đề.
  - Di chuyển bảng vẽ giữa các thư mục, đổi tên bảng, tìm kiếm theo từ khóa.
- ✨ **Nhập dữ liệu phác thảo thông minh (Whimsical / Outline Import):**
  - Cho phép dán nhanh văn bản có định dạng thụt đầu dòng (Markdown bullet, Tab, Spaces) bằng `Ctrl + V` hoặc hộp thoại Import để tự động sinh cây mindmap hoàn chỉnh.
- ✨ **Tự động lưu trữ thời gian thực (Autosave):**
  - Trạng thái sơ đồ được tự động đồng bộ về backend PostgreSQL mà không cần nhấn nút lưu thủ công, có đèn báo trạng thái trực quan (*Saving*, *Saved*, *Unsaved changes*).

---

## 🛠 Công nghệ sử dụng

Danh sách các công nghệ, framework và thư viện chính của dự án:

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & [React 19](https://react.dev/)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Sơ đồ tư duy & Đồ thị:** [`@xyflow/react`](https://reactflow.dev/) (React Flow v12)
- **Thuật toán đồ thị:** [`@dagrejs/dagre`](https://github.com/dagrejs/dagre)
- **Quản lý trạng thái:** [Zustand](https://github.com/pmndrs/zustand)
- **Giao diện & Styling:** [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)

### Backend
- **Framework:** [NestJS 12](https://nestjs.com/) (Node.js & Express)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma ORM 5.22](https://www.prisma.io/)
- **Dữ liệu & Validation:** `class-validator`, `class-transformer`
- **Linting & Testing:** [Oxlint](https://oxc.rs/), [Vitest](https://vitest.dev/)

### Database & DevOps
- **Cơ sở dữ liệu:** [PostgreSQL 16](https://www.postgresql.org/)
- **DevOps / Container:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) hỗ trợ chế độ Docker Compose Watch

---

## 📋 Yêu cầu hệ thống (Prerequisites)

Các công cụ cần cài đặt trước trên máy local:
- [Node.js](https://nodejs.org/) `>= 20.x`
- [Docker](https://www.docker.com/) & Docker Compose `>= 2.22`
- [Git](https://git-scm.com/)
- Trình quản lý gói: `npm` (hoặc `pnpm` / `yarn`)

---

## 🚀 Cài đặt (Installation)
Toàn bộ dịch vụ (PostgreSQL, Backend NestJS và Frontend Next.js) được đóng gói và cấu hình sẵn trong thư mục `docker-mindmap24h`.

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/mindmap24h.git
   cd mindmap24h
   ```

2. **Chạy các dịch vụ với Docker Compose:**
   ```bash
   cd docker-mindmap24h
   docker compose up -d --build
   ```

3. **(Tùy chọn) Bật tính năng live sync mã nguồn với Docker Watch:**
   ```bash
   docker compose watch
   ```

4. **Kiểm tra trạng thái container:**
   ```bash
   docker compose ps
   ```

Ứng dụng sẽ hoạt động tại:
- 🌐 **Giao diện Frontend:** [http://localhost:3030](http://localhost:3030)
- 🔌 **Backend REST API:** [http://localhost:3031/api](http://localhost:3031/api)
- 🗄️ **PostgreSQL Server:** `localhost:5432`
---

## ⚙️ Cấu hình (Configuration)

### 1. Cấu hình Backend (`backend/.env`)
| Biến môi trường | Giá trị mặc định | Giải thích |
| :--- | :--- | :--- |
| `PORT` | `3031` | Cổng HTTP mà NestJS lắng nghe |
| `DATABASE_URL` | `postgresql://mindmap:mindmap@localhost:5432/mindmap24h` | Chuỗi kết nối đến cơ sở dữ liệu PostgreSQL |

### 2. Cấu hình Frontend (`frontend/.env`)
| Biến môi trường | Giá trị mặc định | Giải thích |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3031/api` | Đường dẫn kết nối API tới Backend |
| `FRONTEND_PORT` | `3030` | Cổng chạy server Next.js |
| `BACKEND_PORT` | `3031` | Cổng backend cho cấu hình Docker |

### 3. Cấu hình Docker (`docker-mindmap24h/docker-compose.yml`)
- Cổng dịch vụ DB: `5432:5432`
- Cổng dịch vụ Backend: `${BACKEND_PORT:-3031}:3001`
- Cổng dịch vụ Frontend: `${FRONTEND_PORT:-3030}:3000`

---

## 💡 Hướng dẫn sử dụng

### 1. Quản lý Bảng vẽ & Thư mục (Dashboard)
- Nhấn **"New Board"** để tạo bảng sơ đồ tư duy mới.
- Nhấn **"New Folder"** để tạo thư mục mới phân loại nội dung.
- Sử dụng ô **Search** để lọc nhanh các sơ đồ theo tên.
- Di chuột vào bảng vẽ để đổi tên, di chuyển sang thư mục khác hoặc xóa bảng.

### 2. Thao tác trên Mindmap Canvas
- **Tạo nút con:** Nhấp chọn một nút bất kỳ, nhấn phím <kbd>Tab</kbd> hoặc nút **+ Child** trên thanh công cụ.
- **Tạo nút ngang hàng:** Nhấn phím <kbd>Enter</kbd> hoặc nút **Sibling**.
- **Chỉnh sửa nội dung:** Nhấp đúp chuột (**Double Click**) vào nút để sửa chữ trực tiếp, hoặc chỉnh sửa qua thanh **Node Properties Sidebar** ở mép phải.
- **Sắp xếp tự động:** Nhấn nút **"Layout"** hoặc bấm <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> để căn chỉnh cây đều đẹp.
- **Đổi tên bảng:** Nhấn vào tên bảng ở góc trên bên trái thanh công cụ.
- **Thu gọn / Mở rộng:** Nhấn nút icon `+` hoặc `-` trên các nút có nút con.

### Bảng phím tắt (Keyboard Shortcuts)
| Phím tắt | Thao tác |
| :--- | :--- |
| <kbd>Tab</kbd> | Thêm nút con (Child Node) |
| <kbd>Enter</kbd> | Thêm nút cùng cấp (Sibling Node) |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Xóa nút đang chọn cùng tất cả nút con |
| **Double Click** | Đổi tên nút đang chọn |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Hoàn tác (Undo) |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Làm lại (Redo) |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd> | Căn chỉnh sơ đồ vừa khớp toàn màn hình (Fit View) |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> | Tự động sắp xếp lại vị trí toàn bộ đồ thị (Auto Layout) |
| <kbd>Ctrl</kbd> + <kbd>V</kbd> | Dán văn bản outline để tạo mindmap tự động |

### Nhập dữ liệu thông minh (Smart Outline Import)
Bạn có thể bấm nút **"Import"** trên thanh công cụ hoặc nhấn phím <kbd>Ctrl</kbd> + <kbd>V</kbd> trên canvas và dán văn bản có cấu trúc phân cấp (thụt dòng bằng tab/spaces hoặc markdown bullet points):

```text
Ý Tưởng Khởi Nghiệp
  Nghiên Cứu Thị Trường
    Khảo sát khách hàng tiềm năng
    Phân tích đối thủ cạnh tranh
  Phát Triển Sản Phẩm
    MVP (Giai đoạn 1)
      Giao diện trực quan
      Hệ thống lưu trữ
    Tính năng nâng cao (Giai đoạn 2)
      Hợp tác thời gian thực
      Xuất file PDF/PNG
  Chiến Lược Marketing
    Mạng xã hội
    Nội dung hữu ích
```

Hệ thống sẽ tự động bóc tách cấu trúc và tạo thành các nút phân nhánh tương ứng trên sơ đồ.

---

## 📁 Cấu trúc thư mục

```text
mindmap24h/
├── backend/                         # Ứng dụng Backend (NestJS 12)
│   ├── prisma/
│   │   └── schema.prisma            # Khai báo mô hình dữ liệu Prisma (Folder, Board)
│   ├── src/
│   │   ├── boards/                  # API và nghiệp vụ quản lý Board
│   │   │   ├── dto/                 # CreateBoardDto, UpdateBoardDto
│   │   │   ├── boards.controller.ts
│   │   │   ├── boards.service.ts
│   │   │   └── boards.module.ts
│   │   ├── folders/                 # API và nghiệp vụ quản lý Folder
│   │   │   ├── dto/                 # CreateFolderDto, UpdateFolderDto
│   │   │   ├── folders.controller.ts
│   │   │   ├── folders.service.ts
│   │   └── folders.module.ts
│   │   ├── prisma/                  # Dịch vụ kết nối Prisma Client
│   │   ├── app.module.ts            # Root module
│   │   └── main.ts                  # Điểm khởi chạy ứng dụng NestJS (CORS, Validation)
│   ├── Dockerfile                   # Dockerfile của Backend
│   └── package.json
│
├── frontend/                        # Ứng dụng Frontend (Next.js 16 + React 19)
│   ├── app/
│   │   ├── boards/[id]/page.tsx     # Trang Canvas chỉnh sửa sơ đồ tư duy
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Trang chủ quản lý danh sách bảng và thư mục
│   │   └── globals.css              # Cấu hình Tailwind CSS v4
│   ├── components/
│   │   ├── boards/                  # Giao diện quản lý bảng và thư mục
│   │   │   ├── BoardCard.tsx        # Thẻ hiển thị Board
│   │   │   ├── BoardList.tsx        # Danh sách bảng, tìm kiếm, modal tạo & sửa
│   │   │   ├── FolderCard.tsx       # Thẻ hiển thị Folder
│   │   │   └── CreateBoardDialog.tsx# Hộp thoại tạo mới Board
│   │   └── editor/                  # Giao diện bộ soạn thảo Mindmap
│   │       ├── ImportDialog.tsx     # Hộp thoại dán/nhập outline văn bản
│   │       ├── MindMapEditor.tsx    # Canvas chính sử dụng React Flow
│   │       ├── MindMapNode.tsx      # Giao diện node tùy chỉnh, badge số lượng con, toggle collapse
│   │       ├── MindMapEdge.tsx      # Đường nối mượt mà tùy biến
│   │       ├── NodeSidebar.tsx      # Thanh bên phải sửa chi tiết node
│   │       └── Toolbar.tsx          # Thanh công cụ trên cùng (Undo/Redo, Add, Layout, Shortcuts)
│   ├── hooks/
│   │   └── useLayout.ts             # Hook kích hoạt giải thuật sắp xếp vị trí Dagre
│   ├── lib/
│   │   ├── api.ts                   # Module gọi HTTP API backend
│   │   ├── mindmap.ts               # Thuật toán phối màu nhánh, đo lường và căn lề node không đè nhau
│   │   └── textToMindmap.ts         # Parser phân tích văn bản thụt dòng thành sơ đồ cây
│   ├── store/
│   │   ├── boardStore.ts            # Quản lý state danh sách Board & Folder
│   │   └── editorStore.ts           # Quản lý state Node, Edge, Undo/Redo history, Autosave
│   ├── types/
│   │   └── index.ts                 # TypeScript types cho Board, MindMapNode, HistoryEntry...
│   ├── Dockerfile                   # Dockerfile của Frontend
│   └── package.json
│
├── docker-mindmap24h/               # Cấu hình triển khai container
│   ├── docker-compose.yml           # Khai báo DB, Backend, Frontend và Docker Watch
│   └── data/                        # Thư mục volume lưu trữ dữ liệu PostgreSQL
│
├── .gitignore                       # Danh sách file/thư mục bỏ qua của Git
└── README.md                        # Tài liệu hướng dẫn dự án
```

---

## 🏛 Kiến trúc hệ thống

```mermaid
graph TD
    Client["Trình duyệt người dùng (Web Browser)"]
    
    subgraph Frontend ["Frontend (:3030 - Next.js 16 / React 19)"]
        UI["Mindmap Editor Canvas (@xyflow/react)"]
        Store["Editor & Board Store (Zustand)"]
        Algorithm["Thuật toán phân nhánh màu & Tree Layout"]
        APIClient["API Client (lib/api.ts)"]
    end
    
    subgraph Backend ["Backend (:3031 - NestJS 12)"]
        Controller["Boards & Folders Controllers"]
        Service["Boards & Folders Services"]
        PrismaORM["Prisma ORM Client"]
    end
    
    subgraph Storage ["Database (:5432)"]
        Database[("PostgreSQL 16")]
    end
    
    Client --> UI
    UI <--> Store
    Store <--> Algorithm
    Store --> APIClient
    APIClient --> Controller
    Controller --> Service
    Service --> PrismaORM
    PrismaORM --> Database
```

---

## 🤝 Đóng góp (Contributing)

Đóng góp của bạn luôn được hoan nghênh và đánh giá cao! Để đóng góp:

1. **Fork** dự án về tài khoản GitHub của bạn.
2. Tạo branch mới cho tính năng:
   ```bash
   git checkout -b feature/tinh-nang-moi
   ```
3. Commit thay đổi tuân theo chuẩn [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m 'feat: them tinh nang xuat file anh'
   ```
4. Push branch lên GitHub:
   ```bash
   git push origin feature/tinh-nang-moi
   ```
5. Tạo một **Pull Request** trên GitHub giải thích nội dung thay đổi.

---

## 📄 Giấy phép (License)

Dự án này được phát hành dưới giấy phép [MIT License](LICENSE).

---

<p align="center">
  Được phát triển với ❤️ cho cộng đồng Mindmap24h
</p>

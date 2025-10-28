// permission.enum.ts
export enum Permission {
  None = 0,

  // 👥 User Management
  ViewUsers = 1,
  AddUsers = 2,
  EditUsers = 4,
  DeleteUsers = 8,

  // 🧩 Role Management
  ViewRoles = 16,
  AddRoles = 32,
  EditRoles = 64,
  DeleteRoles = 128,

  // ❓ FAQ Management
  ViewFaqs = 256,
  AddFaqs = 512,
  EditFaqs = 1024,
  DeleteFaqs = 2048,

  // 📰 CMS Management
  ViewCms = 4096,
  AddCms = 8192,
  EditCms = 16384,
  DeleteCms = 32768
}

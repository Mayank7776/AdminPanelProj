export enum PermissionBits {
  NONE = 0,

  // 👥 User Management
  ADD_USERS = 2,         // 2^1
  EDIT_USERS = 4,        // 2^2
  DELETE_USERS = 8,      // 2^3

  // 🧩 Role Management
  ADD_ROLES = 32,        // 2^5
  EDIT_ROLES = 64,       // 2^6
  DELETE_ROLES = 128,    // 2^7

  // ❓ FAQ Management
  ADD_FAQS = 512,        // 2^9
  EDIT_FAQS = 1024,      // 2^10
  DELETE_FAQS = 2048,    // 2^11

  // 📰 CMS Management
  ADD_CMS = 8192,        // 2^13
  EDIT_CMS = 16384,      // 2^14
  DELETE_CMS = 32768     // 2^15
}
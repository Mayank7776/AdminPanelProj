import { Permission } from "../common/permission.enum";

export class Pagination {
  page: number = 1;
  pageSize: number = 10;
  Search?: string;
  SortColumn?: string;
  SortDirection?: 'asc' | 'desc';
  filters?: { [key: string]: string };
}


export interface IUser {
  // id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  DateOfbirth: string | Date;
  countryId?: number;
  countryName?: string;
  stateId?: number;
  stateName?: string;
  cityId?: number;
  cityName?: string;
  profileImageUrl?: string;
  roles: string[];
  isActive: boolean;
}

export interface UserResponse {
  totalRecords: number;
  page: number;
  pageSize: number;
  users: IUser[];
}

export interface ICms {
  id: number,
  title: string,
  key: string,
  metaKeyword: string,
  isActive: boolean
}

// Roles and Permission
export interface IRole {
  id: string,
  name: string,
  description: string,
  isActive: boolean;
  permissions: { label: string; value: Permission }[];
}

// FAQ
export interface IFaq {
  id: number,
  question: string,
  answer: string,
  isActive: boolean,
}
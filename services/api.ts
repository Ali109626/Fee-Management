import { Admin, Student, FeeRecord, UserRole } from "../types";

const API_BASE = "/api";

export const api = {
  async register(adminData: Omit<Admin, 'id'>) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminData),
      credentials: "include"
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async login(credentials: any) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include"
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async logout() {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
  },

  async me() {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
    if (!res.ok) return null;
    return res.json();
  },

  async getStudents(adminId?: string) {
    const url = adminId ? `${API_BASE}/students?adminId=${adminId}` : `${API_BASE}/students`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return [];
    return res.json();
  },

  async addStudent(student: Student) {
    const res = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
      credentials: "include"
    });
    return res.json();
  },

  async updateStudent(id: string, student: any) {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
      credentials: "include"
    });
    return res.json();
  },

  async deleteStudent(id: string) {
    await fetch(`${API_BASE}/students/${id}`, { method: "DELETE", credentials: "include" });
  },

  async getFees(adminId?: string) {
    const url = adminId ? `${API_BASE}/fees?adminId=${adminId}` : `${API_BASE}/fees`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return [];
    return res.json();
  },

  async addFee(fee: FeeRecord) {
    const res = await fetch(`${API_BASE}/fees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fee),
      credentials: "include"
    });
    return res.json();
  },

  async updateFee(id: string, updates: any) {
    const res = await fetch(`${API_BASE}/fees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
      credentials: "include"
    });
    return res.json();
  }
};

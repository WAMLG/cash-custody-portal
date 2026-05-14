"use client";

import { useEffect, useState } from "react";
import { AdminActionButton, AdminTable } from "@/components/AdminTable";
import { Modal } from "@/components/Modal";
import { StateBlock } from "@/components/StateBlock";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AuthorizedReceiver, CollectionResponse, User, UserRole } from "@/types";

export function AdminUsersClient() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [receivers, setReceivers] = useState<AuthorizedReceiver[]>([]);
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", role: "finance" as UserRole });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", username: "", phone: "", role: "finance" as UserRole, password: "" });
  const [receiverForm, setReceiverForm] = useState({ name: "", relationship_or_role: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    const [userResponse, receiverResponse] = await Promise.all([
      apiRequest<CollectionResponse<User>>("/admin/users?per_page=50", { token }),
      apiRequest<CollectionResponse<AuthorizedReceiver>>("/admin/authorized-receivers?per_page=50", { token }),
    ]);
    setUsers(userResponse.data);
    setReceivers(receiverResponse.data);
  }

  useEffect(() => {
    async function run() {
      await Promise.resolve();
      await load().catch(() => setError("Could not load users.")).finally(() => setIsLoading(false));
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function createUser() {
    if (!token) return;
    try {
      const response = await apiRequest<{ data: User }>("/admin/users", { method: "POST", token, body: JSON.stringify(form) });
      setForm({ name: "", email: "", username: "", password: "", role: "finance" });
      setUsers((current) => [...current, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      setMessage("User created.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "User action failed.");
    }
  }

  async function userAction(path: string, success: string) {
    if (!token) return;
    try {
      const response = await apiRequest<{ data: User }>(path, { method: "POST", token });
      setMessage(success);
      setUsers((current) => current.map((user) => user.id === response.data.id ? response.data : user));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "User action failed.");
    }
  }

  async function receiverAction(path: string, success: string) {
    if (!token) return;
    try {
      const response = await apiRequest<{ data: AuthorizedReceiver }>(path, { method: "POST", token });
      setMessage(success);
      setReceivers((current) => current.map((receiver) => receiver.id === response.data.id ? response.data : receiver));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Receiver action failed.");
    }
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone ?? "",
      role: user.role,
      password: "",
    });
  }

  async function saveUserEdit() {
    if (!token || !editingUser) return;

    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        username: editForm.username,
        phone: editForm.phone || null,
        role: editForm.role,
        ...(editForm.password ? { password: editForm.password } : {}),
      };
      const response = await apiRequest<{ data: User }>(`/admin/users/${editingUser.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify(payload),
      });
      setUsers((current) => current.map((user) => user.id === response.data.id ? response.data : user));
      setEditingUser(null);
      setMessage("User updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "User update failed.");
    }
  }

  async function createReceiver() {
    if (!token) return;
    try {
      const response = await apiRequest<{ data: AuthorizedReceiver }>("/admin/authorized-receivers", { method: "POST", token, body: JSON.stringify(receiverForm) });
      setReceiverForm({ name: "", relationship_or_role: "" });
      setReceivers((current) => [...current, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      setMessage("Authorized receiver created.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Receiver action failed.");
    }
  }

  if (isLoading) return <StateBlock title="Loading" message="Fetching users." />;

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-3 rounded-md border border-[#d8dde5] bg-white p-4 shadow-sm md:grid-cols-6">
        <input className="h-11 rounded-md border border-[#cfd6df] px-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="h-11 rounded-md border border-[#cfd6df] px-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="h-11 rounded-md border border-[#cfd6df] px-3" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className="h-11 rounded-md border border-[#cfd6df] px-3" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="h-11 rounded-md border border-[#cfd6df] px-3" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}><option value="finance">Finance</option><option value="admin">Admin</option></select>
        <button className="h-11 rounded-md bg-[#1f7a5c] px-5 text-sm font-semibold text-white" type="button" onClick={() => void createUser()}>Create</button>
      </section>
      {message ? <p className="text-sm text-[#146245]">{message}</p> : null}
      {error ? <p className="text-sm text-[#9d2f1f]">{error}</p> : null}
      <AdminTable headers={["Name", "Email", "Username", "Role", "Status", "Last Login", "Actions"]} empty={users.length === 0}>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="px-5 py-3 font-medium">{user.name}</td>
            <td className="px-5 py-3">{user.email}</td>
            <td className="px-5 py-3">{user.username}</td>
            <td className="px-5 py-3 capitalize">{user.role}</td>
            <td className="px-5 py-3 capitalize">{user.status}</td>
            <td className="px-5 py-3">{user.last_login_at ?? "-"}</td>
            <td className="px-5 py-3">
              <div className="flex flex-wrap gap-2">
                <AdminActionButton onClick={() => openEdit(user)}>Edit</AdminActionButton>
                {user.id === currentUser?.id ? "Current user" : user.status === "active" ? (
                  <AdminActionButton onClick={() => window.confirm(`Block user ${user.name}? They will be logged out and cannot sign in until unblocked.`) && void userAction(`/admin/users/${user.id}/block`, "User blocked.")}>Block</AdminActionButton>
                ) : (
                  <AdminActionButton onClick={() => void userAction(`/admin/users/${user.id}/unblock`, "User unblocked.")}>Unblock</AdminActionButton>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
      {editingUser ? (
        <Modal title={`Edit ${editingUser.name}`} onClose={() => setEditingUser(null)}>
          <div className="grid gap-3">
            <input className="h-11 rounded-md border border-[#cfd6df] px-3" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
            <input className="h-11 rounded-md border border-[#cfd6df] px-3" value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} />
            <input className="h-11 rounded-md border border-[#cfd6df] px-3" value={editForm.username} onChange={(event) => setEditForm({ ...editForm, username: event.target.value })} />
            <input className="h-11 rounded-md border border-[#cfd6df] px-3" placeholder="Phone" value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} />
            <select className="h-11 rounded-md border border-[#cfd6df] px-3" value={editForm.role} onChange={(event) => setEditForm({ ...editForm, role: event.target.value as UserRole })}>
              <option value="finance">Finance</option>
              <option value="admin">Admin</option>
            </select>
            <input className="h-11 rounded-md border border-[#cfd6df] px-3" placeholder="New password optional" type="password" value={editForm.password} onChange={(event) => setEditForm({ ...editForm, password: event.target.value })} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-md border border-[#cfd6df] px-4 py-2 text-sm font-semibold text-[#384150]" type="button" onClick={() => setEditingUser(null)}>Cancel</button>
            <button className="rounded-md bg-[#1f7a5c] px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => void saveUserEdit()}>Save User</button>
          </div>
        </Modal>
      ) : null}
      <section className="mt-4 rounded-md border border-[#d8dde5] bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-[#15181d]">Authorized Receivers</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input className="h-11 rounded-md border border-[#cfd6df] px-3" placeholder="Receiver name" value={receiverForm.name} onChange={(event) => setReceiverForm({ ...receiverForm, name: event.target.value })} />
          <input className="h-11 rounded-md border border-[#cfd6df] px-3" placeholder="Relationship or role" value={receiverForm.relationship_or_role} onChange={(event) => setReceiverForm({ ...receiverForm, relationship_or_role: event.target.value })} />
          <button className="h-11 rounded-md bg-[#1f7a5c] px-5 text-sm font-semibold text-white" type="button" onClick={() => void createReceiver()}>Create Receiver</button>
        </div>
      </section>
      <AdminTable headers={["Name", "Role", "Status", "Actions"]} empty={receivers.length === 0}>
        {receivers.map((receiver) => (
          <tr key={receiver.id}>
            <td className="px-5 py-3 font-medium">{receiver.name}</td>
            <td className="px-5 py-3">{receiver.relationship_or_role}</td>
            <td className="px-5 py-3">{receiver.is_active ? "active" : "blocked"}</td>
            <td className="px-5 py-3">
              {receiver.is_active ? (
                <AdminActionButton onClick={() => window.confirm(`Block receiver ${receiver.name}? Finance users will not be able to select them for new handovers.`) && void receiverAction(`/admin/authorized-receivers/${receiver.id}/block`, "Receiver blocked.")}>Block</AdminActionButton>
              ) : (
                <AdminActionButton onClick={() => void receiverAction(`/admin/authorized-receivers/${receiver.id}/unblock`, "Receiver unblocked.")}>Unblock</AdminActionButton>
              )}
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

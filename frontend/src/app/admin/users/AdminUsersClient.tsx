"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { StateBlock } from "@/components/StateBlock";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AuthorizedReceiver, CollectionResponse, User, UserRole } from "@/types";

type UsersTab = "create" | "users" | "receivers";

const emptyUserForm = {
  name: "",
  email: "",
  username: "",
  password: "",
  role: "finance" as UserRole,
  supplier_name: "",
  supplier_contact_person: "",
  supplier_phone: "",
  supplier_email: "",
  supplier_address: "",
};

export function AdminUsersClient() {
  const { token, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<UsersTab>("create");
  const [users, setUsers] = useState<User[]>([]);
  const [receivers, setReceivers] = useState<AuthorizedReceiver[]>([]);
  const [form, setForm] = useState(emptyUserForm);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ ...emptyUserForm, phone: "" });
  const [receiverForm, setReceiverForm] = useState({ name: "", relationship_or_role: "" });
  const [editingReceiver, setEditingReceiver] = useState<AuthorizedReceiver | null>(null);
  const [receiverEditForm, setReceiverEditForm] = useState({ name: "", relationship_or_role: "" });
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

  function clearMessages() {
    setMessage(null);
    setError(null);
  }

  async function createUser() {
    if (!token) return;
    clearMessages();

    try {
      const payload = {
        name: form.name,
        email: form.email,
        username: form.username,
        password: form.password,
        role: form.role,
        supplier: form.role === "supplier" ? {
          name: form.supplier_name,
          contact_person: form.supplier_contact_person || null,
          phone: form.supplier_phone || null,
          email: form.supplier_email || null,
          address: form.supplier_address || null,
        } : undefined,
      };
      const response = await apiRequest<{ data: User }>("/admin/users", { method: "POST", token, body: JSON.stringify(payload) });
      setForm(emptyUserForm);
      setUsers((current) => [...current, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      setMessage(form.role === "supplier" ? "Supplier and login user created." : "User created.");
      setActiveTab("users");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "User action failed.");
    }
  }

  async function userAction(path: string, success: string) {
    if (!token) return;
    clearMessages();

    try {
      const response = await apiRequest<{ data: User }>(path, { method: "POST", token });
      setMessage(success);
      setUsers((current) => current.map((user) => user.id === response.data.id ? response.data : user));
      setEditingUser(response.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "User action failed.");
    }
  }

  function openEdit(user: User) {
    clearMessages();
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      username: user.username,
      password: "",
      phone: user.phone ?? "",
      role: user.role,
      supplier_name: user.supplier?.name ?? "",
      supplier_contact_person: user.supplier?.contact_person ?? "",
      supplier_phone: user.supplier?.phone ?? "",
      supplier_email: user.supplier?.email ?? "",
      supplier_address: user.supplier?.address ?? "",
    });
  }

  async function saveUserEdit() {
    if (!token || !editingUser) return;
    clearMessages();

    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        username: editForm.username,
        phone: editForm.phone || null,
        role: editForm.role,
        supplier: editForm.role === "supplier" ? {
          name: editForm.supplier_name,
          contact_person: editForm.supplier_contact_person || null,
          phone: editForm.supplier_phone || null,
          email: editForm.supplier_email || null,
          address: editForm.supplier_address || null,
        } : undefined,
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
    clearMessages();

    try {
      const response = await apiRequest<{ data: AuthorizedReceiver }>("/admin/authorized-receivers", { method: "POST", token, body: JSON.stringify(receiverForm) });
      setReceiverForm({ name: "", relationship_or_role: "" });
      setReceivers((current) => [...current, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      setMessage("Authorized receiver created.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Receiver action failed.");
    }
  }

  function openReceiver(receiver: AuthorizedReceiver) {
    clearMessages();
    setEditingReceiver(receiver);
    setReceiverEditForm({
      name: receiver.name,
      relationship_or_role: receiver.relationship_or_role,
    });
  }

  async function saveReceiverEdit() {
    if (!token || !editingReceiver) return;
    clearMessages();

    try {
      const response = await apiRequest<{ data: AuthorizedReceiver }>(`/admin/authorized-receivers/${editingReceiver.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify(receiverEditForm),
      });
      setReceivers((current) => current.map((receiver) => receiver.id === response.data.id ? response.data : receiver));
      setEditingReceiver(null);
      setMessage("Authorized receiver updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Receiver update failed.");
    }
  }

  async function receiverStatusAction(path: string, success: string) {
    if (!token) return;
    clearMessages();

    try {
      const response = await apiRequest<{ data: AuthorizedReceiver }>(path, { method: "POST", token });
      setReceivers((current) => current.map((receiver) => receiver.id === response.data.id ? response.data : receiver));
      setEditingReceiver(response.data);
      setMessage(success);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Receiver action failed.");
    }
  }

  if (isLoading) return <StateBlock title="Loading" message="Fetching users." />;

  return (
    <div className="flex flex-col gap-4">
      <section className="grid grid-cols-3 gap-2 rounded-md border border-[#d8dde5] bg-white p-2 shadow-sm">
        <TabButton active={activeTab === "create"} onClick={() => setActiveTab("create")}>Create</TabButton>
        <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>Users</TabButton>
        <TabButton active={activeTab === "receivers"} onClick={() => setActiveTab("receivers")}>Receivers</TabButton>
      </section>

      {message ? <p className="rounded-md border border-[#a8d5c0] bg-[#edf8f3] px-3 py-2 text-sm text-[#146245]">{message}</p> : null}
      {error ? <p className="rounded-md border border-[#f0c4bd] bg-[#fff5f3] px-3 py-2 text-sm text-[#9d2f1f]">{error}</p> : null}

      {activeTab === "create" ? (
        <section className="rounded-md border border-[#d8dde5] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Input label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Input label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
            <Input label="Username" value={form.username} onChange={(value) => setForm({ ...form, username: value })} />
            <Input label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
            <label className="block">
              <span className="text-sm font-medium text-[#384150]">Role</span>
              <select className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 sm:h-11" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
                <option value="finance">Finance</option>
                <option value="admin">Admin</option>
                <option value="supplier">Supplier</option>
              </select>
            </label>
            {form.role === "supplier" ? (
              <>
                <Input label="Supplier company" value={form.supplier_name} onChange={(value) => setForm({ ...form, supplier_name: value })} />
                <Input label="Contact person" value={form.supplier_contact_person} onChange={(value) => setForm({ ...form, supplier_contact_person: value })} />
                <Input label="Supplier phone" value={form.supplier_phone} onChange={(value) => setForm({ ...form, supplier_phone: value })} />
                <Input label="Supplier email" type="email" value={form.supplier_email} onChange={(value) => setForm({ ...form, supplier_email: value })} />
                <Input label="Supplier address" value={form.supplier_address} onChange={(value) => setForm({ ...form, supplier_address: value })} className="xl:col-span-2" />
              </>
            ) : null}
          </div>
          <div className="mt-4 flex justify-end">
            <button className="h-12 w-full rounded-md bg-[#1f7a5c] px-5 text-sm font-semibold text-white sm:h-11 sm:w-auto" type="button" onClick={() => void createUser()}>Create User</button>
          </div>
        </section>
      ) : null}

      {activeTab === "users" ? (
        <section className="grid gap-3">
          {users.length === 0 ? <StateBlock title="No Users" message="No login users were found." /> : null}
          {users.map((user) => (
            <button key={user.id} className="rounded-md border border-[#d8dde5] bg-white p-4 text-left shadow-sm transition hover:border-[#b8c4d2] hover:bg-[#fafbfc]" type="button" onClick={() => openEdit(user)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#15181d]">{user.name}</p>
                  <p className="mt-1 text-sm text-[#687080]">{user.email}</p>
                  <p className="mt-1 text-sm text-[#687080]">{user.username}</p>
                </div>
                <span className={`rounded-md border px-2 py-1 text-xs font-semibold capitalize ${user.status === "active" ? "border-[#a8d5c0] bg-[#edf8f3] text-[#146245]" : "border-[#efb4ad] bg-[#fff1ef] text-[#9d2f1f]"}`}>{user.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#384150]">
                <span className="rounded-md bg-[#eef2f6] px-2 py-1 capitalize">{user.role}</span>
                {user.supplier ? <span className="rounded-md bg-[#eef2f6] px-2 py-1">{user.supplier.name}</span> : null}
                {user.id === currentUser?.id ? <span className="rounded-md bg-[#fff8df] px-2 py-1 text-[#735c05]">Current user</span> : null}
              </div>
            </button>
          ))}
        </section>
      ) : null}

      {activeTab === "receivers" ? (
        <section className="flex flex-col gap-4">
          <section className="rounded-md border border-[#d8dde5] bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input label="Receiver name" value={receiverForm.name} onChange={(value) => setReceiverForm({ ...receiverForm, name: value })} />
              <Input label="Relationship or role" value={receiverForm.relationship_or_role} onChange={(value) => setReceiverForm({ ...receiverForm, relationship_or_role: value })} />
              <button className="h-12 rounded-md bg-[#1f7a5c] px-5 text-sm font-semibold text-white md:mt-7 md:h-11" type="button" onClick={() => void createReceiver()}>Create Receiver</button>
            </div>
          </section>
          <section className="grid gap-3">
            {receivers.map((receiver) => (
              <button key={receiver.id} className="rounded-md border border-[#d8dde5] bg-white p-4 text-left shadow-sm transition hover:border-[#b8c4d2] hover:bg-[#fafbfc]" type="button" onClick={() => openReceiver(receiver)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#15181d]">{receiver.name}</p>
                    <p className="mt-1 text-sm text-[#687080]">{receiver.relationship_or_role}</p>
                  </div>
                  <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${receiver.is_active ? "border-[#a8d5c0] bg-[#edf8f3] text-[#146245]" : "border-[#efb4ad] bg-[#fff1ef] text-[#9d2f1f]"}`}>{receiver.is_active ? "active" : "blocked"}</span>
                </div>
              </button>
            ))}
          </section>
        </section>
      ) : null}

      {editingUser ? (
        <Modal title={`User: ${editingUser.name}`} onClose={() => setEditingUser(null)}>
          <div className="grid gap-3">
            <Input label="Name" value={editForm.name} onChange={(value) => setEditForm({ ...editForm, name: value })} />
            <Input label="Email" type="email" value={editForm.email} onChange={(value) => setEditForm({ ...editForm, email: value })} />
            <Input label="Username" value={editForm.username} onChange={(value) => setEditForm({ ...editForm, username: value })} />
            <Input label="Phone" value={editForm.phone} onChange={(value) => setEditForm({ ...editForm, phone: value })} />
            <label className="block">
              <span className="text-sm font-medium text-[#384150]">Role</span>
              <select className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 sm:h-11" value={editForm.role} onChange={(event) => setEditForm({ ...editForm, role: event.target.value as UserRole })}>
                <option value="finance">Finance</option>
                <option value="admin">Admin</option>
                <option value="supplier">Supplier</option>
              </select>
            </label>
            {editForm.role === "supplier" ? (
              <div className="grid gap-3 rounded-md border border-[#d8dde5] p-3">
                <Input label="Supplier company" value={editForm.supplier_name} onChange={(value) => setEditForm({ ...editForm, supplier_name: value })} />
                <Input label="Contact person" value={editForm.supplier_contact_person} onChange={(value) => setEditForm({ ...editForm, supplier_contact_person: value })} />
                <Input label="Supplier phone" value={editForm.supplier_phone} onChange={(value) => setEditForm({ ...editForm, supplier_phone: value })} />
                <Input label="Supplier email" type="email" value={editForm.supplier_email} onChange={(value) => setEditForm({ ...editForm, supplier_email: value })} />
                <Input label="Supplier address" value={editForm.supplier_address} onChange={(value) => setEditForm({ ...editForm, supplier_address: value })} />
              </div>
            ) : null}
            <Input label="New password optional" type="password" value={editForm.password} onChange={(value) => setEditForm({ ...editForm, password: value })} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button className="min-h-11 rounded-md bg-[#1f7a5c] px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => void saveUserEdit()}>Save Changes</button>
            {editingUser.id === currentUser?.id ? (
              <button className="min-h-11 rounded-md border border-[#cfd6df] px-4 py-2 text-sm font-semibold text-[#384150]" type="button" onClick={() => setEditingUser(null)}>Close</button>
            ) : editingUser.status === "active" ? (
              <button className="min-h-11 rounded-md border border-[#efb4ad] px-4 py-2 text-sm font-semibold text-[#9d2f1f]" type="button" onClick={() => window.confirm(`Block user ${editingUser.name}?`) && void userAction(`/admin/users/${editingUser.id}/block`, "User blocked.")}>Block User</button>
            ) : (
              <button className="min-h-11 rounded-md border border-[#a8d5c0] px-4 py-2 text-sm font-semibold text-[#146245]" type="button" onClick={() => void userAction(`/admin/users/${editingUser.id}/unblock`, "User unblocked.")}>Unblock User</button>
            )}
          </div>
        </Modal>
      ) : null}

      {editingReceiver ? (
        <Modal title={`Receiver: ${editingReceiver.name}`} onClose={() => setEditingReceiver(null)}>
          <div className="grid gap-3">
            <Input label="Receiver name" value={receiverEditForm.name} onChange={(value) => setReceiverEditForm({ ...receiverEditForm, name: value })} />
            <Input label="Relationship or role" value={receiverEditForm.relationship_or_role} onChange={(value) => setReceiverEditForm({ ...receiverEditForm, relationship_or_role: value })} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button className="min-h-11 rounded-md bg-[#1f7a5c] px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => void saveReceiverEdit()}>Save Receiver</button>
            {editingReceiver.is_active ? (
              <button className="min-h-11 rounded-md border border-[#efb4ad] px-4 py-2 text-sm font-semibold text-[#9d2f1f]" type="button" onClick={() => window.confirm(`Block receiver ${editingReceiver.name}?`) && void receiverStatusAction(`/admin/authorized-receivers/${editingReceiver.id}/block`, "Receiver blocked.")}>Block Receiver</button>
            ) : (
              <button className="min-h-11 rounded-md border border-[#a8d5c0] px-4 py-2 text-sm font-semibold text-[#146245]" type="button" onClick={() => void receiverStatusAction(`/admin/authorized-receivers/${editingReceiver.id}/unblock`, "Receiver unblocked.")}>Unblock Receiver</button>
            )}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold ${active ? "bg-[#1f7a5c] text-white" : "bg-[#eef2f6] text-[#384150]"}`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-[#384150]">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 outline-none focus:border-[#1f7a5c] sm:h-11"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

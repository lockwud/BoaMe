"use client";

import { Ban, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Shield, UserRound, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/client-api";

type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  phone: string;
  email?: string;
  location?: string;
  campaigns?: number;
  donations?: number;
};

type PaginatedUsersResponse = {
  data: AdminUser[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const PAGE_SIZE = 6;

function initials(user: AdminUser) {
  return `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
}

function roleTone(role: string) {
  if (role === "ADMIN") return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  if (role === "BENEFICIARY") return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
  if (role === "DONOR") return "bg-[#edf7ee] text-boame-deep ring-1 ring-green-100";
  return "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
}

function statusTone(status: string) {
  if (status === "ACTIVE") return "bg-[#edf7ee] text-boame-deep ring-1 ring-green-100";
  if (status === "PENDING_VERIFICATION") return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  if (status === "BLOCKED") return "bg-red-50 text-red-600 ring-1 ring-red-100";
  return "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
}

function normalizeUsersResponse(payload: AdminUser[] | PaginatedUsersResponse, requestedPage: number, requestedPageSize: number) {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      page: requestedPage,
      pageSize: requestedPageSize,
      total: payload.length,
      totalPages: Math.max(1, Math.ceil(payload.length / requestedPageSize))
    };
  }

  return payload;
}

function UserTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="hidden grid-cols-[1.2fr_0.75fr_0.8fr_0.75fr_130px] gap-4 border-b border-gray-100 px-5 py-3 lg:grid">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className="h-3 rounded-full bg-gray-100" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0 lg:grid-cols-[1.2fr_0.75fr_0.8fr_0.75fr_130px] lg:items-center">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-full bg-gray-100" />
            <span className="space-y-2">
              <span className="block h-3 w-32 rounded-full bg-gray-100" />
              <span className="block h-3 w-24 rounded-full bg-gray-100" />
            </span>
          </div>
          <span className="h-6 w-24 rounded-full bg-gray-100" />
          <span className="h-3 w-20 rounded-full bg-gray-100" />
          <span className="h-6 w-28 rounded-full bg-gray-100" />
          <span className="ml-auto h-8 w-20 rounded-lg bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });

  useEffect(() => {
    loadUsers(page);
  }, [page]);

  async function loadUsers(nextPage = page) {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(PAGE_SIZE)
      });

      const data = normalizeUsersResponse(await apiGet<AdminUser[] | PaginatedUsersResponse>(`/admin/users?${params.toString()}`), nextPage, PAGE_SIZE);
      const nextUsers = data.data;
      setUsers(nextUsers);
      setSelectedId((current) => (current && nextUsers.some((user) => user.id === current) ? current : null));
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        totalPages: Math.max(1, data.totalPages)
      });
      setMessage(null);
    } catch (error) {
      setUsers([]);
      setSelectedId(null);
      setPagination({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });
      setMessage(error instanceof Error ? error.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function blockUser(userId: string) {
    try {
      setProcessingId(userId);
      const response = await apiPost<{ message: string }>(`/admin/users/${userId}/block`, {});
      setMessage(response.message);
      await loadUsers(page);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to block user");
    } finally {
      setProcessingId(null);
    }
  }

  async function unblockUser(userId: string) {
    try {
      setProcessingId(userId);
      const response = await apiPost<{ message: string }>(`/admin/users/${userId}/unblock`, {});
      setMessage(response.message);
      await loadUsers(page);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to unblock user");
    } finally {
      setProcessingId(null);
    }
  }

  const visibleUsers = users;

  const selectedUser = useMemo(() => users.find((user) => user.id === selectedId) ?? null, [selectedId, users]);
  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total);

  if (selectedUser) {
    const blocked = selectedUser.status === "BLOCKED";
    const isProcessing = processingId === selectedUser.id;

    return (
      <section className="rounded-lg border border-gray-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => setSelectedId(null)}
            className="focus-ring inline-flex h-9 w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-xs font-black text-gray-700 transition hover:bg-gray-50"
          >
            <ChevronLeft size={15} />
            Back to users
          </button>

          {blocked ? (
            <button
              onClick={() => unblockUser(selectedUser.id)}
              disabled={isProcessing}
              className="focus-ring inline-flex h-9 w-fit items-center justify-center rounded-lg bg-gray-900 px-4 text-xs font-black text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={14} /> : "Unblock user"}
            </button>
          ) : (
            <button
              onClick={() => blockUser(selectedUser.id)}
              disabled={isProcessing}
              className="focus-ring inline-flex h-9 w-fit items-center gap-1.5 rounded-lg border border-red-200 px-4 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Ban size={14} />}
              Block user
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-boame-deep text-lg font-black text-white">
                {initials(selectedUser)}
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-gray-500">User profile</p>
                <h1 className="mt-2 text-2xl font-black leading-tight text-boame-ink">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h1>
                <p className="mt-1 text-sm font-semibold text-gray-500">{selectedUser.email ?? selectedUser.phone}</p>
                <p className="mt-1 text-xs font-semibold text-gray-500">{selectedUser.phone}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-black ${roleTone(selectedUser.role)}`}>{selectedUser.role}</span>
              <span className={`rounded-full px-3 py-1 text-[11px] font-black ${statusTone(selectedUser.status)}`}>
                {selectedUser.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <section className="space-y-5">
              <div>
                <h2 className="text-sm font-black text-boame-ink">Account details</h2>
                <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 border-b border-gray-100 pb-6">
                  <div>
                    <p className="text-xs font-bold text-gray-500">Role</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">{selectedUser.role}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Status</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">{selectedUser.status.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Location</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">{selectedUser.location ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Activity</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">
                      {selectedUser.role === "DONOR"
                        ? `${selectedUser.donations ?? 0} gifts`
                        : selectedUser.role === "ADMIN"
                          ? "Admin workspace"
                          : `${selectedUser.campaigns ?? 0} campaigns`}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-black text-boame-ink">Contact</h2>
                <div className="mt-4 grid gap-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500">Email</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">{selectedUser.email ?? "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Phone</p>
                    <p className="mt-1 text-sm font-black text-boame-ink">{selectedUser.phone}</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-black text-boame-ink">Review checks</h2>
              <div className="mt-4 grid gap-3">
                {[
                  ["Identity", selectedUser.status === "PENDING_VERIFICATION" ? "Needs beneficiary verification" : "Profile is available"],
                  ["Permissions", selectedUser.role === "ADMIN" ? "Admin dashboard access" : "Standard platform access"],
                  ["Risk", selectedUser.status === "BLOCKED" ? "Account is blocked" : "No active restriction"]
                ].map(([title, detail]) => (
                  <div key={title} className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-4">
                    {title === "Risk" ? <Shield className="mt-0.5 text-boame-deep" size={17} /> : <CheckCircle2 className="mt-0.5 text-boame-deep" size={17} />}
                    <div>
                      <p className="text-sm font-black text-boame-ink">{title}</p>
                      <p className="mt-1 text-xs font-semibold text-gray-500">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="rounded-lg border border-gray-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-boame-soft text-boame-deep">
              <UsersRound size={20} />
            </span>
            <div>
              <h1 className="text-lg font-black text-boame-ink">Users and access</h1>
              <p className="mt-1 text-xs font-semibold text-gray-500">Manage donors, beneficiaries, admins, and permissions.</p>
            </div>
          </div>
        </div>

        {message ? <div className="mx-5 mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">{message}</div> : null}

        <div className="overflow-hidden pt-4">
          {loading ? (
            <UserTableSkeleton />
          ) : (
            <>
              <div className="hidden grid-cols-[1.2fr_0.75fr_0.8fr_0.75fr_130px] gap-4 border-b border-gray-100 px-5 py-3 text-[11px] font-black uppercase tracking-wide text-gray-400 lg:grid">
                <span>User</span>
                <span>Role</span>
                <span>Activity</span>
                <span>Status</span>
                <span className="text-right">Action</span>
              </div>

              {visibleUsers.map((user) => {
            const blocked = user.status === "BLOCKED";
            const isProcessing = processingId === user.id;

            return (
              <button
                key={user.id}
                onClick={() => setSelectedId(user.id)}
                className="focus-ring grid w-full gap-4 border-b border-gray-100 bg-white px-5 py-4 text-left transition hover:bg-gray-50/70 last:border-b-0 lg:grid-cols-[1.2fr_0.75fr_0.8fr_0.75fr_130px] lg:items-center"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-black text-gray-700">
                    {initials(user)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-boame-ink">{user.firstName} {user.lastName}</span>
                    <span className="mt-1 block truncate text-xs font-semibold text-gray-500">{user.phone}</span>
                  </span>
                </span>

                <span className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${roleTone(user.role)}`}>{user.role}</span>
                </span>

                <span className="text-xs font-semibold text-gray-500">
                  {user.role === "DONOR" ? `${user.donations ?? 0} donations` : user.role === "BENEFICIARY" ? `${user.campaigns ?? 0} campaigns` : "Admin workspace"}
                </span>

                <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-black ${statusTone(user.status)}`}>{user.status.replace("_", " ")}</span>

                <span className="flex items-center justify-between gap-2 lg:justify-end">
                  {blocked ? (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        unblockUser(user.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          unblockUser(user.id);
                        }
                      }}
                      className="focus-ring inline-flex h-8 items-center justify-center rounded-lg bg-gray-900 px-3.5 text-xs font-black text-white transition hover:bg-gray-800"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={14} /> : "Unblock"}
                    </span>
                  ) : (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        blockUser(user.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          blockUser(user.id);
                        }
                      }}
                      className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 px-3.5 text-xs font-black text-red-600 transition hover:bg-red-50"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Ban size={14} />}
                      Block
                    </span>
                  )}
                  <ChevronRight className="text-gray-300" size={17} />
                </span>
              </button>
            );
          })}
            </>
          )}
        </div>

        {!loading && visibleUsers.length === 0 ? (
          <div className="py-16 text-center">
            <UserRound size={40} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-bold text-gray-500">No users found.</p>
          </div>
        ) : null}

        {!loading && visibleUsers.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-xs font-semibold text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {startItem}-{endItem} of {pagination.total} users
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
                className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span className="rounded-full bg-gray-50 px-3 py-1.5 font-black text-gray-700">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

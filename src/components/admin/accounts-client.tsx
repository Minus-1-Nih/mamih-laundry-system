"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  KeyRound,
  Pencil,
  Plus,
  Power,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { formatDateTime, initials, roleLabel } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import type { User, ZoneId } from "@/lib/types";

type SheetState =
  | { kind: "create" }
  | { kind: "edit"; user: User }
  | { kind: "reset"; user: User }
  | { kind: "deactivate"; user: User }
  | null;

const roleOrder: Record<string, number> = { owner: 0, admin: 1, store: 1, driver: 2 };

function sortUsers(a: User, b: User): number {
  const rankOf = (user: User) =>
    roleOrder[user.adminLevel ?? user.role] ?? 9;
  const rankA = rankOf(a);
  const rankB = rankOf(b);
  if (rankA !== rankB) return rankA - rankB;
  return a.name.localeCompare(b.name, "id");
}

function RoleBadge({ user }: { user: User }) {
  const owner = user.adminLevel === "owner";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-13 font-medium",
        owner
          ? "bg-primary text-white"
          : user.role === "admin"
            ? "bg-secondary text-primary"
            : "bg-track text-ink",
      )}
    >
      {owner ? <ShieldCheck className="h-3.5 w-3.5" /> : null}
      {roleLabel(user)}
    </span>
  );
}

interface AccountFormProps {
  mode: "create" | "edit";
  user?: User;
  zones: { id: ZoneId; name: string }[];
  onDone: () => void;
}

function AccountForm({ mode, user, zones, onDone }: AccountFormProps) {
  const createUser = useAppStore((state) => state.createUser);
  const updateUser = useAppStore((state) => state.updateUser);
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "driver">(
    user?.role === "driver" ? "driver" : "admin",
  );
  const [zoneIds, setZoneIds] = useState<ZoneId[]>(user?.zoneIds ?? []);
  const [error, setError] = useState<string | null>(null);

  function toggleZone(zoneId: ZoneId) {
    setZoneIds((current) =>
      current.includes(zoneId)
        ? current.filter((item) => item !== zoneId)
        : [...current, zoneId],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (mode === "create") {
      const result = createUser({
        name,
        username,
        phone,
        password,
        role,
        zoneIds: role === "driver" ? zoneIds : undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast({ title: `Akun ${result.user.name} dibuat.` });
      onDone();
      return;
    }

    const result = updateUser(user!.id, {
      name,
      username,
      phone,
      zoneIds: user!.role === "driver" ? zoneIds : undefined,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast({ title: "Perubahan akun disimpan." });
    onDone();
  }

  return (
    <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-danger-fg/20 bg-danger-bg px-3 py-2.5 text-sm text-danger-fg"
        >
          {error}
        </div>
      ) : null}

      <Field label="Nama lengkap" htmlFor="account-name" required>
        <Input
          id="account-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nama yang tampil di sistem"
        />
      </Field>

      <Field
        label="Username"
        htmlFor="account-username"
        hint="Dipakai untuk masuk. Huruf, angka, titik, garis bawah, atau strip."
        required
      >
        <Input
          id="account-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="contoh: nadia"
          autoComplete="off"
        />
      </Field>

      <Field label="Nomor WhatsApp" htmlFor="account-phone">
        <Input
          id="account-phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="0812-3456-7890"
          inputMode="tel"
        />
      </Field>

      {mode === "create" ? (
        <>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-ink">Peran</p>
            <div className="flex gap-2">
              <Chip active={role === "admin"} onClick={() => setRole("admin")}>
                Admin
              </Chip>
              <Chip active={role === "driver"} onClick={() => setRole("driver")}>
                Driver
              </Chip>
            </div>
            <p className="text-xs text-muted">
              Owner tidak dapat ditambahkan. Akun Owner hanya satu dan sudah
              tersedia.
            </p>
          </div>

          <Field
            label="Kata sandi awal"
            htmlFor="account-password"
            hint="Minimal 6 karakter. Sampaikan ke pemilik akun."
            required
          >
            <Input
              id="account-password"
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
            />
          </Field>
        </>
      ) : (
        <div className="rounded-lg border border-border bg-canvas px-3 py-2.5">
          <p className="text-13 text-muted">
            Peran: <span className="font-medium text-ink">{roleLabel(user!)}</span>
            . Peran tidak dapat diubah. Gunakan reset kata sandi untuk mengganti
            akses masuk.
          </p>
        </div>
      )}

      {role === "driver" || user?.role === "driver" ? (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-ink">Zona tugas</p>
          <div className="flex flex-wrap gap-2">
            {zones.map((zone) => (
              <Chip
                key={zone.id}
                active={zoneIds.includes(zone.id)}
                onClick={() => toggleZone(zone.id)}
                aria-pressed={zoneIds.includes(zone.id)}
              >
                {zone.id}, {zone.name}
              </Chip>
            ))}
          </div>
          <p className="text-xs text-muted">
            Driver akan menerima tugas dari zona yang dipilih.
          </p>
        </div>
      ) : null}
    </form>
  );
}

function ResetPasswordForm({
  user,
  onDone,
}: {
  user: User;
  onDone: () => void;
}) {
  const resetPassword = useAppStore((state) => state.resetPassword);
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Konfirmasi kata sandi belum sama.");
      return;
    }
    const result = resetPassword(user.id, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast({ title: `Kata sandi ${user.name} diperbarui.` });
    onDone();
  }

  return (
    <form id="reset-form" onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-danger-fg/20 bg-danger-bg px-3 py-2.5 text-sm text-danger-fg"
        >
          {error}
        </div>
      ) : null}
      <div className="rounded-lg border border-border bg-canvas px-3 py-2.5">
        <p className="text-sm font-medium text-ink">{user.name}</p>
        <p className="text-13 text-muted">@{user.username}</p>
      </div>
      <Field
        label="Kata sandi baru"
        htmlFor="reset-password"
        hint="Minimal 6 karakter."
        required
      >
        <Input
          id="reset-password"
          type="text"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Ulangi kata sandi" htmlFor="reset-confirm" required>
        <Input
          id="reset-confirm"
          type="text"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
        />
      </Field>
    </form>
  );
}

export function AccountsClient() {
  const users = useAppStore((state) => state.users);
  const zones = useAppStore((state) => state.zones);
  const orders = useAppStore((state) => state.orders);
  const deactivateUser = useAppStore((state) => state.deactivateUser);
  const activateUser = useAppStore((state) => state.activateUser);
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "driver">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [sheet, setSheet] = useState<SheetState>(null);

  const accounts = useMemo(
    () => users.filter((user) => user.role === "admin" || user.role === "driver"),
    [users],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return accounts
      .filter((user) => {
        if (roleFilter !== "all" && user.role !== roleFilter) return false;
        if (statusFilter === "active" && !user.active) return false;
        if (statusFilter === "inactive" && user.active) return false;
        if (!needle) return true;
        return (
          user.name.toLowerCase().includes(needle) ||
          user.username.toLowerCase().includes(needle) ||
          user.phone.toLowerCase().includes(needle)
        );
      })
      .sort(sortUsers);
  }, [accounts, roleFilter, statusFilter, search]);

  const activeAdmins = accounts.filter(
    (user) => user.role === "admin" && user.active,
  ).length;
  const activeDrivers = accounts.filter(
    (user) => user.role === "driver" && user.active,
  ).length;
  const inactive = accounts.filter((user) => !user.active).length;

  function activeOrdersFor(userId: string): number {
    return orders.filter(
      (order) =>
        !order.deletedAt &&
        order.driverId === userId &&
        order.status !== "selesai",
    ).length;
  }

  function handleActivate(user: User) {
    const result = activateUser(user.id);
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({ title: `Akun ${user.name} diaktifkan kembali.` });
  }

  function handleDeactivate() {
    if (sheet?.kind !== "deactivate") return;
    const result = deactivateUser(sheet.user.id);
    if (!result.ok) {
      toast({ title: result.error, tone: "error" });
      return;
    }
    toast({ title: `Akun ${sheet.user.name} dinonaktifkan.` });
    setSheet(null);
  }

  return (
    <div>
      <AdminPageHeader
        title="Manajemen akun"
        subtitle="Owner mengelola akun Admin dan Driver. Pelanggan mendaftar sendiri."
        action={
          <Button onClick={() => setSheet({ kind: "create" })}>
            <Plus className="h-4 w-4" />
            Tambah akun
          </Button>
        }
      />

      <Card className="mb-4 flex flex-wrap items-start gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">
            Owner adalah tingkat akses tertinggi dari Admin
          </p>
          <p className="mt-0.5 text-13 text-muted">
            Sistem tetap memiliki tiga peran: Admin, Driver, dan Pelanggan.
            Halaman ini hanya dapat dibuka oleh Owner.
          </p>
        </div>
        <dl className="flex gap-5 text-13">
          <div>
            <dt className="text-muted">Akun aktif</dt>
            <dd className="text-base font-semibold text-ink">
              {activeAdmins + activeDrivers}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Driver aktif</dt>
            <dd className="text-base font-semibold text-ink">{activeDrivers}</dd>
          </div>
          <div>
            <dt className="text-muted">Nonaktif</dt>
            <dd className="text-base font-semibold text-ink">{inactive}</dd>
          </div>
        </dl>
      </Card>

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, username, atau WA..."
              className="pl-9"
              aria-label="Cari akun"
            />
          </div>
          <div className="w-full sm:w-[150px]">
            <Select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as typeof roleFilter)
              }
              aria-label="Filter peran"
            >
              <option value="all">Semua peran</option>
              <option value="admin">Admin</option>
              <option value="driver">Driver</option>
            </Select>
          </div>
          <div className="w-full sm:w-[150px]">
            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as typeof statusFilter)
              }
              aria-label="Filter status akun"
            >
              <option value="all">Semua status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </Select>
          </div>
          <p className="ml-auto text-13 text-muted">
            {filtered.length} dari {accounts.length} akun
          </p>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Tidak ada akun yang cocok"
              description="Ubah kata kunci atau filter peran dan status."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Reset filter
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Akun</TH>
                <TH>Peran</TH>
                <TH>Zona</TH>
                <TH>Kontak</TH>
                <TH>Status</TH>
                <TH>Akses terakhir</TH>
                <TH className="text-right">Aksi</TH>
              </tr>
            </THead>
            <TBody>
              {filtered.map((user) => {
                const owner = user.adminLevel === "owner";
                return (
                  <TR key={user.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-13 font-semibold text-primary"
                          aria-hidden="true"
                        >
                          {initials(user.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{user.name}</p>
                          <p className="text-13 text-muted">@{user.username}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <RoleBadge user={user} />
                    </TD>
                    <TD className="text-13 text-muted">
                      {user.role === "driver"
                        ? (user.zoneIds ?? []).join(", ") || "—"
                        : "Semua zona"}
                    </TD>
                    <TD className="text-13 text-muted">
                      {user.phone || "—"}
                    </TD>
                    <TD>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-13 font-medium",
                          user.active ? "text-done-fg" : "text-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            user.active ? "bg-done-fg" : "bg-muted",
                          )}
                        />
                        {user.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </TD>
                    <TD className="text-13 text-muted">
                      {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Belum pernah"}
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSheet({ kind: "edit", user })}
                          aria-label={`Ubah akun ${user.name}`}
                          title="Ubah akun"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-secondary hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSheet({ kind: "reset", user })}
                          aria-label={`Reset kata sandi ${user.name}`}
                          title="Reset kata sandi"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-secondary hover:text-primary"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        {owner ? (
                          <span
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted/40"
                            title="Akun Owner tidak dapat dinonaktifkan"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              user.active
                                ? setSheet({ kind: "deactivate", user })
                                : handleActivate(user)
                            }
                            aria-label={
                              user.active
                                ? `Nonaktifkan akun ${user.name}`
                                : `Aktifkan akun ${user.name}`
                            }
                            title={user.active ? "Nonaktifkan akun" : "Aktifkan akun"}
                            className={cn(
                              "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                              user.active
                                ? "text-muted hover:bg-danger-bg hover:text-danger-fg"
                                : "text-muted hover:bg-secondary hover:text-primary",
                            )}
                          >
                            <Power className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      <Sheet
        open={sheet?.kind === "create" || sheet?.kind === "edit"}
        onClose={() => setSheet(null)}
        title={sheet?.kind === "edit" ? "Ubah akun" : "Tambah akun"}
        description={
          sheet?.kind === "edit"
            ? "Perbarui data akun. Peran tidak dapat diubah."
            : "Buat akun Admin atau Driver baru. Kata sandi awal wajib diisi."
        }
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setSheet(null)}>
              Batal
            </Button>
            <Button type="submit" form="account-form">
              {sheet?.kind === "edit" ? "Simpan perubahan" : "Buat akun"}
            </Button>
          </div>
        }
      >
        {sheet?.kind === "create" ? (
          <AccountForm
            mode="create"
            zones={zones}
            onDone={() => setSheet(null)}
          />
        ) : sheet?.kind === "edit" ? (
          <AccountForm
            mode="edit"
            user={sheet.user}
            zones={zones}
            onDone={() => setSheet(null)}
          />
        ) : null}
      </Sheet>

      <Sheet
        open={sheet?.kind === "reset"}
        onClose={() => setSheet(null)}
        title="Reset kata sandi"
        description="Kata sandi lama langsung diganti. Sampaikan kata sandi baru kepada pemilik akun."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setSheet(null)}>
              Batal
            </Button>
            <Button type="submit" form="reset-form">
              Simpan kata sandi
            </Button>
          </div>
        }
      >
        {sheet?.kind === "reset" ? (
          <ResetPasswordForm
            user={sheet.user}
            onDone={() => setSheet(null)}
          />
        ) : null}
      </Sheet>

      <Sheet
        open={sheet?.kind === "deactivate"}
        onClose={() => setSheet(null)}
        title="Nonaktifkan akun"
        description="Akun tidak dapat masuk sampai diaktifkan kembali."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setSheet(null)}>
              Batal
            </Button>
            <Button variant="dangerSolid" onClick={handleDeactivate}>
              Nonaktifkan akun
            </Button>
          </div>
        }
      >
        {sheet?.kind === "deactivate" ? (
          <div className="space-y-3 text-sm text-muted">
            <p>
              Akun <span className="font-medium text-ink">{sheet.user.name}</span>{" "}
              (@{sheet.user.username}) akan dinonaktifkan.
            </p>
            {sheet.user.role === "driver" && activeOrdersFor(sheet.user.id) > 0 ? (
              <p className="rounded-lg border border-waiting-fg/20 bg-waiting-bg px-3 py-2.5 text-waiting-fg">
                Driver masih memiliki {activeOrdersFor(sheet.user.id)} tugas
                berjalan. Tugas tetap tercatat, tetapi penugasan baru sebaiknya
                dialihkan lebih dulu.
              </p>
            ) : null}
            <p>Riwayat pesanan dan jejak status tidak dihapus.</p>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}

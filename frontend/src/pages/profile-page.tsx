import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Topbar } from "../components/topbar.js";
import {
  UserIcon,
  ChevronDown,
  LogoutIcon,
  EyeOffIcon,
  PlusIcon,
} from "../components/icons.js";
import { useApi, apiPost, apiPut, apiDelete } from "../data/use-api.js";
import { useUser } from "../context/user-context.js";
import { AVATAR_PRESETS, DEFAULT_AVATAR } from "../data/avatar.js";
import styles from "./profile-page.module.css";

type Section = "profile" | "access";
type Perm = "Dashboard" | "Reports" | "Inventory" | "Orders" | "Settings";
type AccessUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Record<Perm, boolean>;
  protected?: boolean;
};

const PERMS: Perm[] = [
  "Dashboard",
  "Reports",
  "Inventory",
  "Orders",
  "Settings",
];
const FALLBACK: AccessUser[] = [];

/** Profile page with My Profile and Manage Access sections. */
export function ProfilePage() {
  const [section, setSection] = useState<Section>("profile");
  const { logout, hasPermission } = useUser();
  const navigate = useNavigate();
  const canManageAccess = hasPermission("Settings");

  useEffect(() => {
    if (!canManageAccess && section === "access") setSection("profile");
  }, [canManageAccess, section]);

  return (
    <>
      <Topbar title="Profile" />
      <div className={styles.layout}>
        <aside className={styles.menu}>
          <button
            className={`${styles.menuItem} ${section === "profile" ? styles.menuActive : ""}`}
            onClick={() => setSection("profile")}
          >
            <UserIcon size={20} /> My Profile
          </button>
          {canManageAccess && (
            <button
              className={`${styles.menuItem} ${section === "access" ? styles.menuActive : ""}`}
              onClick={() => setSection("access")}
            >
              <ChevronDown size={20} /> Manage Access
            </button>
          )}
          <button
            className={styles.menuItem}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogoutIcon size={20} /> Logout
          </button>
        </aside>

        {section === "profile" ? <MyProfile /> : <ManageAccess />}
      </div>
    </>
  );
}

function MyProfile() {
  const { user, updateProfile } = useUser();
  const INITIAL = useMemo(() => ({
    name: user?.fullName || "Jacques Kagabo",
    email: user?.email || "kagabo12@gmail.com",
    restaurantName: user?.restaurantName || "Foodey",
    avatar: user?.avatar || DEFAULT_AVATAR,
    address: "123 Street, Kigali, Gikondo",
    password: "",
    confirm: "",
  }), [user?.avatar, user?.email, user?.fullName, user?.restaurantName]);
  const [profile, setProfile] = useState(INITIAL);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(profile) !== JSON.stringify(INITIAL);
  const set = (k: keyof typeof INITIAL) => (v: string) =>
    setProfile((p) => ({ ...p, [k]: v }));
  const uploadAvatar = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile((p) => ({ ...p, avatar: String(reader.result || DEFAULT_AVATAR) }));
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setProfile(INITIAL);
  }, [INITIAL]);

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Personal Information</h3>
      <div className={styles.person}>
        <img src={profile.avatar || DEFAULT_AVATAR} alt="" className={styles.personAvatar} />
        <div>
          <div className={styles.personName}>{profile.name}</div>
          <div className={styles.personRole}>Manager</div>
        </div>
      </div>

      <Field id="profile-name" name="fullName" autoComplete="name" label="Full Name" value={profile.name} onChange={set("name")} />
      <Field id="profile-email" name="email" autoComplete="email" label="Email" value={profile.email} onChange={set("email")} />
      <Field id="profile-restaurant" name="restaurantName" autoComplete="organization" label="Restaurant Name" value={profile.restaurantName} onChange={set("restaurantName")} />
      <div className={styles.avatarPanel}>
        <div className={styles.avatarPanelHead}>
          <span>Choose profile avatar</span>
          <label className={styles.uploadBtn}>
            Upload image
            <input id="profile-avatar-upload" name="avatarUpload" type="file" accept="image/*" onChange={(e) => uploadAvatar(e.target.files?.[0])} />
          </label>
        </div>
        <div className={styles.avatarChoices}>
          {AVATAR_PRESETS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              className={`${styles.avatarChoice} ${profile.avatar === avatar ? styles.avatarChoiceActive : ""}`}
              onClick={() => setProfile((p) => ({ ...p, avatar }))}
            >
              <img src={avatar} alt="" />
            </button>
          ))}
        </div>
      </div>
      <Field
        label="Address"
          id="profile-address"
          name="address"
          autoComplete="street-address"
        value={profile.address}
        onChange={set("address")}
      />
      <div className={styles.twoCol}>
        <PassField
          label="Password"
          id="profile-password"
          name="password"
          autoComplete="new-password"
          value={profile.password}
          onChange={set("password")}
        />
        <PassField
          label="Confirm Password"
          id="profile-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          value={profile.confirm}
          onChange={set("confirm")}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button
          className={styles.discard}
          onClick={() => setProfile(INITIAL)}
          disabled={!dirty}
        >
          Discard Changes
        </button>
        <button
          className={styles.save}
          disabled={saving}
          onClick={async () => {
            setError("");
            if (profile.password && profile.password !== profile.confirm) {
              setError("Passwords do not match.");
              return;
            }
            setSaving(true);
            try {
              const updated = await updateProfile({
                fullName: profile.name,
                email: profile.email,
                restaurantName: profile.restaurantName,
                avatar: profile.avatar,
              });
              if (updated) {
                setProfile((current) => ({
                  ...current,
                  name: updated.fullName,
                  email: updated.email,
                  restaurantName: updated.restaurantName,
                  avatar: updated.avatar || DEFAULT_AVATAR,
                  password: "",
                  confirm: "",
                }));
              }
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Profile update failed.");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? <><ReloadIcon /> Saving...</> : saved ? "Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function ReloadIcon() {
  return (
    <svg className={styles.reloadIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v5h-5" />
    </svg>
  );
}

function ManageAccess() {
  const {
    data: users,
    setData,
    refetch,
  } = useApi<AccessUser[]>("access-users", FALLBACK);
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [accessError, setAccessError] = useState("");

  const toggle = async (userId: string, perm: Perm) => {
    const target = users.find((u) => u.id === userId);
    if (!target || target.protected) return;
    const previous = users;
    let next = false;
    setData((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        next = !u.permissions[perm];
        return { ...u, permissions: { ...u.permissions, [perm]: next } };
      }),
    );
    const updated = await apiPut(`access-users/${userId}/permission`, { perm, value: next });
    if (!updated) {
      setData(previous);
      setAccessError("This access row is protected or could not be updated.");
    }
  };

  const addUser = async () => {
    setAccessError("");
    if (!draft.name || !draft.email || !draft.password) {
      setAccessError("Full name, email, and a strong password are required to add a team member.");
      return;
    }
    const created = await apiPost("access-users", {
      name: draft.name,
      email: draft.email,
      role: draft.role || "Sub Admin",
      password: draft.password,
    });
    if (!created) {
      setAccessError("Could not add this user. Check the password strength and email.");
      return;
    }
    setDraft({ name: "", email: "", role: "", password: "" });
    refetch();
  };

  const removeUser = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target || target.protected) return;
    const previous = users;
    setData((prev) => prev.filter((u) => u.id !== id));
    const ok = await apiDelete(`access-users/${id}`);
    if (!ok) {
      setData(previous);
      setAccessError("This access row is protected or could not be removed.");
    }
  };

  return (
    <div className={styles.accessLayout}>
      <div className={styles.addCard}>
        <div className={styles.addCardHead}>
          <div className={styles.addCardIcon}>
            <UserIcon size={20} />
          </div>
          <div>
            <h3 className={styles.addCardTitle}>Add New User</h3>
            <p className={styles.addCardSub}>
              Create an account and assign access permissions
            </p>
          </div>
        </div>
        <div className={styles.addGrid}>
          <div className={styles.addField}>
            <label className={styles.addLabel} htmlFor="access-name">Full Name</label>
            <input
              id="access-name"
              name="name"
              autoComplete="name"
              className={styles.addInput}
              placeholder="e.g. John Doe"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div className={styles.addField}>
            <label className={styles.addLabel} htmlFor="access-email">Email</label>
            <input
              id="access-email"
              name="email"
              type="email"
              autoComplete="email"
              className={styles.addInput}
              placeholder="e.g. john@foodey.com"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </div>
          <div className={styles.addField}>
            <label className={styles.addLabel} htmlFor="access-role">Role</label>
            <select
              id="access-role"
              name="role"
              autoComplete="off"
              className={styles.addInput}
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            >
              <option value="">Select role</option>
              <option>Sub Admin</option>
              <option>Manager</option>
              <option>Chef</option>
            </select>
          </div>
          <div className={styles.addField}>
            <label className={styles.addLabel} htmlFor="access-password">Password</label>
            <div className={styles.passWrap}>
              <input
                id="access-password"
                name="password"
                autoComplete="new-password"
                className={styles.addInput}
                type={showPass ? "text" : "password"}
                placeholder="Set a password"
                value={draft.password}
                onChange={(e) =>
                  setDraft({ ...draft, password: e.target.value })
                }
              />
              <button
                className={styles.passEye}
                onClick={() => setShowPass((s) => !s)}
                type="button"
              >
                <EyeOffIcon size={18} />
              </button>
            </div>
          </div>
        </div>
        {accessError && <p className={styles.error}>{accessError}</p>}
        <button className={styles.addBtn} onClick={addUser}>
          <PlusIcon size={18} /> Add User
        </button>
      </div>

      <div className={styles.card}>
        {users.map((u) => (
          <div key={u.id} className={styles.accessUser}>
            <div className={styles.accessHead}>
              <span className={styles.accessName}>{u.name}</span>
              <span className={styles.roleTag}>{u.role}</span>
              <button
                className={styles.removeUser}
                onClick={() => removeUser(u.id)}
                disabled={u.protected}
              >
                {u.protected ? "Protected" : "Remove"}
              </button>
            </div>
            <div className={styles.accessEmail}>{u.email}</div>
            <div className={styles.perms}>
              {PERMS.map((p) => (
                <div key={p} className={styles.perm}>
                  <div className={styles.permLabel}>{p}</div>
                  <button
                    type="button"
                    className={`${styles.toggle} ${u.permissions[p] ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => toggle(u.id, p)}
                    aria-pressed={u.permissions[p]}
                    disabled={u.protected}
                  >
                    <span className={styles.knob} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  id,
  name,
  autoComplete,
  label,
  value,
  onChange,
}: {
  id: string;
  name: string;
  autoComplete?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        autoComplete={autoComplete}
        className={styles.fieldInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function PassField({
  id,
  name,
  autoComplete,
  label,
  value,
  onChange,
}: {
  id: string;
  name: string;
  autoComplete?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={id}>{label}</label>
      <div className={styles.passInput}>
        <input
          id={id}
          name={name}
          autoComplete={autoComplete}
          type={show ? "text" : "password"}
          value={value}
          placeholder="Enter password"
          onChange={(e) => onChange(e.target.value)}
          className={styles.passField}
        />
        <button
          className={styles.passEye}
          onClick={() => setShow((s) => !s)}
          type="button"
        >
          <EyeOffIcon size={18} />
        </button>
      </div>
    </div>
  );
}

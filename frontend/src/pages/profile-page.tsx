import React, { useState } from "react";
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
  const { logout } = useUser();
  const navigate = useNavigate();

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
          <button
            className={`${styles.menuItem} ${section === "access" ? styles.menuActive : ""}`}
            onClick={() => setSection("access")}
          >
            <ChevronDown size={20} /> Manage Access
          </button>
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
  const INITIAL = {
    name: user?.fullName || "Jacques Kagabo",
    email: user?.email || "kagabo12@gmail.com",
    restaurantName: user?.restaurantName || "Foodey",
    avatar: user?.avatar || DEFAULT_AVATAR,
    address: "123 Street, Kigali, Gikondo",
    password: "",
    confirm: "",
  };
  const [profile, setProfile] = useState(INITIAL);
  const [saved, setSaved] = useState(false);
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

      <Field label="Full Name" value={profile.name} onChange={set("name")} />
      <Field label="Email" value={profile.email} onChange={set("email")} />
      <Field label="Restaurant Name" value={profile.restaurantName} onChange={set("restaurantName")} />
      <div className={styles.avatarPanel}>
        <div className={styles.avatarPanelHead}>
          <span>Choose profile avatar</span>
          <label className={styles.uploadBtn}>
            Upload image
            <input type="file" accept="image/*" onChange={(e) => uploadAvatar(e.target.files?.[0])} />
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
        value={profile.address}
        onChange={set("address")}
      />
      <div className={styles.twoCol}>
        <PassField
          label="Password"
          value={profile.password}
          onChange={set("password")}
        />
        <PassField
          label="Confirm Password"
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
          onClick={async () => {
            setError("");
            if (profile.password && profile.password !== profile.confirm) {
              setError("Passwords do not match.");
              return;
            }
            try {
              await updateProfile({
                fullName: profile.name,
                email: profile.email,
                restaurantName: profile.restaurantName,
                avatar: profile.avatar,
              });
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Profile update failed.");
            }
          }}
        >
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>
    </div>
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
    let next = false;
    setData((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        next = !u.permissions[perm];
        return { ...u, permissions: { ...u.permissions, [perm]: next } };
      }),
    );
    await apiPut(`access-users/${userId}/permission`, { perm, value: next });
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
    setData((prev) => prev.filter((u) => u.id !== id));
    await apiDelete(`access-users/${id}`);
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
            <label className={styles.addLabel}>Full Name</label>
            <input
              className={styles.addInput}
              placeholder="e.g. John Doe"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div className={styles.addField}>
            <label className={styles.addLabel}>Email</label>
            <input
              className={styles.addInput}
              placeholder="e.g. john@foodey.com"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </div>
          <div className={styles.addField}>
            <label className={styles.addLabel}>Role</label>
            <select
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
            <label className={styles.addLabel}>Password</label>
            <div className={styles.passWrap}>
              <input
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
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        className={styles.fieldInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function PassField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.passInput}>
        <input
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

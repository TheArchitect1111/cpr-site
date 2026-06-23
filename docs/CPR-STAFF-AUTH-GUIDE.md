# CPR Staff Guide: Login, Signup, and Account Access

This guide explains how athletes, parents, and CPR admin staff use the CPR website for applications, enrollment, login, and password recovery. Use it when helping families or troubleshooting access issues.

---

## Quick reference

| Who | Login page | Forgot password | Change password |
| --- | --- | --- | --- |
| Athlete | [cpr-site.vercel.app/portal/login](https://cpr-site.vercel.app/portal/login) | `/portal/forgot-password` | Portal → **Account** tab → Change Password |
| Parent | Same portal login | Same forgot-password page | Same Account tab |
| Admin | [cpr-site.vercel.app/admin/login](https://cpr-site.vercel.app/admin/login) | `/admin/forgot-password` | Admin → **Account Settings** |

Support email: **mikecprglobal@mississaugamagic.com**

---

## Athlete journey

### 1. Application (before enrollment)

- Athletes apply at **Apply** on the CPR homepage (`/apply`).
- They submit name, email, sport info, and parent contact details.
- CPR creates a recruiting profile in Airtable with status **Pending**.
- The athlete receives a confirmation email with their public profile link.
- **Important:** Applying does **not** create portal login credentials. Portal access starts after CPR enrolls the athlete.

### 2. Duplicate applications

If someone applies again with the **same email**, the system blocks the duplicate and shows:

> *An application with this email address already exists…*

No second Airtable record is created. Help them contact CPR if they need to update an existing application.

### 3. Enrollment (portal access created)

- CPR staff enroll athletes from **Admin → Create New Client** (`/admin/create-client`).
- The system creates athlete and parent usernames, temporary passwords, and sends welcome emails via Resend.
- Athlete username is usually `first-last` (e.g. `jayden-thompson`).
- Parent username is usually `parent.first-last`.

### 4. Login

1. Go to **Portal Login** (`/portal/login`).
2. Enter **username** and **password** (not email for login, unless the username is an email).
3. After login, the athlete lands on their portal home (`/portal/athlete/{slug}`).

### 5. Forgot password

1. On the portal login page, click **Forgot password?**
2. Enter **username or email**.
3. If a matching enrolled account exists, a reset link is emailed to the address on file (athlete email or parent email, depending on account type).
4. The link expires in **30 minutes** and works **once**.
5. After resetting, sign in at `/portal/login` with the new password.

### 6. Change password (logged in)

1. Sign in to the portal.
2. Open the **Account** tab.
3. Enter current password, new password, and confirmation.
4. Password must be at least **10 characters** with letters and numbers.
5. A note is added to the athlete’s Airtable activity log when the password is changed.

### 7. Profile access

- **Public recruiting profile:** `/profile/{slug}` (created at application).
- **Private portal:** `/portal/athlete/{slug}` after enrollment and login.

---

## Parent journey

### 1. Enrollment

Parents are enrolled together with the athlete. They receive a separate welcome email with:

- Portal login URL
- Parent username (e.g. `parent.jayden-thompson`)
- Temporary password

### 2. Login

Same page as athletes: `/portal/login`. Parents use their **parent username**, not the athlete’s.

After login: `/portal/parent/{slug}`.

### 3. Password reset and change

Same flow as athletes:

- **Forgot password:** `/portal/forgot-password`
- **Change password:** **Account** tab while logged in

Reset emails go to the **parent email** on file.

### 4. Portal access

Parents can use Amplifi™, Update Portal, Resources, Messages, and Account Settings from the portal navigation.

---

## Admin journey

### 1. Login

1. Go to `/admin/login`.
2. Sign in with admin **email** and **password**.
3. Registered admin email: **mikecprglobal@mississaugamagic.com** (stored in Airtable Admin Users or environment config).

### 2. Forgot password

1. On admin login, click **Forgot password?** (`/admin/forgot-password`).
2. Enter admin email.
3. Reset link is emailed (30-minute, one-time use).
4. Set new password at `/admin/reset-password`.

### 3. Change password (logged in)

1. Go to **Account Settings** (`/admin/account`).
2. Enter current password, new password, and confirmation.
3. Same strength rules: 10+ characters, letters and numbers.

### 4. User management and enrollment

- **Registrants / dashboard:** `/admin`
- **Create New Client (enrollment):** `/admin/create-client` — requires admin login (no daily password code).
- Enrollment sends athlete, parent, and admin notification emails.

### 5. Supporting locked-out users

**Portal or admin — too many wrong passwords**

- After **5 failed login attempts**, login is locked for **15 minutes**.
- Portal users see a message with remaining attempts or lockout time.
- Admin users see a lockout message on the login page.
- **Staff action:** Wait for the cooldown, or help the user use **Forgot password** if they do not remember the password.

**Forgot password — no email received**

- Confirm they used the correct username or email.
- Check spam/junk folder.
- Confirm the account is **enrolled** (application alone does not create portal login).
- Resend by having them submit forgot-password again (generates a new link; old link stops working).

**Reset link expired or already used**

- Have them request a new link from forgot-password. Links expire after 30 minutes and work once.

---

## Emails families receive

| Email | When | What it contains |
| --- | --- | --- |
| Application confirmation | After `/apply` | Profile link, next steps |
| Athlete welcome | After enrollment | Login URL, username, temporary password, Account Settings / forgot-password instructions |
| Parent welcome | After enrollment | Same for parent credentials |
| Admin new-client alert | After enrollment | Athlete and parent details for Mike |
| Portal password reset | Forgot password request | One-time reset link |
| Admin password reset | Admin forgot password | One-time reset link |

All transactional emails send through **Resend** from CPR’s configured sender address.

---

## Security notes for staff

- Do not share admin credentials in email or text; use enrollment emails or secure channels for family credentials.
- Temporary passwords should be changed via **Account Settings** after first login.
- If you suspect unauthorized access, change the password immediately and notify Mike.
- Admin sessions expire after **12 hours**; portal sessions after **24 hours**.

---

## Common staff scenarios

**“I applied but can’t log in.”**  
Application ≠ portal access. Check enrollment status in Airtable. If not enrolled, use Create New Client when ready.

**“I forgot my username.”**  
Athlete: usually `first-last`. Parent: `parent.first-last`. Check Airtable or enrollment email.

**“The apply form says my email already exists.”**  
They already applied. Do not create a duplicate; help them with their existing profile or enrollment status.

**“Admin create-client says Unauthorized.”**  
Staff must be signed in at `/admin/login` before using Create New Client.

---

*Last updated: June 2026 — CPR Authentication Hardening sprint*

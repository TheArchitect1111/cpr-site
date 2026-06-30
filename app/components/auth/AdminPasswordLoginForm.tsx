type Props = {
  next?: string;
  disabled?: boolean;
  disabledReason?: string | null;
};

export default function AdminPasswordLoginForm({ next = '/admin', disabled, disabledReason }: Props) {
  return (
    <form action="/api/admin/session" method="post" className="pl-magic-form admin-password-form">
      <input type="hidden" name="next" value={next} />
      <h3>Sign in with password</h3>
      <p className="pl-sub">Use the email and password on your CPR admin account.</p>

      {disabledReason ? (
        <p className="pl-error" role="alert">{disabledReason}</p>
      ) : null}

      <div className="pl-field">
        <label htmlFor="admin-email">EMAIL</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={disabled}
        />
      </div>

      <div className="pl-field">
        <label htmlFor="admin-password">PASSWORD</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={disabled}
        />
      </div>

      <button type="submit" className="pl-btn" disabled={disabled}>
        Sign in
      </button>

      <p className="pl-sub" style={{ marginTop: '0.75rem' }}>
        <a href="/admin/forgot-password">Forgot password?</a>
      </p>
    </form>
  );
}

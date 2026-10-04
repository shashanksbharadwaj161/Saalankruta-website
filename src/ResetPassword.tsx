import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "./api";
export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false);
  return (
    <div className="wrap page narrow">
      <div className="collection-intro">
        <span className="eyebrow">YOUR ACCOUNT</span>
        <h1>A fresh start.</h1>
        <p>Choose a new password with at least 12 characters.</p>
      </div>
      {!done ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await api("complete-reset", {
                key: params.get("key"),
                login: params.get("login"),
                password,
              });
              setDone(true);
              setMessage(
                "Your password has been changed. You can now sign in.",
              );
            } catch (e) {
              setMessage((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            New password
            <input
              required
              type="password"
              autoComplete="new-password"
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="primary" disabled={busy}>
            {busy ? "Saving…" : "Save new password"}
          </button>
        </form>
      ) : (
        <Link className="primary" to="/account/">
          Sign in
        </Link>
      )}
      {message && (
        <p className="service-note" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

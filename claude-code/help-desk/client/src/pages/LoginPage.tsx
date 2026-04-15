import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "../lib/auth-client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError("");
    const { error } = await signIn.email(data);
    if (error) {
      setServerError(error.message ?? "Invalid email or password");
    } else {
      navigate("/");
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Helpdesk</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              {...register("email")}
              type="email"
              autoFocus
              style={{ ...styles.input, ...(errors.email && styles.inputError) }}
              placeholder="you@example.com"
            />
            {errors.email && <p style={styles.error}>{errors.email.message}</p>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              {...register("password")}
              type="password"
              style={{ ...styles.input, ...(errors.password && styles.inputError) }}
              placeholder="••••••••"
            />
            {errors.password && (
              <p style={styles.error}>{errors.password.message}</p>
            )}
          </div>

          {serverError && <p style={styles.error}>{serverError}</p>}

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2.5rem",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    margin: "0 0 0.25rem",
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#111827",
  },
  subtitle: {
    margin: "0 0 1.5rem",
    color: "#6b7280",
    fontSize: "0.95rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "0.625rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "0.95rem",
    outline: "none",
  },
  inputError: {
    border: "1px solid #dc2626",
  },
  error: {
    margin: 0,
    color: "#dc2626",
    fontSize: "0.875rem",
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.7rem",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
};

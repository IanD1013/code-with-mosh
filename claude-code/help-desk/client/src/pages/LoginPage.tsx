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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Helpdesk</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              {...register("email")}
              type="email"
              autoFocus
              className={`px-3 py-2.5 border rounded-lg text-sm outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              {...register("password")}
              type="password"
              className={`px-3 py-2.5 border rounded-lg text-sm outline-none ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-600 text-sm">{errors.password.message}</p>
            )}
          </div>

          {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 py-2.5 bg-blue-600 text-white rounded-lg text-base font-semibold cursor-pointer hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

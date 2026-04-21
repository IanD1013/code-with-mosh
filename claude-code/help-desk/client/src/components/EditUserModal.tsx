import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { editUserSchema, type EditUserData } from "@helpdesk/core";
import type { User } from "./UsersTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserModal({ user, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditUserData>({ resolver: zodResolver(editUserSchema) });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email, password: "" });
  }, [user, reset]);

  async function onSubmit(data: EditUserData) {
    if (!user) return;
    setServerError("");
    try {
      await axios.patch(`/api/users/${user.id}`, data, { withCredentials: true });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(
          (err.response?.data as { error?: string })?.error ?? "Failed to update user."
        );
      } else {
        setServerError("Failed to update user.");
      }
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) setServerError("");
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              {...register("name")}
              id="edit-name"
              placeholder="Jane Doe"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              {...register("email")}
              id="edit-email"
              type="email"
              placeholder="jane@example.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-password">Password</Label>
            <Input
              {...register("password")}
              id="edit-password"
              type="password"
              placeholder="Leave blank to keep unchanged"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-destructive text-sm">{serverError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

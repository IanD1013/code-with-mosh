import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { User } from "./UsersTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteUserModal({ user, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleDelete() {
    if (!user) return;
    setIsDeleting(true);
    setServerError("");
    try {
      await axios.delete(`/api/users/${user.id}`, { withCredentials: true });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(
          (err.response?.data as { error?: string })?.error ?? "Failed to delete user."
        );
      } else {
        setServerError("Failed to delete user.");
      }
    } finally {
      setIsDeleting(false);
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
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-medium text-gray-900">{user?.name}</span>? This action cannot be undone.
        </p>
        {serverError && <p className="text-destructive text-sm">{serverError}</p>}
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

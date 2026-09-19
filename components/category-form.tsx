"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory, updateCategory } from "@/app/actions/categories";
import { Modal } from "@/components/modal";

type CategoryRecord = {
  id: string;
  name: string;
  group: string;
  isIncome: boolean;
  transactionCount: number;
};

const groups = ["Income", "Housing", "Food", "Transport", "Lifestyle", "Health", "Transfers", "Other"];

export function CategoryActions({ category }: { category?: CategoryRecord }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const payload = {
      name: String(formData.get("name") ?? ""),
      group: String(formData.get("group") ?? ""),
      isIncome: formData.get("isIncome") === "on",
    };
    const result = category ? await updateCategory(category.id, payload) : await createCategory(payload);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function onDelete() {
    if (!category || !window.confirm(`Delete ${category.name}?`)) {
      return;
    }
    const result = await deleteCategory(category.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" className={category ? "btn btn-ghost" : "btn btn-primary"} onClick={() => setOpen(true)}>
        {category ? "Edit" : "Add category"}
      </button>
      <Modal title={category ? "Edit category" : "New category"} open={open} onClose={() => setOpen(false)}>
        <form action={onSubmit} className="grid gap-4">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" defaultValue={category?.name} required />
          </div>
          <div className="field">
            <label htmlFor="group">Group</label>
            <input id="group" name="group" list="category-groups" defaultValue={category?.group ?? "Other"} required />
            <datalist id="category-groups">
              {groups.map((group) => (
                <option key={group} value={group} />
              ))}
            </datalist>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isIncome" defaultChecked={category?.isIncome} />
            This is an income category
          </label>
          {error ? <p className="text-sm text-coral">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Saving…" : "Save category"}
            </button>
            {category ? (
              <button type="button" className="btn btn-danger" onClick={onDelete} disabled={category.transactionCount > 0}>
                Delete
              </button>
            ) : null}
          </div>
        </form>
      </Modal>
    </>
  );
}

import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin</h1>
        <p className="mt-2 text-sm text-white/65">Manage global templates and content assets.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/admin/image-templates"
          className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-violet-400/60 hover:bg-violet-500/10"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
              <ImageIcon className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-white/45 transition group-hover:translate-x-0.5 group-hover:text-violet-300" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">Image Templates</h2>
          <p className="mt-1 text-sm text-white/60">
            View, add, edit, delete, and categorize image templates.
          </p>
        </Link>
      </div>
    </div>
  );
}

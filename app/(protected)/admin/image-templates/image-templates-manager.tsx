"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteConfirmationModal from "@/app/components/delete-confirmation-modal";

type TemplateCategory = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

type ImageTemplate = {
  id: string;
  image_url: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  category: Pick<TemplateCategory, "id" | "name" | "slug"> | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ConfirmationState =
  | {
      type: "template" | "category";
      id: string;
      label: string;
    }
  | null;

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export default function ImageTemplatesManager() {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = useState<ImageTemplate[]>([]);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ImageTemplate | null>(null);
  const [selectedTemplateCategoryId, setSelectedTemplateCategoryId] = useState<string>("");
  const [newTemplateCategoryName, setNewTemplateCategoryName] = useState("");
  const [templateImageFile, setTemplateImageFile] = useState<File | null>(null);
  const [templateImagePreview, setTemplateImagePreview] = useState<string>("");
  const [templatePreviewObjectUrl, setTemplatePreviewObjectUrl] = useState<string | null>(null);
  const [submittingTemplate, setSubmittingTemplate] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TemplateCategory | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [submittingCategory, setSubmittingCategory] = useState(false);

  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);
  const [deleting, setDeleting] = useState(false);

  const hasTemplates = templates.length > 0;

  const hasNextPage = useMemo(() => {
    return page < pagination.totalPages;
  }, [page, pagination.totalPages]);

  useEffect(() => {
    return () => {
      if (templatePreviewObjectUrl) {
        URL.revokeObjectURL(templatePreviewObjectUrl);
      }
    };
  }, [templatePreviewObjectUrl]);

  async function fetchCategories() {
    try {
      setLoadingCategories(true);
      const response = await fetch("/api/admin/template-categories", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load categories");
      }

      setCategories(Array.isArray(data?.categories) ? data.categories : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load categories";
      toast.error(message);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function fetchTemplates(targetPage: number, targetCategoryId: string) {
    try {
      setLoadingTemplates(true);
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: "10",
      });

      if (targetCategoryId !== "all") {
        params.set("categoryId", targetCategoryId);
      }

      const response = await fetch(`/api/admin/image-templates?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load image templates");
      }

      setTemplates(Array.isArray(data?.templates) ? data.templates : []);
      setPagination(data?.pagination || DEFAULT_PAGINATION);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load image templates";
      toast.error(message);
    } finally {
      setLoadingTemplates(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTemplates(page, selectedCategoryFilter);
  }, [page, selectedCategoryFilter]);

  function openCreateTemplateModal() {
    if (templatePreviewObjectUrl) {
      URL.revokeObjectURL(templatePreviewObjectUrl);
      setTemplatePreviewObjectUrl(null);
    }
    setEditingTemplate(null);
    setSelectedTemplateCategoryId("");
    setNewTemplateCategoryName("");
    setTemplateImageFile(null);
    setTemplateImagePreview("");
    setIsTemplateModalOpen(true);
  }

  function openEditTemplateModal(template: ImageTemplate) {
    if (templatePreviewObjectUrl) {
      URL.revokeObjectURL(templatePreviewObjectUrl);
      setTemplatePreviewObjectUrl(null);
    }
    setEditingTemplate(template);
    setSelectedTemplateCategoryId(template.category_id ?? "");
    setNewTemplateCategoryName("");
    setTemplateImageFile(null);
    setTemplateImagePreview(template.image_url);
    setIsTemplateModalOpen(true);
  }

  function closeTemplateModal() {
    if (submittingTemplate) return;
    if (templatePreviewObjectUrl) {
      URL.revokeObjectURL(templatePreviewObjectUrl);
      setTemplatePreviewObjectUrl(null);
    }
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
    setSelectedTemplateCategoryId("");
    setNewTemplateCategoryName("");
    setTemplateImageFile(null);
    setTemplateImagePreview("");
  }

  function openCreateCategoryModal() {
    setEditingCategory(null);
    setCategoryNameInput("");
    setIsCategoryModalOpen(true);
  }

  function openEditCategoryModal(category: TemplateCategory) {
    setEditingCategory(category);
    setCategoryNameInput(category.name);
    setIsCategoryModalOpen(true);
  }

  function closeCategoryModal() {
    if (submittingCategory) return;
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryNameInput("");
  }

  function onTemplateFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    setTemplateImageFile(file);

    if (!file) {
      if (templatePreviewObjectUrl) {
        URL.revokeObjectURL(templatePreviewObjectUrl);
        setTemplatePreviewObjectUrl(null);
      }
      setTemplateImagePreview(editingTemplate?.image_url ?? "");
      return;
    }

    if (templatePreviewObjectUrl) {
      URL.revokeObjectURL(templatePreviewObjectUrl);
    }
    const localPreview = URL.createObjectURL(file);
    setTemplatePreviewObjectUrl(localPreview);
    setTemplateImagePreview(localPreview);
  }

  async function uploadTemplateImage(file: File) {
    const signedResponse = await fetch("/api/uploads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });

    const signedData = await signedResponse.json();

    if (!signedResponse.ok) {
      throw new Error(signedData?.error || "Failed to request upload URL");
    }

    const uploadResponse = await fetch(signedData.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload image file");
    }

    return signedData.publicUrl as string;
  }

  async function createCategory(name: string) {
    const response = await fetch("/api/admin/template-categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Failed to create category");
    }

    return data.category as TemplateCategory;
  }

  async function resolveTemplateCategoryId() {
    const normalizedNewName = normalizeName(newTemplateCategoryName);

    if (normalizedNewName) {
      const existingCategory = categories.find(
        (category) => normalizeName(category.name).toLowerCase() === normalizedNewName.toLowerCase()
      );

      if (existingCategory) {
        return existingCategory.id;
      }

      const createdCategory = await createCategory(normalizedNewName);
      await fetchCategories();
      return createdCategory.id;
    }

    if (!selectedTemplateCategoryId) {
      throw new Error("Select a category or create a new one");
    }

    return selectedTemplateCategoryId;
  }

  async function onTemplateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmittingTemplate(true);

      const categoryId = await resolveTemplateCategoryId();
      let imageUrl = editingTemplate?.image_url ?? "";

      if (templateImageFile) {
        imageUrl = await uploadTemplateImage(templateImageFile);
      }

      if (!imageUrl) {
        throw new Error("Please upload an image");
      }

      if (editingTemplate) {
        const response = await fetch(`/api/admin/image-templates/${editingTemplate.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId,
            imageUrl,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to update image template");
        }

        toast.success("Image template updated");
      } else {
        const response = await fetch("/api/admin/image-templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId,
            imageUrl,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to create image template");
        }

        toast.success("Image template added");
      }

      closeTemplateModal();
      await fetchTemplates(page, selectedCategoryFilter);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save template";
      toast.error(message);
    } finally {
      setSubmittingTemplate(false);
    }
  }

  async function onCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmittingCategory(true);

      const name = normalizeName(categoryNameInput);
      if (!name) {
        throw new Error("Category name is required");
      }

      if (editingCategory) {
        const response = await fetch(`/api/admin/template-categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to update category");
        }

        toast.success("Category updated");
      } else {
        await createCategory(name);
        toast.success("Category created");
      }

      closeCategoryModal();
      await fetchCategories();
      await fetchTemplates(page, selectedCategoryFilter);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save category";
      toast.error(message);
    } finally {
      setSubmittingCategory(false);
    }
  }

  async function onDeleteConfirm() {
    if (!confirmation) return;

    try {
      setDeleting(true);
      let nextPage = page;
      let nextFilter = selectedCategoryFilter;

      if (confirmation.type === "template") {
        const response = await fetch(`/api/admin/image-templates/${confirmation.id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to delete template");
        }

        if (templates.length === 1 && page > 1) {
          nextPage = page - 1;
          setPage(nextPage);
        }

        toast.success("Image template deleted");
      } else {
        const response = await fetch(`/api/admin/template-categories/${confirmation.id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to delete category");
        }

        if (selectedCategoryFilter === confirmation.id) {
          nextFilter = "all";
          nextPage = 1;
          setSelectedCategoryFilter("all");
          setPage(1);
        }

        toast.success("Category deleted");
        await fetchCategories();
      }

      setConfirmation(null);
      await fetchTemplates(nextPage, nextFilter);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Image Templates</h2>
          <p className="mt-1 text-sm text-white/65">
            Manage all template images, categories, filters, and pagination.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            onClick={openCreateCategoryModal}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
          <Button
            type="button"
            className="bg-violet-600 text-white hover:bg-violet-500"
            onClick={openCreateTemplateModal}
          >
            <Plus className="h-4 w-4" />
            Add Image Template
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full max-w-xs">
            <p className="mb-1 text-xs text-white/50">Filter by Category</p>
            <Select
              value={selectedCategoryFilter}
              onValueChange={(value) => {
                setSelectedCategoryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full border-white/20 bg-black/20 text-white">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="border-white/20 bg-[#090912] text-white">
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-white/60">
            {loadingTemplates ? "Loading templates..." : `${pagination.total} total templates`}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/85">Categories</h3>
          {loadingCategories && <span className="text-xs text-white/50">Loading...</span>}
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-white/55">No categories yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs text-white/85"
              >
                <span>{category.name}</span>
                <button
                  type="button"
                  className="text-white/55 transition hover:text-violet-300"
                  onClick={() => openEditCategoryModal(category)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="text-white/55 transition hover:text-red-300"
                  onClick={() =>
                    setConfirmation({
                      type: "category",
                      id: category.id,
                      label: category.name,
                    })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {loadingTemplates ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : hasTemplates ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <article
              key={template.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#08080f]"
            >
              <div className="relative aspect-[4/3] w-full bg-black/20">
                <Image
                  src={template.image_url}
                  alt={template.category?.name || "Template image"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white/80">
                    {template.category?.name || "Uncategorized"}
                  </span>
                  <span className="text-xs text-white/45">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => openEditTemplateModal(template)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    onClick={() =>
                      setConfirmation({
                        type: "template",
                        id: template.id,
                        label: template.category?.name || "template",
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <p className="text-white/75">No image templates found for this filter.</p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm text-white/60">
          Page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            disabled={page <= 1 || loadingTemplates}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            disabled={!hasNextPage || loadingTemplates}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={closeTemplateModal}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#090914] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              {editingTemplate ? "Edit Image Template" : "Add Image Template"}
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Choose a category, optionally create a new one, then upload the image.
            </p>

            <form onSubmit={onTemplateSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs text-white/70">Existing Category</label>
                <Select
                  value={selectedTemplateCategoryId || "none"}
                  onValueChange={(value) =>
                    setSelectedTemplateCategoryId(value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full border-white/20 bg-black/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="border-white/20 bg-[#090912] text-white">
                    <SelectItem value="none">Select category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-white/70">Or Create Category</label>
                <Input
                  value={newTemplateCategoryName}
                  onChange={(event) => setNewTemplateCategoryName(event.target.value)}
                  placeholder="e.g. Real Estate"
                  className="border-white/20 bg-black/20 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-white/70">Template Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={onTemplateFileChange}
                  className="border-white/20 bg-black/20 text-white"
                />
              </div>

              {templateImagePreview && (
                <div className="overflow-hidden rounded-xl border border-white/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={templateImagePreview} alt="Template preview" className="h-48 w-full object-cover" />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={closeTemplateModal}
                  disabled={submittingTemplate}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-violet-600 text-white hover:bg-violet-500"
                  disabled={submittingTemplate}
                >
                  {submittingTemplate ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingTemplate ? (
                    "Save Changes"
                  ) : (
                    "Add Template"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={closeCategoryModal}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#090914] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              {editingCategory ? "Edit Category" : "Create Category"}
            </h3>
            <p className="mt-1 text-sm text-white/60">Category names are used for filtering templates.</p>

            <form onSubmit={onCategorySubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs text-white/70">Category Name</label>
                <Input
                  value={categoryNameInput}
                  onChange={(event) => setCategoryNameInput(event.target.value)}
                  placeholder="e.g. Fashion"
                  className="border-white/20 bg-black/20 text-white placeholder:text-white/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={closeCategoryModal}
                  disabled={submittingCategory}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-violet-600 text-white hover:bg-violet-500"
                  disabled={submittingCategory}
                >
                  {submittingCategory ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingCategory ? (
                    "Save Category"
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={Boolean(confirmation)}
        onClose={() => {
          if (!deleting) {
            setConfirmation(null);
          }
        }}
        onConfirm={onDeleteConfirm}
        title={
          confirmation?.type === "category" ? "Delete Category" : "Delete Image Template"
        }
        description={
          confirmation?.type === "category"
            ? `Delete category \"${confirmation.label}\"? Templates in it will become uncategorized.`
            : "Delete this image template? This action cannot be undone."
        }
        confirmText="Delete"
        isDeleting={deleting}
      />
    </div>
  );
}

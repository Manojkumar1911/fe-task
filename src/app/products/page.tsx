"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState as useReactState } from "react";
import React from "react";
import { useRouter } from "next/navigation";

// Define the product type based on DummyJSON API
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

const productSchema = z.object({
  title: z.string().min(1),
  price: z.number().min(0),
  rating: z.number().min(0).max(5),
  brand: z.string().min(1),
  description: z.string().min(1),
});

type ProductForm = z.infer<typeof productSchema>;

// Utility to get products from localStorage or DummyJSON
async function getProducts(page: number, pageSize: number) {
  const local = localStorage.getItem('products');
  if (local) {
    const all = JSON.parse(local);
    const products = all.slice(page * pageSize, (page + 1) * pageSize);
    return { products, total: all.length };
  } else {
    const res = await fetch(`https://dummyjson.com/products?limit=1000`);
    const data = await res.json();
    localStorage.setItem('products', JSON.stringify(data.products));
    const products = data.products.slice(page * pageSize, (page + 1) * pageSize);
    return { products, total: data.products.length };
  }
}

function AddProductModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });
  const mutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      // Add to localStorage
      const local = localStorage.getItem('products');
      let all = local ? JSON.parse(local) : [];
      const newId = all.length ? Math.max(...all.map((p: Product) => p.id)) + 1 : 1;
      const newProduct = { ...data, id: newId };
      all = [newProduct, ...all];
      localStorage.setItem('products', JSON.stringify(all));
      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      reset();
      onClose();
    },
  });
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        className="bg-white p-6 rounded shadow w-96 flex flex-col gap-2"
        onSubmit={handleSubmit((data) => mutation.mutate({ ...data, price: Number(data.price), rating: Number(data.rating) }))}
      >
        <h2 className="text-lg font-bold mb-2">Add Product</h2>
        <input {...register("title")}
          placeholder="Title" className="border p-2 rounded" />
        {errors.title && <span className="text-red-500">{errors.title.message}</span>}
        <input {...register("price", { valueAsNumber: true })}
          placeholder="Price" type="number" className="border p-2 rounded" />
        {errors.price && <span className="text-red-500">{errors.price.message}</span>}
        <input {...register("rating", { valueAsNumber: true })}
          placeholder="Rating" type="number" step="0.1" className="border p-2 rounded" />
        {errors.rating && <span className="text-red-500">{errors.rating.message}</span>}
        <input {...register("brand")}
          placeholder="Brand" className="border p-2 rounded" />
        {errors.brand && <span className="text-red-500">{errors.brand.message}</span>}
        <textarea {...register("description")}
          placeholder="Description" className="border p-2 rounded" />
        {errors.description && <span className="text-red-500">{errors.description.message}</span>}
        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={mutation.isLoading}>Add</button>
          <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancel</button>
        </div>
        {mutation.isError && <span className="text-red-500">Error adding product.</span>}
      </form>
    </div>
  );
}

function EditProductModal({ open, onClose, product }: { open: boolean; onClose: () => void; product: Product | null }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {},
  });
  React.useEffect(() => {
    if (product) {
      setValue("title", product.title);
      setValue("price", product.price);
      setValue("rating", product.rating);
      setValue("brand", product.brand);
      setValue("description", product.description);
    }
  }, [product, setValue]);
  const mutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      // Update in localStorage
      const local = localStorage.getItem('products');
      let all = local ? JSON.parse(local) : [];
      all = all.map((p: Product) =>
        p.id === product?.id ? { ...p, ...data } : p
      );
      localStorage.setItem('products', JSON.stringify(all));
      return { ...product, ...data };
    },
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries(["products"]);
      reset();
      onClose();
    },
  });
  if (!open || !product) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        className="bg-white p-6 rounded shadow w-96 flex flex-col gap-2"
        onSubmit={handleSubmit((data) => mutation.mutate({ ...data, price: Number(data.price), rating: Number(data.rating) }))}
      >
        <h2 className="text-lg font-bold mb-2">Edit Product</h2>
        <input {...register("title")}
          placeholder="Title" className="border p-2 rounded" />
        {errors.title && <span className="text-red-500">{errors.title.message}</span>}
        <input {...register("price", { valueAsNumber: true })}
          placeholder="Price" type="number" className="border p-2 rounded" />
        {errors.price && <span className="text-red-500">{errors.price.message}</span>}
        <input {...register("rating", { valueAsNumber: true })}
          placeholder="Rating" type="number" step="0.1" className="border p-2 rounded" />
        {errors.rating && <span className="text-red-500">{errors.rating.message}</span>}
        <input {...register("brand")}
          placeholder="Brand" className="border p-2 rounded" />
        {errors.brand && <span className="text-red-500">{errors.brand.message}</span>}
        <textarea {...register("description")}
          placeholder="Description" className="border p-2 rounded" />
        {errors.description && <span className="text-red-500">{errors.description.message}</span>}
        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={mutation.isLoading}>Save</button>
          <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancel</button>
        </div>
        {mutation.isError && <span className="text-red-500">Error updating product.</span>}
      </form>
    </div>
  );
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-2 bg-gray-100" />
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="p-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<{ id: keyof Product; desc: boolean } | null>(null);
  const [addOpen, setAddOpen] = useReactState(false);
  const [editOpen, setEditOpen] = useReactState(false);
  const [editProduct, setEditProduct] = useReactState<Product | null>(null);
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Remove from localStorage
      const local = localStorage.getItem('products');
      let all = local ? JSON.parse(local) : [];
      all = all.filter((p: Product) => p.id !== id);
      localStorage.setItem('products', JSON.stringify(all));
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries(["products"]);
    },
  });

  // Move columns definition here so it can access sorting and setSorting
  const columns: ColumnDef<Product>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Title"
          onSort={(id, desc) => setSorting({ id: id as keyof Product, desc })}
          isSorted={sorting?.id === "title"}
          isDesc={sorting?.id === "title" && sorting.desc}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Price"
          onSort={(id, desc) => setSorting({ id: id as keyof Product, desc })}
          isSorted={sorting?.id === "price"}
          isDesc={sorting?.id === "price" && sorting.desc}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Rating"
          onSort={(id, desc) => setSorting({ id: id as keyof Product, desc })}
          isSorted={sorting?.id === "rating"}
          isDesc={sorting?.id === "rating" && sorting.desc}
        />
      ),
      enableSorting: true,
    },
    { accessorKey: "brand", header: "Brand" },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", page, pageSize],
    queryFn: async () => getProducts(page, pageSize),
  });

  const sortedData = useMemo(() => {
    if (!data?.products || !sorting) return data?.products || [];
    const sorted = [...data.products].sort((a, b) => {
      const aValue = a[sorting.id];
      const bValue = b[sorting.id];
      if (aValue < bValue) return sorting.desc ? 1 : -1;
      if (aValue > bValue) return sorting.desc ? -1 : 1;
      return 0;
    });
    return sorted;
  }, [data, sorting]);

  const actionColumn: ColumnDef<Product> = {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button className="text-blue-600 underline" onClick={() => { setEditProduct(row.original); setEditOpen(true); }}>Edit</button>
        <button className="text-red-600 underline" onClick={() => { if (window.confirm("Delete this product?")) deleteMutation.mutate(row.original.id); }}>Delete</button>
      </div>
    ),
  };

  const router = useRouter();

  const [search, setSearch] = useReactState("");
  const [debouncedSearch, setDebouncedSearch] = useReactState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);
  const filteredData = useMemo(() => {
    if (!debouncedSearch) return sortedData;
    return sortedData.filter(
      (p) =>
        p &&
        typeof p.title === "string" &&
        typeof p.brand === "string" &&
        (p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.brand.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
  }, [sortedData, debouncedSearch]);

  return (
    <main className="min-h-screen h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <button className="mb-4 bg-green-600 text-white px-4 py-2 rounded cursor-pointer" onClick={() => setAddOpen(true)}>Add Product</button>
        <AddProductModal open={addOpen} onClose={() => setAddOpen(false)} />
        <EditProductModal open={editOpen} onClose={() => setEditOpen(false)} product={editProduct} />
        <input
          className="mb-4 border px-3 py-2 rounded w-full max-w-md"
          placeholder="Search by title or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isLoading ? (
          <TableSkeleton columns={columns.length + 1} />
        ) : error ? (
          <div>Error loading products.</div>
        ) : (
          <DataTable
            columns={[...columns, actionColumn]}
            data={filteredData}
            getRowProps={(row) => ({
              onClick: () => router.push(`/products/${row.original.id}`),
              className: "cursor-pointer hover:bg-gray-100",
            })}
          />
        )}
      </div>
      {/* Pagination Controls */}
      {data && (
        <div className="flex items-center justify-between p-4 border-t bg-white sticky bottom-0 z-10">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <span>
            Page {page + 1} of {Math.ceil(data.total / pageSize)}
          </span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
            onClick={() => setPage((p) => (p + 1 < Math.ceil(data.total / pageSize) ? p + 1 : p))}
            disabled={page + 1 >= Math.ceil(data.total / pageSize)}
          >
            Next
          </button>
          <select
            className="ml-4 border rounded px-2 py-1 cursor-pointer"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
          >
            {[10, 20, 40, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      )}
    </main>
  );
} 
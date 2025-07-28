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
import Navbar from "@/components/navbar"

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
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={mutation.isPending}>Add</button>
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
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
      onClose();
    },
  });
  if (!open || !product) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4"
        onSubmit={handleSubmit((data) => mutation.mutate({ ...data, price: Number(data.price), rating: Number(data.rating) }))}
      >
        <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
        
        <div className="relative">
          <input 
            {...register("title")} 
            id="title"
            className="w-full px-4 py-3 border rounded-md peer pt-6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
          <label 
            htmlFor="title" 
            className="absolute text-sm text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
          >
            Title
          </label>
          {errors.title && <span className="text-red-500 text-sm mt-1">{errors.title.message}</span>}
        </div>
        
        <div className="relative">
          <input 
            {...register("price", { valueAsNumber: true })} 
            id="price"
            type="number" 
            step="0.01"
            className="w-full px-4 py-3 border rounded-md peer pt-6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
          <label 
            htmlFor="price" 
            className="absolute text-sm text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
          >
            Price
          </label>
          {errors.price && <span className="text-red-500 text-sm mt-1">{errors.price.message}</span>}
        </div>
        
        <div className="relative">
          <input 
            {...register("rating", { valueAsNumber: true })} 
            id="rating"
            type="number" 
            step="0.1" 
            className="w-full px-4 py-3 border rounded-md peer pt-6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
          <label 
            htmlFor="rating" 
            className="absolute text-sm text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
          >
            Rating
          </label>
          {errors.rating && <span className="text-red-500 text-sm mt-1">{errors.rating.message}</span>}
        </div>
        
        <div className="relative">
          <input 
            {...register("brand")} 
            id="brand"
            className="w-full px-4 py-3 border rounded-md peer pt-6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
          <label 
            htmlFor="brand" 
            className="absolute text-sm text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
          >
            Brand
          </label>
          {errors.brand && <span className="text-red-500 text-sm mt-1">{errors.brand.message}</span>}
        </div>
        
        <div className="relative">
          <textarea 
            {...register("description")} 
            id="description"
            className="w-full px-4 py-3 border rounded-md peer pt-6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]" 
          />
          <label 
            htmlFor="description" 
            className="absolute text-sm text-gray-500 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
          >
            Description
          </label>
          {errors.description && <span className="text-red-500 text-sm mt-1">{errors.description.message}</span>}
        </div>
        
        <div className="flex gap-3 mt-2">
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </button>
          <button 
            type="button" 
            className="flex-1 bg-gray-200 px-4 py-3 rounded-md hover:bg-gray-300 transition-colors font-medium" 
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
        {mutation.isError && <span className="text-red-500 text-sm">Error updating product.</span>}
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
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Move columns definition here so it can access sorting and setSorting
  const columns: ColumnDef<Product>[] = [
    { accessorKey: "id", header: "ID" },
    // The title column already has the integrated image
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
      cell: ({ row }) => {
        const thumbnail = row.original.thumbnail;
        return (
          <div className="flex items-center gap-3">
            {thumbnail && (
              <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={thumbnail} 
                  alt={row.original.title} 
                  className="object-cover h-full w-full"
                />
              </div>
            )}
            <span>{row.getValue("title")}</span>
          </div>
        );
      },
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
    // Add this to your columns array before the title column
    {
      accessorKey: "thumbnail",
      header: "Image",
      cell: ({ row }) => {
        const thumbnail = row.original.thumbnail;
        return thumbnail ? (
          <div className="relative h-10 w-10 rounded overflow-hidden">
            <img 
              src={thumbnail} 
              alt={row.original.title} 
              className="object-cover h-full w-full"
            />
          </div>
        ) : null;
      },
    },
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
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button 
          className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer" 
          onClick={() => { setEditProduct(row.original); setEditOpen(true); }}
        >
          Edit
        </button>
        <button 
          className="text-red-600 hover:text-red-800 font-medium cursor-pointer" 
          onClick={(e) => { 
            e.stopPropagation();
            if (window.confirm(`Are you sure you want to delete ${row.original.title}?`)) {
              deleteMutation.mutate(row.original.id);
            }
          }}
        >
          Delete
        </button>
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

  // Add useEffect for setting document title
  useEffect(() => {
    document.title = "All Products – MyShop";
  }, []);

  return (
    // Update the main container in products page
    <main className="min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 p-4 container mx-auto max-w-7xl overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <button 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors cursor-pointer" 
            onClick={() => setAddOpen(true)}
          >
            Add Product
          </button>
        </div>
        <AddProductModal open={addOpen} onClose={() => setAddOpen(false)} />
        <EditProductModal open={editOpen} onClose={() => setEditOpen(false)} product={editProduct} />
        
        {isLoading ? (
          <TableSkeleton columns={columns.length + 1} />
        ) : error ? (
          <div className="p-4 text-red-500 bg-red-50 rounded-md">Error loading products.</div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <DataTable
              columns={[...columns, actionColumn]}
              data={filteredData}
              getRowProps={(row) => ({
                onClick: () => router.push(`/products/${row.original.id}`),
                className: "cursor-pointer hover:bg-accent/50 transition-colors",
              })}
            />
          </div>
        )}
      </div>
    </main>
  );
}
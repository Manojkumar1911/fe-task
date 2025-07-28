"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Image from "next/image";
import type { Product } from "../page";
import { ArrowLeft, Star, Trash } from "lucide-react";
import Link from "next/link";

// Function to fetch a single product by ID
async function getProduct(id: string) {
  // First try to get from localStorage
  const local = localStorage.getItem('products');
  if (local) {
    const products = JSON.parse(local);
    const product = products.find((p: Product) => p.id === Number(id));
    if (product) return product;
  }
  
  // If not found in localStorage, fetch from API
  const res = await fetch(`https://dummyjson.com/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Remove from localStorage
      const local = localStorage.getItem('products');
      let all = local ? JSON.parse(local) : [];
      all = all.filter((p: Product) => p.id !== id);
      localStorage.setItem('products', JSON.stringify(all));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push('/products');
    },
  });

  // Set the document title when product data is loaded
  useEffect(() => {
    if (product?.title) {
      document.title = `${product.title} – MyShop`;
    }
    return () => {
      document.title = "All Products – MyShop";
    };
  }, [product]);

  const handleDelete = () => {
    if (product && window.confirm(`Are you sure you want to delete ${product.title}?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  if (isLoading) return (
    <main className="min-h-screen overflow-auto">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        </div>
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen overflow-auto">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="text-red-500">Error loading product details.</div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen overflow-auto">
      <Navbar />
      <div className="container mx-auto p-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/products" 
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Products
          </Link>
          <button 
            onClick={handleDelete}
            className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors cursor-pointer"
          >
            <Trash className="mr-1 h-4 w-4" />
            Delete Product
          </button>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm overflow-hidden p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-96 rounded-lg overflow-hidden bg-accent/10">
              {product?.thumbnail && (
                <Image 
                  src={product.thumbnail} 
                  alt={product.title} 
                  fill 
                  className="object-contain hover:scale-105 transition-transform duration-300" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product?.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-2xl font-semibold">${product?.price.toFixed(2)}</span>
                  {product?.discountPercentage > 0 && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {product.discountPercentage}% OFF
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y">
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(product?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium">{product?.rating}/5</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Brand</p>
                    <p className="font-medium mt-1">{product?.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium mt-1">{product?.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="font-medium mt-1">{product?.stock} units</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="font-medium mb-2">Description</h2>
                <p className="text-muted-foreground">{product?.description}</p>
              </div>
            </div>
          </div>
        </div>
        
        {product?.images && product.images.length > 0 && (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Product Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.images.map((image: string, index: number) => (
                <div key={index} className="relative h-48 rounded-lg overflow-hidden bg-accent/10 hover:shadow-md transition-shadow">
                  <Image 
                    src={image} 
                    alt={`${product.title} - image ${index + 1}`} 
                    fill 
                    className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" 
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
import { use } from "react";
import { notFound } from "next/navigation";

async function getProduct(id: string) {
  const res = await fetch(`https://dummyjson.com/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) return notFound();
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
      <div className="flex gap-8">
        <img src={product.thumbnail} alt={product.title} className="w-48 h-48 object-cover rounded" />
        <div>
          <div className="mb-2"><b>Brand:</b> {product.brand}</div>
          <div className="mb-2"><b>Price:</b> ${product.price}</div>
          <div className="mb-2"><b>Rating:</b> {product.rating}</div>
          <div className="mb-2"><b>Stock:</b> {product.stock}</div>
          <div className="mb-2"><b>Category:</b> {product.category}</div>
          <div className="mb-2"><b>Description:</b> {product.description}</div>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  return {
    title: product ? `${product.title} – MyShop` : "Product Not Found – MyShop",
  };
} 
import Navbar from "@/components/navbar";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-auto">
      <Navbar />
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            Welcome to <span className="text-primary">MyShop</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-[700px]">
            Discover our wide range of high-quality products at competitive prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link 
              href="/products" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

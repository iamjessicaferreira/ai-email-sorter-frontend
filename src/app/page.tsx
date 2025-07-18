"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Category {
  id: number;
  name: string;
  description: string;
}

const mockCategories: Category[] = [
  { id: 1, name: "Work", description: "Emails from clients or team" },
  { id: 2, name: "Newsletters", description: "Weekly and daily newsletters" },
];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<Omit<Category, "id">>({
    name: "",
    description: "",
  });

  useEffect(() => {
    setCategories(mockCategories);
    /*
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories);
    */
  }, []);

  const addCategory = async () => {
    const newCat: Category = { id: Date.now(), ...newCategory };
    setCategories([...categories, newCat]);
    setNewCategory({ name: "", description: "" });

    /*
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory),
    });
    const newCat = await res.json();
    setCategories([...categories, newCat]);
    setNewCategory({ name: '', description: '' });
    */
  };

  const handleClick = () => {
    // Redireciona para endpoint de login
    window.location.href =
      "http://localhost:8000/api/auth/login/google-oauth2/";
  };

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">AI Email Sorter</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Connect Gmail Account</h2>
        <Button onClick={() => (window.location.href = "/api/auth/google")}>
          Sign in with Google
        </Button>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add Category</h2>
        <div className="flex flex-col gap-2 max-w-md">
          <button onClick={handleClick}>➕ Adicionar Conta Gmail</button>
          <Input
            placeholder="Category Name"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
          />
          <Input
            placeholder="Category Description"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
          />
          <Button onClick={addCategory}>Add</Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Your Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardContent>
                <h3 className="font-bold text-lg">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {cat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

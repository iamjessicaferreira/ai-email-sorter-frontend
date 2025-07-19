"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<Omit<Category, "id">>({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/categories/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error("Erro ao buscar categorias", err));
  }, []);

  const addCategory = async () => {
    const csrftoken = getCookie("csrftoken");

    const res = await fetch("http://localhost:8000/api/categories/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrftoken && { "X-CSRFToken": csrftoken }),
      },
      body: JSON.stringify(newCategory),
    });

    if (res.ok) {
      const created = await res.json();
      setCategories([...categories, created]);
      setNewCategory({ name: "", description: "" });
    } else {
      console.error("Erro ao criar categoria");
    }
  };

  const getCookie = (name: string) => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
    return cookieValue || null;
  };

  const handleClick = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/refresh-token/", {
        credentials: "include", // para enviar cookies, se estiver usando sessão
      });

      if (!res.ok) {
        throw new Error("Erro ao verificar refresh token");
      }

      const data = await res.json();
      const hasRefreshToken = data.has_refresh_token;

      const loginUrl = hasRefreshToken
        ? "http://localhost:8000/api/auth/login/google-oauth2/"
        : "http://localhost:8000/api/auth/login/google-oauth2/?prompt=consent&access_type=offline";

      window.location.href = loginUrl;
    } catch (err) {
      console.error(err);
      // Se quiser, pode ainda redirecionar ao login normal ou mostrar erro
      window.location.href =
        "http://localhost:8000/api/auth/login/google-oauth2/";
    }
  };

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">AI Email Sorter</h1>
      <Link href="/emails/list"> List emails </Link>
      <Link href="/auth/success"> Connected accounts </Link>
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

// app/dashboard/components/ConnectSection.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  newCat: { name: string; description: string };
  setNewCat: React.Dispatch<
    React.SetStateAction<{ name: string; description: string }>
  >;
  addCategory: () => Promise<void>;
  handleAddAccount: () => Promise<void>;
};

export default function ConnectSection({
  newCat,
  setNewCat,
  addCategory,
  handleAddAccount,
}: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Conectar Conta Gmail</h2>
      <Button onClick={handleAddAccount}>➕ Adicionar Conta</Button>

      <h2 className="text-xl font-semibold">Adicionar Categoria</h2>
      <div className="flex gap-2">
        <Input
          placeholder="Nome"
          value={newCat.name}
          onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
        />
        <Input
          placeholder="Descrição"
          value={newCat.description}
          onChange={(e) =>
            setNewCat({ ...newCat, description: e.target.value })
          }
        />
        <Button onClick={addCategory}>Adicionar</Button>
      </div>
    </section>
  );
}

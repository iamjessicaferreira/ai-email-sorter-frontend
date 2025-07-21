"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardCategory } from "@/app/page";

type Props = {
  newCategory: { name: string; description: string };
  setNewCategory: React.Dispatch<
    React.SetStateAction<{ name: string; description: string }>
  >;
  addCategory: () => Promise<void>;
  handleAddAccount: () => Promise<void>;
  cardCategories: CardCategory[];
};

export default function ConnectSection({
  newCategory,
  setNewCategory,
  addCategory,
  cardCategories,
  handleAddAccount,
}: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Connect Gmail Account</h2>
      <Button onClick={handleAddAccount}>➕ Add Account</Button>

      <h2 className="text-xl font-semibold">Add Category</h2>
      <div className="flex gap-2">
        <Input
          placeholder="Name"
          value={newCategory.name}
          onChange={(e) =>
            setNewCategory({ ...newCategory, name: e.target.value })
          }
        />
        <Input
          placeholder="Description"
          value={newCategory.description}
          onChange={(e) =>
            setNewCategory({ ...newCategory, description: e.target.value })
          }
        />
        <Button onClick={addCategory}>Add</Button>
      </div>


      {cardCategories?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mt-2">My categories</h3>
              <ul>
                {cardCategories.map((c: CardCategory) => (
                  <li key={c.name}>
                    <span className="font-bold">{c.name}</span>
                    {c.description && (
                      <span className="ml-2 text-gray-500 text-sm">{c.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
    </section>
  );
}

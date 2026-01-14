"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardCategory } from "@/app/page";
import Modal from "../Modal";

type Props = {
  newCategory: { name: string; description: string };
  setNewCategory: React.Dispatch<
    React.SetStateAction<{ name: string; description: string }>
  >;
  addCategory: () => Promise<void>;
  cardCategories: CardCategory[];
  onDeleteCategory: (id: number) => Promise<void>;
  onUpdateCategory: (id: number, data: { name: string; description: string }) => Promise<boolean>;
};

export default function ConnectSection({
  newCategory,
  setNewCategory,
  addCategory,
  cardCategories,
  onDeleteCategory,
  onUpdateCategory,
}: Props) {
  const [editingCategory, setEditingCategory] = useState<CardCategory | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const handleEdit = (category: CardCategory) => {
    setEditingCategory(category);
    setEditForm({ name: category.name, description: category.description });
  };

  const handleSaveEdit = async () => {
    if (editingCategory) {
      const success = await onUpdateCategory(editingCategory.id, editForm);
      if (success) {
        setEditingCategory(null);
        setEditForm({ name: "", description: "" });
      }
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (confirm("Are you sure you want to delete this category? Emails in this category will become uncategorized.")) {
      await onDeleteCategory(categoryId);
    }
  };

  return (
    <section className="space-y-6">
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add Category
          </CardTitle>
          <CardDescription>
            Create a new category to organize your emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              className="flex-1 border-2"
            />
            <Input
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              className="flex-1 border-2"
            />
            <Button 
              onClick={addCategory}
              className="bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg transition-shadow px-6"
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {cardCategories.length > 0 && (
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Categories
            </CardTitle>
            <CardDescription>
              {cardCategories.length} categor{cardCategories.length !== 1 ? 'ies' : 'y'} created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {cardCategories.map((c) => (
                <li 
                  key={c.id} 
                  className="flex items-center justify-between p-4 border-2 rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 text-lg">{c.name}</span>
                    {c.description && (
                      <p className="mt-1 text-gray-600 text-sm">{c.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleEdit(c)}
                      variant="outline"
                      size="sm"
                      className="border-2 hover:bg-gray-50 p-2"
                      title="Edit category"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Button>
                    <Button
                      onClick={() => handleDelete(c.id)}
                      variant="outline"
                      size="sm"
                      className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 p-2"
                      title="Delete category"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={!!editingCategory} onClose={() => setEditingCategory(null)}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Category
            </h2>
            <p className="text-gray-600 text-sm mt-1">Update category details</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Category name"
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Category description"
                className="border-2"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setEditingCategory(null)}
              className="border-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              className="bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

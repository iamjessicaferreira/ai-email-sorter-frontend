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
    <section className="space-y-6 animate-fade-in">
      <Card className="shadow-elegant border-2 hover:shadow-elegant-hover transition-all duration-300 animate-slide-up">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Category
              </CardTitle>
              <CardDescription className="text-xs">
                Organize emails automatically
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Category name (e.g., Work, Personal)"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            className="border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <Input
            placeholder="Description (optional)"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
            className="border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <Button 
            onClick={addCategory}
            tooltip="Create a new category to organize your emails"
            className="w-full"
            disabled={!newCategory.name.trim()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Category
          </Button>
        </CardContent>
      </Card>

      {cardCategories.length > 0 && (
        <Card className="shadow-elegant border-2 hover:shadow-elegant-hover transition-all duration-300 animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    My Categories
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {cardCategories.length} categor{cardCategories.length !== 1 ? 'ies' : 'y'}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {cardCategories.map((c, index) => (
                <li 
                  key={c.id} 
                  className="
                    flex items-center justify-between p-3 border-2 rounded-lg bg-white 
                    hover:shadow-elegant-hover hover:scale-[1.01] hover:border-blue-300
                    transition-all duration-300 ease-out
                    animate-slide-up
                  "
                  style={{
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0"></div>
                      <span className="font-semibold text-gray-900 truncate">{c.name}</span>
                    </div>
                    {c.description && (
                      <p className="mt-1 text-gray-600 text-xs truncate">{c.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 ml-3 flex-shrink-0">
                    <Button
                      onClick={() => handleEdit(c)}
                      variant="ghost"
                      size="icon"
                      tooltip="Edit category name and description"
                      className="h-8 w-8"
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
                      variant="ghost"
                      size="icon"
                      tooltip="Delete this category (emails will become uncategorized)"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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
              tooltip="Cancel editing"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              tooltip="Save the changes to this category"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

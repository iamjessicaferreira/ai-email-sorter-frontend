import { NextResponse } from "next/server";

const categories = [
  { id: 1, name: "Work", description: "Emails from clients or team" },
  { id: 2, name: "Newsletters", description: "Weekly and daily newsletters" },
];

export async function GET() {
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newCategory = { id: Date.now(), ...body };
  categories.push(newCategory);
  return NextResponse.json(newCategory);
}

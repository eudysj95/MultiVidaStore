"use client";

import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = createClient();

  // Si Supabase no está configurado, redirigimos al panel inmediatamente
  if (!supabase) {
redirect("/admin/products");
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/admin/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/admin");
}
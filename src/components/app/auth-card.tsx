"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const inputClass =
  "h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-[#8bd450]/50 focus:ring-2 focus:ring-[#8bd450]/15";

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@lifeos.local");
  const [password, setPassword] = useState("lifeos-demo");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "register") {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        setMessage("Registration failed.");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.ok) {
      router.push("/");
      return;
    }

    setMessage("Login failed.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0f0c] px-4 text-zinc-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Login to LifeOS" : "Create LifeOS Account"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <input
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name"
                required
              />
            )}
            <input
              className={inputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
              required
            />
            <input
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              required
            />
            {message && <p className="text-sm text-red-200">{message}</p>}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Working..." : mode === "login" ? "Login" : "Register"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-zinc-500">
            {mode === "login" ? (
              <Link className="text-[#c8f5a4]" href="/register">
                Create account
              </Link>
            ) : (
              <Link className="text-[#c8f5a4]" href="/login">
                Login instead
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

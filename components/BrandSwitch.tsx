"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PaymentMethod = "bolivares" | "dolar" | "cashea";

const PAYMENT_METHODS: Record<
  PaymentMethod,
  { label: string; hint: string }
> = {
  bolivares: { label: "Bolívares", hint: "Bs." },
  dolar: { label: "Dólar", hint: "USD" },
  cashea: { label: "Cashea", hint: "Cashea" },
};

export default function BrandSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get("payment") as PaymentMethod) || "bolivares";

  const select = (method: PaymentMethod) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("payment", method);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="inline-flex items-center justify-center gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200">
      {Object.entries(PAYMENT_METHODS).map(([key, { label, hint }]) => {
        const method = key as PaymentMethod;
        const isActive = current === method;
        return (
          <button
            key={method}
            onClick={() => select(method)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-brand-blue text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
            <span className="ml-1 text-xs opacity-70">{hint}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PaymentMethod = "bolivares" | "dolar" | "cashea";

const PAYMENT_METHODS: Record<
  PaymentMethod,
  { label: string }
> = {
  bolivares: { label: "Bolívares" },
  dolar: { label: "Dólar" },
  cashea: { label: "Cashea" },
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
      {Object.entries(PAYMENT_METHODS).map(([key, { label }]) => {
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
          </button>
        );
      })}
    </div>
  );
}

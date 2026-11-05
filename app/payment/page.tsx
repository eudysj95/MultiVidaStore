"use client";

import { useRouter } from "next/navigation";

type PaymentMethod = "bolivares" | "dolar" | "cashea";

const PAYMENT_METHODS: Record<
  PaymentMethod,
  { label: string; hint: string; color: string }
> = {
  bolivares: {
    label: "Bolívares",
    hint: "Bs.",
    color: "bg-brand-blue border-brand-blue",
  },
  dolar: {
    label: "Dólar",
    hint: "USD",
    color: "bg-brand-accent-blue-royal border-brand-accent-blue-royal",
  },
  cashea: {
    label: "Cashea",
    hint: "Cashea",
    color: "bg-brand-accent-green border-brand-accent-green",
  },
};

export default function PaymentSelection() {
  const router = useRouter();

  const select = (method: PaymentMethod) => {
    router.push(`/?payment=${method}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow">
            <img
              src="/images/logo.jpeg"
              alt="MultiVida Store"
              className="h-12 w-12 object-contain"
            />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-brand-black tracking-tight sm:text-4xl">
            Elige tu forma de pago
          </h1>
          <p className="mt-2 text-gray-600">
            Los precios se mostrarán según la opción que elijas.
          </p>
        </div>

        <div className="space-y-3">
          {Object.entries(PAYMENT_METHODS).map(([key, { label, hint, color }]) => {
            const method = key as PaymentMethod;
            return (
              <button
                key={method}
                onClick={() => select(method)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border text-left shadow-sm transition-all hover:scale-[1.02] active:scale-95 ${color} text-white font-semibold`}
              >
                <div>
                  <div className="text-sm">{label}</div>
                  <div className="text-xs opacity-80">{hint}</div>
                </div>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400">
          Esta selección solo aplica durante esta visita.
        </p>
      </div>
    </div>
  );
}

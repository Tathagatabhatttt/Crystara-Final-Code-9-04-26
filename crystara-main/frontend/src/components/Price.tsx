import { cn } from "@/lib/utils";

interface PriceProps {
  amount: number;
  className?: string;
  strike?: boolean;
}

/** Formats a storefront price so ₹ and digits sit flush on one baseline. */
export function Price({ amount, className, strike = false }: PriceProps) {
  const digits = Number(amount || 0).toLocaleString("en-IN");

  return (
    <span
      className={cn(
        "price-tag inline-flex items-center font-sans font-bold tabular-nums tracking-tight leading-none",
        strike && "line-through font-medium opacity-70",
        className,
      )}
    >
      <span className="price-currency" aria-hidden="true">
        ₹
      </span>
      <span className="price-digits">{digits}</span>
    </span>
  );
}

export default Price;

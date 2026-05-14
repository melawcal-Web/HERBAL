import { AddProductForm } from "./add-product-form";

export const metadata = {
  title: "מוצרים — ניהול",
};

export default function AdminProductsPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-herbal-900 sm:text-2xl">הוספת מוצר לשוק</h2>
      <p className="mt-2 text-sm text-slate-600">
        מוצר חדש מסוג «מוצר מדף» יופיע בדף הבית ובדף השוק לאחר השמירה.
      </p>
      <AddProductForm />
    </div>
  );
}

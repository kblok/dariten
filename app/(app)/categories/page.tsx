import { getCategories } from "@/lib/queries";
import { CategoryActions } from "@/components/category-form";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const groups = [...new Set(categories.map((category) => category.group))];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Categories</h1>
          <p className="mt-2 text-muted">A starter chart of accounts. Rename groups, add categories, or retire unused ones.</p>
        </div>
        <CategoryActions />
      </div>

      <div className="grid gap-4">
        {groups.map((group) => (
          <section key={group} className="rounded-3xl border border-line bg-panel p-5">
            <h2 className="text-xs uppercase tracking-[0.18em] text-muted">{group}</h2>
            <div className="mt-4 grid gap-3">
              {categories
                .filter((category) => category.group === group)
                .map((category) => (
                  <div key={category.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#fffaf1] px-4 py-3">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted">
                        {category.isIncome ? "Income" : "Expense"} · {category._count.transactions} transactions
                      </p>
                    </div>
                    <CategoryActions
                      category={{
                        id: category.id,
                        name: category.name,
                        group: category.group,
                        isIncome: category.isIncome,
                        transactionCount: category._count.transactions,
                      }}
                    />
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

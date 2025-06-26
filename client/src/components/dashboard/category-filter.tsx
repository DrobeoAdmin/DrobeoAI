import { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  onCategoryClick: (categoryId: number) => void;
  itemCounts?: Record<number, number>;
}

export default function CategoryFilter({ 
  categories, 
  onCategoryClick, 
  itemCounts = {} 
}: CategoryFilterProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-primary">Browse Categories</h3>
        <button className="text-accent hover:text-accent/80 text-sm font-medium">
          View All
        </button>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-card bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center cursor-pointer"
            onClick={() => onCategoryClick(category.id)}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <i 
                className={`${category.icon} text-lg`}
                style={{ color: category.color }}
              ></i>
            </div>
            <div className="text-sm font-medium text-primary">{category.name}</div>
            <div className="text-xs text-neutral">
              {itemCounts[category.id] || 0} items
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

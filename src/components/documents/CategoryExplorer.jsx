export default function CategoryExplorer({
  categories,
  activeCategoryId,
  onSelectCategory,
}) {
  return (
    <aside className="gd-explorer">
      <div className="gd-explorer__header">
        <h2>Categorías</h2>
        <p>{categories.length} categoría(s)</p>
      </div>

      <div className="gd-explorer__list">
        {categories.length === 0 ? (
          <p className="gd-empty">No hay categorías disponibles.</p>
        ) : (
          categories.map((category) => {
            const isActive = Number(activeCategoryId) === Number(category.id);

            return (
              <button
                key={category.id}
                type="button"
                className={
                  isActive
                    ? 'gd-explorer__item gd-explorer__item--active'
                    : 'gd-explorer__item'
                }
                onClick={() => onSelectCategory(category.id)}
              >
                <span>{category.nombre}</span>

                {category.total_subcategorias !== undefined && (
                  <small>
                    {category.total_subcategorias} subcategoría(s)
                  </small>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
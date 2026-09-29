import { CTA, RECIPES, type Recipe } from '@/app/prank/content';

interface RecipeScreenProps {
  onPick: (recipe: Recipe) => void;
}

/** Chọn công thức — món nào cũng dẫn tới cùng một kết cục 😏 */
export default function RecipeScreen({ onPick }: RecipeScreenProps) {
  return (
    <section className="fb-screen">
      <h2 className="fb-title">{CTA.chooseRecipe}</h2>
      <p className="fb-subtitle">{CTA.chooseHint}</p>

      <div className="fb-recipes">
        {RECIPES.map((recipe) => (
          <button key={recipe.id} type="button" className="fb-recipe" onClick={() => onPick(recipe)}>
            <span className="fb-recipe__tag">{recipe.tag}</span>
            <img className="fb-recipe__image pixel" src={recipe.image} alt="" />
            <span className="fb-recipe__name">{recipe.name}</span>
            <span className="fb-recipe__meta">
              {'★'.repeat(recipe.stars)}
              {'☆'.repeat(3 - recipe.stars)} · {recipe.time}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

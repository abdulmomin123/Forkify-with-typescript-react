import { useEffect, useState, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import fraction from 'fraction.js';
import { getRecipe } from '../helpers';
import { BookmarksContext } from '../contexts/Bookmarks.context';
import { NotificationSetter } from '../contexts/Notification.context';
import icons from '../Images/icons.svg';
import styles from '../styles/Recipe.module.css';
import * as Types from '../Types';
import Spinner from './styled/Spinner';

const Recipe = () => {
  // Consuming context
  const { bookmarks, addToBookmark } = useContext(BookmarksContext);
  const setNotification = useContext(NotificationSetter);

  // Getting query & recipe id from the url
  const { query, recipeId } = useParams<{ query: string; recipeId: string }>();

  // Adds to bookmark
  const handleAddBookmark = () => {
    const { id, title, image_url, publisher } = recipe!;

    const bookmark: Types.Result = {
      id,
      query,
      title,
      image_url,
      publisher,
    };

    addToBookmark!(bookmark);
  };

  // For redirecting user to search route
  const history = useHistory();

  // State
  const [recipe, setRecipe] = useState<Types.Recipe>();

  // Setting the query in the context if the query is new
  useEffect(() => {
    if (!recipeId) return;

    // Clearing old recipe (if any)
    setRecipe(undefined);

    const getNewRecipe = async (recipeId: string) => {
      try {
        const recipe = await getRecipe(recipeId);

        // Storing new recipe
        setRecipe(recipe);
      } catch (err) {
        // Add a notification in the notification context
        setNotification({
          message: err.message,
          type: 'error',
          isShowing: true,
        });

        // Redirect the user back
        history.goBack();
      }
    };

    getNewRecipe(recipeId);
  }, [recipeId, history, setNotification]);

  const updateServings = (servings: number) => {
    if (servings < 1) return;

    const ingredients = recipe!.ingredients.map(ingredient => {
      const quantity = (ingredient.quantity! * servings) / recipe!.servings;

      return { ...ingredient, quantity };
    });

    setRecipe({ ...recipe!, servings, ingredients });
  };

  const isBookmarked = bookmarks?.some(bookmark => bookmark.id === recipe?.id);

  const ingredients = recipe?.ingredients.map(
    ({ description, quantity, unit }) => (
      <li className={styles.Ingredient} key={uuid()}>
        <svg>
          <use href={`${icons}#icon-check`}></use>
        </svg>
        <div className={styles.Quantity}>
          {quantity ? new fraction(quantity).toFraction(true) : ''}
        </div>
        <div>
          <span>{unit} </span>
          {description}
        </div>
      </li>
    )
  );

  const markup = (
    <div className={styles.Recipe}>
      <figure className={styles.Figure}>
        <img
          src={recipe?.image_url}
          alt={recipe?.title}
          className={styles.Image}
        />
        <h1 className={styles.Title}>
          <span>{recipe?.title}</span>
        </h1>
      </figure>

      <div className={styles.Details}>
        <div className={styles.Info}>
          <svg>
            <use href={`${icons}#icon-clock`}></use>
          </svg>
          <span className={styles.InfoData}>{recipe?.cooking_time}</span>
          <span>minutes</span>
        </div>
        <div className={styles.Info}>
          <svg>
            <use href={`${icons}#icon-users`}></use>
          </svg>
          <span className={styles.InfoData}>{recipe?.servings}</span>
          <span>servings</span>

          <div className={styles.Btns}>
            <button
              onClick={() => updateServings(recipe?.servings! - 1)}
              className={styles.Btn}
            >
              <svg>
                <use href={`${icons}#icon-minus-circle`}></use>
              </svg>
            </button>
            <button
              onClick={() => updateServings(recipe?.servings! + 1)}
              className={styles.Btn}
            >
              <svg>
                <use href={`${icons}#icon-plus-circle`}></use>
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.UserGenerated}>
          {recipe?.key ? (
            <svg>
              <use href={`${icons}#icon-user`}></use>
            </svg>
          ) : null}
        </div>
        <button className={styles.BtnRound} onClick={handleAddBookmark}>
          <svg>
            <use
              href={`${icons}#icon-bookmark${isBookmarked ? '-fill' : ''}`}
            ></use>
          </svg>
        </button>
      </div>

      <div className={styles.Ingredients}>
        <h2>Recipe ingredients</h2>
        <ul className={styles.IngredientList}>{ingredients}</ul>
      </div>

      <div className={styles.Directions}>
        <h2>How to cook it</h2>
        <p className={styles.DirectionsText}>
          This recipe was carefully designed and tested by
          <span className={styles.Publisher}> {recipe?.publisher}</span>. Please
          check out directions at their website.
        </p>
        <a
          className={styles.BtnDirections}
          href={recipe?.source_url}
          target="_blank"
          rel="noreferrer"
        >
          <span>Directions</span>
          <svg>
            <use href={`${icons}#icon-arrow-right`}></use>
          </svg>
        </a>
      </div>
    </div>
  );

  return (
    <div className={styles.Recipe}>
      <div>{recipe ? markup : <Spinner />}</div>
    </div>
  );
};

export default Recipe;

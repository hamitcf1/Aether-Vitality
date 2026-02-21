import { useFoodStore } from '../store/foodStore';

export interface FoodItem {
    id: string;
    name: string;
    emoji: string;
    calories: number; // per serving
    sugar: number; // grams per serving
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    servingSize: string;
    category: 'fruit' | 'vegetable' | 'protein' | 'grain' | 'dairy' | 'snack' | 'drink' | 'fast-food' | 'meal';
}

export const PORTIONS = [
    { label: 'Small', multiplier: 0.7, description: '70% of standard' },
    { label: 'Standard', multiplier: 1, description: '1.0x serving' },
    { label: 'Large', multiplier: 1.5, description: '1.5x serving' },
    { label: 'Extra Large', multiplier: 2, description: '2.0x serving' },
];

export const FOOD_DATABASE: FoodItem[] = [
    // Fruits
    { id: 'apple', name: 'Apple', emoji: '🍎', calories: 95, sugar: 19, protein: 0.5, carbs: 25, fat: 0.3, servingSize: '1 medium', category: 'fruit' },
    { id: 'banana', name: 'Banana', emoji: '🍌', calories: 105, sugar: 14, protein: 1.3, carbs: 27, fat: 0.4, servingSize: '1 medium', category: 'fruit' },
    { id: 'orange', name: 'Orange', emoji: '🍊', calories: 62, sugar: 12, protein: 1.2, carbs: 15, fat: 0.2, servingSize: '1 medium', category: 'fruit' },
    { id: 'strawberries', name: 'Strawberries', emoji: '🍓', calories: 49, sugar: 7, protein: 1, carbs: 12, fat: 0.5, servingSize: '1 cup', category: 'fruit' },
    { id: 'grapes', name: 'Grapes', emoji: '🍇', calories: 104, sugar: 23, protein: 1, carbs: 27, fat: 0.2, servingSize: '1 cup', category: 'fruit' },
    { id: 'watermelon', name: 'Watermelon', emoji: '🍉', calories: 86, sugar: 18, protein: 1.7, carbs: 22, fat: 0.4, servingSize: '2 cups diced', category: 'fruit' },
    { id: 'mango', name: 'Mango', emoji: '🥭', calories: 99, sugar: 23, protein: 1.4, carbs: 25, fat: 0.6, servingSize: '1 cup', category: 'fruit' },
    { id: 'blueberries', name: 'Blueberries', emoji: '🫐', calories: 84, sugar: 15, protein: 1.1, carbs: 21, fat: 0.5, servingSize: '1 cup', category: 'fruit' },

    // Vegetables
    { id: 'broccoli', name: 'Broccoli', emoji: '🥦', calories: 55, sugar: 2.6, protein: 3.7, carbs: 11, fat: 0.6, servingSize: '1 cup', category: 'vegetable' },
    { id: 'carrot', name: 'Carrot', emoji: '🥕', calories: 25, sugar: 3, protein: 0.6, carbs: 6, fat: 0.1, servingSize: '1 medium', category: 'vegetable' },
    { id: 'spinach', name: 'Spinach', emoji: '🥬', calories: 7, sugar: 0.1, protein: 0.9, carbs: 1.1, fat: 0.1, servingSize: '1 cup raw', category: 'vegetable' },
    { id: 'tomato', name: 'Tomato', emoji: '🍅', calories: 22, sugar: 3.2, protein: 1.1, carbs: 4.8, fat: 0.2, servingSize: '1 medium', category: 'vegetable' },
    { id: 'cucumber', name: 'Cucumber', emoji: '🥒', calories: 16, sugar: 1.7, protein: 0.7, carbs: 3.6, fat: 0.1, servingSize: '1 cup sliced', category: 'vegetable' },
    { id: 'pepper', name: 'Bell Pepper', emoji: '🫑', calories: 31, sugar: 5.4, protein: 1, carbs: 7, fat: 0.3, servingSize: '1 medium', category: 'vegetable' },
    { id: 'corn', name: 'Sweet Corn', emoji: '🌽', calories: 96, sugar: 5, protein: 3.4, carbs: 21, fat: 1.5, servingSize: '1 ear', category: 'vegetable' },
    { id: 'potato', name: 'Baked Potato', emoji: '🥔', calories: 161, sugar: 2, protein: 4.3, carbs: 37, fat: 0.2, servingSize: '1 medium', category: 'vegetable' },

    // Proteins
    { id: 'chicken_breast', name: 'Chicken Breast', emoji: '🍗', calories: 165, sugar: 0, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g cooked', category: 'protein' },
    { id: 'salmon', name: 'Salmon Fillet', emoji: '🐟', calories: 208, sugar: 0, protein: 20, carbs: 0, fat: 13, servingSize: '100g cooked', category: 'protein' },
    { id: 'egg', name: 'Egg', emoji: '🥚', calories: 78, sugar: 0.6, protein: 6, carbs: 0.6, fat: 5, servingSize: '1 large', category: 'protein' },
    { id: 'beef_steak', name: 'Beef Steak', emoji: '🥩', calories: 271, sugar: 0, protein: 26, carbs: 0, fat: 18, servingSize: '100g cooked', category: 'protein' },
    { id: 'tuna', name: 'Tuna (canned)', emoji: '🐟', calories: 116, sugar: 0, protein: 26, carbs: 0, fat: 0.8, servingSize: '100g drained', category: 'protein' },
    { id: 'tofu', name: 'Tofu', emoji: '🧊', calories: 76, sugar: 0.6, protein: 8, carbs: 1.9, fat: 4.8, servingSize: '100g', category: 'protein' },
    { id: 'shrimp', name: 'Shrimp', emoji: '🦐', calories: 99, sugar: 0, protein: 24, carbs: 0.2, fat: 0.3, servingSize: '100g cooked', category: 'protein' },
    { id: 'turkey', name: 'Turkey Breast', emoji: '🦃', calories: 135, sugar: 0, protein: 30, carbs: 0, fat: 1, servingSize: '100g cooked', category: 'protein' },

    // Grains
    { id: 'white_rice', name: 'White Rice', emoji: '🍚', calories: 206, sugar: 0.1, protein: 4.3, carbs: 45, fat: 0.4, servingSize: '1 cup cooked', category: 'grain' },
    { id: 'brown_rice', name: 'Brown Rice', emoji: '🍚', calories: 216, sugar: 0.7, protein: 5, carbs: 45, fat: 1.8, servingSize: '1 cup cooked', category: 'grain' },
    { id: 'pasta', name: 'Pasta', emoji: '🍝', calories: 220, sugar: 0.8, protein: 8, carbs: 43, fat: 1.3, servingSize: '1 cup cooked', category: 'grain' },
    { id: 'bread_slice', name: 'Bread (White)', emoji: '🍞', calories: 79, sugar: 1.5, protein: 2.7, carbs: 15, fat: 1, servingSize: '1 slice', category: 'grain' },
    { id: 'oatmeal', name: 'Oatmeal', emoji: '🥣', calories: 154, sugar: 1.1, protein: 5, carbs: 27, fat: 2.6, servingSize: '1 cup cooked', category: 'grain' },
    { id: 'whole_wheat_bread', name: 'Bread (Whole Wheat)', emoji: '🍞', calories: 69, sugar: 1.4, protein: 3.6, carbs: 12, fat: 1, servingSize: '1 slice', category: 'grain' },
    { id: 'quinoa', name: 'Quinoa', emoji: '🥣', calories: 222, sugar: 1.6, protein: 8, carbs: 39, fat: 3.5, servingSize: '1 cup cooked', category: 'grain' },

    // Dairy
    { id: 'milk_whole', name: 'Whole Milk', emoji: '🥛', calories: 149, sugar: 12, protein: 8, carbs: 12, fat: 8, servingSize: '1 cup', category: 'dairy' },
    { id: 'milk_skim', name: 'Skim Milk', emoji: '🥛', calories: 83, sugar: 12, protein: 8, carbs: 12, fat: 0.2, servingSize: '1 cup', category: 'dairy' },
    { id: 'yogurt', name: 'Greek Yogurt', emoji: '🍦', calories: 100, sugar: 6, protein: 17, carbs: 6, fat: 0.7, servingSize: '170g', category: 'dairy' },
    { id: 'cheese_cheddar', name: 'Cheddar Cheese', emoji: '🧀', calories: 113, sugar: 0.4, protein: 7, carbs: 0.4, fat: 9, servingSize: '1 oz', category: 'dairy' },
    { id: 'cottage_cheese', name: 'Cottage Cheese', emoji: '🧀', calories: 98, sugar: 3.5, protein: 11, carbs: 3.5, fat: 4.3, servingSize: '100g', category: 'dairy' },

    // Snacks & Treats
    { id: 'peanut_butter', name: 'Peanut Butter', emoji: '🥜', calories: 188, sugar: 3.4, protein: 7, carbs: 7, fat: 16, servingSize: '2 tbsp', category: 'snack' },
    { id: 'almonds', name: 'Almonds', emoji: '🌰', calories: 164, sugar: 1.2, protein: 6, carbs: 6, fat: 14, servingSize: '1 oz (23 nuts)', category: 'snack' },
    { id: 'dark_chocolate', name: 'Dark Chocolate', emoji: '🍫', calories: 170, sugar: 14, protein: 2.2, carbs: 13, fat: 12, servingSize: '1 oz', category: 'snack' },
    { id: 'granola_bar', name: 'Granola Bar', emoji: '🍫', calories: 140, sugar: 10, protein: 3, carbs: 18, fat: 7, servingSize: '1 bar', category: 'snack' },
    { id: 'chips', name: 'Potato Chips', emoji: '🍟', calories: 152, sugar: 0.1, protein: 2, carbs: 15, fat: 10, servingSize: '1 oz', category: 'snack' },
    { id: 'cookie', name: 'Chocolate Chip Cookie', emoji: '🍪', calories: 160, sugar: 11, protein: 2, carbs: 22, fat: 7, servingSize: '1 large', category: 'snack' },
    { id: 'ice_cream', name: 'Ice Cream', emoji: '🍨', calories: 207, sugar: 21, protein: 3.5, carbs: 23, fat: 11, servingSize: '1/2 cup', category: 'snack' },
    { id: 'popcorn', name: 'Popcorn (Air-popped)', emoji: '🍿', calories: 31, sugar: 0.1, protein: 1, carbs: 6, fat: 0.4, servingSize: '1 cup', category: 'snack' },

    // Drinks
    { id: 'water', name: 'Water', emoji: '💧', calories: 0, sugar: 0, protein: 0, carbs: 0, fat: 0, servingSize: '1 glass (250ml)', category: 'drink' },
    { id: 'coffee_black', name: 'Black Coffee', emoji: '☕', calories: 2, sugar: 0, protein: 0.3, carbs: 0, fat: 0, servingSize: '1 cup', category: 'drink' },
    { id: 'green_tea', name: 'Green Tea', emoji: '🍵', calories: 2, sugar: 0, protein: 0, carbs: 0, fat: 0, servingSize: '1 cup', category: 'drink' },
    { id: 'orange_juice', name: 'Orange Juice', emoji: '🧃', calories: 112, sugar: 21, protein: 1.7, carbs: 26, fat: 0.5, servingSize: '1 cup', category: 'drink' },
    { id: 'soda', name: 'Cola', emoji: '🥤', calories: 140, sugar: 39, protein: 0, carbs: 39, fat: 0, servingSize: '12 oz can', category: 'drink' },
    { id: 'smoothie', name: 'Fruit Smoothie', emoji: '🥤', calories: 210, sugar: 30, protein: 3, carbs: 44, fat: 2, servingSize: '1 cup', category: 'drink' },
    { id: 'protein_shake', name: 'Protein Shake', emoji: '🥤', calories: 160, sugar: 3, protein: 25, carbs: 8, fat: 3, servingSize: '1 scoop + water', category: 'drink' },

    // Fast Food / Meals
    { id: 'pizza_slice', name: 'Pizza (Pepperoni)', emoji: '🍕', calories: 298, sugar: 3.6, protein: 13, carbs: 34, fat: 13, servingSize: '1 large slice', category: 'fast-food' },
    { id: 'burger', name: 'Cheeseburger', emoji: '🍔', calories: 354, sugar: 7, protein: 20, carbs: 29, fat: 18, servingSize: '1 regular', category: 'fast-food' },
    { id: 'fries', name: 'French Fries', emoji: '🍟', calories: 365, sugar: 0.3, protein: 4, carbs: 44, fat: 19, servingSize: 'medium serving', category: 'fast-food' },
    { id: 'hot_dog', name: 'Hot Dog', emoji: '🌭', calories: 290, sugar: 4, protein: 11, carbs: 24, fat: 17, servingSize: '1 with bun', category: 'fast-food' },
    { id: 'kebab', name: 'Chicken Kebab', emoji: '🥙', calories: 480, sugar: 4, protein: 28, carbs: 42, fat: 22, servingSize: '1 wrap', category: 'fast-food' },
    { id: 'taco', name: 'Taco', emoji: '🌮', calories: 210, sugar: 2, protein: 10, carbs: 21, fat: 10, servingSize: '1 taco', category: 'fast-food' },
    { id: 'sushi_roll', name: 'Sushi Roll', emoji: '🍣', calories: 255, sugar: 5, protein: 9, carbs: 38, fat: 7, servingSize: '6 pieces', category: 'fast-food' },
    { id: 'fried_chicken', name: 'Fried Chicken', emoji: '🍗', calories: 320, sugar: 0, protein: 24, carbs: 12, fat: 20, servingSize: '1 piece (thigh)', category: 'fast-food' },

    // Complete Meals
    { id: 'salad_caesar', name: 'Caesar Salad', emoji: '🥗', calories: 180, sugar: 2, protein: 7, carbs: 8, fat: 14, servingSize: '1 serving', category: 'meal' },
    { id: 'grilled_salmon_meal', name: 'Grilled Salmon w/ Veggies', emoji: '🐟', calories: 380, sugar: 3, protein: 35, carbs: 12, fat: 22, servingSize: '1 plate', category: 'meal' },
    { id: 'chicken_rice', name: 'Chicken & Rice Bowl', emoji: '🍛', calories: 450, sugar: 2, protein: 35, carbs: 50, fat: 10, servingSize: '1 bowl', category: 'meal' },
    { id: 'stir_fry', name: 'Veggie Stir Fry', emoji: '🍳', calories: 220, sugar: 6, protein: 8, carbs: 28, fat: 9, servingSize: '1 serving', category: 'meal' },
    { id: 'soup_lentil', name: 'Lentil Soup', emoji: '🍲', calories: 180, sugar: 3, protein: 12, carbs: 30, fat: 2, servingSize: '1 bowl', category: 'meal' },
    { id: 'sandwich_turkey', name: 'Turkey Sandwich', emoji: '🥪', calories: 320, sugar: 4, protein: 22, carbs: 36, fat: 10, servingSize: '1 sandwich', category: 'meal' },
    { id: 'breakfast_eggs', name: 'Eggs & Toast', emoji: '🍳', calories: 290, sugar: 2, protein: 18, carbs: 24, fat: 14, servingSize: '2 eggs + 2 toast', category: 'meal' },
    { id: 'avocado_toast', name: 'Avocado Toast', emoji: '🥑', calories: 240, sugar: 1, protein: 6, carbs: 22, fat: 15, servingSize: '1 slice', category: 'meal' },
];

export function searchFoods(query: string): FoodItem[] {
    const q = query.toLowerCase().trim();
    const customFoods = useFoodStore.getState().customFoods;
    const allFoods = [...customFoods, ...FOOD_DATABASE];

    if (!q) return allFoods;

    return allFoods.filter(
        (f) => f.name.toLowerCase().includes(q) || f.category.includes(q)
    );
}

export function getFoodsByCategory(category: FoodItem['category']): FoodItem[] {
    const customFoods = useFoodStore.getState().customFoods;
    const allFoods = [...customFoods, ...FOOD_DATABASE];
    return allFoods.filter((f) => f.category === category);
}

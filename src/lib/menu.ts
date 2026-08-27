export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
};

export const menuItems: MenuItem[] = [
  { id: "jollof-bowl", name: "Signature Jollof Bowl", description: "Smoky jollof rice, tender chicken and fresh sides.", price: 18, category: "Rice & Bowls", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85" },
  { id: "fried-rice-bowl", name: "Fried Rice Bowl", description: "Seasoned fried rice with tender chicken and fresh vegetables.", price: 18, category: "Rice & Bowls", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85" },
  { id: "chicken-box", name: "Comfort Chicken Box", description: "Golden chicken, seasoned rice and house-made sauce.", price: 21, category: "Chicken", image: "https://images.unsplash.com/photo-1598514982901-ae6275a9a8b9?auto=format&fit=crop&w=900&q=85" },
  { id: "peppered-chicken", name: "Peppered Chicken", description: "Juicy chicken finished with a bold pepper sauce.", price: 19, category: "Chicken", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=900&q=85" },
  { id: "plantain", name: "Sweet Plantain", description: "Golden, caramelized and made fresh.", price: 7, category: "Sides", image: "https://images.unsplash.com/photo-1603833797130-0a7e5a5c4a08?auto=format&fit=crop&w=900&q=85" },
  { id: "weekend-special", name: "Weekend Special", description: "A rotating comfort-food plate made for sharing.", price: 24, category: "Specials", image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85" },
];

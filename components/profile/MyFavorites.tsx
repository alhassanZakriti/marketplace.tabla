"use client";
import type React from "react"
import { useState } from "react";
import RestaurantCard from "../restaurant/RestaurantCard";
import { useTranslation } from "next-i18next";

// Sample favorites data for restaurants
const favorites = [
  {
    id: 1,
    name: "La Bella Italia",
    location: "Downtown, City Center",
    cuisine: "Italian",
    priceRange: "$$",
    rating: 4.8,
    image: "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&w=2089&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    name: "Sakura Sushi",
    location: "East Side, Riverside",
    cuisine: "Japanese",
    priceRange: "$$$",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    name: "Le Petit Bistro",
    location: "West End, Fashion District",
    cuisine: "French",
    priceRange: "$$$",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: 4,
    name: "Spice Garden",
    location: "North Square, Cultural District",
    cuisine: "Indian",
    priceRange: "$$",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D",
  },
]

export const MyFavorites: React.FC = () => {

    const {t} = useTranslation();

    const [restaurants, setRestaurants] = useState([
        {
            name: 'Restaurant 1',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D',
            rating: 4.5,
            address: '123 Main St, City',
            category: 'Italian',
            isOpen: true,
            id: 1
        },
        {
            name: 'Restaurant 2',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D',
            rating: 4.0,
            address: '456 Elm St, City',
            category: 'Chinese',
            isOpen: false,
            id: 2
        },
        {
            name: 'Restaurant 3',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D',
            rating: 4.2,
            address: '789 Oak St, City',
            category: 'Mexican',
            isOpen: true,
            id: 3
        },
        {
            name: 'Restaurant 4',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D',
            rating: 4.7,
            address: '321 Pine St, City',
            category: 'Indian',
            isOpen: true,
            id: 4
        },
        {
            name: 'Restaurant 5',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D',
            rating: 4.1,
            address: '654 Maple St, City',
            category: 'Thai',
            isOpen: false,
            id: 5
        },
        {
            name: 'Restaurant 6',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D',
            rating: 4.6,
            address: '987 Birch St, City',
            category: 'Japanese',
            isOpen: true,
            id: 6
        }
    ]);



  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">{t("profile.myFavorites.title", "My Favorite Restaurants")}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="bg-whitetheme dark:bg-bgdarktheme2 rounded-lg overflow-hidden shadow-md border border-softgreytheme dark:border-darkthemeitems transition-colors duration-200"
          >
            <div className="relative h-48 bg-softgreytheme dark:bg-darkthemeitems">
              <img
                src={favorite.image || "/placeholder.svg"}
                alt={favorite.name}
                className="w-full h-full object-cover"
              />
              <button className="absolute top-3 right-3 p-2 bg-whitetheme dark:bg-darkthemeitems rounded-full text-redtheme">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-blacktheme dark:text-textdarktheme">{favorite.name}</h3>

              <div className="flex items-center mt-1 text-sm text-greytheme dark:text-textdarktheme">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {favorite.location}
              </div>

              <div className="flex items-center mt-1 text-sm text-greytheme dark:text-textdarktheme">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M3 3h18v18H3zM12 8v8M8 12h8"></path>
                </svg>
                {favorite.cuisine}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-greentheme font-semibold">{favorite.priceRange}</div>

                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellowtheme mr-1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span className="text-sm text-greytheme dark:text-textdarktheme">{favorite.rating}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 bg-greentheme text-whitetheme rounded-lg hover:bg-opacity-90 transition-colors duration-200">
                  Book Table
                </button>
                <button className="flex-1 py-2 bg-softgreytheme dark:bg-darkthemeitems text-blacktheme dark:text-textdarktheme rounded-lg hover:bg-opacity-90 transition-colors duration-200">
                  View Menu
                </button>
              </div>
            </div>
          </div>
        ))} */}
        {restaurants.map((restaurant) => (
            // <div key={restaurant.id} className="flex-none w-[85%] mr-4 snap-start">
            <RestaurantCard
                id={restaurant.id}
                name={restaurant.name}
                address={restaurant.address}
                rating={restaurant.rating}
                category={restaurant.category}
                isOpen={restaurant.isOpen}
                imageUrl={restaurant.imageUrl}
                favorite={true}
            />
            // </div>
        ))}
      </div>
    </div>
  )
}

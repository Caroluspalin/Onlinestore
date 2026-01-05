<img width="1440" height="900" alt="Screenshot 2026-01-05 at 21 43 56" src="https://github.com/user-attachments/assets/011661d5-c0bb-4ad1-a28d-37453c6cb187" />
Online Store Project 🛒
A modern, responsive e-commerce interface built to learn full-stack development concepts. This project moves beyond static HTML/CSS by integrating a real cloud database for dynamic product management and order tracking.

The goal was to create a high-fidelity shopping experience with a "Glassmorphism" UI, similar to modern fintech or streetwear drop sites.

✨ Features

Dynamic Backend: Fetches product data (images, prices, titles) directly from a Supabase database instead of hardcoding them in HTML.

Shopping Cart Logic: Add items, select sizes (A4, A3, Large), and calculate totals in real-time.

Order System: The "Pay Now" button actually sends order details (email + cart contents) to the database.

Modern UI: Dark mode aesthetic with glassmorphism effects, neon glows, and smooth CSS transitions.

Product Inspection: Click any product to open a detailed modal view with customization options.

AI Assistant: A built-in chatbot interface for guiding users (frontend logic).

🛠️ Tech Stack

Frontend: HTML5, CSS3 (Flexbox, Grid, Variables), JavaScript (ES6+).

Backend / Database: Supabase (PostgreSQL) for storing Products and Orders.

Learning Focus: This is my first project implementing a real backend connection and database management.

🚀 How to Run

Clone the repository:

Bash
git clone https://github.com/caroluspalin/onlinestore.git
Open index.html in your browser (or use Live Server in VS Code).

Note on Database: The project connects to a live Supabase instance. If products don't load, check the console for API key errors or create your own Supabase project and update script.js.

📂 Project Structure

Plaintext
/onlinestore
│
├── index.html    # Main structure and layout
├── style.css     # Glassmorphism styling and responsive grid
├── script.js     # logic for fetching data from Supabase & cart management
└── README.md     # Project documentation
Created by Carolus Palin

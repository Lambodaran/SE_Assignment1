# CIS046-3: Software for Enterprise – Assignment 1

This repository contains the source code and supporting materials for **Assignment 1** of the *CIS046-3 Software for Enterprise* unit.  
The assignment involves developing a software application and presenting its implementation in the context of four key computer science themes.

---

## Assignment Overview

The assignment requires the development of a **working software application** using a mainstream programming language.  
The project must demonstrate sufficient technical complexity and serve as the basis for a **10-minute video presentation**.  
The video will include both a demonstration of the system and a discussion of the following four themes:

- Version Control  
- Event-Driven Programming  
- Interoperability  
- Virtual Identity  

**Weighting:** 60% of the total unit mark  
**Submission Deadline:** Before 10 a.m. on 05/12/2025

---

## The Four Key Themes

### 1. Version Control
The project uses **Git and GitHub** to manage source code and track progress.  
- Each feature (e.g., API proxy, MFA, game animations) was developed on a **separate branch** and merged into `main`.  
- **Descriptive commit messages** document changes and create a complete version history.  
- The modular structure ensures maintainability, scalability, and ease of collaboration.

### 2. Event-Driven Programming
**Banana Brain** is built with **React (TypeScript)**, a library following an event-driven architecture.  
- The core component, `App.tsx`, acts as a **finite state machine (FSM)**.  
- User interactions (e.g., clicking 'Sign In', submitting MFA codes) generate **events**.  
- These events trigger **handler functions** (e.g., `handleMfaSuccess`) which update a central `appState`.  
- The `appState` determines which component is rendered (`LoginScreen`, `MfaEnrollPage`, `GameScreen`), ensuring a **predictable, responsive UI**.

### 3. Interoperability
The application demonstrates a secure and layered interoperability model:

1. **Client-to-Backend:** React frontend communicates with **Supabase Edge Functions** (Deno/TypeScript) instead of directly accessing the puzzle API.  
2. **Backend-to-External API:** Edge Functions (`get-question`, `check-answer`) act as a **secure proxy**, fetching puzzles from the Banana API.  
3. **Data Security:** All communication uses **JSON**. Puzzle solutions are encrypted into **JWTs**, ensuring the client cannot access the answer.  
4. **Database Integration:** Supabase stores and retrieves **leaderboard scores** via `supabase-js`, enabling real-time persistence.

### 4. Virtual Identity
**Supabase** handles authentication with **Multi-Factor Authentication (MFA)**:

- **Factor 1 (Password):** Users log in with email and password.  
- **Factor 2 (TOTP):** Users provide a **Time-based One-Time Password (TOTP)** from an authenticator app.  

The `App.tsx` state machine checks the user’s **Authenticator Assurance Level (AAL)**. Only fully verified users (AAL2) can access the game, ensuring secure identity and trustworthy leaderboard entries.

---

## About This Implementation

- **Project Name:** Banana Brain  
- **Project Description:**  
  *Banana Brain* is an interactive puzzle game designed to improve logical thinking.  
  Users create an account, enroll in MFA, select a difficulty level, and solve timed banana-themed puzzles.  
  The game tracks combos, levels, lives, and high scores, storing results on a global leaderboard.

- **Programming Languages:**  
  - **Frontend:** TypeScript (React)  
  - **Backend:** Deno (TypeScript) for Supabase Edge Functions  

- **Frameworks & Libraries:**  
  - React (with Vite)  
  - Supabase (Auth, DB, Edge Functions)  
  - Lucide React (Icons)  
  - Tailwind CSS (Styling)  

---

## Getting Started

### Prerequisites
Ensure the following software is installed:

```bash
Node.js v18 or above
npm (Node Package Manager)
Supabase CLI
Docker Desktop (required by Supabase CLI)

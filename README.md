# CIS046-3: Software for Enterprise – Assignment 1

**Student:** V. Lambodaran
**Date:** November 2025 (Week 8)  

This repository contains the source code and supporting materials for **Assignment 1** of *CIS046-3 Software for Enterprise*.  

The assignment involves developing a **working software application** and presenting its implementation in the context of four key computer science themes.

---

## Assignment Overview

The project is a puzzle game called **Banana Brain**, designed to improve logical thinking. Users can create accounts, enroll in Multi-Factor Authentication (MFA), select difficulty levels, and solve timed banana-themed puzzles. The game tracks combos, levels, lives, and high scores, storing results on a global leaderboard.

**Weighting:** 60% of the total unit mark  
**Submission Deadline:** 10 a.m., 05/12/2025  

The project will be demonstrated in a **10-minute video**, including a system walkthrough and discussion of four key themes:  

1. Version Control  
2. Event-Driven Programming  
3. Interoperability  
4. Virtual Identity  

---

## Key Themes

### 1. Version Control
- The project is developed using **Git and GitHub**.  
- Regular commits were made to preserve progress. Example commit messages include:
  - "The README file was revised and added."  
  - "The game's logic was updated."  
  - "Enhanced responsiveness on mobile devices."  
  - "Animations were added."  
- Features were reviewed via **pull requests** before merging into `main`.  
- GitHub provides a complete history of commits, merges, and enhancements, allowing professional tracking of project progress.  

---

### 2. Event-Driven Programming
- The frontend is built with **React (TypeScript)**, which follows an event-driven architecture.  
- User actions, such as clicking **Sign In, Start Game, Submit Answer, Enable MFA**, trigger events.  
- Input events include email, password, and TOTP code submission.  
- Game-specific events include life loss when the timer reaches zero.  
- **`App.tsx`** functions as a **finite state machine (FSM)**:
  - Handler functions update `appState` based on events.  
  - `appState` determines which component renders: `LoginScreen → MfaEnrollPage → GameScreen`.  
- This design ensures predictable and responsive UI behavior.  

---

### 3. Interoperability
- The React frontend communicates with **Supabase Edge Functions** over HTTPS and JSON.  
- Edge Functions act as a **secure proxy** to the Banana Game API: `http://marcconrad.com/uob/banana/api.php`.  
  - Puzzles are returned as JSON objects (question + solution).  
  - Solutions are encrypted into **JWT tokens**, so the client cannot access them.  
- **Leaderboard integration:** `supabase-js` is used to store and retrieve high scores in real time.  

---

### 4. Virtual Identity
- Authentication is handled by **Supabase Authentication** with MFA:  
  - **Factor 1:** Email and password  
  - **Factor 2:** Six-digit TOTP code from an authenticator app  
- The app enforces **Authenticator Assurance Levels (AAL)**:
  - **AAL1:** Password only → user must complete MFA  
  - **AAL2:** Password + TOTP → user can access the game  
- Sessions are managed securely via **JWT tokens**, maintaining user identity and leaderboard integrity.  

---

### Additional Features
- The application uses a **finite state machine** to manage screen transitions.  
- Game mechanics include:
  - 3 lives per game  
  - Level-up system  
  - Combo scoring  
  - Timer-based challenges  
- Security is enforced by encrypting puzzle answers in JWT tokens, preventing cheating.  
- UI enhancements include toasts, level-up modals, and leaderboard celebration animations.  
- The code is modular, reusable, and built with **React, TypeScript, and Tailwind CSS**.  

---

## Getting Started

### Prerequisites
Ensure the following software is installed:

```bash
Node.js v18 or above
npm (Node Package Manager)
Supabase CLI
Docker Desktop (required by Supabase CLI)

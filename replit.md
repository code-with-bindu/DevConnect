# DevConnect

## Overview
DevConnect is a React + Vite frontend application (no backend in this repo). The backend folder `DevConnect-BE` is empty.

## Project Layout
- `DevConnect-FE/` — Vite + React app (entry point)
  - `src/` — React components, redux slices, utilities
  - `vite.config.js` — configured for Replit (host 0.0.0.0, port 5000, allowedHosts: true)
- `DevConnect-FE/devConnect-FrontEnd-main/` — duplicate copy of the project (unused)

## Tech Stack
- React 19 + Vite 7
- Redux Toolkit, react-redux
- react-router-dom v7
- TailwindCSS + DaisyUI
- axios, socket.io-client

## API Base URL
`src/utils/constants.js` sets `BASE_URL` to `http://localhost:7777` on localhost or `/api` otherwise. Backend service is not included in this repo.

## Workflows
- `Start application` — runs `cd DevConnect-FE && npm run dev` on port 5000 (webview).

## Deployment
Configured as `static`:
- Build: `cd DevConnect-FE && npm install && npm run build`
- Public dir: `DevConnect-FE/dist`

## Recent Changes
- 2026-04-23: Initial Replit setup. Configured Vite to bind to 0.0.0.0:5000 with allowedHosts:true. Fixed duplicated/broken JSX at the end of `src/components/NavBar.jsx`.

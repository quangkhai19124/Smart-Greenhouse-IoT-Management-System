# Smart Greenhouse Frontend

> Frontend for the Smart Greenhouse IoT System

## Overview

This is the frontend web application for the Smart Greenhouse project, providing real-time monitoring and control of greenhouse sensors and devices. The app is built with React, TypeScript, Vite, Tailwind CSS, and Ant Design, and uses the [Refine](https://refine.dev/) framework for rapid development of admin dashboards and internal tools.

- **Live Demo:** [https://smartgreenhouse.site/](https://smartgreenhouse.site/)

## Features
- Real-time dashboard for temperature, humidity, light, and soil moisture
- Device and sensor management (add, edit, remove)
- User authentication and role-based access
- Device control and automation scheduling
- Data visualization with interactive charts
- Responsive UI for desktop and mobile

## Tech Stack
- [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- [Ant Design](https://ant.design/), [Refine](https://refine.dev/)
- [React Query](https://tanstack.com/query/latest)
- [Axios](https://axios-http.com/)

## Getting Started

### 1. Install dependencies
```bash
yarn install
```

### 2. Start the development server
```bash
yarn dev
```

### 3. Build for production
```bash
yarn build
```

### 4. Run the production server
```bash
yarn start
```

## Project Structure
- `src/pages/` — Main app pages (dashboard, device control, admin, etc.)
- `src/components/` — Reusable UI components
- `src/services/` — API service logic
- `src/models/` — TypeScript types and interfaces
- `src/contexts/` — React context providers
- `src/hooks/` — Custom React hooks

## Learn More
- [Refine Documentation](https://refine.dev/docs)
- [Ant Design Documentation](https://ant.design/docs/react/introduce)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT

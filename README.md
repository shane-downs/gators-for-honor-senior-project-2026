# Canvas SEB Exam Creator

A middleware application that simplifies the creation of Safe Exam Browser (SEB) proctored exams in Canvas LMS at the University of Florida.
https://gatorsforhonor.vercel.app

## Overview

This tool streamlines the fragmented workflow of setting up SEB-proctored exams by providing a unified interface that:
- Automatically generates SEB configuration files
- Handles Canvas API integration for quiz creation
- Reduces exam setup time from 30-45 minutes to under 10 minutes

## Tech Stack

**Frontend:**
- Next.js + TypeScript
- Tailwind CSS
- Shadcn Component Library

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL
- Canvas LMS REST API

## Project Timeline

- **Feb 2-14**: Sprint 1 - Foundation & Authentication
- **Feb 15-27**: Sprint 2 - Core Features (Prototype Ready)
- **Mar 9-20**: User Testing with UF Instructors
- **Apr 22**: Final Delivery

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Canvas Developer Account

### Installation

```bash
# Clone the repository
git clone https://github.com/shane-downs/gators-for-honor-senior-project-2026.git
cd gators-for-honor-senior-project-2026

# Install frontend dependencies
cd frontend
npm install

# Set up environment variables 
cp .env.example .env.local

# Install backend dependencies
cd ../backend
npm install

# Run development servers
cd frontend
npm run dev
```

## Features

- ✅ Canvas OAuth authentication
- ✅ Course selection interface
- ✅ 5-step exam creation wizard
- ✅ SEB configuration presets (Standard, High Security, Open Book)
- ✅ Automatic .seb file generation
- ✅ Config Key computation
- ✅ Direct quiz publishing to Canvas

## Team

**Gators For Honor**
- Shane Downs - Project Manager, Full Stack Developer
- Wilson Goins - Scrum Master, Full Stack Developer

**Faculty Advisor:** Dr. Jeremiah Blanchard

## License

University of Florida - Senior Design Project 2026

## Research Component

This project includes a usability study (Mar 9-20) measuring instructor experience with the tool compared to manual SEB configuration.
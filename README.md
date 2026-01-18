# 10xcards

## Table of Contents
1. [Project Name](#project-name)
2. [Project Description](#project-description)
3. [Tech Stack](#tech-stack)
4. [Getting Started Locally](#getting-started-locally)
5. [Available Scripts](#available-scripts)
6. [Project Scope](#project-scope)
7. [Project Status](#project-status)
8. [License](#license)

## Project Name
10xcards

## Project Description
10xcards is a web application designed to simplify the creation and management of flashcards for effective spaced repetition-based learning. The application enables users to generate flashcards in two ways:

- **AI-Generated Flashcards**: Users provide input text (between 1000 and 10,000 characters), and the AI generates candidate flashcards with a "front" (up to 200 characters) and a "back" (up to 500 characters). Users can then review, accept, edit, or reject these suggestions.
- **Manual Flashcard Creation**: Users can manually create flashcards using a simple form with validated character limits.

Additional functionalities include user account management (registration, login, password change, and account deletion), integration with a pre-built spaced repetition algorithm, and logging of flashcard generation sessions for performance monitoring.

## Tech Stack

- **Frontend**:
  - Astro 5 – Enables building fast, efficient web pages with minimal JavaScript.
  - React 19 – Provides the interactivity required for dynamic components.
  - TypeScript 5 – Offers static typing for improved code quality and IDE support.
  - Tailwind CSS 4 – Simplifies application styling through utility classes.
  - Shadcn/ui – Supplies a library of ready-to-use React components for building the user interface.

- **Backend & Database**:
  - Supabase – Serves as a comprehensive backend solution featuring a PostgreSQL database, built-in authentication, and various SDKs for a backend-as-a-service approach.

- **AI Integration**:
  - Openrouter.ai – Provides access to a range of models (OpenAI, Anthropic, Google, and more) with cost limits for API keys, facilitating efficient AI-generated content.

- **CI/CD & Hosting**:
  - GitHub Actions – Used for continuous integration and deployment pipelines.
  - DigitalOcean – Hosts the application using Docker images.

## Getting Started Locally

### Prerequisites
- Node.js (version as specified in the `.nvmrc` file, e.g., 22.14.0)
- NPM or Yarn
- Git

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/izukowska/10xcards.git
   cd 10xcards
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory to add your environment variables such as Supabase credentials and Openrouter.ai API keys.

### Running the Project
Start the development server with:

```bash
npm run dev
```

Then, open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

From the project root, you can run:

- `npm run dev`: Runs the application in development mode.
- `npm run build`: Builds the application for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Checks the project for linting errors.
- `npm run lint:fix`: Automatically fixes linting errors.
- `npm run format`: Formats the code using Prettier.

Refer to the `package.json` file for additional scripts if available.

## Project Scope

The MVP of 10xcards includes:

- **AI-Driven Flashcard Generation**: Generate flashcards based on user-provided text input with synchronous generation and review.
- **Flashcard Review Process**: Review candidate flashcards and decide to accept, edit, or reject each one, with only accepted flashcards saved.
- **Manual Flashcard Creation**: Create flashcards manually via a simple form with strict character limits (200 characters for the front and 500 for the back).
- **User Account Management**: Account registration, login, password change, and account deletion with built-in authentication and authorization.
- **Integration with Spaced Repetition**: Use existing spaced repetition algorithms to optimize learning.
- **Logging System**: Track flashcard generation sessions to measure AI effectiveness and success rates.

Exclusions from the MVP:
- Advanced repetition algorithms (e.g., SuperMemo, Anki).
- Support for importing multiple file formats (e.g., PDF, DOCX).
- Sharing flashcard sets between users.
- Integrations with external educational platforms.
- Mobile applications (web-only for the initial release).

## Project Status

Currently, 10xcards is in the MVP stage. Future enhancements may include adding more advanced AI capabilities, enhancing scalability, and incorporating additional features based on user feedback.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

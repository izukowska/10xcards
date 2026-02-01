# 10x-cards 🎴

AI-powered flashcards application built with Astro, React, and Supabase.

## 🚀 Tech Stack

- **Astro 5** - Web framework
- **TypeScript 5** - Type safety
- **React 19** - UI components
- **Tailwind 4** - Styling
- **Shadcn/ui** - Component library
- **Supabase** - Backend & Authentication
- **OpenRouter** - AI generation

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (local or cloud)
- OpenRouter API key (for AI features)

## 🛠️ Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd 10xcards
npm install
```

### 2. Configure Environment Variables

Create `.env` file for local development:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

For E2E tests, create `.env.test`:

```bash
cp .env.test.example .env.test
```

Edit `.env.test` with your cloud Supabase credentials:

```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-cloud-anon-key
E2E_EMAIL=test@example.com
E2E_PASSWORD=YourStrongPassword123!
```

📚 **See [e2e/ENV_GUIDE.md](e2e/ENV_GUIDE.md) for detailed environment setup**

### 3. Start Local Supabase (Optional)

```bash
npx supabase start
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or port shown in terminal)

## 📜 Available Scripts

### Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
```

### Testing

```bash
# Unit Tests (Vitest)
npm run test              # Run unit tests
npm run test:watch        # Watch mode
npm run test:ui           # Vitest UI
npm run test:coverage     # Coverage report

# E2E Tests (Playwright)
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Playwright UI
npm run test:e2e:debug    # Debug mode
npm run test:e2e:codegen  # Generate tests
```

📚 **See [TESTING.md](TESTING.md) for testing guidelines**

## 🏗️ Project Structure

```
10xcards/
├── src/
│   ├── layouts/          # Astro layouts
│   ├── pages/            # Astro pages & API routes
│   │   └── api/         # API endpoints
│   ├── components/       # React & Astro components
│   │   └── ui/          # Shadcn/ui components
│   ├── lib/             # Services & helpers
│   ├── db/              # Supabase clients
│   ├── types.ts         # Shared types
│   └── middleware/      # Astro middleware
├── e2e/                 # E2E tests (Playwright)
│   ├── auth/           # Authentication tests
│   ├── pages/          # Page Object Models
│   └── fixtures/       # Test fixtures
├── public/              # Static assets
└── supabase/           # Supabase migrations & config
```

## 🧪 Testing

This project uses **two testing frameworks**:

### Unit Tests (Vitest)
- Fast, isolated component/function tests
- Run during development
- See `TESTING.md` for guidelines

### E2E Tests (Playwright)
- Full user flow testing
- Runs against real browser
- Uses cloud Supabase (via `.env.test`)
- See `e2e/README.md` for details

### Environment Separation

- **`.env`** → Local development (local Supabase)
- **`.env.test`** → E2E tests (cloud Supabase)

When running E2E tests, `.env.test` takes priority. This allows you to:
- ✅ Develop locally with local database
- ✅ Test with cloud database automatically
- ✅ No manual switching needed

## 🔐 Authentication

The app uses **Supabase Auth** with:
- Email/password registration
- Email confirmation (configurable)
- Protected routes via middleware
- Session management

Test user credentials are configured in `.env.test`.

## 🎨 Styling

- **Tailwind CSS 4** for utility-first styling
- **Shadcn/ui** for pre-built components
- Dark mode support built-in
- Responsive design

## 🚢 Deployment

### Build

```bash
npm run build
```

### Deploy to Vercel/Netlify/etc.

Set environment variables in your hosting platform:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`

## 📚 Documentation

- [TESTING.md](TESTING.md) - Testing guidelines
- [e2e/README.md](e2e/README.md) - E2E test documentation
- [e2e/ENV_GUIDE.md](e2e/ENV_GUIDE.md) - Environment variables guide
- [.cursor/rules/](..cursor/rules/) - AI assistant rules

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards

- Follow existing code style
- Run linter before committing (`npm run lint:fix`)
- Write tests for new features
- Update documentation as needed

## 📄 License

[Your License Here]

## 🐛 Known Issues

None currently. Please report issues via GitHub Issues.

## 💡 Tips

- Use `npm run test:watch` during development
- Use `npm run test:e2e:ui` to debug E2E tests visually
- Check `e2e/ENV_GUIDE.md` if tests fail with connection errors
- Local Supabase: `npx supabase start` (port 54321)
- Dev server: Usually port 3000 or 4321

## 📞 Support

For questions or issues:
1. Check existing documentation
2. Search closed issues
3. Open new issue with details

---

**Happy coding! 🚀**

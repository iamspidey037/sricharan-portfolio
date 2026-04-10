# Sri Charan's Portfolio — Complete Folder Structure

```
portfolio/
├── app/                                    # Next.js 14 App Router
│   ├── layout.tsx                          # Root layout (fonts, providers, SEO)
│   ├── page.tsx                            # Public portfolio home
│   ├── globals.css                         # Global styles, CSS variables, theme
│   │
│   ├── (public)/                           # Public-facing pages (grouped)
│   │   ├── projects/
│   │   │   ├── page.tsx                    # All projects listing
│   │   │   └── [slug]/page.tsx             # Individual project detail
│   │   ├── blog/
│   │   │   ├── page.tsx                    # Blog listing
│   │   │   └── [slug]/page.tsx             # Individual blog post
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── links/page.tsx                  # Link-in-bio page
│   │
│   ├── share/[token]/page.tsx              # Secret shareable links
│   │
│   ├── admin/                              # Admin Panel (all protected)
│   │   ├── login/page.tsx                  # Admin login page
│   │   ├── setup/page.tsx                  # First-time setup wizard
│   │   ├── layout.tsx                      # Admin layout (sidebar, header)
│   │   ├── dashboard/page.tsx              # Admin dashboard home
│   │   ├── content/
│   │   │   ├── page.tsx                    # Content manager (tree view)
│   │   │   └── [id]/page.tsx               # Section editor
│   │   ├── files/page.tsx                  # File manager
│   │   ├── messages/page.tsx               # Contact messages inbox
│   │   ├── analytics/page.tsx              # Visitor analytics
│   │   ├── activity/page.tsx               # Activity log
│   │   └── settings/page.tsx               # Admin settings
│   │
│   └── api/                                # Next.js API Routes
│       ├── auth/
│       │   ├── login/route.ts              # POST: admin login
│       │   ├── logout/route.ts             # POST: admin logout
│       │   ├── refresh/route.ts            # POST: refresh access token
│       │   └── setup/route.ts              # POST: first-time setup
│       │
│       ├── admin/                          # Protected admin APIs
│       │   ├── sections/
│       │   │   ├── route.ts                # GET list, POST create
│       │   │   ├── [id]/route.ts           # GET, PUT, DELETE single
│       │   │   ├── [id]/reorder/route.ts   # PUT: change order
│       │   │   └── [id]/restore/route.ts   # PUT: restore from trash
│       │   ├── files/
│       │   │   ├── route.ts                # GET list, POST upload
│       │   │   └── [id]/route.ts           # GET, PUT, DELETE single
│       │   ├── messages/
│       │   │   ├── route.ts                # GET list
│       │   │   └── [id]/route.ts           # GET, PUT, DELETE single
│       │   ├── settings/route.ts           # GET, PUT site settings
│       │   ├── analytics/route.ts          # GET analytics data
│       │   └── activity/route.ts           # GET activity log
│       │
│       └── public/                         # Public APIs (no auth needed)
│           ├── sections/route.ts           # GET public sections
│           ├── contact/route.ts            # POST contact form
│           ├── share/[token]/route.ts      # GET shared content
│           └── track/route.ts              # POST analytics tracking
│
├── components/
│   ├── admin/
│   │   ├── layout/
│   │   │   ├── AdminSidebar.tsx            # Admin sidebar navigation
│   │   │   ├── AdminHeader.tsx             # Admin top header
│   │   │   └── AdminLayout.tsx             # Admin layout wrapper
│   │   ├── editors/
│   │   │   ├── RichTextEditor.tsx          # Tiptap WYSIWYG editor
│   │   │   ├── SectionEditor.tsx           # Full section editor panel
│   │   │   └── FieldBuilder.tsx            # Dynamic custom fields builder
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx               # Admin login form
│   │   │   ├── SetupForm.tsx               # First-time setup form
│   │   │   └── SettingsForm.tsx            # Site settings form
│   │   ├── panels/
│   │   │   ├── ContentTree.tsx             # Tree view of all content
│   │   │   ├── FileManager.tsx             # File manager panel
│   │   │   ├── MessagesInbox.tsx           # Contact messages
│   │   │   └── AnalyticsDashboard.tsx      # Analytics charts
│   │   └── modals/
│   │       ├── ConfirmDialog.tsx           # Delete confirmation
│   │       ├── ShareLinkModal.tsx          # Shareable link generator
│   │       ├── FileUploadModal.tsx         # File upload modal
│   │       └── VisibilityModal.tsx         # Visibility selector
│   │
│   ├── public/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                  # Public navbar
│   │   │   ├── Footer.tsx                  # Public footer
│   │   │   └── PageTransition.tsx          # Framer Motion transitions
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx             # Hero with typing effect
│   │   │   ├── AboutSection.tsx            # About me section
│   │   │   ├── SkillsSection.tsx           # Skills with progress bars
│   │   │   ├── ProjectsSection.tsx         # Projects grid/list
│   │   │   ├── ProjectCard.tsx             # Individual project card
│   │   │   ├── InternshipsSection.tsx      # Internships timeline
│   │   │   ├── CertificationsSection.tsx   # Certifications grid
│   │   │   ├── BlogSection.tsx             # Blog preview
│   │   │   ├── ContactSection.tsx          # Contact form
│   │   │   ├── TimelineSection.tsx         # Experience timeline
│   │   │   └── EdgeAIShowcase.tsx          # Edge AI/TinyML showcase
│   │   └── ui/
│   │       ├── TechChip.tsx                # Tech stack chip
│   │       ├── StatusBadge.tsx             # Project status badge
│   │       ├── VisibilityBadge.tsx         # Public/Shared/Private badge
│   │       ├── FilePreview.tsx             # File preview component
│   │       ├── ImageGallery.tsx            # Lightbox gallery
│   │       ├── CodeBlock.tsx               # Syntax-highlighted code
│   │       └── ScrollReveal.tsx            # Scroll animation wrapper
│   │
│   └── shared/
│       ├── ThemeToggle.tsx                 # Dark/light theme toggle
│       ├── Toast.tsx                       # Toast notifications
│       ├── LoadingSkeleton.tsx             # Loading skeleton
│       ├── EmptyState.tsx                  # Empty state component
│       └── BackToTop.tsx                   # Back to top button
│
├── lib/
│   ├── db/
│   │   ├── mongoose.ts                     # MongoDB connection
│   │   └── seed.ts                         # Sample data seeder
│   ├── auth/
│   │   ├── jwt.ts                          # JWT utilities
│   │   ├── bcrypt.ts                       # Password hashing
│   │   └── middleware.ts                   # Auth middleware
│   └── utils/
│       ├── api.ts                          # API helper functions
│       ├── slugify.ts                      # URL slug generator
│       ├── fileUtils.ts                    # File handling utilities
│       └── analytics.ts                    # Analytics helpers
│
├── models/                                 # Mongoose schemas
│   ├── Admin.ts                            # Admin user schema
│   ├── Section.ts                          # Recursive section schema
│   ├── File.ts                             # File/media schema
│   ├── ContactMessage.ts                   # Contact form submissions
│   ├── ActivityLog.ts                      # Activity audit log
│   ├── Analytics.ts                        # Page view analytics
│   └── SiteSettings.ts                     # Global site settings
│
├── hooks/
│   ├── useAuth.ts                          # Authentication hook
│   ├── useSections.ts                      # Sections CRUD hook
│   ├── useFileUpload.ts                    # File upload hook
│   ├── useTheme.ts                         # Theme management hook
│   └── useToast.ts                         # Toast notifications hook
│
├── types/
│   ├── section.ts                          # Section TypeScript types
│   ├── admin.ts                            # Admin types
│   ├── file.ts                             # File types
│   └── api.ts                              # API response types
│
├── middleware.ts                           # Next.js middleware (auth protection)
├── next.config.js                          # Next.js configuration
├── tailwind.config.ts                      # Tailwind configuration
├── tsconfig.json                           # TypeScript configuration
├── .env.example                            # Environment variables template
├── .env.local                              # Local environment (gitignored)
├── .gitignore
└── README.md                               # Comprehensive setup guide
```

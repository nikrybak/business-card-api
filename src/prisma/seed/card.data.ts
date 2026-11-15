import type { SkillCategory } from '~/generated/prisma/client';

/** The card content: the source of truth that the seed writes to the database */
export const card = {
  slug: 'nikita-rybak',
  name: 'Nikita Rybak',
  headline: 'Full-stack developer - Node.js, TypeScript, PHP, Go',
  description:
    'I build products end to end: research, architecture, code, release and support. ' +
    '3+ years across fintech, digital agencies and B2B SaaS, 20+ apps shipped to the Bitrix24 Marketplace',
  location: 'Da Nang, Vietnam - remote',

  links: [
    { label: 'GitHub', url: 'https://github.com/nikrybak' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/nikita-rybak' },
    { label: 'Telegram', url: 'https://t.me/nik_rybak' },
    { label: 'Email', url: 'mailto:nrybak200x@gmail.com' },
  ],

  skills: {
    LANGUAGE: ['TypeScript', 'JavaScript', 'PHP', 'Go', 'Kotlin', 'SQL'],
    BACKEND: ['Node.js', 'NestJS', 'Express', 'GraphQL', 'REST', 'gRPC', 'WebSocket'],
    DATA: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'ClickHouse', 'Prisma', 'TypeORM'],
    MESSAGING: ['Kafka', 'RabbitMQ'],
    FRONTEND: ['Vue 3', 'Pinia', 'React'],
    DEVOPS: [
      'Docker',
      'Kubernetes',
      'Nomad',
      'Consul',
      'Nginx',
      'CI/CD',
      'Prometheus',
      'Grafana',
      'ELK',
      'Sentry',
    ],
    PRACTICE: ['Clean architecture', 'DDD', 'SOLID', 'TDD', 'Jest', 'Vitest', 'Playwright', 'Claude Code'],
  } satisfies Record<SkillCategory, string[]>,

  experience: [
    {
      company: 'Bambit',
      position: 'Full-stack developer',
      location: 'Remote',
      startedAt: '2025-07',
      endedAt: null,
      stack: ['TypeScript', 'Node.js', 'Express', 'Prisma', 'MySQL', 'Vue 3', 'PHP', 'Docker'],
      achievements: [
        'Designed and shipped 20+ Bitrix24 Marketplace apps end to end - research, architecture, release and support',
        'Built a cash-flow accounting app with multi-currency cash desks and a payment calendar, load-tested on 100 000 operations',
        'Built a messenger app family on a shared core service, with a courier mini app that routes by roads and takes photo reports',
        'Migrated legacy PHP products to Node.js and TypeScript',
        'Set up tag-based releases with a canary check next to the live version, rollback in minutes and full test coverage of new modules',
      ],
    },
    {
      company: '3205.team',
      position: 'Backend Node.js developer',
      location: 'Remote',
      startedAt: '2025-01',
      endedAt: '2025-04',
      stack: ['Node.js', 'TypeScript', 'NestJS', 'GraphQL', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
      achievements: [
        'Shipped NestJS service modules with a layered architecture and typed REST and GraphQL contracts',
        'Modeled data in PostgreSQL, added Redis caching and background jobs, ran services on Kubernetes',
      ],
    },
    {
      company: 'Purrweb',
      position: 'Node.js developer',
      location: 'Remote',
      startedAt: '2024-08',
      endedAt: '2024-10',
      stack: ['Node.js', 'TypeScript', 'NestJS', 'GraphQL', 'PostgreSQL', 'TypeORM'],
      achievements: [
        'Built REST and GraphQL APIs for web and mobile products of international clients',
        'Implemented OAuth2 and JWT authentication, payments and subscriptions through Paddle',
      ],
    },
    {
      company: 'Fintech company - cloud point-of-sale platform',
      position: 'Node.js developer',
      location: 'Remote',
      startedAt: '2023-06',
      endedAt: '2024-05',
      stack: ['Node.js', 'Moleculer', 'Kafka', 'RabbitMQ', 'gRPC', 'MongoDB', 'PostgreSQL', 'ClickHouse'],
      achievements: [
        'Built microservices with Kafka and RabbitMQ messaging and gRPC between services',
        'Developed the API gateway layer with custom routing in front of the services',
        'Ran services on Nomad with Consul, logs in ELK and metrics in Prometheus and Grafana',
      ],
    },
  ],

  projects: [
    {
      name: 'Business card API',
      description: 'This service: NestJS, Prisma and GraphQL with batched nested reads',
      url: 'https://github.com/nikrybak/business-card-api',
      stack: ['NestJS', 'GraphQL', 'Prisma', 'PostgreSQL', 'Docker'],
    },
    {
      name: 'Statecraft',
      description: 'State machine and workflow library for PHP 8.3+',
      url: 'https://github.com/nikrybak/statecraft',
      stack: ['PHP'],
    },
    {
      name: 'Nonoku',
      description: 'Offline puzzle game for Android and Google Play Games on PC with a shared Rust backend',
      url: 'https://play.google.com/store/apps/details?id=com.nonoku.app',
      stack: ['Kotlin', 'Jetpack Compose', 'Rust'],
    },
  ],
};

# PROMPT PARA CLAUDE CODE — IWON AUDIOVISUAL

## CONTEXTO DEL PROYECTO

Iwon Audiovisual es una productora audiovisual que funciona como plataforma de membresía para artistas urbanos independientes en Argentina. No es una academia de cursos ni un marketplace — es un programa de impulso artístico con producción real.

**Pitch:** "Vamos a seleccionar a los 50 mejores artistas y filmarles su disco. Con equipamiento de cine."

**Fundador:** Leonardo  
**Marca:** Iwon Audiovisual  
**Mercado:** Argentina (artistas urbanos independientes, 18-30 años, trap/rap/RKT/reggaetón)  
**Modelo:** Suscripción mensual $9.999 ARS  
**Estado:** Lanzamiento inmediato (Abril 2026)

---

## INSTRUCCIÓN PRINCIPAL

Creá desde cero la aplicación web completa de Iwon Audiovisual. Esto incluye:

1. Inicializar el proyecto con todas las carpetas y archivos.
2. Instalar todos los paquetes y dependencias necesarias.
3. Diseñar y construir el frontend funcional completo.
4. Configurar la base de datos y autenticación.
5. Implementar la lógica de pagos con MercadoPago.
6. Construir el panel de administración.

---

## STACK TÉCNICO (OBLIGATORIO)

| Componente | Tecnología | Notas |
|---|---|---|
| Framework | **Next.js 14+** (App Router `app/`) | TypeScript |
| UI/Styling | **Tailwind CSS + shadcn/ui** | Tema oscuro como base, estética urbana/premium |
| Base de datos | **Supabase + PostgreSQL** | Auth, storage, realtime |
| Autenticación | **Supabase Auth** | Email/password + Google OAuth |
| Pagos | **MercadoPago SDK** | Suscripciones recurrentes |
| Video hosting | **Cloudinary** | Video Player para cursos |
| Email | **Resend** | Emails transaccionales |
| Rate limiting | **Upstash Redis** | Protección de APIs |
| Hosting | **Vercel** | Deploy y CDN |
| Validación | **Zod** | Schemas de validación |
| Estado global | **Zustand** (si es necesario) | Mínimo uso, preferir server components |

---

## ESTRUCTURA DE CARPETAS

```
iwon-audiovisual/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/route.ts          # OAuth callback
│   ├── (marketing)/
│   │   ├── page.tsx                    # Landing page pública
│   │   └── layout.tsx
│   ├── (platform)/
│   │   ├── layout.tsx                  # Layout con sidebar (requiere auth + suscripción)
│   │   ├── dashboard/page.tsx          # Home del suscriptor
│   │   ├── cursos/
│   │   │   ├── page.tsx                # Lista de cursos
│   │   │   └── [slug]/page.tsx         # Detalle + video player
│   │   ├── seleccion/
│   │   │   ├── page.tsx                # Info de la selección actual
│   │   │   └── aplicar/page.tsx        # Formulario de aplicación
│   │   ├── promos/page.tsx             # Promos de filmación
│   │   ├── sorteos/page.tsx            # Sorteos activos
│   │   └── perfil/page.tsx             # Perfil del artista
│   ├── (admin)/
│   │   ├── layout.tsx                  # Layout admin (requiere rol admin)
│   │   ├── admin/page.tsx              # Dashboard admin
│   │   ├── admin/suscriptores/page.tsx
│   │   ├── admin/selecciones/page.tsx  # Gestionar selecciones "Los 50"
│   │   ├── admin/sorteos/page.tsx      # Gestionar sorteos
│   │   ├── admin/cursos/page.tsx       # CRUD de cursos
│   │   ├── admin/promos/page.tsx       # Gestionar promos filmación
│   │   └── admin/pagos/page.tsx        # Ver estado de pagos
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── mercadopago/route.ts    # Webhook de MercadoPago
│   │   ├── subscription/
│   │   │   ├── create/route.ts
│   │   │   └── cancel/route.ts
│   │   ├── seleccion/
│   │   │   └── aplicar/route.ts
│   │   └── sorteos/
│   │       └── participar/route.ts
│   ├── layout.tsx                      # Root layout
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── landing/                        # Componentes de la landing
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Benefits.tsx
│   │   ├── Pricing.tsx
│   │   ├── Portfolio.tsx
│   │   ├── FAQ.tsx
│   │   └── CTA.tsx
│   ├── platform/                       # Componentes de la plataforma
│   │   ├── Sidebar.tsx
│   │   ├── CourseCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── SelectionTimer.tsx
│   │   ├── EventCalendar.tsx
│   │   └── SubscriptionStatus.tsx
│   ├── admin/                          # Componentes del admin
│   │   ├── AdminSidebar.tsx
│   │   ├── StatsCards.tsx
│   │   ├── SubscriberTable.tsx
│   │   └── SelectionManager.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── Logo.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   ├── server.ts                   # Server client
│   │   ├── admin.ts                    # Service role client
│   │   └── middleware.ts               # Auth middleware
│   ├── mercadopago/
│   │   ├── client.ts                   # SDK config
│   │   ├── subscription.ts             # Crear/cancelar suscripciones
│   │   └── webhook.ts                  # Procesar webhooks
│   ├── cloudinary/
│   │   └── config.ts
│   ├── resend/
│   │   └── client.ts
│   ├── redis/
│   │   └── client.ts                   # Upstash rate limiting
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── subscription.ts
│   │   ├── seleccion.ts
│   │   └── curso.ts
│   └── utils.ts
├── types/
│   ├── database.ts                     # Tipos de Supabase (generados)
│   ├── mercadopago.ts
│   └── index.ts
├── hooks/
│   ├── useUser.ts
│   ├── useSubscription.ts
│   └── useAdmin.ts
├── middleware.ts                        # Next.js middleware (auth + rutas protegidas)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # Schema completo
├── .env.example
├── .env.local                          # (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## BASE DE DATOS — SCHEMA SQL (Supabase/PostgreSQL)

Creá el archivo `supabase/migrations/001_initial_schema.sql` con estas tablas:

```sql
-- Habilitar extensiones
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extiende auth.users de Supabase)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  artist_name text,
  avatar_url text,
  phone text,
  bio text,
  genres text[] default '{}',
  instagram_url text,
  spotify_url text,
  youtube_url text,
  role text not null default 'user' check (role in ('user', 'admin', 'moderator')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mp_subscription_id text,                    -- ID de MercadoPago
  mp_preapproval_id text,                     -- ID de preapproval de MP
  status text not null default 'pending' check (status in ('pending', 'active', 'paused', 'cancelled', 'expired')),
  plan_amount decimal(10,2) default 9999.00,
  currency text default 'ARS',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- PAYMENTS
-- ============================================
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id),
  mp_payment_id text,
  amount decimal(10,2) not null,
  currency text default 'ARS',
  status text not null check (status in ('pending', 'approved', 'rejected', 'refunded')),
  payment_method text,
  created_at timestamptz default now()
);

-- ============================================
-- COURSES (cursos de formación)
-- ============================================
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  category text not null check (category in ('finanzas', 'marketing', 'branding', 'distribucion', 'legal', 'estrategia')),
  is_published boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- LESSONS (lecciones dentro de un curso)
-- ============================================
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  video_url text,                             -- Cloudinary URL
  video_public_id text,                       -- Cloudinary public_id
  duration_minutes int,
  sort_order int default 0,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- LESSON PROGRESS (progreso del usuario)
-- ============================================
create table public.lesson_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed boolean default false,
  progress_seconds int default 0,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

-- ============================================
-- SELECTIONS (oleadas de "Los 50")
-- ============================================
create table public.selections (
  id uuid default uuid_generate_v4() primary key,
  title text not null,                        -- Ej: "Oleada 1 - Abril 2026"
  description text,
  status text not null default 'draft' check (status in ('draft', 'open', 'reviewing', 'announced', 'in_production', 'completed')),
  open_date timestamptz,
  close_date timestamptz,
  announcement_date timestamptz,
  max_selected int default 50,
  created_at timestamptz default now()
);

-- ============================================
-- SELECTION APPLICATIONS (aplicaciones)
-- ============================================
create table public.selection_applications (
  id uuid default uuid_generate_v4() primary key,
  selection_id uuid references public.selections(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  demo_url text not null,                     -- Link al demo
  demo_description text,
  tracks_count int default 5,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'selected', 'rejected')),
  admin_notes text,                           -- Notas internas del equipo
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  unique(selection_id, user_id)               -- Solo una aplicación por oleada
);

-- ============================================
-- RAFFLES (sorteos)
-- ============================================
create table public.raffles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  prize_description text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  draw_date timestamptz,
  winner_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- RAFFLE ENTRIES (participaciones en sorteos)
-- ============================================
create table public.raffle_entries (
  id uuid default uuid_generate_v4() primary key,
  raffle_id uuid references public.raffles(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(raffle_id, user_id)
);

-- ============================================
-- PROMOS (promos de filmación)
-- ============================================
create table public.promos (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price decimal(10,2) default 49999.00,
  max_slots int default 200,
  slots_taken int default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'sold_out', 'completed')),
  available_from timestamptz,
  available_until timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- PROMO BOOKINGS (reservas de promos)
-- ============================================
create table public.promo_bookings (
  id uuid default uuid_generate_v4() primary key,
  promo_id uuid references public.promos(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mp_payment_id text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_payments_user on public.payments(user_id);
create index idx_lessons_course on public.lessons(course_id);
create index idx_lesson_progress_user on public.lesson_progress(user_id);
create index idx_selection_apps_selection on public.selection_applications(selection_id);
create index idx_selection_apps_user on public.selection_applications(user_id);
create index idx_raffle_entries_raffle on public.raffle_entries(raffle_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.selections enable row level security;
alter table public.selection_applications enable row level security;
alter table public.raffles enable row level security;
alter table public.raffle_entries enable row level security;
alter table public.promos enable row level security;
alter table public.promo_bookings enable row level security;

-- Profiles: usuarios ven su propio perfil, admins ven todos
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Subscriptions: usuario ve la suya
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- Courses y Lessons: todos los suscriptores activos pueden ver cursos publicados
create policy "Active subscribers can view published courses" on public.courses for select using (
  is_published = true and exists (
    select 1 from public.subscriptions where user_id = auth.uid() and status = 'active'
  )
);
create policy "Active subscribers can view published lessons" on public.lessons for select using (
  is_published = true and exists (
    select 1 from public.subscriptions where user_id = auth.uid() and status = 'active'
  )
);

-- Lesson progress: usuario gestiona su propio progreso
create policy "Users manage own progress" on public.lesson_progress for all using (auth.uid() = user_id);

-- Selections: visibles para todos los suscriptores activos
create policy "Subscribers can view open selections" on public.selections for select using (
  status != 'draft' and exists (
    select 1 from public.subscriptions where user_id = auth.uid() and status = 'active'
  )
);

-- Selection applications: usuario ve y crea las suyas
create policy "Users manage own applications" on public.selection_applications for all using (auth.uid() = user_id);

-- Raffles y entries: similar a selections
create policy "Subscribers can view active raffles" on public.raffles for select using (
  status != 'draft' and exists (
    select 1 from public.subscriptions where user_id = auth.uid() and status = 'active'
  )
);
create policy "Users manage own raffle entries" on public.raffle_entries for all using (auth.uid() = user_id);

-- Promos: suscriptores activos
create policy "Subscribers can view active promos" on public.promos for select using (
  status in ('active', 'sold_out') and exists (
    select 1 from public.subscriptions where user_id = auth.uid() and status = 'active'
  )
);
create policy "Users manage own bookings" on public.promo_bookings for all using (auth.uid() = user_id);

-- Admin: full access via service role (no necesita policies, usa supabase admin client)

-- ============================================
-- FUNCTIONS
-- ============================================

-- Crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Actualizar updated_at automáticamente
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
create trigger update_subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.update_updated_at();
create trigger update_courses_updated_at before update on public.courses
  for each row execute procedure public.update_updated_at();
```

---

## PÁGINAS Y FUNCIONALIDAD

### 1. LANDING PAGE (pública — `app/(marketing)/page.tsx`)

Es la página más importante. Debe vender la suscripción. Estética: oscura, premium, urbana. Inspiración visual: sitios de productoras de cine mezclados con cultura urbana argentina.

**Secciones obligatorias:**

- **Hero:** Título grande "Vamos a seleccionar a los 50 mejores artistas y filmarles su disco." Subtítulo: "Con equipamiento de cine." Botón CTA "Suscribite por $9.999/mes". Video de fondo o imagen de alta calidad (placeholder con Cloudinary).
- **Cómo funciona:** 4 pasos visuales con el ciclo de eventos (Selección → Sorteo → Promos → Cursos).
- **Beneficios:** Grid con los 4 beneficios desde el día 1 (cursos, promos, sorteos, selección).
- **Portfolio:** Galería/carrusel con los +450 videoclips como prueba social. Placeholder con thumbnails.
- **Pricing:** Card única con el precio $9.999/mes, lista de todo lo incluido, CTA.
- **FAQ:** Acordeón con todas las objeciones resueltas del documento.
- **CTA final:** Repetir el call-to-action de suscripción.

### 2. AUTENTICACIÓN (`app/(auth)/`)

- Login con email/password y botón de Google.
- Registro con email/password y botón de Google.
- Callback para OAuth.
- Después de registrarse, redirigir a página de suscripción.
- Usar Supabase Auth con `@supabase/ssr` para manejar cookies en server components.

### 3. PLATAFORMA DEL SUSCRIPTOR (`app/(platform)/`)

Requiere: autenticación + suscripción activa. Si no tiene suscripción activa, redirigir a página de pago.

- **Dashboard:** Resumen del estado actual. Próximo evento del calendario rotativo. Estado de su suscripción. Accesos rápidos a cursos, selección, promos, sorteos. Contador/timer si hay selección abierta.
- **Cursos:** Lista de cursos por categoría (Finanzas, Marketing, Branding, Distribución). Cada curso con sus lecciones. Video player con Cloudinary. Tracking de progreso por lección.
- **Selección "Los 50":** Info de la oleada actual (status, fechas). Formulario de aplicación (demo URL, descripción, cantidad de tracks). Estado de la aplicación si ya aplicó. Lista de seleccionados una vez anunciados.
- **Promos de filmación:** Cards con las promos activas. Cupos disponibles (200 - slots_taken). Botón de reservar (pago único por MercadoPago).
- **Sorteos:** Sorteos activos con descripción del premio. Botón "Participar" (1 click). Ver si ya participó. Resultado cuando se complete.
- **Perfil:** Editar datos del artista (nombre, nombre artístico, bio, géneros, redes sociales). Ver estado de suscripción. Cancelar suscripción.

### 4. PANEL DE ADMINISTRACIÓN (`app/(admin)/`)

Requiere: autenticación + rol 'admin' en profiles.

- **Dashboard admin:** KPIs en tiempo real: total suscriptores activos, revenue mensual, selecciones activas, clips producidos. Gráficos de crecimiento de suscriptores (usar recharts o chart con shadcn).
- **Gestión de suscriptores:** Tabla con todos los suscriptores. Filtrar por status, fecha, búsqueda. Ver detalle de cada suscriptor (perfil, pagos, aplicaciones).
- **Gestión de selecciones:** Crear nueva oleada. Abrir/cerrar convocatoria. Ver aplicaciones recibidas. Marcar como seleccionado/rechazado. Notas internas por aplicación. Anunciar resultados.
- **Gestión de sorteos:** Crear sorteo. Activar/cerrar. Ver participantes. Seleccionar ganador (botón que elige al azar). Publicar resultado.
- **Gestión de cursos:** CRUD completo de cursos y lecciones. Subir video (Cloudinary). Publicar/despublicar. Reordenar.
- **Gestión de promos:** Crear promo. Configurar cupos y precio. Ver reservas. Marcar como sold_out.
- **Pagos:** Historial de pagos. Filtrar por estado, fecha, monto. Exportar a CSV (nice to have).

---

## INTEGRACIÓN MERCADOPAGO

### Suscripción recurrente:

```typescript
// Usar MercadoPago SDK v2 para Node
// Crear una "preapproval" (suscripción recurrente)
// Plan: $9.999 ARS/mes, sin permanencia mínima

// Flujo:
// 1. Usuario clickea "Suscribite"
// 2. Backend crea preapproval en MP
// 3. MP redirige al usuario a su checkout
// 4. Usuario paga → MP envía webhook
// 5. Webhook actualiza status de subscription en Supabase
// 6. Usuario accede a la plataforma
```

### Webhook (`app/api/webhooks/mercadopago/route.ts`):

- Validar firma del webhook.
- Procesar eventos: `payment.created`, `payment.updated`, `subscription_preapproval.updated`.
- Actualizar tablas `subscriptions` y `payments` según el evento.
- Usar rate limiting con Upstash Redis para proteger el endpoint.

### Variables de entorno necesarias:

```env
# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend
RESEND_API_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## DISEÑO Y ESTÉTICA

### Paleta de colores (configurar en Tailwind):

- **Fondo principal:** Negro/casi negro `#0A0A0A`
- **Fondo secundario:** Gris oscuro `#141414`
- **Fondo cards:** `#1A1A1A`
- **Acento primario (dorado):** `#C9A84C` (para CTAs, highlights, logo)
- **Acento secundario:** `#E8D48B` (hover del dorado)
- **Texto principal:** `#F5F5F5`
- **Texto secundario:** `#A0A0A0`
- **Bordes:** `#2A2A2A`
- **Éxito:** `#22C55E`
- **Error:** `#EF4444`
- **Warning:** `#F59E0B`

### Tipografía:

- **Headlines:** Inter o similar sans-serif, bold, tracking tight.
- **Body:** Inter, regular.
- **Acentos/números:** Mono o tabular para precios y contadores.

### Principios de diseño:

- Dark mode como default y único modo.
- Bordes sutiles, sin sombras pesadas.
- Animaciones suaves con Tailwind (hover, transitions).
- Glassmorphism sutil en cards (backdrop-blur donde aplique).
- Espaciado generoso. No amontonar.
- Mobile-first. Todo responsive.
- Los componentes de shadcn/ui deben reskinnearse al tema oscuro/dorado.

---

## MIDDLEWARE Y PROTECCIÓN DE RUTAS

```typescript
// middleware.ts
// 1. Verificar sesión de Supabase
// 2. Rutas /platform/* → requieren auth + suscripción activa
// 3. Rutas /admin/* → requieren auth + role = 'admin'
// 4. Rutas /login, /register → redirigir a /dashboard si ya está logueado
// 5. Rutas públicas: landing, callback
```

---

## LÍMITES Y RESTRICCIONES TÉCNICAS

1. **No usar `pages/` router.** Solo App Router (`app/`).
2. **No usar `getServerSideProps` ni `getStaticProps`.** Usar server components y `fetch` en server.
3. **No instalar ORMs.** Usar Supabase client directamente.
4. **No crear un backend separado.** Todo vive en Next.js API routes.
5. **No hardcodear textos en español con caracteres especiales** sin escapar correctamente.
6. **Máximo 1 nivel de nesting en componentes de layout.** Mantener la arquitectura plana.
7. **Cada API route debe tener rate limiting** con Upstash Redis.
8. **Todas las inputs de usuario deben validarse con Zod** antes de procesarse.
9. **No usar `any` en TypeScript.** Tipar todo correctamente.
10. **No almacenar tokens o secrets en el frontend.** Solo variables `NEXT_PUBLIC_*` van al cliente.

---

## ORDEN DE EJECUCIÓN

Seguir este orden estrictamente:

1. **Inicializar proyecto:** `npx create-next-app@latest aurelia-productions --typescript --tailwind --eslint --app --src-dir=false`
2. **Instalar dependencias:** Todas las necesarias de una sola vez.
3. **Configurar Tailwind** con la paleta de colores y tema oscuro.
4. **Instalar y configurar shadcn/ui** con el tema personalizado.
5. **Crear estructura de carpetas** completa.
6. **Crear `.env.example`** con todas las variables.
7. **Configurar Supabase** (client, server, admin, middleware).
8. **Crear el schema SQL** completo.
9. **Implementar autenticación** (login, register, callback, middleware).
10. **Construir la landing page** completa con todas las secciones.
11. **Construir la plataforma del suscriptor** (todas las páginas).
12. **Implementar integración MercadoPago** (suscripciones + webhooks).
13. **Construir el panel admin** completo.
14. **Configurar Cloudinary** para video player.
15. **Configurar Resend** para emails.
16. **Configurar Upstash Redis** para rate limiting.
17. **Crear `README.md`** con instrucciones de setup.

---

## RESULTADO ESPERADO

Al finalizar, la aplicación debe:

- Compilar sin errores con `npm run build`.
- Tener todas las páginas funcionales y navegables.
- Tener el diseño completo (no wireframes, no placeholders de diseño).
- Tener toda la lógica de autenticación funcionando.
- Tener las API routes listas para conectar con MercadoPago.
- Tener el panel admin funcional.
- Ser completamente responsive (mobile-first).
- Pasar `npm run lint` sin errores.

**IMPORTANTE:** No preguntar nada. No pedir confirmación. Ejecutar todo de principio a fin sin interrupciones. Si hay alguna decisión técnica menor que no está cubierta en este prompt, tomar la decisión más razonable y seguir adelante.
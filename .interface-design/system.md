# Design System - Marketplace de Serviços

## Direction

**Personality:** Profissional & Confiável  
**Foundation:** Verde Esmeralda (Natureza & Crescimento)  
**Depth:** Borders-only com subtle shadows  
**Feel:** Moderno, limpo, focado em dados e transações

---

## Domain Exploration

**Product Domain:** Marketplace de serviços profissionais - conecta prestadores de serviços com clientes em um ambiente seguro e transparente.

**Domain Concepts:**

1. Confiança - Validação de perfis, avaliações, histórico
2. Transparência - Preços claros, propostas detalhadas, status visível
3. Eficiência - Busca rápida, filtros precisos, navegação intuitiva
4. Profissionalismo - Interface séria, dados organizados, hierarquia clara
5. Crescimento - Métricas, estatísticas, progresso visível

**Color World:**

1. Verde floresta profundo - Estabilidade, confiança, natureza
2. Verde esmeralda - Crescimento, sucesso, ação positiva
3. Verde menta claro - Informação secundária, estados de sucesso
4. Cinza ardósia - Estrutura, profissionalismo, neutralidade
5. Âmbar suave - Avisos, atenção, estados pendentes

**Signature Element:**
Status badges com gradiente sutil e borda luminosa que indicam validação e confiabilidade do prestador de serviço.

**Defaults Rejected:**

1. ❌ Cards brancos em fundo claro → ✅ Cards com fundo escuro translúcido em gradiente verde
2. ❌ Sidebar com cor diferente → ✅ Sidebar integrada com mesmo fundo e border sutil
3. ❌ Botões coloridos aleatórios → ✅ Sistema de botões baseado em hierarquia (primary verde, secondary outline, ghost)

---

## Tokens

### Colors - Foundation

```css
/* Base Palette - Verde Esmeralda */
--emerald-50: #f0fdf4;
--emerald-100: #dcfce7;
--emerald-200: #bbf7d0;
--emerald-300: #86efac;
--emerald-400: #4ade80;
--emerald-500: #22c55e;
--emerald-600: #16a34a;
--emerald-700: #15803d;
--emerald-800: #166534;
--emerald-900: #14532d;
--emerald-950: #052e16;

/* Forest Green - Base escura */
--forest-900: #021a0f;
--forest-800: #042f1c;
--forest-700: #064328;
--forest-600: #085d35;
--forest-500: #0a7742;
```

### Semantic Colors

```css
/* Background - Surface Elevation */
--bg-base: linear-gradient(135deg, #021a0f 0%, #042f1c 25%, #064328 50%, #021a0f 100%);
--bg-surface-0: rgba(6, 67, 40, 0.15);
--bg-surface-1: rgba(6, 67, 40, 0.25);
--bg-surface-2: rgba(6, 67, 40, 0.35);
--bg-surface-3: rgba(6, 67, 40, 0.45);
--bg-overlay: rgba(2, 26, 15, 0.95);

/* Foreground - Text Hierarchy */
--fg-primary: #f0fdf4;
--fg-secondary: #dcfce7;
--fg-tertiary: #bbf7d0;
--fg-muted: #86efac;
--fg-disabled: rgba(240, 253, 244, 0.4);

/* Border - Separation Hierarchy */
--border-subtle: rgba(52, 211, 153, 0.08);
--border-default: rgba(52, 211, 153, 0.15);
--border-strong: rgba(52, 211, 153, 0.25);
--border-stronger: rgba(52, 211, 153, 0.4);

/* Brand - Primary Accent */
--brand-primary: #34d399;
--brand-primary-hover: #10b981;
--brand-primary-active: #059669;
--brand-secondary: #6ee7b7;

/* Semantic - Status Colors */
--success: #22c55e;
--success-bg: rgba(34, 197, 94, 0.1);
--warning: #fbbf24;
--warning-bg: rgba(251, 191, 36, 0.1);
--error: #ef4444;
--error-bg: rgba(239, 68, 68, 0.1);
--info: #3b82f6;
--info-bg: rgba(59, 130, 246, 0.1);
```

### Spacing

```css
--space-base: 4px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Typography

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Border Radius

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
--shadow-xl: 0 8px 16px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2);
--shadow-glow: 0 0 20px rgba(52, 211, 153, 0.2);
```

### Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Component Patterns

### Button Primary

```css
height: 40px;
padding: 0 20px;
border-radius: var(--radius-md);
background: var(--brand-primary);
color: var(--forest-900);
font-weight: var(--font-semibold);
font-size: var(--text-sm);
border: none;
transition: var(--transition-fast);

hover: background: var(--brand-primary-hover);
active: background: var(--brand-primary-active);
disabled: opacity: 0.5; cursor: not-allowed;
```

### Button Secondary

```css
height: 40px;
padding: 0 20px;
border-radius: var(--radius-md);
background: transparent;
color: var(--brand-primary);
font-weight: var(--font-semibold);
font-size: var(--text-sm);
border: 1.5px solid var(--brand-primary);
transition: var(--transition-fast);

hover: background: rgba(52, 211, 153, 0.1);
active: background: rgba(52, 211, 153, 0.15);
```

### Button Ghost

```css
height: 40px;
padding: 0 16px;
border-radius: var(--radius-md);
background: transparent;
color: var(--fg-secondary);
font-weight: var(--font-medium);
font-size: var(--text-sm);
border: none;
transition: var(--transition-fast);

hover: background: var(--bg-surface-1); color: var(--fg-primary);
active: background: var(--bg-surface-2);
```

### Card Default

```css
background: var(--bg-surface-1);
border: 1px solid var(--border-default);
border-radius: var(--radius-lg);
padding: var(--space-6);
box-shadow: var(--shadow-sm);
transition: var(--transition-base);

hover: border-color: var(--border-strong); box-shadow: var(--shadow-md);
```

### Card Elevated

```css
background: var(--bg-surface-2);
border: 1px solid var(--border-strong);
border-radius: var(--radius-lg);
padding: var(--space-6);
box-shadow: var(--shadow-md);
```

### Input Field

```css
height: 40px;
padding: 0 var(--space-4);
border-radius: var(--radius-md);
background: var(--bg-surface-1);
border: 1px solid var(--border-default);
color: var(--fg-primary);
font-size: var(--text-sm);
transition: var(--transition-fast);

focus: border-color: var(--brand-primary); box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
error: border-color: var(--error);
disabled: opacity: 0.5; cursor: not-allowed;
```

### Badge Status (Signature)

```css
display: inline-flex;
align-items: center;
gap: var(--space-2);
padding: var(--space-1) var(--space-3);
border-radius: var(--radius-full);
font-size: var(--text-xs);
font-weight: var(--font-semibold);
border: 1px solid;
background: linear-gradient(135deg, rgba(52, 211, 153, 0.1), rgba(16, 185, 129, 0.15));
border-color: var(--brand-primary);
color: var(--brand-primary);
box-shadow: 0 0 12px rgba(52, 211, 153, 0.15);

verified: border-color: var(--success); color: var(--success);
pending: border-color: var(--warning); color: var(--warning);
```

### Navigation Sidebar

```css
width: 260px;
background: var(--bg-surface-0);
border-right: 1px solid var(--border-subtle);
padding: var(--space-6);

nav-item:
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--fg-secondary);
  transition: var(--transition-fast);
  
  hover: background: var(--bg-surface-1); color: var(--fg-primary);
  active: background: var(--bg-surface-2); color: var(--brand-primary); border-left: 2px solid var(--brand-primary);
```

### Data Table

```css
background: var(--bg-surface-1);
border: 1px solid var(--border-default);
border-radius: var(--radius-lg);
overflow: hidden;

header:
  background: var(--bg-surface-2);
  padding: var(--space-4);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  color: var(--fg-secondary);
  border-bottom: 1px solid var(--border-default);

row:
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  transition: var(--transition-fast);
  
  hover: background: var(--bg-surface-2);
  last: border-bottom: none;
```

---

## Usage Guidelines

### When to Use Each Surface Level

- **surface-0:** Sidebar, secondary panels
- **surface-1:** Main cards, form containers
- **surface-2:** Elevated cards, dropdowns, popovers
- **surface-3:** Modals, highest elevation overlays

### Typography Hierarchy

- **Headings:** Use semibold/bold weights with tight line-height
- **Body:** Use normal weight with relaxed line-height
- **Labels:** Use medium weight, smaller size
- **Data/Numbers:** Use monospace font with tabular-nums

### Color Usage

- **Green (Brand):** Primary actions, links, success states
- **Amber:** Warnings, pending states
- **Red:** Errors, destructive actions
- **Blue:** Information, neutral highlights

### Spacing Consistency

- Use multiples of 4px for all spacing
- Cards: 24px padding
- Buttons: 20px horizontal padding
- Inputs: 16px horizontal padding
- Sections: 32-48px gaps

---

## Anti-Patterns to Avoid

❌ **Don't:**

- Use pure white (#fff) - breaks the dark theme
- Mix different border styles (solid, dashed, dotted)
- Use dramatic shadows - keep them subtle
- Create inconsistent spacing (random px values)
- Use multiple accent colors - stick to green
- Add decorative gradients without purpose

✅ **Do:**

- Use subtle surface elevation changes
- Keep borders light and consistent
- Apply shadows sparingly for depth
- Follow the 4px spacing scale
- Use green for all primary actions
- Add gradients only for signature elements

---

## Implementation Notes

1. **CSS Variables:** All tokens should be defined as CSS custom properties in `:root`
2. **Dark Mode:** This system is dark-mode first; light mode would require inverted values
3. **Accessibility:** Maintain WCAG AA contrast ratios (4.5:1 for text)
4. **Performance:** Use `will-change` sparingly, prefer `transform` for animations
5. **Consistency:** Every component should reference tokens, never hardcoded values

# 🌿 Marketplace de Serviços - Design System

Sistema profissional de design implementado com base nos princípios do [interface-design skill](https://github.com/Dammyjay93/interface-design).

## 🎨 Identidade Visual

**Paleta Verde Esmeralda** - Transmitindo confiança, crescimento e profissionalismo.

### Cores Principais

- **Verde Esmeralda**: `#34d399` - Ações primárias, links, destaques
- **Verde Floresta**: `#021a0f` - Background base
- **Verde Claro**: `#f0fdf4` - Texto primário

## 📚 Documentação

### Guias Principais

- **[DESIGN_SYSTEM_COMPLETO.md](DESIGN_SYSTEM_COMPLETO.md)** - Documentação completa
- **[DESIGN_SYSTEM_GUIDE.md](DESIGN_SYSTEM_GUIDE.md)** - Guia de uso rápido
- **[MELHORIAS_IMPLEMENTADAS.md](MELHORIAS_IMPLEMENTADAS.md)** - Resumo das melhorias
- **[.interface-design/system.md](.interface-design/system.md)** - Sistema de design detalhado

## 🚀 Início Rápido

### Instalação

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

### Usando Componentes

#### Classes CSS Prontas

```tsx
<button className="btn btn-primary">Criar Serviço</button>
<div className="card">Conteúdo</div>
<span className="badge badge-verified">✓ Verificado</span>
```

#### Tokens CSS

```tsx
<div style={{
  background: 'var(--bg-surface-1)',
  padding: 'var(--space-6)',
  borderRadius: 'var(--radius-lg)',
}}>
  Conteúdo
</div>
```

## 🧩 Componentes Disponíveis

### Botões

- `btn btn-primary` - Ação primária
- `btn btn-secondary` - Ação secundária
- `btn btn-ghost` - Ação terciária
- `btn btn-danger` - Ação destrutiva

### Cards

- `card` - Card padrão
- `card card-elevated` - Card com mais destaque
- `card card-interactive` - Card clicável

### Badges (Elemento Assinatura)

- `badge badge-verified` - Status verificado (com glow)
- `badge badge-pending` - Status pendente
- `badge badge-error` - Status de erro
- `badge badge-info` - Informação

### Inputs

- `input` - Campo de texto
- `input textarea` - Área de texto
- `input input-error` - Campo com erro

### Navegação

- `nav-item` - Item de navegação
- `nav-item active` - Item ativo

### Outros

- `table-container` + `table` - Tabelas
- `modal-overlay` + `modal-content` - Modais
- `alert alert-{type}` - Alertas
- `spinner` - Loading spinner
- `skeleton` - Loading skeleton

## 🎯 Tokens CSS

### Cores

```css
/* Superfícies */
--bg-surface-0 até --bg-surface-3

/* Texto */
--fg-primary, --fg-secondary, --fg-tertiary, --fg-muted

/* Bordas */
--border-subtle, --border-default, --border-strong, --border-stronger

/* Brand */
--brand-primary, --brand-primary-hover, --brand-primary-active

/* Semânticas */
--success, --warning, --error, --info
```

### Espaçamento

```css
--space-1 (4px) até --space-16 (64px)
```

### Tipografia

```css
/* Tamanhos */
--text-xs (12px) até --text-4xl (36px)

/* Pesos */
--font-normal (400) até --font-bold (700)
```

### Border Radius

```css
--radius-sm (4px) até --radius-full (9999px)
```

### Sombras

```css
--shadow-sm até --shadow-xl
--shadow-glow (efeito especial)
```

### Transições

```css
--transition-fast (150ms)
--transition-base (200ms)
--transition-slow (300ms)
```

## 📁 Estrutura do Projeto

```
projto-serviço/
├── .interface-design/
│   └── system.md                    # Sistema de design
├── frontend/
│   └── src/
│       ├── index.css                # Tokens CSS
│       ├── components.css           # Biblioteca de componentes
│       ├── components/
│       │   ├── ServiceCard.tsx/.css # Componente refatorado
│       │   ├── Header.tsx/.css      # Componente refatorado
│       │   └── DashboardStats.tsx/.css # Componente refatorado
│       └── main.tsx                 # Entry point
├── backend/
│   └── src/
│       └── ...
├── DESIGN_SYSTEM_COMPLETO.md        # Documentação completa
├── DESIGN_SYSTEM_GUIDE.md           # Guia rápido
└── MELHORIAS_IMPLEMENTADAS.md       # Resumo das melhorias
```

## ✨ Componentes Refatorados

### ServiceCard

- ✅ Design system tokens
- ✅ Hierarquia visual clara
- ✅ Badge de destaque com glow
- ✅ Hover states profissionais
- ✅ Acessibilidade completa
- ✅ Responsivo

### Header

- ✅ Sticky com backdrop blur
- ✅ Navegação com ícones
- ✅ Indicador de página ativa
- ✅ Perfil com nome do usuário
- ✅ Mobile-optimized

### DashboardStats

- ✅ Grid responsivo
- ✅ Cards com ícones estilizados
- ✅ Hover effects sutis
- ✅ Indicadores de tendência
- ✅ Loading states

## 🎨 Princípios de Design

### 1. Subtle Layering

Superfícies com diferenças **quase imperceptíveis** mas distinguíveis.

### 2. Systematic Consistency

Todos os valores derivam de tokens CSS - sem valores "mágicos".

### 3. Professional Craft

Transições suaves, micro-interações polidas, estados bem definidos.

### 4. Accessibility First

Contraste WCAG AA, navegação por teclado, ARIA labels.

## 📱 Responsividade

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

Todos os componentes são **mobile-first**.

## ♿ Acessibilidade

- ✅ Contraste WCAG AA (4.5:1)
- ✅ Focus visible
- ✅ Navegação por teclado
- ✅ ARIA labels
- ✅ Semantic HTML

## 🛠️ Tecnologias

### Frontend

- React + TypeScript
- Vite
- CSS Variables (Design Tokens)

### Backend

- Node.js + TypeScript
- Express
- Supabase (PostgreSQL)

## 📖 Como Contribuir

### Adicionando Novos Componentes

1. **Use os tokens CSS**

```css
.meu-componente {
  background: var(--bg-surface-1);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
}
```

1. **Siga a hierarquia**

- Superfícies: surface-0 → surface-3
- Texto: primary → secondary → tertiary → muted
- Bordas: subtle → default → strong → stronger

1. **Documente**

- Adicione ao `system.md`
- Crie exemplos
- Explique quando usar

### Boas Práticas

✓ **FAÇA**

- Use tokens CSS
- Espaçamento em múltiplos de 4px
- Transições suaves
- Teste acessibilidade
- Documente padrões

✗ **NÃO FAÇA**

- Hardcode cores
- Valores aleatórios
- Sombras dramáticas
- Ignorar estados
- Pular documentação

## 🎓 Recursos

### Documentação

- [Design System Completo](DESIGN_SYSTEM_COMPLETO.md)
- [Guia de Uso](DESIGN_SYSTEM_GUIDE.md)
- [Sistema de Design](.interface-design/system.md)

### Referências

- [Interface Design Skill](https://github.com/Dammyjay93/interface-design)
- [Interface Design Website](https://interface-design.dev)
- [Exemplos](https://interface-design.dev/examples.html)

## 📝 Licença

MIT

---

**Desenvolvido com base nos princípios do [interface-design skill](https://github.com/Dammyjay93/interface-design)** 🌿

**Mantendo a essência verde esmeralda!** ✨

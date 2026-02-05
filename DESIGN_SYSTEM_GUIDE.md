# Guia de Uso - Design System

## 🎨 Visão Geral

Este design system foi criado com base nos princípios do **interface-design skill**, mantendo a identidade visual verde esmeralda do marketplace de serviços, mas com uma abordagem profissional e sistemática.

## 📁 Arquivos do Sistema

- **`.interface-design/system.md`** - Documentação completa do sistema de design
- **`frontend/src/index.css`** - Tokens CSS (cores, espaçamento, tipografia, etc.)
- **`frontend/src/components.css`** - Componentes reutilizáveis

## 🎯 Princípios Fundamentais

### 1. **Hierarquia de Superfícies Sutil**

As superfícies devem ser **levemente diferentes** mas distinguíveis:

- `--bg-surface-0` - Sidebar, painéis secundários
- `--bg-surface-1` - Cards principais, containers de formulários
- `--bg-surface-2` - Cards elevados, dropdowns, popovers
- `--bg-surface-3` - Modais, overlays de máxima elevação

### 2. **Bordas Leves mas Visíveis**

Use bordas sutis que desaparecem quando você não está procurando, mas são encontráveis quando necessário:

- `--border-subtle` - Separação mais leve
- `--border-default` - Bordas padrão
- `--border-strong` - Ênfase, estados hover
- `--border-stronger` - Máxima ênfase, focus rings

### 3. **Hierarquia de Texto**

Use todos os 4 níveis consistentemente:

- `--fg-primary` - Texto padrão, maior contraste
- `--fg-secondary` - Texto de suporte, levemente atenuado
- `--fg-tertiary` - Metadados, timestamps, menos importante
- `--fg-muted` - Desabilitado, placeholder, menor contraste

### 4. **Espaçamento Consistente**

Use apenas múltiplos de 4px:

- `--space-1` (4px) - Micro espaçamento
- `--space-2` (8px) - Pequeno
- `--space-3` (12px) - Médio-pequeno
- `--space-4` (16px) - Médio
- `--space-6` (24px) - Grande
- `--space-8` (32px) - Muito grande

## 🧩 Componentes Prontos

### Botões

```html
<!-- Botão Primário -->
<button class="btn btn-primary">Criar Serviço</button>

<!-- Botão Secundário -->
<button class="btn btn-secondary">Cancelar</button>

<!-- Botão Ghost -->
<button class="btn btn-ghost">Ver Mais</button>

<!-- Botão Danger -->
<button class="btn btn-danger">Excluir</button>

<!-- Tamanhos -->
<button class="btn btn-primary btn-sm">Pequeno</button>
<button class="btn btn-primary btn-lg">Grande</button>
```

### Cards

```html
<!-- Card Padrão -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Título do Card</h3>
  </div>
  <p class="card-description">Descrição do conteúdo...</p>
  <div class="card-footer">
    <button class="btn btn-primary">Ação</button>
  </div>
</div>

<!-- Card Elevado -->
<div class="card card-elevated">
  Conteúdo com mais destaque
</div>

<!-- Card Interativo -->
<div class="card card-interactive">
  Clique aqui
</div>
```

### Inputs

```html
<!-- Input Padrão -->
<div class="input-group">
  <label class="input-label">Nome</label>
  <input type="text" class="input" placeholder="Digite seu nome">
  <span class="input-hint">Dica opcional</span>
</div>

<!-- Input com Erro -->
<div class="input-group">
  <label class="input-label">Email</label>
  <input type="email" class="input input-error" value="email-invalido">
  <span class="input-error-message">Email inválido</span>
</div>

<!-- Textarea -->
<textarea class="input textarea" placeholder="Descrição..."></textarea>
```

### Badges (Elemento Assinatura)

```html
<!-- Badge Verificado (com glow effect) -->
<span class="badge badge-verified">✓ Verificado</span>

<!-- Badge Pendente -->
<span class="badge badge-pending">⏳ Pendente</span>

<!-- Badge Erro -->
<span class="badge badge-error">✗ Rejeitado</span>

<!-- Badge Info -->
<span class="badge badge-info">ℹ Novo</span>

<!-- Badge Padrão -->
<span class="badge badge-default">Tag</span>
```

### Navegação

```html
<nav>
  <a href="#" class="nav-item active">
    <span>Dashboard</span>
  </a>
  <a href="#" class="nav-item">
    <span>Serviços</span>
  </a>
  <a href="#" class="nav-item">
    <span>Propostas</span>
  </a>
</nav>
```

### Tabelas

```html
<div class="table-container">
  <table class="table">
    <thead>
      <tr>
        <th>Nome</th>
        <th>Status</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Serviço 1</td>
        <td><span class="badge badge-verified">Ativo</span></td>
        <td><button class="btn btn-ghost btn-sm">Editar</button></td>
      </tr>
    </tbody>
  </table>
</div>
```

### Modais

```html
<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-title">Confirmar Ação</h2>
    </div>
    <div class="modal-body">
      <p>Tem certeza que deseja continuar?</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancelar</button>
      <button class="btn btn-primary">Confirmar</button>
    </div>
  </div>
</div>
```

### Alerts

```html
<div class="alert alert-success">✓ Operação realizada com sucesso!</div>
<div class="alert alert-warning">⚠ Atenção: verifique os dados</div>
<div class="alert alert-error">✗ Erro ao processar requisição</div>
<div class="alert alert-info">ℹ Informação importante</div>
```

### Loading States

```html
<!-- Spinner -->
<div class="spinner"></div>

<!-- Skeleton -->
<div class="skeleton" style="height: 100px; width: 100%;"></div>
```

## 🎨 Usando Tokens CSS

### Em componentes React/TypeScript

```tsx
// Exemplo de componente usando tokens
const ServiceCard = () => {
  return (
    <div style={{
      background: 'var(--bg-surface-1)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
    }}>
      <h3 style={{ 
        color: 'var(--fg-primary)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-semibold)',
      }}>
        Título do Serviço
      </h3>
      <p style={{ 
        color: 'var(--fg-secondary)',
        fontSize: 'var(--text-sm)',
        marginTop: 'var(--space-2)',
      }}>
        Descrição do serviço...
      </p>
    </div>
  );
};
```

### Em arquivos CSS

```css
/* Use os tokens em vez de valores fixos */
.custom-component {
  background: var(--bg-surface-1);
  color: var(--fg-primary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  transition: all var(--transition-fast);
}

.custom-component:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}
```

## ✅ Boas Práticas

### ✓ FAÇA

- Use tokens CSS para todas as cores, espaçamentos e tamanhos
- Mantenha bordas sutis (0.08-0.25 opacity)
- Use hierarquia de superfícies consistente
- Aplique transições suaves (150-200ms)
- Use verde para todas as ações primárias
- Mantenha espaçamento em múltiplos de 4px

### ✗ NÃO FAÇA

- Usar cores hardcoded (#fff, #000, etc.)
- Misturar diferentes estilos de borda
- Criar sombras dramáticas
- Usar valores de espaçamento aleatórios
- Adicionar múltiplas cores de destaque
- Usar gradientes decorativos sem propósito

## 🎯 Elemento Assinatura

O **Badge de Status** é o elemento assinatura deste design system:

```html
<span class="badge badge-verified">✓ Verificado</span>
```

Características:

- Gradiente sutil de fundo
- Borda luminosa
- Efeito glow suave
- Indica confiabilidade e validação

Use este badge para destacar prestadores de serviço verificados, status importantes e informações de confiança.

## 📱 Responsividade

Todos os componentes são responsivos por padrão. Use media queries quando necessário:

```css
@media (max-width: 768px) {
  .card {
    padding: var(--space-4);
  }
}
```

## 🔄 Atualizações Futuras

Para manter a consistência:

1. **Novos componentes** devem seguir os padrões estabelecidos
2. **Novas cores** devem ser adicionadas aos tokens em `index.css`
3. **Novos padrões** devem ser documentados em `system.md`
4. **Sempre use os tokens** - nunca valores hardcoded

## 📚 Recursos

- **Documentação completa**: `.interface-design/system.md`
- **Repositório interface-design**: `interface-design/` (clonado localmente)
- **Exemplos**: Veja os componentes existentes do projeto

---

**Desenvolvido com base nos princípios do [interface-design skill](https://github.com/Dammyjay93/interface-design)**

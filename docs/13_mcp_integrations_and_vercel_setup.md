# 13. Guia de Integrações MCP & Setup do Vercel MCP Server

Este documento consolida a arquitetura e os procedimentos operacionais para a conexão de servidores MCP (Model Context Protocol) no ecossistema LattesChain / EduCore Protocol, com foco na orquestração DataSecAIOps via **Vercel MCP**.

---

## 1. Visão Geral do Vercel MCP

O **Vercel MCP Server** (`https://mcp.vercel.com`) é o servidor oficial da Vercel compatível com as especificações de [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http) e [MCP Authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization).

### Capacidades Habilitadas
- **Navegação e Busca na Documentação Oficial**: Consulta em tempo real de boas práticas e APIs de Next.js, Vercel AI SDK e Fluid Compute.
- **Gerenciamento de Deployments**: Consulta de status de build, histórico de commits e triggers de preview/production.
- **Análise de Logs em Runtime**: Inspeção detalhada de logs de Serverless e Edge Functions para diagnóstico ágil de erros 5xx/4xx.
- **Web Analytics**: Métricas de tráfego, Core Web Vitals (LCP, FID, CLS) e eventos customizados.

---

## 2. Configuração no Ambiente Antigravity / Gemini

A infraestrutura do assistente técnico utiliza dois pontos de configuração para servidores MCP globais:

### 2.1 Configuração Nativa Antigravity (`~/.gemini/config/mcp_config.json`)
```json
{
  "mcpServers": {
    "vercel": {
      "serverUrl": "https://mcp.vercel.com"
    }
  }
}
```

### 2.2 Configuração Gemini CLI / Code Assist (`~/.gemini/settings.json`)
```json
{
  "mcpServers": {
    "vercel": {
      "type": "http",
      "url": "https://mcp.vercel.com"
    }
  }
}
```

---

## 3. Instalação e Sincronização via CLI

Para sincronizar ou atualizar a integração do servidor MCP da Vercel entre todos os clientes suportados:

```bash
# Instalação automatizada para Antigravity e Gemini CLI
npx -y add-mcp https://mcp.vercel.com -g -y -a antigravity -a gemini-cli
```

### Autenticação OAuth
- Ferramentas públicas (como busca de documentação) funcionam sem autenticação.
- Ferramentas autenticadas (projetos, deployments e analytics) disparam o fluxo OAuth no navegador na primeira execução protegida, solicitando consentimento para vincular o escopo da organização/time Vercel.

---

## 4. Matriz de Servidores MCP do Ecossistema

| Servidor | Endpoint / Comando | Escopo |
| :--- | :--- | :--- |
| **Vercel** | `https://mcp.vercel.com` | Deploys, logs, Core Web Vitals e documentação |
| **Supabase** | `https://mcp.supabase.com/mcp` | PostgreSQL, RLS, Storage, Edge Functions e Migrations |
| **Context7** | `https://mcp.context7.com/mcp` | Resolução contextual de bibliotecas e SDKs |
| **Chrome DevTools**| `npx chrome-devtools-mcp` | Automação e inspeção de UI / E2E |
| **Notion** | `npx @notionhq/notion-mcp-server` | Base de conhecimento e documentação de produto |

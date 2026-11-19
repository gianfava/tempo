# ⛈️ Tempo Franca-SP · Monitoramento & Alertas de Tempestade

Página minimalista *single-page* com **estética clara (Light Mode), sofisticada e autêntica**, focada nos **alertas oficiais de tempestade do INMET** para a cidade de **Franca - SP** (Código IBGE: `3516200`).

---

## 🎨 Princípios de Design & Estética (Anti-IA)

1. **Superfícies & Vidro Claro (Frosted Glass):**
   - Fundo suave off-white (`#F8FAFC` a `#F5F5F7`) com formas orgânicas pastéis em desfoque ambiental difuso (`filter: blur(90px)`).
   - Cartões e menus em vidro fosco translúcido (`background: rgba(255, 255, 255, 0.72)` com `backdrop-filter: blur(20px)`), borda nítida de 1px e sombras difusas em tons de cinza frio (`0 8px 30px rgba(0, 0, 0, 0.04)`).
2. **Tipografia & Contraste:**
   - Tipografia contemporânea com as famílias **Plus Jakarta Sans** e **Inter**.
   - Títulos em preto carvão (`#111827`) com espaçamento sutilmente negativo (`tracking-tight`).
   - Textos secundários em cinza ardósia (`#4B5563`).
   - Botão de ação principal em carvão acetinado sóbrio (`#111827`).
3. **Movimento Fluido & Dinâmico (Spring Physics):**
   - Interações com curvas de física de mola (`cubic-bezier(0.16, 1, 0.3, 1)` e `cubic-bezier(0.34, 1.4, 0.64, 1)`).
   - Efeito hover sutil nos cartões (`transform: translateY(-2px)` e elevação de sombra).
   - Animação de entrada escalonada (*staggered entry*) no carregamento da página.
   - Respeito completo às preferências de acessibilidade (`prefers-reduced-motion`).

---

## 📡 APIs Utilizadas

- **RadarMeteorológico (API Pública de Alertas):** `https://radarmeteorologico.com.br/api/v1/alertas?uf=SP`
  - Filtro automático para o código IBGE de Franca (**`3516200`**).
  - Severidade oficial do INMET (Nível 1 - Perigo Potencial, Nível 2 - Perigo, Nível 3 - Grande Perigo).
  - Riscos detalhados (rajadas de vento, granizo, corte de energia, alagamentos).
  - Instruções de segurança da Defesa Civil (199) e Bombeiros (193).
- **Open-Meteo Weather Forecast:** `https://api.open-meteo.com/v1/forecast`
  - Coordenadas de Franca: Lat `-20.5352`, Lon `-47.4039`.
  - Dados em tempo real: temperatura atual, sensação térmica, umidade, vento e precipitação.
  - Previsão horária para 24h e semanal para 7 dias.

---

## 🚀 Como Visualizar

A aplicação é puramente estática e não necessita de build:

```powershell
# Abrir diretamente no navegador:
Start-Process "d:\tempo\index.html"
```

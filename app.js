/**
 * Franca-SP · Clima & Alertas de Tempestade
 * Estética Clara, Sofisticada & Autêntica
 * Powered by RadarMeteorológico Public API & Open-Meteo
 */

// Configuração e Constantes
const CONFIG = {
  CITY: {
    name: 'Franca',
    uf: 'SP',
    ibge: 3516200,
    lat: -20.5352,
    lon: -47.4039,
    url: 'https://radarmeteorologico.com.br/previsao/sp/franca'
  },
  APIS: {
    alertas: 'https://radarmeteorologico.com.br/api/v1/alertas?uf=SP',
    cidades: 'https://radarmeteorologico.com.br/api/v1/cidades?ibge=3516200',
    weather: 'https://api.open-meteo.com/v1/forecast'
  },
  REFRESH_INTERVAL_MS: 5 * 60 * 1000 // 5 minutos (respeitando cache de 10 min)
};

// Mapeamento WMO de Condições Meteorológicas
const WMO_MAP = {
  0: { label: 'Céu limpo', icon: 'sun', storm: false },
  1: { label: 'Predomínio de sol', icon: 'sun-cloud', storm: false },
  2: { label: 'Parcialmente nublado', icon: 'sun-cloud', storm: false },
  3: { label: 'Nublado / Encoberto', icon: 'cloud', storm: false },
  45: { label: 'Nevoeiro', icon: 'fog', storm: false },
  48: { label: 'Nevoeiro com geada', icon: 'fog', storm: false },
  51: { label: 'Chuvisco leve', icon: 'drizzle', storm: false },
  53: { label: 'Chuvisco moderado', icon: 'drizzle', storm: false },
  55: { label: 'Chuvisco denso', icon: 'drizzle', storm: false },
  61: { label: 'Chuva fraca', icon: 'rain', storm: false },
  63: { label: 'Chuva moderada', icon: 'rain', storm: false },
  65: { label: 'Chuva forte', icon: 'heavy-rain', storm: false },
  71: { label: 'Neve fraca', icon: 'snow', storm: false },
  73: { label: 'Neve moderada', icon: 'snow', storm: false },
  75: { label: 'Neve intensa', icon: 'snow', storm: false },
  80: { label: 'Pancadas de chuva leves', icon: 'showers', storm: false },
  81: { label: 'Pancadas de chuva moderadas', icon: 'showers', storm: false },
  82: { label: 'Pancadas de chuva fortes', icon: 'heavy-rain', storm: true },
  95: { label: 'Tempestade com trovoadas', icon: 'thunderstorm', storm: true },
  96: { label: 'Tempestade com granizo', icon: 'thunderstorm-hail', storm: true },
  99: { label: 'Tempestade severa com granizo', icon: 'thunderstorm-hail', storm: true }
};

// Direção do Vento (Rosa dos Ventos)
function getWindDirection(deg) {
  if (deg === undefined || deg === null) return '';
  const directions = ['N', 'NNE', 'NE', 'LNE', 'L', 'LSE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

// Ícones Vetoriais SVG Estilizados e Nítidos (Anti-IA)
function getWeatherSvg(iconType, isNight = false) {
  switch (iconType) {
    case 'sun':
      if (isNight) {
        return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M44 36A16 16 0 0 1 28 16a1.5 1.5 0 0 0-2-1.6 18 18 0 1 0 19.6 23.6A1.5 1.5 0 0 0 44 36z" fill="#FBBF24"/>
        </svg>`;
      }
      return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="13" fill="#F59E0B"/>
        <g stroke="#F59E0B" stroke-width="3" stroke-linecap="round">
          <line x1="32" y1="9" x2="32" y2="4"/>
          <line x1="32" y1="55" x2="32" y2="60"/>
          <line x1="9" y1="32" x2="4" y2="32"/>
          <line x1="55" y1="32" x2="60" y2="32"/>
          <line x1="16" y1="16" x2="12" y2="12"/>
          <line x1="48" y1="48" x2="52" y2="52"/>
          <line x1="16" y1="48" x2="12" y2="52"/>
          <line x1="48" y1="16" x2="52" y2="12"/>
        </g>
      </svg>`;

    case 'sun-cloud':
      return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <g>
          <circle cx="26" cy="24" r="10" fill="#F59E0B"/>
          <g stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round">
            <line x1="26" y1="9" x2="26" y2="5"/>
            <line x1="12" y1="24" x2="8" y2="24"/>
            <line x1="16" y1="14" x2="13" y2="11"/>
            <line x1="36" y1="14" x2="39" y2="11"/>
          </g>
        </g>
        <path d="M46 44H20a10 10 0 0 1-1.3-19.9A14 14 0 0 1 45 22a11 11 0 0 1 1 22z" fill="#94A3B8"/>
      </svg>`;

    case 'cloud':
    case 'fog':
      return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M46 42H18a10 10 0 0 1-1.3-19.9A14 14 0 0 1 43 18a11 11 0 0 1 3 24z" fill="#64748B"/>
        <path d="M50 46H22a8 8 0 0 1-1-15.9A12 12 0 0 1 48 28a9 9 0 0 1 2 18z" fill="#94A3B8" opacity="0.85"/>
      </svg>`;

    case 'drizzle':
    case 'rain':
    case 'showers':
      return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M46 36H18a9 9 0 0 1-1.2-17.9A13 13 0 0 1 42 14a10 10 0 0 1 4 22z" fill="#64748B"/>
        <g stroke="#0284C7" stroke-width="3" stroke-linecap="round">
          <line x1="22" y1="42" x2="18" y2="52"/>
          <line x1="32" y1="42" x2="28" y2="52"/>
          <line x1="42" y1="42" x2="38" y2="52"/>
        </g>
      </svg>`;

    case 'heavy-rain':
      return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M46 34H18a9 9 0 0 1-1.2-17.9A13 13 0 0 1 42 12a10 10 0 0 1 4 22z" fill="#475569"/>
        <g stroke="#0369A1" stroke-width="3.5" stroke-linecap="round">
          <line x1="20" y1="40" x2="15" y2="54"/>
          <line x1="30" y1="40" x2="25" y2="54"/>
          <line x1="40" y1="40" x2="35" y2="54"/>
          <line x1="48" y1="40" x2="43" y2="54"/>
        </g>
      </svg>`;

    case 'thunderstorm':
    case 'thunderstorm-hail':
      return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M46 32H18a9 9 0 0 1-1.2-17.9A13 13 0 0 1 42 10a10 10 0 0 1 4 22z" fill="#334155"/>
        <polygon points="31,32 23,45 30,45 26,58 40,43 33,43 36,32" fill="#F59E0B" stroke="#D97706" stroke-width="1"/>
        <g stroke="#0284C7" stroke-width="2.5" stroke-linecap="round">
          <line x1="16" y1="42" x2="13" y2="50"/>
          <line x1="47" y1="42" x2="44" y2="50"/>
        </g>
      </svg>`;

    default:
      return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="13" fill="#F59E0B"/>
      </svg>`;
  }
}

// Estado da Aplicação
const state = {
  alerts: [],
  francaAlerts: [],
  selectedAlertIndex: 0,
  weather: null,
  lastUpdated: null,
  isRefreshing: false
};

// Referências DOM
const DOM = {
  refreshBtn: document.getElementById('refresh-btn'),
  refreshIcon: document.getElementById('refresh-icon'),
  lastUpdateLabel: document.getElementById('last-update-label'),
  alertContainer: document.getElementById('storm-alert-container'),
  alertsNavTabs: document.getElementById('alerts-nav-tabs'),
  currentWeatherCard: document.getElementById('current-weather-content'),
  hourlyTimeline: document.getElementById('hourly-timeline'),
  dailyList: document.getElementById('daily-list')
};

// Formatação amigável de datas em PT-BR
function formatDateBR(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateString;

  const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const dayOfWeek = weekdays[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${dayOfWeek}, ${day}/${month} às ${hours}:${minutes}`;
}

// Consulta de Alertas da API Pública do RadarMeteorológico
async function fetchAlerts() {
  try {
    const res = await fetch(CONFIG.APIS.alertas, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data.alertas || [];
  } catch (err) {
    console.warn('Erro ao consultar alertas do RadarMeteorológico:', err);
    return [];
  }
}

// Consulta Clima Open-Meteo para Franca (-20.5352, -47.4039)
async function fetchWeather() {
  const params = new URLSearchParams({
    latitude: CONFIG.CITY.lat,
    longitude: CONFIG.CITY.lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'America/Sao_Paulo',
    forecast_days: 7
  });

  const res = await fetch(`${CONFIG.APIS.weather}?${params.toString()}`);
  if (!res.ok) throw new Error(`Weather fetch status ${res.status}`);
  return await res.json();
}

// Carga e Atualização Geral dos Dados
async function loadData() {
  if (state.isRefreshing) return;
  state.isRefreshing = true;

  if (DOM.refreshIcon) DOM.refreshIcon.classList.add('spin-anim');

  try {
    const [alertsList, weatherData] = await Promise.all([
      fetchAlerts(),
      fetchWeather()
    ]);

    state.alerts = alertsList;
    // Filtragem específica para Franca - SP (IBGE: 3516200)
    state.francaAlerts = alertsList.filter(a => {
      if (!Array.isArray(a.geocodes)) return false;
      return a.geocodes.includes(CONFIG.CITY.ibge) || a.geocodes.includes(String(CONFIG.CITY.ibge));
    });

    state.weather = weatherData;
    state.lastUpdated = new Date();

    // Renderização protegida por módulo
    try { renderStormAlerts(); } catch (e) { console.error('Erro ao renderizar alertas:', e); }
    try { renderCurrentWeather(); } catch (e) { console.error('Erro ao renderizar clima atual:', e); }
    try { renderHourlyForecast(); } catch (e) { console.error('Erro ao renderizar previsão horária:', e); }
    try { renderDailyForecast(); } catch (e) { console.error('Erro ao renderizar previsão diária:', e); }
    try { updateTimestamp(); } catch (e) { console.error('Erro ao atualizar horário:', e); }

  } catch (err) {
    console.error('Falha geral ao carregar dados:', err);
    renderErrorNotice(err);
  } finally {
    state.isRefreshing = false;
    if (DOM.refreshIcon) DOM.refreshIcon.classList.remove('spin-anim');
  }
}

// Renderização dos Alertas de Tempestade (Destaque Principal)
function renderStormAlerts() {
  const container = DOM.alertContainer;
  const tabsContainer = DOM.alertsNavTabs;
  if (!container) return;

  const alerts = state.francaAlerts;

  // Caso Franca não tenha nenhum alerta ativo no momento
  if (!alerts || alerts.length === 0) {
    if (tabsContainer) tabsContainer.innerHTML = '';
    container.innerHTML = `
      <article class="alert-card safe">
        <header class="alert-header">
          <div class="alert-title-group">
            <span class="pulse-indicator" aria-hidden="true"></span>
            <div class="alert-heading">
              <h2>Nenhum alerta meteorológico severo para Franca</h2>
              <p class="alert-subheading">Condições estáveis e monitoradas continuamente pelo INMET e Radar Meteorológico.</p>
            </div>
          </div>
          <div class="alert-badges">
            <span class="badge" style="background:#22c55e; color:#fff;">Normal</span>
          </div>
        </header>
        <div style="margin-top:0.9rem; font-size:0.84rem; color:var(--text-slate); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <span>Sem avisos críticos de tempestade ou ventos fortes em vigor para o município.</span>
          <a href="${CONFIG.CITY.url}" target="_blank" rel="noopener" class="alert-footer-link">Consultar no RadarMeteorológico →</a>
        </div>
      </article>
    `;
    return;
  }

  // Renderização das Abas para Múltiplos Alertas
  if (tabsContainer) {
    if (alerts.length > 1) {
      tabsContainer.innerHTML = alerts.map((a, idx) => {
        const activeClass = idx === state.selectedAlertIndex ? 'active' : '';
        const timingLabel = a.futuro ? 'Em breve' : 'Em vigor';
        return `
          <button class="tab-btn ${activeClass}" data-alert-index="${idx}" type="button">
            ${escapeHtml(a.evento)} (${timingLabel})
          </button>
        `;
      }).join('');

      tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-alert-index'), 10);
          state.selectedAlertIndex = idx;
          renderStormAlerts();
        });
      });
    } else {
      tabsContainer.innerHTML = '';
    }
  }

  // Alerta Selecionado
  const alert = alerts[state.selectedAlertIndex] || alerts[0];
  const level = alert.nivel || 1;
  const levelClass = `level-${Math.min(Math.max(level, 1), 3)}`;

  let badgeColorClass = 'badge-warning';
  if (level === 2) badgeColorClass = 'badge-danger';
  if (level === 3) badgeColorClass = 'badge-extreme';

  const statusPill = alert.futuro ? 'Entra em vigor em breve' : 'Em vigor agora';
  const validUntilText = formatDateBR(alert.fim);
  const validFromText = formatDateBR(alert.inicio);

  // Lista de Riscos Oficiais
  const riscosList = (alert.riscos && alert.riscos.length > 0)
    ? alert.riscos.map(r => `<li>${escapeHtml(r)}</li>`).join('')
    : '<li>Risco de chuva forte, rajadas de vento e descargas elétricas.</li>';

  // Instruções de Segurança
  const instructionsList = (alert.instrucoes && alert.instrucoes.length > 0)
    ? alert.instrucoes.map(i => `<li>${escapeHtml(i)}</li>`).join('')
    : '<li>Em caso de rajadas de vento, não se abrigue sob árvores. Contate Defesa Civil (199) ou Bombeiros (193).</li>';

  container.innerHTML = `
    <article class="alert-card ${levelClass}" aria-live="polite">
      <header class="alert-header">
        <div class="alert-title-group">
          <span class="pulse-indicator" aria-hidden="true"></span>
          <div class="alert-heading">
            <h2>Alerta Oficial: ${escapeHtml(alert.evento)} em Franca</h2>
            <p class="alert-subheading">Aviso meteorológico oficial do INMET reproduzido pelo RadarMeteorológico</p>
          </div>
        </div>
        <div class="alert-badges">
          <span class="badge ${badgeColorClass}">Nível ${level} · ${escapeHtml(alert.severidade)}</span>
          <span class="badge badge-time">${statusPill}</span>
        </div>
      </header>

      <div class="alert-details">
        <div class="alert-period-badge">
          ⏱️ Período de vigência: de ${validFromText} até <strong>${validUntilText}</strong>
        </div>

        <div class="detail-block">
          <h3>Riscos Previstos</h3>
          <ul>${riscosList}</ul>
        </div>

        <div class="detail-block instructions">
          <h3>Instruções de Segurança (Defesa Civil 199 / Bombeiros 193)</h3>
          <ul>${instructionsList}</ul>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-top:0.35rem;">
          <span style="font-size:0.78rem; color:var(--text-muted);">
            📍 Abrangência: Franca e outros ${alert.municipios_afetados || 'vários'} municípios.
          </span>
          <a href="${alert.url || CONFIG.CITY.url}" target="_blank" rel="noopener" class="alert-footer-link">
            Consultar aviso completo no RadarMeteorológico →
          </a>
        </div>
      </div>
    </article>
  `;
}

// Renderização do Clima Atual (Card Temático Dinâmico & Fluido)
function renderCurrentWeather() {
  const container = DOM.currentWeatherCard;
  if (!container || !state.weather?.current) return;

  const current = state.weather.current;
  const daily = state.weather.daily;
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const windSpeed = Math.round(current.wind_speed_10m);
  const windDir = getWindDirection(current.wind_direction_10m);
  const precipitation = current.precipitation || 0;

  const todayMax = daily?.temperature_2m_max?.[0] !== undefined ? Math.round(daily.temperature_2m_max[0]) : '--';
  const todayMin = daily?.temperature_2m_min?.[0] !== undefined ? Math.round(daily.temperature_2m_min[0]) : '--';
  const rainProb = daily?.precipitation_probability_max?.[0] !== undefined ? daily.precipitation_probability_max[0] : '--';

  const code = current.weather_code;
  const wmoInfo = WMO_MAP[code] || { label: 'Tempo variado', icon: 'sun-cloud', storm: false };
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 18;
  const weatherIconSvg = getWeatherSvg(wmoInfo.icon, isNight);

  // Determinação Dinâmica do Tema do Card conforme o Clima Atual
  const hasActiveStormAlert = state.francaAlerts && state.francaAlerts.some(a => !a.futuro);
  let themeClass = 'weather-theme-cloudy';
  let statusBadgeIcon = '⛅';
  let statusBadgeText = 'Céu com Nuvens';

  if (hasActiveStormAlert || code === 95 || code === 96 || code === 99 || code === 82) {
    themeClass = 'weather-theme-storm';
    statusBadgeIcon = '⚡';
    statusBadgeText = 'Alerta de Tempestade Ativo';
  } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81].includes(code)) {
    themeClass = 'weather-theme-rain';
    statusBadgeIcon = '💧';
    statusBadgeText = 'Precipitação Ativa';
  } else if (isNight) {
    themeClass = 'weather-theme-night';
    statusBadgeIcon = '🌙';
    statusBadgeText = 'Período Noturno';
  } else if (code === 0 || code === 1) {
    themeClass = 'weather-theme-sunny';
    statusBadgeIcon = '☀️';
    statusBadgeText = 'Céu Aberto e Ensolarado';
  }

  container.className = `current-weather-card ${themeClass}`;

  container.innerHTML = `
    <!-- Halo Atmosférico Fluido de Luz Ambiente -->
    <div class="weather-ambient-halo" aria-hidden="true"></div>

    <!-- Linha de Contexto Superior -->
    <div class="card-context-row">
      <span class="weather-status-chip">
        <span aria-hidden="true">${statusBadgeIcon}</span>
        <span>${statusBadgeText}</span>
      </span>
      <span class="rain-summary-text">
        <span aria-hidden="true">💧</span>
        <span>${rainProb}% de probabilidade de chuva hoje</span>
      </span>
    </div>

    <!-- Hero Central: Temperatura & Ícone Nítido -->
    <div class="hero-main-row">
      <div class="temp-and-condition">
        <div class="weather-hero-icon">${weatherIconSvg}</div>
        <div class="temp-display">
          <div class="current-temp">${temp}°</div>
          <div class="condition-title">${wmoInfo.label}</div>
          <div class="min-max-badge">Hoje: ${todayMax}° máx / ${todayMin}° mín · Sensação de ${feelsLike}°C</div>
        </div>
      </div>
    </div>

    <!-- Grid de Chips Táteis com Física de Mola -->
    <div class="weather-metrics-grid">
      <div class="metric-item">
        <span class="metric-label">Sensação</span>
        <span class="metric-value">${feelsLike}°C</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Umidade</span>
        <span class="metric-value">${humidity}%</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Vento</span>
        <span class="metric-value">${windDir} ${windSpeed} km/h</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">Chuva agora</span>
        <span class="metric-value">${precipitation} mm</span>
      </div>
    </div>
  `;
}

// Renderização da Previsão Horária (Próximas 24 horas)
function renderHourlyForecast() {
  const container = DOM.hourlyTimeline;
  if (!container || !state.weather?.hourly) return;

  const hourly = state.weather.hourly;
  const times = hourly.time || [];
  const temps = hourly.temperature_2m || [];
  const rainProbs = hourly.precipitation_probability || [];
  const codes = hourly.weather_code || [];

  const now = new Date();
  const currentHourISO = now.toISOString().slice(0, 13);

  let startIndex = times.findIndex(t => t.startsWith(currentHourISO));
  if (startIndex === -1) startIndex = 0;

  const next24 = times.slice(startIndex, startIndex + 24);

  container.innerHTML = next24.map((timeStr, offset) => {
    const idx = startIndex + offset;
    const date = new Date(timeStr);
    const hourLabel = String(date.getHours()).padStart(2, '0') + ':00';
    const temp = Math.round(temps[idx]);
    const rain = rainProbs[idx] ?? 0;
    const code = codes[idx] ?? 0;
    const info = WMO_MAP[code] || { label: 'Tempo variado', icon: 'sun-cloud', storm: false };
    const isNight = date.getHours() < 6 || date.getHours() >= 18;
    const iconSvg = getWeatherSvg(info.icon, isNight);

    const isStormRisk = info.storm || rain >= 60;
    const stormClass = isStormRisk ? 'storm-risk' : '';

    return `
      <div class="hourly-item ${stormClass}" title="${info.label} (${rain}% de probabilidade de chuva)">
        <span class="hour-time">${hourLabel}</span>
        <div class="hour-icon">${iconSvg}</div>
        <span class="hour-temp">${temp}°</span>
        <span class="hour-rain-pill">💧${rain}%</span>
        <div class="rain-bar-container">
          <div class="rain-bar-fill" style="width: ${rain}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Renderização da Previsão para os Próximos 7 Dias
function renderDailyForecast() {
  const container = DOM.dailyList;
  if (!container || !state.weather?.daily) return;

  const daily = state.weather.daily;
  const times = daily.time || [];
  const maxTemps = daily.temperature_2m_max || [];
  const minTemps = daily.temperature_2m_min || [];
  const rainProbs = daily.precipitation_probability_max || [];
  const codes = daily.weather_code || [];

  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  container.innerHTML = times.map((dateStr, idx) => {
    const d = new Date(dateStr + 'T12:00:00');
    let dayName = weekdays[d.getDay()];
    if (idx === 0) dayName = 'Hoje';
    else if (idx === 1) dayName = 'Amanhã';

    const dayMonth = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    const maxT = Math.round(maxTemps[idx]);
    const minT = Math.round(minTemps[idx]);
    const rain = rainProbs[idx] ?? 0;
    const code = codes[idx] ?? 0;
    const info = WMO_MAP[code] || { label: 'Variável', icon: 'sun-cloud', storm: false };
    const iconSvg = getWeatherSvg(info.icon, false);

    const stormIndicator = info.storm ? '⛈️ ' : '';

    return `
      <div class="daily-item">
        <div class="daily-day">
          <span class="day-name">${dayName}</span>
          <span class="day-date">${dayMonth}</span>
        </div>
        <div class="daily-icon">${iconSvg}</div>
        <div class="daily-desc">${stormIndicator}${info.label}</div>
        <div class="daily-rain">💧 ${rain}%</div>
        <div class="daily-temps">
          <span class="temp-max">${maxT}°</span>
          <span class="temp-min">${minT}°</span>
        </div>
      </div>
    `;
  }).join('');
}

// Atualização do Indicador de Horário
function updateTimestamp() {
  if (!DOM.lastUpdateLabel || !state.lastUpdated) return;
  const time = state.lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  DOM.lastUpdateLabel.textContent = `Atualizado às ${time}`;
}

// Aviso de Erro Amigável
function renderErrorNotice(err) {
  if (DOM.alertContainer) {
    DOM.alertContainer.innerHTML = `
      <article class="alert-card level-2">
        <header class="alert-header">
          <div class="alert-title-group">
            <span class="pulse-indicator" style="background:#ea580c"></span>
            <div class="alert-heading">
              <h2>Instabilidade na consulta meteorológica</h2>
              <p class="alert-subheading">${escapeHtml(err.message || 'Não foi possível carregar os dados em tempo real.')}</p>
            </div>
          </div>
          <div class="alert-badges">
            <button class="action-btn-primary" onclick="window.appReload()" type="button">Tentar novamente</button>
          </div>
        </header>
      </article>
    `;
  }
}

// Auxiliar para Escapar HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Inicialização da Aplicação
function init() {
  DOM.refreshBtn?.addEventListener('click', () => {
    loadData();
  });

  window.appReload = loadData;

  // Carga inicial
  loadData();

  // Atualização periódica automática
  setInterval(loadData, CONFIG.REFRESH_INTERVAL_MS);
}

// Inicializa no DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);

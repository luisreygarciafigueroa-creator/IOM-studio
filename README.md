# IOM Neural AutoFlow

**Emulación neuronal del marco formal IOM (Unidad Informativa) + plataforma de automatización y optimización de procesos mediante Machine Learning e inteligencia Gemini.**

[![Version](https://img.shields.io/badge/version-1.9.0-cyan)](https://github.com/luisreygarciafigueroa-creator/IOM-studio)
[![License](https://img.shields.io/badge/license-Private-blue)](https://github.com/luisreygarciafigueroa-creator/IOM-studio)
[![Stack](https://img.shields.io/badge/stack-React%2019%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Express-indigo)](https://github.com/luisreygarciafigueroa-creator/IOM-studio)

---

## Descripción

**IOM Neural AutoFlow** es una aplicación full-stack que emula el **Marco Formal de la Unidad Informativa (IOM v1.9.0)** mediante:

- Un motor de **Machine Learning** propio (arquitectura PI-HGAT-T + MLP) implementado en TypeScript puro.
- Un motor de **automatización de procesos** basado en las 5 perspectivas y 13 tríadas canónicas.
- Integración con **Google Gemini** para optimización inteligente y generación de pipelines.
- Una **Bóveda Ontológica** interactiva con los 78 nodos y reglas formales.

El sistema demuestra el **punto fijo estricto** formalizado en Lean 4:

```
S_rev(Ivo(E(V_t))) = V_t
```

y aplica las relaciones operativas `mirrorOf` y `creates` a la automatización real de procesos (DevOps, supply chain, finanzas, customer ops, etc.).

---

## Características principales

| Módulo | Descripción |
|--------|-------------|
| **Entrenador ML** | Entrena modelos (`pi_hgat_t`, MLP, ablations, negative control) sobre las 390 parejas canónicas. Soporta Leave-One-Triad-Out CV, métricas en tiempo real y matriz de confusión. |
| **Automatización de Procesos** | Simulador de pipelines con auto-triggers, compensación `mirrorOf`, creación `creates`, métricas de ciclo, cuellos de botella y self-healing. |
| **Gemini Studio** | Optimización de procesos y generación de pipelines nuevos a partir de lenguaje natural, usando el marco IOM como system prompt. |
| **Bóveda IOM** | Explorador de las 5 perspectivas, 13 tríadas, 78 nodos, reglas de creación, vectores Evol/Invol y operadores formales. |

### Conceptos IOM implementados

- **5 Perspectivas**: Individualidad (Ind), Dualidad (D), Totalidad (Tot), Evolución (Evol), Involución (Invol)
- **13 Tríadas × 2 fases** (avance / retroceso) × 3 posiciones → **78 nodos**
- Relaciones canónicas: `none`, `mirrorOf`, `creates`
- Operadores formales: `E`, `Ivo`, `S_fwd`, `S_rev`, vacío `V_t`
- Punto fijo estricto demostrado

---

## Stack tecnológico

- **Frontend**: React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Lucide React + Motion
- **Backend**: Express + `tsx` (TypeScript nativo)
- **IA**: `@google/genai` (Gemini)
- **ML**: Motor neural propio (Dense layers + GELU + Adam + Softmax) implementado 100 % en TypeScript
- **Datos canónicos**: Especificación IOM v1.9.0 embebida

---

## Instalación y ejecución

### Requisitos

- Node.js ≥ 20
- Cuenta de Google AI Studio / Gemini API Key (opcional pero recomendada)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/luisreygarciafigueroa-creator/IOM-studio.git
cd IOM-studio

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y añade tu GEMINI_API_KEY
```

Contenido de `.env`:

```env
GEMINI_API_KEY=tu_api_key_aqui
APP_URL=http://localhost:3000
```

```bash
# 4. Desarrollo (servidor Express + Vite HMR)
npm run dev

# 5. Build de producción
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3000`.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo (Express + Vite) |
| `npm run build` | Compila el frontend con Vite |
| `npm start` | Ejecuta en modo producción |
| `npm run preview` | Previsualiza el build de Vite |
| `npm run lint` | Verificación de tipos con TypeScript |
| `npm run clean` | Limpia `dist` y artefactos |

---

## Estructura del proyecto

```
IOM-studio/
├── public/                     # Assets estáticos
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # Navegación y métricas globales
│   │   ├── TrainingStudio.tsx         # Entrenamiento de modelos ML
│   │   ├── ProcessAutomationStudio.tsx # Simulador de procesos
│   │   ├── GeminiStudio.tsx           # Interfaz Gemini
│   │   └── OntologyVault.tsx          # Explorador ontológico
│   ├── data/
│   │   └── iomCanonicalData.ts        # Tríadas, nodos, reglas y operadores
│   ├── services/
│   │   ├── iomMlEngine.ts             # Motor ML (PI-HGAT-T + MLP)
│   │   └── processEngine.ts           # Motor de automatización de procesos
│   ├── types/
│   │   └── iom.ts                     # Tipos TypeScript canónicos
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server.ts                   # Servidor Express + endpoints Gemini
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
└── metadata.json
```

---

## API Endpoints (servidor)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado del servicio y configuración Gemini |
| `POST` | `/api/gemini/optimize-process` | Optimiza un pipeline existente con Gemini + heurísticas IOM |
| `POST` | `/api/gemini/generate-process` | Genera un pipeline nuevo a partir de un prompt en lenguaje natural |
| `POST` | `/api/gemini/explain-prediction` | Explica una predicción de relación entre nodos |

Si la API de Gemini no está disponible o hay rate-limit, el sistema cae automáticamente a un motor heurístico determinista basado en las reglas formales IOM.

---

## Arquitectura del motor ML

El motor implementa una red neuronal densa con:

- Inicialización He
- Activación **GELU**
- Optimizador **Adam**
- Pérdida de **Cross-Entropy** ponderada por clase
- Extracción de features posicionales + de fase + términos de interacción (para PI-HGAT-T)

Modelos soportados:

- `pi_hgat_t` → modelo completo con atención a grafo
- `mlp` → baseline MLP
- `ablation_no_phase` / `ablation_no_pos` → estudios de ablación
- `negative_control` → control negativo
- `oracle` → referencia determinista

Validación disponible: split o **Leave-One-Triad-Out** (13 folds).

---

## Licencia y autoría

Proyecto desarrollado por **Luis Rey García Figueroa**.

Marco formal IOM (Unidad Informativa) — especificación canónica v1.9.0.  
Punto fijo estricto demostrado en Lean 4.

---

## Notas

- El entrenamiento baseline se ejecuta automáticamente al cargar la aplicación.
- Todas las predicciones del modelo se confrontan con las reglas formales canónicas (`ruleConformant`).
- La interfaz está optimizada para uso en desktop y tablet.

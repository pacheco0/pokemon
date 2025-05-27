# Pokémon Battle Waves 🌊⚡

Una web app de combates Pokémon en formato de oleadas (1v1) construida con React, Next.js y TailwindCSS, utilizando la PokéAPI.

## 🎮 Características del Juego

### Mecánicas Principales
- **Selección de Región**: Elige entre Kanto, Johto o Hoenn
- **Starter Pokémon**: Selecciona tu Pokémon inicial de los 3 starters de la región elegida
- **Combates por Oleadas**: Enfrenta Pokémon enemigos aleatorios en batallas 1v1
- **Sistema de Niveles**: Tu Pokémon gana experiencia y sube de nivel
- **Evolución**: Los Pokémon evolucionan al alcanzar el nivel requerido
- **Sistema de Captura**: Usa Pokéballs para capturar Pokémon derrotados

### Reglas del Juego
- Empiezas con 5 Pokéballs
- Ganas +1 Pokéball cada 5 oleadas
- Los enemigos tienen máximo 2 niveles superiores al tuyo
- Puedes capturar al último Pokémon que derrotaste (100% de éxito)
- El Pokémon capturado se convierte en tu nuevo compañero

### Sistema de Combate
- **Turnos**: El Pokémon más rápido ataca primero
- **Daño**: Fórmula simplificada basada en ataque vs defensa
- **Movimientos**: Cada Pokémon tiene hasta 4 movimientos disponibles
- **Tipos**: Sistema de tipos de Pokémon con colores distintivos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, Next.js 14, TypeScript
- **Estilos**: TailwindCSS
- **API**: PokéAPI (https://pokeapi.co/)
- **HTTP Client**: Axios
- **Iconos**: Lucide React
- **Persistencia**: LocalStorage

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [url-del-repo]
cd pokemon-battle-app

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

### Scripts Disponibles
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── PokemonGame.tsx    # Componente principal del juego
│   ├── RegionSelect.tsx   # Selección de región
│   ├── StarterSelect.tsx  # Selección de starter
│   ├── BattleScreen.tsx   # Pantalla de batalla
│   ├── VictoryScreen.tsx  # Pantalla de victoria
│   ├── DefeatScreen.tsx   # Pantalla de derrota
│   └── CaptureScreen.tsx  # Pantalla de captura
├── types/                 # Definiciones TypeScript
│   └── pokemon.ts         # Interfaces y tipos
└── utils/                 # Utilidades
    ├── pokeapi.ts         # Cliente de PokéAPI
    └── gameLogic.ts       # Lógica del juego
```

## 🎯 Funcionalidades Implementadas

### ✅ Completadas
- [x] Selección de región (Kanto, Johto, Hoenn)
- [x] Selección de Pokémon starter
- [x] Sistema de combate por turnos
- [x] Cálculo de daño y estadísticas
- [x] Sistema de experiencia y subida de nivel
- [x] Aprendizaje de nuevos movimientos
- [x] Sistema de evolución
- [x] Generación de enemigos aleatorios
- [x] Sistema de Pokéballs y captura
- [x] Persistencia en LocalStorage
- [x] Interfaz responsive
- [x] Animaciones y transiciones

### 🔄 Posibles Mejoras Futuras
- [ ] Efectividad de tipos en combate
- [ ] Más regiones (Sinnoh, Unova, etc.)
- [ ] Sistema de objetos (pociones, etc.)
- [ ] Música y efectos de sonido
- [ ] Multijugador
- [ ] Estadísticas detalladas
- [ ] Sistema de logros

## 🎨 Diseño

La aplicación utiliza un diseño moderno y minimalista inspirado en la Pokédex:
- **Colores**: Gradientes vibrantes con tema Pokémon
- **Tipografía**: Fuentes Geist Sans y Geist Mono
- **Responsive**: Adaptable a móviles, tablets y desktop
- **Animaciones**: Transiciones suaves y efectos hover
- **UX**: Interfaz intuitiva con feedback visual claro

## 🔧 API y Datos

### PokéAPI Endpoints Utilizados
- `/pokemon/{id}` - Datos del Pokémon
- `/move/{id}` - Información de movimientos
- `/pokemon-species/{id}` - Datos de especie
- `/evolution-chain/{id}` - Cadena evolutiva

### Gestión de Estado
- Estado del juego centralizado en el componente principal
- Persistencia automática en LocalStorage
- Carga de estado guardado al iniciar

## 🐛 Problemas Conocidos

- Algunos Pokémon pueden no tener sprites de alta calidad
- La PokéAPI puede tener latencia ocasional
- Algunos movimientos pueden no tener datos de poder

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🙏 Agradecimientos

- **PokéAPI** por proporcionar datos completos de Pokémon
- **The Pokémon Company** por crear el universo Pokémon
- **Vercel** por el hosting y Next.js
- **Tailwind Labs** por TailwindCSS

---

¡Disfruta capturando y entrenando Pokémon! 🎮✨

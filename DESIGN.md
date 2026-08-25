# Design System: Project Vault

## Dirección visual

Project Vault es una bóveda local para lectura y consulta prolongada. La interfaz debe sentirse como un cuaderno técnico bien iluminado: hueso, sepia, café y tinta suave. El objetivo es reducir fatiga visual sin perder jerarquía, foco ni claridad al copiar o revelar un secreto.

- **Densidad:** equilibrada; controles compactos, contenido con aire.
- **Temperatura:** cálida en ambos temas; nunca mezclar grises azulados con cafés.
- **Profundidad:** superficies por capas, bordes suaves y sombras muy tenues.
- **Movimiento:** fluido pero discreto; no debe interrumpir tareas repetitivas.

## Temas

### Claro, papel hueso

- Fondo: `#F5F1E8`.
- Superficie: `#FFFDF8`.
- Texto principal: `#3B3028`.
- Texto secundario: `#75675A`.
- Borde: `#D9CCBC`.
- Primario: `#4A392E`.
- Acento ambiental: sepia y ámbar de baja saturación.

### Oscuro, café carbón

- Fondo: `#2A211D`.
- Superficie: `#352A24`.
- Texto principal: `#F2E9DB`.
- Texto secundario: `#C4B3A1`.
- Borde: `rgba(242, 233, 219, 0.14)`.
- Primario: `#D8B98A` con texto café oscuro.
- Acento ambiental: cacao y ámbar apagados.

Usar gradientes únicamente como luz ambiental de muy baja intensidad. No usar blanco puro, negro puro, neón ni colores fríos saturados en las superficies principales.

## Tipografía

- Interfaz: `ui-sans-serif, system-ui, sans-serif`.
- Valores sensibles: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
- Títulos: 18–20px, 600, tracking ligeramente negativo.
- Cuerpo: 14px, line-height 1.5.
- Metadata: 12px, peso 500, color secundario.
- Texto largo: máximo aproximado de 65 caracteres por línea.

## Componentes

- Tarjetas con radio medio, fondo de superficie, borde tenue y sombra mínima.
- Inputs con fondo ligeramente contrastado, borde suave y foco café/ámbar visible.
- Botón primario café en claro y marfil cálido en oscuro.
- Tags conservan colores suaves porque representan organización creada por el usuario.
- Secretos y contraseñas siempre ocultos por defecto.
- Estados de copia, guardado, vacío y error deben incluir texto o icono además del color.

## Layout y responsive

- Sidebar de 256px en escritorio, apilada en móvil.
- Todas las páginas comparten `max-width: 1152px`, `width: 100%` y centrado.
- Grids: 1 columna en móvil, 2 en tablet, 3 en escritorio amplio.
- Gutters: 16px en móvil, 24px en escritorio.
- Ritmo: 4, 8, 12, 16 y 24px.
- El editor de notas conserva su scroll interno y la shell mantiene `100dvh`.

## Accesibilidad y movimiento

- Contraste mínimo AA en ambos temas.
- Foco de teclado visible y controles de icono con nombre accesible.
- Entradas de pantalla y listas entre 220 y 620ms; stagger de 75ms como máximo.
- Hover sutil, sin desplazar contenido vecino.
- `prefers-reduced-motion` elimina transformaciones y blur decorativo.

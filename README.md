# 🏀 Cotizador de Seguro de Retiro | SIJUBARA & La Segunda Seguros

Simulador y cotizador financiero interactivo para el **Seguro de Retiro en USD** del **SIJUBARA** (Sindicato de Jugadores de Básquetbol de la República Argentina) en alianza estratégica con **La Segunda Seguros de Retiro**.

🌐 **Acceso Web:** [https://genesisfinal.github.io/cotizador-sijubara/](https://genesisfinal.github.io/cotizador-sijubara/)

---

## 🎯 Propósito
Brindar a los jugadores profesionales de básquetbol de la República Argentina una herramienta visual, transparente e intuitiva para proyectar su fondo de retiro en moneda dura (USD), calculando la evolución conjunta de sus aportes personales (5%), los aportes del club empleador (3%) y el efecto multiplicador del interés compuesto tanto durante su carrera activa como en la etapa posterior de capitalización.

---

## ⚙️ Características Principales
- ⚡ **Cálculo en Tiempo Real**: Sincronización instantánea de variables mediante controles deslizantes e inputs directos.
- 📈 **Gráficos Interactivos (Chart.js)**:
  - Evolución acumulada y desglose por origen (Fondo Jugador vs Fondo Club vs Intereses).
  - Estructura patrimonial al momento del retiro (Gráfico de Dona).
- 🏆 **Dos Hitos Clave Visualizados**:
  1. *Fin de la Carrera Activa* (ej. a los 37 años): Capital acumulado y equivalencia en meses de contrato.
  2. *Al Retiro Definitivo* (ej. a los 65 años): Fondo total tras la capitalización post-carrera.
- 🎯 **Simulador de Meta Inversa**: Permite ingresar un capital objetivo al retiro (ej. USD $500.000) y calcula el contrato mensual y aportes requeridos.
- 📄 **Exportación a PDF Oficial**: Genera una propuesta personalizada con membrete institucional de SIJUBARA y La Segunda, lista para firmar y archivar.
- 📊 **Descarga de Datos CSV/Excel**: Exporta la tabla de amortización y evolución año por año.
- 🎨 **Identidad Visual Corporativa**: Diseñado siguiendo los lineamientos del **Brandbook de La Segunda** (Tipografía *Sora*, paleta de rojos institucionales `#E20039`) y el isotipo oficial del básquetbol de **SIJUBARA**.

---

## 🧮 Metodología y Modelo Actuarial
Basado estrictamente en la matriz actuarial del archivo oficial `SIJUBARA.xlsx`:
- **Tasa Mensual Equivalente**:
  $$r_m = (1 + r)^{1/12} - 1$$
- **Capitalización Mensual con Aportes a Mitad de Mes**:
  $$\text{Saldo}_t = \text{Saldo}_{t-1} \times (1 + r_m) + \text{Aporte}_{t-1} \times \left(1 + \frac{r_m}{2}\right)$$

---

## 🏢 Instituciones Participantes
- **SIJUBARA** - Sindicato de Jugadores de Básquetbol de la República Argentina.
- **La Segunda Seguros de Retiro S.A.** - Compañía autorizada por la Superintendencia de Seguros de la Nación (SSN N° 0317 - 0618 - 0117 - 0436).
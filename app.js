/* ==========================================================================
   COTIZADOR DE SEGURO DE RETIRO - SIJUBARA & LA SEGUNDA
   Lógica Actuarial y Control de Interfaz
   Basado en el modelo matemático de SIJUBARA.xlsx
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // DOM References - Inputs
    const inputNombreJugador = document.getElementById('inputNombreJugador');
    const inputClubJugador = document.getElementById('inputClubJugador');

    const rangeContrato = document.getElementById('rangeContrato');
    const inputContrato = document.getElementById('inputContrato');
    const displayContrato = document.getElementById('displayContrato');

    const rangeMesesAporte = document.getElementById('rangeMesesAporte');
    const inputMesesAporte = document.getElementById('inputMesesAporte');
    const displayMesesAporte = document.getElementById('displayMesesAporte');

    const inputEdadInicio = document.getElementById('inputEdadInicio');
    const inputAniosAporte = document.getElementById('inputAniosAporte');

    const rangeEdadRetiro = document.getElementById('rangeEdadRetiro');
    const inputEdadRetiro = document.getElementById('inputEdadRetiro');
    const displayEdadRetiro = document.getElementById('displayEdadRetiro');

    const inputPctJugador = document.getElementById('inputPctJugador');
    const inputPctClub = document.getElementById('inputPctClub');
    const inputTasaAnual = document.getElementById('inputTasaAnual');

    const calcAporteJugadorMes = document.getElementById('calcAporteJugadorMes');
    const calcAporteClubMes = document.getElementById('calcAporteClubMes');
    const calcTasaMensual = document.getElementById('calcTasaMensual');

    // Timeline Pills
    const pillEdadInicio = document.getElementById('pillEdadInicio');
    const pillAniosAporte = document.getElementById('pillAniosAporte');
    const pillEdadFin = document.getElementById('pillEdadFin');
    const pillAniosCrecimiento = document.getElementById('pillAniosCrecimiento');
    const pillEdadRetiro = document.getElementById('pillEdadRetiro');

    // DOM References - Resultados Hito 1 (Fin de Carrera)
    const resEdadFinCarrera = document.getElementById('resEdadFinCarrera');
    const resFondoTotalFinCarrera = document.getElementById('resFondoTotalFinCarrera');
    const resMultiplicadorFinCarrera = document.getElementById('resMultiplicadorFinCarrera');
    const resFondoJugadorFinCarrera = document.getElementById('resFondoJugadorFinCarrera');
    const resMesesJugadorFinCarrera = document.getElementById('resMesesJugadorFinCarrera');
    const resFondoClubFinCarrera = document.getElementById('resFondoClubFinCarrera');
    const resMesesClubFinCarrera = document.getElementById('resMesesClubFinCarrera');

    // DOM References - Resultados Hito 2 (Retiro)
    const resEdadRetiro = document.getElementById('resEdadRetiro');
    const resFondoTotalRetiro = document.getElementById('resFondoTotalRetiro');
    const resMultiplicadorRetiro = document.getElementById('resMultiplicadorRetiro');
    const resFondoJugadorRetiro = document.getElementById('resFondoJugadorRetiro');
    const resMesesJugadorRetiro = document.getElementById('resMesesJugadorRetiro');
    const resFondoClubRetiro = document.getElementById('resFondoClubRetiro');
    const resMesesClubRetiro = document.getElementById('resMesesClubRetiro');

    // Métricas Secundarias
    const resTotalAportadoPuro = document.getElementById('resTotalAportadoPuro');
    const resSubAportes = document.getElementById('resSubAportes');
    const resInteresesGanados = document.getElementById('resInteresesGanados');
    const resMultiplicadorGanancia = document.getElementById('resMultiplicadorGanancia');
    const resRentaMensualEstimada = document.getElementById('resRentaMensualEstimada');
    const resRentaEdad = document.getElementById('resRentaEdad');

    // Gráficos y Tablas
    const evolutionChartCanvas = document.getElementById('evolutionChart');
    const doughnutChartCanvas = document.getElementById('doughnutChart');
    const doughnutSummaryText = document.getElementById('doughnutSummaryText');
    const chartViewToggle = document.getElementById('chartViewToggle');
    const projectionTableBody = document.getElementById('projectionTableBody');
    const tableSearchAge = document.getElementById('tableSearchAge');
    const tableRowsInfo = document.getElementById('tableRowsInfo');

    // Goal Calculator
    const inputTargetAmount = document.getElementById('inputTargetAmount');
    const goalEdadRetiroText = document.getElementById('goalEdadRetiroText');
    const goalTargetDisplay = document.getElementById('goalTargetDisplay');
    const goalRequiredSalary = document.getElementById('goalRequiredSalary');
    const goalRequiredContributions = document.getElementById('goalRequiredContributions');

    // Botones de acción
        const btnExportPDF = document.getElementById('btnExportPDF');
    if (btnExportPDF) {
        btnExportPDF.addEventListener('click', () => {
            if (!lastSimulationResult) return;
            const res = lastSimulationResult;

            const nombreJugador = inputNombreJugador.value.trim() || 'Nombre y Apellido';
            const clubJugador = inputClubJugador.value.trim() || 'Club de Basquetbol';

            // 1. Llenar datos en el template de PDF
            document.getElementById('pdfNombreJugador').textContent = nombreJugador;
            document.getElementById('pdfClubJugador').textContent = clubJugador;
            document.getElementById('pdfCurrentDate').textContent = `Fecha: ${new Date().toLocaleDateString('es-AR')}`;

            document.getElementById('pdfParamContrato').textContent = formatCurrencyFull(res.params.salarioMensual);
            document.getElementById('pdfParamMeses').textContent = `${res.params.mesesAporteAnio} meses / año`;
            document.getElementById('pdfParamEdadInicio').textContent = `${res.params.edadInicio} años`;
            document.getElementById('pdfParamAniosAporte').textContent = `${res.params.aniosAporte} años (hasta los ${res.edadFinCarrera})`;
            document.getElementById('pdfParamEdadRetiro').textContent = `${res.params.edadRetiro} años`;
            document.getElementById('pdfParamTasa').textContent = `${(res.params.tasaInteresAnual * 100).toFixed(2)}% TNA`;
            document.getElementById('pdfParamAporteJ').textContent = `USD $${Math.round(res.params.salarioMensual * res.params.pctJugador)} / mes (${(res.params.pctJugador*100).toFixed(1)}%)`;
            document.getElementById('pdfParamAporteC').textContent = `USD $${Math.round(res.params.salarioMensual * res.params.pctClub)} / mes (${(res.params.pctClub*100).toFixed(1)}%)`;

            // Hito Fin Carrera
            document.getElementById('pdfKpiEdadFin').textContent = res.edadFinCarrera;
            document.getElementById('pdfKpiTotalFin').textContent = formatCurrencyFull(res.finCarrera.saldoTotal);
            document.getElementById('pdfKpiEquivFin').textContent = `Equivalente a ${formatDecimal(res.finCarrera.mesesTotal)} meses de sueldo`;
            document.getElementById('pdfKpiJFin').textContent = formatCurrencyFull(res.finCarrera.saldoJugador);
            document.getElementById('pdfKpiCFin').textContent = formatCurrencyFull(res.finCarrera.saldoClub);

            // Hito Retiro
            document.getElementById('pdfKpiEdadRet').textContent = res.params.edadRetiro;
            document.getElementById('pdfKpiTotalRet').textContent = formatCurrencyFull(res.retiro.saldoTotal);
            document.getElementById('pdfKpiEquivRet').textContent = `Equivalente a ${formatDecimal(res.retiro.mesesTotal)} meses de sueldo (~${(res.retiro.mesesTotal/12).toFixed(1)} años)`;
            document.getElementById('pdfKpiJRet').textContent = formatCurrencyFull(res.retiro.saldoJugador);
            document.getElementById('pdfKpiCRet').textContent = formatCurrencyFull(res.retiro.saldoClub);

            // Cuadro de Renta Mensual a 20 Años
            const pdfRentaMensual = document.getElementById('pdfRentaMensual');
            const pdfRentaEdad = document.getElementById('pdfRentaEdad');
            if (pdfRentaMensual) pdfRentaMensual.textContent = formatCurrencyFull(res.rentaMensualEstimada);
            if (pdfRentaEdad) pdfRentaEdad.textContent = res.params.edadRetiro;

            // Tabla de Síntesis
            const totFinal = res.retiro.saldoTotal;
            const intTot = res.intereses;
            const intJ = totFinal > 0 ? intTot * (res.aportes.jugador / res.aportes.total) : 0;
            const intC = totFinal > 0 ? intTot * (res.aportes.club / res.aportes.total) : 0;

            document.getElementById('pdfSumAporteJ').textContent = formatCurrencyFull(res.aportes.jugador);
            document.getElementById('pdfSumAporteC').textContent = formatCurrencyFull(res.aportes.club);
            document.getElementById('pdfSumAporteTot').textContent = formatCurrencyFull(res.aportes.total);

            document.getElementById('pdfSumInteresJ').textContent = formatCurrencyFull(intJ);
            document.getElementById('pdfSumInteresC').textContent = formatCurrencyFull(intC);
            document.getElementById('pdfSumInteresTot').textContent = formatCurrencyFull(res.intereses);

            document.getElementById('pdfSumEdadFinal').textContent = res.params.edadRetiro;
            document.getElementById('pdfSumFinalJ').textContent = formatCurrencyFull(res.retiro.saldoJugador);
            document.getElementById('pdfSumFinalC').textContent = formatCurrencyFull(res.retiro.saldoClub);
            document.getElementById('pdfSumFinalTot').textContent = formatCurrencyFull(res.retiro.saldoTotal);

            // 2. Renderizar imágenes de los gráficos (Evolución y Torta de Composición)
            const pdfEvolutionChartImg = document.getElementById('pdfEvolutionChartImg');
            const pdfDoughnutChartImg = document.getElementById('pdfDoughnutChartImg');

            if (evolutionChartCanvas && pdfEvolutionChartImg) {
                pdfEvolutionChartImg.src = evolutionChartCanvas.toDataURL('image/png', 1.0);
            }
            if (doughnutChartCanvas && pdfDoughnutChartImg) {
                pdfDoughnutChartImg.src = doughnutChartCanvas.toDataURL('image/png', 1.0);
            }

            // 3. Llenar datos de la leyenda de la torta en PDF
            const pctJ = totFinal > 0 ? (res.aportes.jugador / totFinal) * 100 : 0;
            const pctC = totFinal > 0 ? (res.aportes.club / totFinal) * 100 : 0;
            const pctR = totFinal > 0 ? (res.intereses / totFinal) * 100 : 0;

            const elPctJ = document.getElementById('pdfPctJugadorText');
            const elValJ = document.getElementById('pdfValJugadorText');
            const elPctC = document.getElementById('pdfPctClubText');
            const elValC = document.getElementById('pdfValClubText');
            const elPctR = document.getElementById('pdfPctRendText');
            const elValR = document.getElementById('pdfValRendText');

            if (elPctJ) elPctJ.textContent = `${pctJ.toFixed(1)}%`;
            if (elValJ) elValJ.textContent = formatCurrencyFull(res.aportes.jugador);
            if (elPctC) elPctC.textContent = `${pctC.toFixed(1)}%`;
            if (elValC) elValC.textContent = formatCurrencyFull(res.aportes.club);
            if (elPctR) elPctR.textContent = `${pctR.toFixed(1)}%`;
            if (elValR) elValR.textContent = formatCurrencyFull(res.intereses);

            // 4. Mostrar template temporalmente y generar PDF
            const element = document.getElementById('pdfExportTemplate');
            element.style.display = 'block';

            const opt = {
                margin: [6, 8, 6, 8],
                filename: `Propuesta_Retiro_SIJUBARA_${nombreJugador.replace(/\s+/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'] }
            };

            setTimeout(() => {
                if (window.html2pdf) {
                    window.html2pdf().set(opt).from(element).save().then(() => {
                        element.style.display = 'none';
                        if (window.confetti) {
                            window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
                        }
                    }).catch(err => {
                        console.error('Error generating PDF:', err);
                        element.style.display = 'none';
                        window.print();
                    });
                } else {
                    window.print();
                    element.style.display = 'none';
                }
            }, 120);
        });
    }

    updateUI();
});

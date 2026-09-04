/* ==========================================================================
   COTIZADOR DE SEGURO DE RETIRO - SIJUBARA & SEGUROS DE RETIRO
   Lógica Actuarial, Control de Interfaz y Exportación en 2 Páginas
   Basado en el modelo matemático de SIJUBARA.xlsx
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const inputNombreJugador = document.getElementById('inputNombreJugador');
    const inputClubJugador = document.getElementById('inputClubJugador');
    const rangeContrato = document.getElementById('rangeContrato');
    const inputContrato = document.getElementById('inputContrato');
    const rangeMesesAporte = document.getElementById('rangeMesesAporte');
    const inputMesesAporte = document.getElementById('inputMesesAporte');
    const inputEdadInicio = document.getElementById('inputEdadInicio');
    const inputAniosAporte = document.getElementById('inputAniosAporte');
    const rangeEdadRetiro = document.getElementById('rangeEdadRetiro');
    const inputEdadRetiro = document.getElementById('inputEdadRetiro');
    const inputPctJugador = document.getElementById('inputPctJugador');
    const inputPctClub = document.getElementById('inputPctClub');
    const inputTasaAnual = document.getElementById('inputTasaAnual');

    const pillEdadInicio = document.getElementById('pillEdadInicio');
    const pillAniosAporte = document.getElementById('pillAniosAporte');
    const pillEdadFin = document.getElementById('pillEdadFin');
    const pillAniosCrecimiento = document.getElementById('pillAniosCrecimiento');
    const pillEdadRetiro = document.getElementById('pillEdadRetiro');

    const resEdadFinCarrera = document.getElementById('resEdadFinCarrera');
    const resFondoTotalFinCarrera = document.getElementById('resFondoTotalFinCarrera');
    const resMultiplicadorFinCarrera = document.getElementById('resMultiplicadorFinCarrera');
    const resFondoJugadorFinCarrera = document.getElementById('resFondoJugadorFinCarrera');
    const resMesesJugadorFinCarrera = document.getElementById('resMesesJugadorFinCarrera');
    const resFondoClubFinCarrera = document.getElementById('resFondoClubFinCarrera');
    const resMesesClubFinCarrera = document.getElementById('resMesesClubFinCarrera');

    const resEdadRetiro = document.getElementById('resEdadRetiro');
    const resFondoTotalRetiro = document.getElementById('resFondoTotalRetiro');
    const resMultiplicadorRetiro = document.getElementById('resMultiplicadorRetiro');
    const resFondoJugadorRetiro = document.getElementById('resFondoJugadorRetiro');
    const resMesesJugadorRetiro = document.getElementById('resMesesJugadorRetiro');
    const resFondoClubRetiro = document.getElementById('resFondoClubRetiro');
    const resMesesClubRetiro = document.getElementById('resMesesClubRetiro');

    const resTotalAportadoPuro = document.getElementById('resTotalAportadoPuro');
    const resSubAportes = document.getElementById('resSubAportes');
    const resInteresesGanados = document.getElementById('resInteresesGanados');
    const resMultiplicadorGanancia = document.getElementById('resMultiplicadorGanancia');
    const resRentaMensualEstimada = document.getElementById('resRentaMensualEstimada');
    const resRentaEdad = document.getElementById('resRentaEdad');

    const calcAporteJugadorMes = document.getElementById('calcAporteJugadorMes');
    const calcAporteClubMes = document.getElementById('calcAporteClubMes');
    const calcTasaMensual = document.getElementById('calcTasaMensual');

    const evolutionChartCanvas = document.getElementById('evolutionChart');
    const doughnutChartCanvas = document.getElementById('doughnutChart');
    const doughnutSummaryText = document.getElementById('doughnutSummaryText');
    const chartViewToggle = document.getElementById('chartViewToggle');

    const inputTargetAmount = document.getElementById('inputTargetAmount');
    const goalEdadRetiroText = document.getElementById('goalEdadRetiroText');
    const goalTargetDisplay = document.getElementById('goalTargetDisplay');
    const goalRequiredSalary = document.getElementById('goalRequiredSalary');
    const goalRequiredContributions = document.getElementById('goalRequiredContributions');

    const projectionTableBody = document.getElementById('projectionTableBody');
    const tableSearchAge = document.getElementById('tableSearchAge');
    const tableRowsInfo = document.getElementById('tableRowsInfo');

    const btnResetDefaults = document.getElementById('btnResetDefaults');
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

            // Hitos
            document.getElementById('pdfKpiEdadFin').textContent = res.edadFinCarrera;
            document.getElementById('pdfKpiTotalFin').textContent = formatCurrencyFull(res.finCarrera.saldoTotal);
            document.getElementById('pdfKpiEquivFin').textContent = `Equiv. a ${formatDecimal(res.finCarrera.mesesTotal)} meses de contrato`;
            document.getElementById('pdfKpiJFin').textContent = formatCurrencyFull(res.finCarrera.saldoJugador);
            document.getElementById('pdfKpiCFin').textContent = formatCurrencyFull(res.finCarrera.saldoClub);

            document.getElementById('pdfKpiEdadRet').textContent = res.params.edadRetiro;
            document.getElementById('pdfKpiTotalRet').textContent = formatCurrencyFull(res.retiro.saldoTotal);
            document.getElementById('pdfKpiEquivRet').textContent = `Equiv. a ${formatDecimal(res.retiro.mesesTotal)} meses de contrato (~${(res.retiro.mesesTotal/12).toFixed(1)} años)`;
            document.getElementById('pdfKpiJRet').textContent = formatCurrencyFull(res.retiro.saldoJugador);
            document.getElementById('pdfKpiCRet').textContent = formatCurrencyFull(res.retiro.saldoClub);

            // Renta Mensual 20 Años
            const pdfRentaMensual = document.getElementById('pdfRentaMensual');
            const pdfRentaEdad = document.getElementById('pdfRentaEdad');
            if (pdfRentaMensual) pdfRentaMensual.textContent = formatCurrencyFull(res.rentaMensualEstimada);
            if (pdfRentaEdad) pdfRentaEdad.textContent = res.params.edadRetiro;

            // Síntesis
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

            // Renderizar gráficos a imágenes para el PDF
            const pdfEvolutionChartImg = document.getElementById('pdfEvolutionChartImg');
            const pdfDoughnutChartImg = document.getElementById('pdfDoughnutChartImg');

            if (evolutionChartCanvas && pdfEvolutionChartImg) {
                pdfEvolutionChartImg.src = evolutionChartCanvas.toDataURL('image/png', 1.0);
            }
            if (doughnutChartCanvas && pdfDoughnutChartImg) {
                pdfDoughnutChartImg.src = doughnutChartCanvas.toDataURL('image/png', 1.0);
            }

            // Leyenda de torta
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

            // Generar PDF usando el template posicionado fuera de pantalla (sin saltos visuales)
            const element = document.getElementById('pdfExportTemplate');

            const btnText = btnExportPDF.querySelector('span');
            const originalText = btnText ? btnText.textContent : 'Exportar PDF';
            if (btnText) btnText.textContent = 'Generando...';
            btnExportPDF.disabled = true;

            const opt = {
                margin: [4, 6, 4, 6],
                filename: `Propuesta_Retiro_SIJUBARA_${nombreJugador.replace(/\s+/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'], before: '.pdf-page-2' }
            };

            setTimeout(() => {
                if (window.html2pdf) {
                    window.html2pdf().set(opt).from(element).save().then(() => {
                        if (btnText) btnText.textContent = originalText;
                        btnExportPDF.disabled = false;
                        if (window.confetti) {
                            window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
                        }
                    }).catch(err => {
                        console.error('Error generating PDF:', err);
                        if (btnText) btnText.textContent = originalText;
                        btnExportPDF.disabled = false;
                    });
                } else {
                    if (btnText) btnText.textContent = originalText;
                    btnExportPDF.disabled = false;
                    window.print();
                }
            }, 120);
        });
    }

    updateUI();
});

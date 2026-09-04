/* ==========================================================================
   COTIZADOR DE SEGURO DE RETIRO - SIJUBARA
   Lógica Actuarial, Control de Interfaz y Exportación Vectorial en 2 Páginas
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
    const benefitCoFinanced = document.getElementById('benefitCoFinanced');

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

    let evolutionChartInstance = null;
    let doughnutChartInstance = null;
    let currentChartView = 'stacked';
    let lastSimulationResult = null;

    function formatCurrencyFull(val) {
        return 'USD $' + Math.round(val).toLocaleString('es-AR');
    }

    function formatDecimal(val, decimals = 1) {
        return val.toLocaleString('es-AR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    function getInputs() {
        let salario = parseFloat(inputContrato.value) || 4000;
        let mesesAporte = parseInt(inputMesesAporte.value, 10) || 10;
        let edadInicio = parseInt(inputEdadInicio.value, 10);
        let aniosAporte = parseInt(inputAniosAporte.value, 10);
        let edadRetiroVal = parseInt(inputEdadRetiro.value, 10);
        let pctJ = parseFloat(inputPctJugador.value);
        let pctC = parseFloat(inputPctClub.value);
        let tasaAnual = parseFloat(inputTasaAnual.value);

        if (isNaN(mesesAporte)) mesesAporte = 10;
        if (mesesAporte < 1) mesesAporte = 1;
        if (mesesAporte > 12) mesesAporte = 12;

        if (isNaN(edadInicio)) edadInicio = 19;
        if (edadInicio < 16) edadInicio = 16;
        if (edadInicio > 40) edadInicio = 40;

        if (isNaN(aniosAporte)) aniosAporte = 18;
        if (aniosAporte < 1) aniosAporte = 1;
        if (aniosAporte > 30) aniosAporte = 30;

        const edadFinCarrera = edadInicio + aniosAporte;
        const minRetiro = edadFinCarrera + 1;
        const maxRetiro = 70;

        rangeEdadRetiro.min = minRetiro;
        rangeEdadRetiro.max = maxRetiro;
        inputEdadRetiro.min = minRetiro;
        inputEdadRetiro.max = maxRetiro;

        if (isNaN(edadRetiroVal) || edadRetiroVal < minRetiro) {
            edadRetiroVal = (65 >= minRetiro && 65 <= maxRetiro) ? 65 : minRetiro;
            if (edadRetiroVal > maxRetiro) edadRetiroVal = maxRetiro;
            inputEdadRetiro.value = edadRetiroVal;
            rangeEdadRetiro.value = edadRetiroVal;
        } else if (edadRetiroVal > maxRetiro) {
            edadRetiroVal = maxRetiro;
            inputEdadRetiro.value = edadRetiroVal;
            rangeEdadRetiro.value = edadRetiroVal;
        }

        if (isNaN(pctJ)) pctJ = 5.0;
        if (pctJ < 1.0) pctJ = 1.0;
        if (pctJ > 20.0) pctJ = 20.0;

        if (isNaN(pctC)) pctC = 3.0;
        if (pctC < 1.0) pctC = 1.0;
        if (pctC > 20.0) pctC = 20.0;

        if (isNaN(tasaAnual)) tasaAnual = 5.0;
        if (tasaAnual < 1.0) tasaAnual = 1.0;
        if (tasaAnual > 6.0) tasaAnual = 6.0;
        tasaAnual = Math.round(tasaAnual * 2) / 2;

        return {
            salarioMensual: salario,
            mesesAporteAnio: mesesAporte,
            edadInicio: edadInicio,
            aniosAporte: aniosAporte,
            edadRetiro: edadRetiroVal,
            pctJugador: pctJ / 100,
            pctClub: pctC / 100,
            tasaInteresAnual: tasaAnual / 100
        };
    }

    function calculateSimulation(params) {
        const {
            salarioMensual,
            mesesAporteAnio,
            edadInicio,
            aniosAporte,
            edadRetiro,
            pctJugador,
            pctClub,
            tasaInteresAnual
        } = params;

        const tasaMensual = Math.pow(1 + tasaInteresAnual, 1 / 12) - 1;
        const aporteJugadorMes = salarioMensual * pctJugador;
        const aporteClubMes = salarioMensual * pctClub;

        const maxMeses = 1188;
        const mesesActivo = aniosAporte * 12;
        const mesesHastaRetiro = (edadRetiro - edadInicio) * 12;

        let saldoJugador = 0;
        let saldoClub = 0;
        let totalAportadoJugador = 0;
        let totalAportadoClub = 0;

        const monthlyData = [];
        let finCarreraData = null;
        let retiroData = null;

        for (let m = 1; m <= maxMeses; m++) {
            const anioActual = Math.floor((m - 1) / 12) + 1;
            const mesEnAnio = ((m - 1) % 12) + 1;
            const edadActual = edadInicio + Math.floor((m - 1) / 12);

            let apJ = 0;
            let apC = 0;

            if (m <= mesesActivo && mesEnAnio <= mesesAporteAnio) {
                apJ = aporteJugadorMes;
                apC = aporteClubMes;
            }

            totalAportadoJugador += apJ;
            totalAportadoClub += apC;

            saldoJugador = saldoJugador * (1 + tasaMensual) + apJ * (1 + tasaMensual / 2);
            saldoClub = saldoClub * (1 + tasaMensual) + apC * (1 + tasaMensual / 2);

            const record = {
                mesGlobal: m,
                anio: anioActual,
                edad: edadActual,
                mesEnAnio: mesEnAnio,
                aporteJugador: apJ,
                aporteClub: apC,
                saldoJugador: saldoJugador,
                saldoClub: saldoClub,
                saldoTotal: saldoJugador + saldoClub
            };

            monthlyData.push(record);

            if (m === mesesActivo) finCarreraData = { ...record };
            if (m === mesesHastaRetiro) retiroData = { ...record };
        }

        const annualData = [];
        const aniosSimulacion = edadRetiro - edadInicio + 1;

        for (let a = 1; a <= aniosSimulacion; a++) {
            const endMonthIdx = Math.min(a * 12 - 1, monthlyData.length - 1);
            const startMonthIdx = (a - 1) * 12;

            let aporteAnualJ = 0;
            let aporteAnualC = 0;

            for (let i = startMonthIdx; i <= endMonthIdx; i++) {
                aporteAnualJ += monthlyData[i].aporteJugador;
                aporteAnualC += monthlyData[i].aporteClub;
            }

            const monthEndRecord = monthlyData[endMonthIdx];
            const prevYearEndSaldo = a === 1 ? 0 : annualData[a - 2].saldoTotal;
            const rendAnual = monthEndRecord.saldoTotal - prevYearEndSaldo - (aporteAnualJ + aporteAnualC);

            annualData.push({
                anio: a,
                edad: edadInicio + (a - 1),
                aporteAnualJugador: aporteAnualJ,
                aporteAnualClub: aporteAnualC,
                aporteAnualTotal: aporteAnualJ + aporteAnualC,
                saldoJugador: monthEndRecord.saldoJugador,
                saldoClub: monthEndRecord.saldoClub,
                saldoTotal: monthEndRecord.saldoTotal,
                rendimientoAnual: Math.max(0, rendAnual)
            });
        }

        const estadoFinCarrera = finCarreraData || monthlyData[Math.min(mesesActivo - 1, monthlyData.length - 1)];
        const estadoRetiro = retiroData || monthlyData[Math.min(mesesHastaRetiro - 1, monthlyData.length - 1)];

        const totalAportadoGlobal = totalAportadoJugador + totalAportadoClub;
        const totalIntereses = estadoRetiro.saldoTotal - totalAportadoGlobal;

        const numMesesRenta = 240;
        const r_m = tasaMensual;
        let factorFrances = (r_m > 0)
            ? (r_m * Math.pow(1 + r_m, numMesesRenta)) / (Math.pow(1 + r_m, numMesesRenta) - 1)
            : 1 / numMesesRenta;

        const rentaMensual20Anios = estadoRetiro.saldoTotal * factorFrances;

        return {
            params,
            edadFinCarrera: edadInicio + aniosAporte,
            aniosCrecimiento: edadRetiro - (edadInicio + aniosAporte),
            finCarrera: {
                saldoJugador: estadoFinCarrera.saldoJugador,
                saldoClub: estadoFinCarrera.saldoClub,
                saldoTotal: estadoFinCarrera.saldoTotal,
                mesesTotal: estadoFinCarrera.saldoTotal / salarioMensual,
                mesesJugador: estadoFinCarrera.saldoJugador / salarioMensual,
                mesesClub: estadoFinCarrera.saldoClub / salarioMensual
            },
            retiro: {
                edad: edadRetiro,
                saldoJugador: estadoRetiro.saldoJugador,
                saldoClub: estadoRetiro.saldoClub,
                saldoTotal: estadoRetiro.saldoTotal,
                mesesTotal: estadoRetiro.saldoTotal / salarioMensual,
                mesesJugador: estadoRetiro.saldoJugador / salarioMensual,
                mesesClub: estadoRetiro.saldoClub / salarioMensual
            },
            aportes: {
                jugador: totalAportadoJugador,
                club: totalAportadoClub,
                total: totalAportadoGlobal
            },
            intereses: Math.max(0, totalIntereses),
            rentaMensualEstimada: rentaMensual20Anios,
            annualData
        };
    }

    const periodZonesPlugin = {
        id: 'periodZonesPlugin',
        beforeDraw: (chart) => {
            if (!lastSimulationResult) return;
            const { ctx, chartArea, scales: { x } } = chart;
            if (!chartArea || !x) return;

            const res = lastSimulationResult;
            const edadInicio = res.params.edadInicio;
            const edadFin = res.edadFinCarrera;
            const edadRetiro = res.params.edadRetiro;

            const labelInicio = `Edad ${edadInicio}`;
            const labelFin = `Edad ${edadFin}`;
            const labelRetiro = `Edad ${edadRetiro}`;

            const labels = chart.data.labels;
            const idxInicio = labels.indexOf(labelInicio);
            const idxFin = labels.indexOf(labelFin);
            const idxRetiro = labels.indexOf(labelRetiro);

            if (idxInicio === -1 || idxFin === -1) return;

            const xStart = x.getPixelForValue(idxInicio);
            const xFin = x.getPixelForValue(idxFin);
            const xEnd = idxRetiro !== -1 ? x.getPixelForValue(idxRetiro) : chartArea.right;

            ctx.save();

            ctx.fillStyle = 'rgba(45, 79, 143, 0.05)';
            ctx.fillRect(xStart, chartArea.top, xFin - xStart, chartArea.bottom - chartArea.top);

            ctx.fillStyle = 'rgba(226, 0, 57, 0.04)';
            ctx.fillRect(xFin, chartArea.top, xEnd - xFin, chartArea.bottom - chartArea.top);

            ctx.font = '600 11px Sora, sans-serif';
            ctx.fillStyle = '#2d4f8f';
            ctx.textAlign = 'center';
            if (xFin - xStart > 90) {
                ctx.fillText('Etapa Activa de Aportes', (xStart + xFin) / 2, chartArea.top + 18);
            }

            if (xEnd - xFin > 90) {
                ctx.fillStyle = '#b91c1c';
                ctx.fillText('Capitalización Pura (Sin Aportes)', (xFin + xEnd) / 2, chartArea.top + 18);
            }

            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(xFin, chartArea.top);
            ctx.lineTo(xFin, chartArea.bottom);
            ctx.stroke();

            ctx.setLineDash([]);
            const badgeText = `Fin Carrera (${edadFin} años)`;
            ctx.font = 'bold 10px Sora, sans-serif';
            const textWidth = ctx.measureText(badgeText).width;
            const badgeWidth = textWidth + 16;
            const badgeHeight = 22;
            const badgeX = Math.min(Math.max(xFin - badgeWidth / 2, chartArea.left + 4), chartArea.right - badgeWidth - 4);
            const badgeY = chartArea.top + 28;

            ctx.fillStyle = '#162447';
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 5);
            } else {
                ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
            }
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + 15);

            ctx.restore();
        }
    };

    function renderEvolutionChart(res) {
        if (!evolutionChartCanvas) return;

        const labels = res.annualData.map(d => `Edad ${d.edad}`);
        const dataJugador = res.annualData.map(d => Math.round(d.saldoJugador));
        const dataClub = res.annualData.map(d => Math.round(d.saldoClub));
        const dataTotal = res.annualData.map(d => Math.round(d.saldoTotal));

        const finIndex = labels.indexOf(`Edad ${res.edadFinCarrera}`);
        const retIndex = labels.indexOf(`Edad ${res.retiro.edad}`);

        const pointRadii = labels.map((_, idx) => (idx === finIndex || idx === retIndex) ? 6 : 2);
        const pointHoverRadii = labels.map((_, idx) => (idx === finIndex || idx === retIndex) ? 9 : 5);

        let datasets = [];

        if (currentChartView === 'stacked') {
            datasets = [
                {
                    label: 'Fondo Jugador (USD)',
                    data: dataJugador,
                    backgroundColor: 'rgba(45, 79, 143, 0.50)',
                    borderColor: '#2d4f8f',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.3,
                    pointRadius: pointRadii,
                    pointHoverRadius: pointHoverRadii,
                    pointBackgroundColor: '#2d4f8f'
                },
                {
                    label: 'Fondo Aporte Club (USD)',
                    data: dataClub,
                    backgroundColor: 'rgba(58, 199, 146, 0.50)',
                    borderColor: '#3ac792',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.3,
                    pointRadius: pointRadii,
                    pointHoverRadius: pointHoverRadii,
                    pointBackgroundColor: '#3ac792'
                }
            ];
        } else {
            datasets = [
                {
                    label: 'Fondo Total Acumulado (USD)',
                    data: dataTotal,
                    borderColor: '#e20039',
                    backgroundColor: 'rgba(226, 0, 57, 0.10)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.3,
                    pointRadius: pointRadii.map(r => r === 6 ? 7 : 3),
                    pointHoverRadius: pointHoverRadii,
                    pointBackgroundColor: '#e20039'
                },
                {
                    label: 'Fondo Jugador (USD)',
                    data: dataJugador,
                    borderColor: '#2d4f8f',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 4],
                    tension: 0.3,
                    pointRadius: 0
                },
                {
                    label: 'Fondo Club (USD)',
                    data: dataClub,
                    borderColor: '#3ac792',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 4],
                    tension: 0.3,
                    pointRadius: 0
                }
            ];
        }

        if (evolutionChartInstance) {
            evolutionChartInstance.data.labels = labels;
            evolutionChartInstance.data.datasets = datasets;
            evolutionChartInstance.options.scales.x.stacked = (currentChartView === 'stacked');
            evolutionChartInstance.options.scales.y.stacked = (currentChartView === 'stacked');
            evolutionChartInstance.update();
        } else {
            const ctx = evolutionChartCanvas.getContext('2d');
            evolutionChartInstance = new Chart(ctx, {
                type: 'line',
                data: { labels, datasets },
                plugins: [periodZonesPlugin],
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { family: 'Sora', size: 11, weight: '600' },
                                usePointStyle: true,
                                padding: 14
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleFont: { family: 'Sora', size: 12, weight: 'bold' },
                            bodyFont: { family: 'Sora', size: 11 },
                            padding: 10,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    return ` ${context.dataset.label}: USD $${context.parsed.y.toLocaleString('es-AR')}`;
                                },
                                afterTitle: function(context) {
                                    const edadNum = parseInt(context[0].label.replace('Edad ', ''), 10);
                                    if (edadNum <= res.edadFinCarrera) {
                                        return 'Período Activo de Aportes';
                                    } else {
                                        return 'Período de Capitalización Pura (Sin Aportes)';
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: (currentChartView === 'stacked'),
                            grid: { display: false },
                            ticks: { font: { family: 'Sora', size: 11 }, maxTicksLimit: 12 }
                        },
                        y: {
                            stacked: (currentChartView === 'stacked'),
                            grid: { color: '#f1f5f9' },
                            ticks: {
                                font: { family: 'Sora', size: 11 },
                                callback: function(value) {
                                    return '$' + (value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value);
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    function renderDoughnutChart(res) {
        if (!doughnutChartCanvas) return;

        const totalFinal = res.retiro.saldoTotal;
        const aporteJ = res.aportes.jugador;
        const aporteC = res.aportes.club;
        const rendimientos = res.intereses;

        const pctJ = totalFinal > 0 ? (aporteJ / totalFinal) * 100 : 0;
        const pctC = totalFinal > 0 ? (aporteC / totalFinal) * 100 : 0;
        const pctR = totalFinal > 0 ? (rendimientos / totalFinal) * 100 : 0;

        const dataValues = [Math.round(aporteJ), Math.round(aporteC), Math.round(rendimientos)];

        if (doughnutSummaryText) {
            doughnutSummaryText.innerHTML = `El <strong>${pctR.toFixed(1)}%</strong> de tu fondo al retiro proviene de la rentabilidad del interés compuesto.`;
        }

        if (doughnutChartInstance) {
            doughnutChartInstance.data.datasets[0].data = dataValues;
            doughnutChartInstance.update();
        } else {
            const ctx = doughnutChartCanvas.getContext('2d');
            doughnutChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [
                        `Aporte Jugador (${pctJ.toFixed(1)}%)`,
                        `Aporte Club (${pctC.toFixed(1)}%)`,
                        `Intereses Ganados (${pctR.toFixed(1)}%)`
                    ],
                    datasets: [
                        {
                            data: dataValues,
                            backgroundColor: ['#2d4f8f', '#3ac792', '#e20039'],
                            borderWidth: 2,
                            borderColor: '#ffffff',
                            hoverOffset: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { family: 'Sora', size: 11, weight: '600' },
                                padding: 12,
                                usePointStyle: true,
                                boxWidth: 8
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleFont: { family: 'Sora', size: 12, weight: 'bold' },
                            bodyFont: { family: 'Sora', size: 11 },
                            callbacks: {
                                label: function(context) {
                                    const val = context.parsed;
                                    const pct = totalFinal > 0 ? ((val / totalFinal) * 100).toFixed(1) : 0;
                                    return ` USD $${val.toLocaleString('es-AR')} (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    function updateGoalCalculator(res) {
        if (!inputTargetAmount || !goalTargetDisplay || !goalRequiredSalary || !goalRequiredContributions) return;

        const targetAmount = parseFloat(inputTargetAmount.value) || 500000;
        goalTargetDisplay.textContent = Math.round(targetAmount).toLocaleString('es-AR');
        if (goalEdadRetiroText) goalEdadRetiroText.textContent = res.params.edadRetiro;

        const factorSueldoActual = res.retiro.saldoTotal / res.params.salarioMensual;
        if (factorSueldoActual > 0) {
            const requiredSalary = targetAmount / factorSueldoActual;
            const requiredJ = requiredSalary * res.params.pctJugador;
            const requiredC = requiredSalary * res.params.pctClub;

            goalRequiredSalary.textContent = formatCurrencyFull(requiredSalary);
            goalRequiredContributions.innerHTML = `Tu aporte mensual: <strong>${formatCurrencyFull(requiredJ)}</strong> | Club: <strong>${formatCurrencyFull(requiredC)}</strong>`;
        }
    }

    function renderTable(annualData, filterQuery = '') {
        if (!projectionTableBody) return;

        let filtered = annualData;
        if (filterQuery && filterQuery.trim() !== '') {
            const q = filterQuery.toLowerCase().trim();
            filtered = annualData.filter(d =>
                d.edad.toString().includes(q) ||
                `edad ${d.edad}`.includes(q) ||
                `año ${d.anio}`.includes(q) ||
                d.anio.toString().includes(q)
            );
        }

        let html = '';
        filtered.forEach(row => {
            const isFinCarrera = lastSimulationResult && row.edad === lastSimulationResult.edadFinCarrera;
            const isRetiro = lastSimulationResult && row.edad === lastSimulationResult.retiro.edad;

            let rowClass = '';
            if (isFinCarrera) rowClass = 'row-highlight-career';
            if (isRetiro) rowClass = 'row-highlight-retirement';

            html += `
                <tr class="${rowClass}">
                    <td><strong>${row.edad}</strong> ${isFinCarrera ? '<span class="badge-row">Fin Carrera</span>' : ''} ${isRetiro ? '<span class="badge-row red">Retiro</span>' : ''}</td>
                    <td>Año ${row.anio}</td>
                    <td>${formatCurrencyFull(row.aporteAnualJugador)}</td>
                    <td>${formatCurrencyFull(row.aporteAnualClub)}</td>
                    <td>${formatCurrencyFull(row.saldoJugador)}</td>
                    <td>${formatCurrencyFull(row.saldoClub)}</td>
                    <td class="text-bold">${formatCurrencyFull(row.saldoTotal)}</td>
                    <td class="text-green">+${formatCurrencyFull(row.rendimientoAnual)}</td>
                </tr>
            `;
        });

        projectionTableBody.innerHTML = html;
        if (tableRowsInfo) {
            tableRowsInfo.textContent = `Mostrando ${filtered.length} de ${annualData.length} años de proyección`;
        }
    }

    function updateUI() {
        const inputs = getInputs();
        const res = calculateSimulation(inputs);
        lastSimulationResult = res;

        if (pillEdadInicio) pillEdadInicio.textContent = `${inputs.edadInicio} años`;
        if (pillAniosAporte) pillAniosAporte.textContent = `${inputs.aniosAporte} años`;
        if (pillEdadFin) pillEdadFin.textContent = `${res.edadFinCarrera} años`;
        if (pillAniosCrecimiento) pillAniosCrecimiento.textContent = `${res.aniosCrecimiento} años`;
        if (pillEdadRetiro) pillEdadRetiro.textContent = `${inputs.edadRetiro} años`;

        const aporteJMes = inputs.salarioMensual * inputs.pctJugador;
        const aporteCMes = inputs.salarioMensual * inputs.pctClub;
        if (calcAporteJugadorMes) calcAporteJugadorMes.textContent = `${formatCurrencyFull(aporteJMes)} / mes`;
        if (calcAporteClubMes) calcAporteClubMes.textContent = `${formatCurrencyFull(aporteCMes)} / mes`;

        const tasaMensualPct = ((Math.pow(1 + inputs.tasaInteresAnual, 1 / 12) - 1) * 100).toFixed(4);
        if (calcTasaMensual) calcTasaMensual.textContent = `Tasa mensual equivalente: ${tasaMensualPct}% (1% a 6% en pasos de 0.5%)`;

        if (benefitCoFinanced) {
            const pctJ = inputs.pctJugador * 100;
            const pctC = inputs.pctClub * 100;
            const gananciaInmediata = pctJ > 0 ? ((pctC / pctJ) * 100).toFixed(1) : 0;
            benefitCoFinanced.innerHTML = `<strong>Aporte Co-Financiado:</strong> Tu club aporta un <strong>${pctC.toFixed(1)}%</strong> adicional que incrementa directamente tu patrimonio. Esto significa una ganancia inmediata de <strong>${gananciaInmediata}%</strong> sobre tu aporte personal.`;
        }

        if (resEdadFinCarrera) resEdadFinCarrera.textContent = res.edadFinCarrera;
        if (resFondoTotalFinCarrera) resFondoTotalFinCarrera.textContent = formatCurrencyFull(res.finCarrera.saldoTotal);
        if (resMultiplicadorFinCarrera) {
            resMultiplicadorFinCarrera.innerHTML = `<i data-lucide="award"></i> Equivalente a <strong>${formatDecimal(res.finCarrera.mesesTotal)} meses</strong> de sueldo`;
        }
        if (resFondoJugadorFinCarrera) resFondoJugadorFinCarrera.textContent = formatCurrencyFull(res.finCarrera.saldoJugador);
        if (resMesesJugadorFinCarrera) resMesesJugadorFinCarrera.textContent = `(${formatDecimal(res.finCarrera.mesesJugador)} meses)`;
        if (resFondoClubFinCarrera) resFondoClubFinCarrera.textContent = formatCurrencyFull(res.finCarrera.saldoClub);
        if (resMesesClubFinCarrera) resMesesClubFinCarrera.textContent = `(${formatDecimal(res.finCarrera.mesesClub)} meses)`;

        if (resEdadRetiro) resEdadRetiro.textContent = inputs.edadRetiro;
        if (resFondoTotalRetiro) resFondoTotalRetiro.textContent = formatCurrencyFull(res.retiro.saldoTotal);
        if (resMultiplicadorRetiro) {
            const aniosEq = (res.retiro.mesesTotal / 12).toFixed(1);
            resMultiplicadorRetiro.innerHTML = `<i data-lucide="trending-up"></i> Equivalente a <strong>${formatDecimal(res.retiro.mesesTotal)} meses</strong> de sueldo (~${aniosEq} años)`;
        }
        if (resFondoJugadorRetiro) resFondoJugadorRetiro.textContent = formatCurrencyFull(res.retiro.saldoJugador);
        if (resMesesJugadorRetiro) resMesesJugadorRetiro.textContent = `(${formatDecimal(res.retiro.mesesJugador)} meses)`;
        if (resFondoClubRetiro) resFondoClubRetiro.textContent = formatCurrencyFull(res.retiro.saldoClub);
        if (resMesesClubRetiro) resMesesClubRetiro.textContent = `(${formatDecimal(res.retiro.mesesClub)} meses)`;

        if (resTotalAportadoPuro) resTotalAportadoPuro.textContent = formatCurrencyFull(res.aportes.total);
        if (resSubAportes) resSubAportes.textContent = `Jugador: ${formatCurrencyFull(res.aportes.jugador)} | Club: ${formatCurrencyFull(res.aportes.club)}`;
        if (resInteresesGanados) resInteresesGanados.textContent = formatCurrencyFull(res.intereses);
        if (resMultiplicadorGanancia) {
            const factorTotal = res.aportes.total > 0 ? (res.retiro.saldoTotal / res.aportes.total).toFixed(1) : 0;
            resMultiplicadorGanancia.innerHTML = `El fondo se multiplicó <strong>${factorTotal}x</strong> veces`;
        }
        if (resRentaMensualEstimada) resRentaMensualEstimada.textContent = `${formatCurrencyFull(res.rentaMensualEstimada)} / mes`;
        if (resRentaEdad) resRentaEdad.textContent = inputs.edadRetiro;

        renderEvolutionChart(res);
        renderDoughnutChart(res);
        updateGoalCalculator(res);
        renderTable(res.annualData, tableSearchAge ? tableSearchAge.value : '');

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function bindInputSync(rangeEl, inputEl) {
        if (!rangeEl || !inputEl) return;
        rangeEl.addEventListener('input', (e) => {
            inputEl.value = e.target.value;
            updateUI();
        });
        inputEl.addEventListener('input', (e) => {
            rangeEl.value = e.target.value;
            updateUI();
        });
        inputEl.addEventListener('change', () => {
            updateUI();
        });
    }

    bindInputSync(rangeContrato, inputContrato);
    bindInputSync(rangeMesesAporte, inputMesesAporte);
    bindInputSync(rangeEdadRetiro, inputEdadRetiro);

    [inputEdadInicio, inputAniosAporte, inputPctJugador, inputPctClub, inputTasaAnual].forEach(el => {
        if (el) {
            el.addEventListener('input', updateUI);
            el.addEventListener('change', updateUI);
        }
    });

    if (inputTargetAmount) {
        inputTargetAmount.addEventListener('input', () => {
            if (lastSimulationResult) updateGoalCalculator(lastSimulationResult);
        });
    }

    if (tableSearchAge) {
        tableSearchAge.addEventListener('input', (e) => {
            if (lastSimulationResult) {
                renderTable(lastSimulationResult.annualData, e.target.value);
            }
        });
    }

    if (chartViewToggle) {
        const toggleButtons = chartViewToggle.querySelectorAll('.btn-toggle');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                toggleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentChartView = btn.dataset.view;
                if (lastSimulationResult) {
                    renderEvolutionChart(lastSimulationResult);
                }
            });
        });
    }

        // Desactivar scroll brusco de la rueda del mouse sobre inputs numéricos y rangos
    document.querySelectorAll('input[type="number"], input[type="range"]').forEach(input => {
        input.addEventListener('wheel', (e) => {
            if (document.activeElement === input) {
                input.blur();
            }
            e.preventDefault();
        }, { passive: false });
    });

    if (btnResetDefaults) {
        btnResetDefaults.addEventListener('click', () => {
            inputContrato.value = 4000;
            rangeContrato.value = 4000;
            inputMesesAporte.value = 10;
            rangeMesesAporte.value = 10;
            inputEdadInicio.value = 19;
            inputAniosAporte.value = 18;
            inputEdadRetiro.value = 65;
            rangeEdadRetiro.value = 65;
            inputPctJugador.value = 5.0;
            inputPctClub.value = 3.0;
            inputTasaAnual.value = 5.0;
            if (inputTargetAmount) inputTargetAmount.value = 500000;
            updateUI();
        });
    }

    // ==========================================================================
    // EXPORTACIÓN A PDF OFICIAL EN 2 PÁGINAS (jsPDF Vectorial de Alta Resolución)
    // ==========================================================================
    function getEvolutionChartBase64(customWidth = 1600, customHeight = 720) {
        if (!evolutionChartInstance || !evolutionChartCanvas) return null;
        try {
            const offCanvas = document.createElement('canvas');
            offCanvas.width = customWidth;
            offCanvas.height = customHeight;
            const ctx = offCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, customWidth, customHeight);
            ctx.drawImage(evolutionChartCanvas, 0, 0, customWidth, customHeight);
            return offCanvas.toDataURL('image/png', 1.0);
        } catch (e) {
            console.warn('Error capturing evolution chart:', e);
            return null;
        }
    }

    function getSquareDoughnutBase64(res, size = 800) {
        try {
            const offCanvas = document.createElement('canvas');
            offCanvas.width = size;
            offCanvas.height = size;
            const ctx = offCanvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);

            const tot = res.retiro.saldoTotal;
            const valJ = res.aportes.jugador;
            const valC = res.aportes.club;
            const valR = res.intereses;

            if (tot <= 0) return offCanvas.toDataURL('image/png', 1.0);

            const cx = size / 2;
            const cy = size / 2;
            const radius = size * 0.35;
            const strokeWidth = size * 0.16;

            const slices = [
                { val: valJ, color: '#2d4f8f' },
                { val: valC, color: '#3ac792' },
                { val: valR, color: '#e20039' }
            ];

            let startAngle = -Math.PI / 2;
            const totalVal = slices.reduce((a, b) => a + b.val, 0);

            slices.forEach(slice => {
                const sliceAngle = (slice.val / totalVal) * 2 * Math.PI;
                const endAngle = startAngle + sliceAngle;

                const gap = 0.02;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, startAngle + gap, endAngle - gap);
                ctx.lineWidth = strokeWidth;
                ctx.strokeStyle = slice.color;
                ctx.stroke();

                startAngle = endAngle;
            });

            // Center text: Total value
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 36px Sora, Helvetica, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(formatCurrencyFull(tot), cx, cy - 14);

            ctx.fillStyle = '#64748b';
            ctx.font = '600 20px Sora, Helvetica, Arial, sans-serif';
            ctx.fillText('Fondo Total Retiro', cx, cy + 24);

            return offCanvas.toDataURL('image/png', 1.0);
        } catch (e) {
            console.warn('Error generating circular doughnut:', e);
            return null;
        }
    }

    if (btnExportPDF) {
        btnExportPDF.addEventListener('click', async () => {
            if (!lastSimulationResult) return;
            const res = lastSimulationResult;

            const toast = document.getElementById('pdfLoadingToast');
            if (toast) toast.style.display = 'flex';

            await new Promise(r => setTimeout(r, 60));

            try {
                const { jsPDF } = window.jspdf || window;
                if (!jsPDF) {
                    alert('Librería jsPDF no disponible. Por favor recarga la página.');
                    if (toast) toast.style.display = 'none';
                    return;
                }

                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                    compress: true
                });

                const nombreJugador = (inputNombreJugador && inputNombreJugador.value.trim()) ? inputNombreJugador.value.trim() : 'Nombre y Apellido';
                const clubJugador = (inputClubJugador && inputClubJugador.value.trim()) ? inputClubJugador.value.trim() : 'Club de Basquetbol';
                const currentDateStr = new Date().toLocaleDateString('es-AR');

                const totFinal = res.retiro.saldoTotal;
                const intTot = res.intereses;
                const intJ = totFinal > 0 ? intTot * (res.aportes.jugador / res.aportes.total) : 0;
                const intC = totFinal > 0 ? intTot * (res.aportes.club / res.aportes.total) : 0;

                const pctJ = totFinal > 0 ? (res.aportes.jugador / totFinal) * 100 : 0;
                const pctC = totFinal > 0 ? (res.aportes.club / totFinal) * 100 : 0;
                const pctR = totFinal > 0 ? (res.intereses / totFinal) * 100 : 0;

                const logoElement = document.querySelector('.brand-logo-sijubara');

                // ==========================================
                // PÁGINA 1: PARÁMETROS, KPIS, SÍNTESIS Y EVOLUCIÓN
                // ==========================================

                // 1. Header
                if (logoElement) {
                    try {
                        doc.addImage(logoElement, 'PNG', 15, 9, 36, 12);
                    } catch (e) {
                        console.warn('Logo image could not be added:', e);
                    }
                }

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(200, 16, 46);
                doc.text('SEGURO DE RETIRO', 195, 13, { align: 'right' });

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7.5);
                doc.setTextColor(100, 116, 139);
                doc.text('PLAN DE RETIRO DEPORTIVO SIJUBARA', 195, 17.5, { align: 'right' });

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(140, 150, 165);
                doc.text('Fecha: ' + currentDateStr, 195, 22, { align: 'right' });

                // Línea decorativa roja
                doc.setFillColor(200, 16, 46);
                doc.rect(15, 24.5, 180, 1.2, 'F');

                // 2. Banner de Beneficiario
                doc.setFillColor(248, 250, 252);
                doc.setDrawColor(226, 232, 240);
                doc.roundedRect(15, 27.5, 180, 11, 1.5, 1.5, 'FD');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9.5);
                doc.setTextColor(26, 32, 44);
                doc.text('PROPUESTA PERSONALIZADA DE SEGURO DE RETIRO', 105, 32, { align: 'center' });

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(71, 85, 105);
                doc.text(`Beneficiario: ${nombreJugador}   |   Club / Entidad: ${clubJugador}`, 105, 36.2, { align: 'center' });

                // 3. Sección 1: Parámetros del Plan
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(200, 16, 46);
                doc.text('1. PARÁMETROS DEL PLAN', 15, 43);

                doc.autoTable({
                    startY: 45,
                    margin: { left: 15, right: 15 },
                    theme: 'plain',
                    styles: {
                        fontSize: 7.2,
                        cellPadding: 1.8,
                        textColor: [30, 41, 59],
                        lineColor: [226, 232, 240],
                        lineWidth: 0.2
                    },
                    columnStyles: {
                        0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 42 },
                        1: { cellWidth: 48 },
                        2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 42 },
                        3: { cellWidth: 48 }
                    },
                    body: [
                        [
                            'Contrato Mensual:', formatCurrencyFull(res.params.salarioMensual),
                            'Meses de Aporte por Año:', `${res.params.mesesAporteAnio} meses / año`
                        ],
                        [
                            'Edad de Inicio:', `${res.params.edadInicio} años`,
                            'Años de Carrera Activa:', `${res.params.aniosAporte} años (hasta los ${res.edadFinCarrera})`
                        ],
                        [
                            'Edad de Acceso al Fondo:', `${res.params.edadRetiro} años`,
                            'Tasa Rentabilidad Anual:', `${(res.params.tasaInteresAnual * 100).toFixed(2)}% TNA`
                        ],
                        [
                            `Aporte Jugador (${(res.params.pctJugador * 100).toFixed(1)}%):`, `USD $${Math.round(res.params.salarioMensual * res.params.pctJugador)} / mes`,
                            `Aporte Club (${(res.params.pctClub * 100).toFixed(1)}%):`, `USD $${Math.round(res.params.salarioMensual * res.params.pctClub)} / mes`
                        ]
                    ]
                });

                // 4. Sección 2: Fondos Proyectados y Renta (3 KPI Cards)
                const yKpiTitle = doc.lastAutoTable.finalY + 4;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(200, 16, 46);
                doc.text('2. FONDOS PROYECTADOS Y RENTA DE RETIRO', 15, yKpiTitle);

                const yKpi = yKpiTitle + 2.5;
                const cardW = 57;
                const cardH = 20;

                // Card 1: Fin Carrera
                doc.setFillColor(245, 248, 255);
                doc.setDrawColor(190, 215, 250);
                doc.roundedRect(15, yKpi, cardW, cardH, 1.5, 1.5, 'FD');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.8);
                doc.setTextColor(30, 64, 175);
                doc.text(`FONDO FIN DE CARRERA (${res.edadFinCarrera} AÑOS)`, 17.5, yKpi + 4.5);
                doc.setFontSize(10.5);
                doc.text(formatCurrencyFull(res.finCarrera.saldoTotal), 17.5, yKpi + 10);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.2);
                doc.setTextColor(71, 85, 105);
                doc.text(`Equiv. a ${formatDecimal(res.finCarrera.mesesTotal)} meses de contrato`, 17.5, yKpi + 14.2);
                doc.setFontSize(5.8);
                doc.setTextColor(100, 116, 139);
                doc.text(`Jugador: ${formatCurrencyFull(res.finCarrera.saldoJugador)} | Club: ${formatCurrencyFull(res.finCarrera.saldoClub)}`, 17.5, yKpi + 17.8);

                // Card 2: Al Retiro
                doc.setFillColor(254, 242, 242);
                doc.setDrawColor(254, 202, 202);
                doc.roundedRect(76.5, yKpi, cardW, cardH, 1.5, 1.5, 'FD');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.8);
                doc.setTextColor(185, 28, 28);
                doc.text(`FONDO AL RETIRO (${res.params.edadRetiro} AÑOS)`, 79, yKpi + 4.5);
                doc.setFontSize(10.5);
                doc.text(formatCurrencyFull(res.retiro.saldoTotal), 79, yKpi + 10);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.2);
                doc.setTextColor(71, 85, 105);
                doc.text(`Equiv. a ${formatDecimal(res.retiro.mesesTotal)} meses (~${(res.retiro.mesesTotal / 12).toFixed(1)} años)`, 79, yKpi + 14.2);
                doc.setFontSize(5.8);
                doc.setTextColor(100, 116, 139);
                doc.text(`Jugador: ${formatCurrencyFull(res.retiro.saldoJugador)} | Club: ${formatCurrencyFull(res.retiro.saldoClub)}`, 79, yKpi + 17.8);

                // Card 3: Renta Mensual 20 Años
                doc.setFillColor(236, 253, 245);
                doc.setDrawColor(167, 243, 208);
                doc.roundedRect(138, yKpi, cardW, cardH, 1.5, 1.5, 'FD');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.8);
                doc.setTextColor(4, 120, 87);
                doc.text(`RENTA MENSUAL (20 AÑOS / 240 M)`, 140.5, yKpi + 4.5);
                doc.setFontSize(10.5);
                doc.text(formatCurrencyFull(res.rentaMensualEstimada), 140.5, yKpi + 10);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.2);
                doc.setTextColor(71, 85, 105);
                doc.text(`A partir de los ${res.params.edadRetiro} años garantizados`, 140.5, yKpi + 14.2);
                doc.setFontSize(5.8);
                doc.setTextColor(100, 116, 139);
                doc.text(`Renta cierta garantizada 20 años`, 140.5, yKpi + 17.8);

                // 5. Sección 3: Síntesis de Capitalización
                const ySumTitle = yKpi + cardH + 4;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(200, 16, 46);
                doc.text('3. SÍNTESIS DE CAPITALIZACIÓN', 15, ySumTitle);

                doc.autoTable({
                    startY: ySumTitle + 2,
                    margin: { left: 15, right: 15 },
                    theme: 'plain',
                    head: [['Concepto', 'Aporte Jugador', 'Aporte Club', 'Total Consolidado']],
                    headStyles: {
                        fillColor: [241, 245, 249],
                        textColor: [30, 41, 59],
                        fontStyle: 'bold',
                        fontSize: 7.2,
                        cellPadding: 1.8,
                        halign: 'center'
                    },
                    columnStyles: {
                        0: { fontStyle: 'normal', cellWidth: 57, halign: 'left' },
                        1: { halign: 'right', cellWidth: 41 },
                        2: { halign: 'right', cellWidth: 41 },
                        3: { halign: 'right', cellWidth: 41, fontStyle: 'bold', textColor: [200, 16, 46] }
                    },
                    bodyStyles: {
                        fontSize: 7.2,
                        cellPadding: 1.8,
                        textColor: [30, 41, 59],
                        lineColor: [226, 232, 240],
                        lineWidth: 0.2
                    },
                    body: [
                        ['Total Aportado en Efectivo', formatCurrencyFull(res.aportes.jugador), formatCurrencyFull(res.aportes.club), formatCurrencyFull(res.aportes.total)],
                        ['Ganancia por Interés Compuesto', formatCurrencyFull(intJ), formatCurrencyFull(intC), formatCurrencyFull(res.intereses)],
                        [`Fondo Final Acumulado a los ${res.params.edadRetiro} años`, formatCurrencyFull(res.retiro.saldoJugador), formatCurrencyFull(res.retiro.saldoClub), formatCurrencyFull(res.retiro.saldoTotal)]
                    ]
                });

                // 6. Sección 4: Gráfico de Evolución
                const yChartTitle = doc.lastAutoTable.finalY + 4;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(200, 16, 46);
                doc.text('4. PROYECCIÓN VISUAL Y ETAPAS DE CAPITALIZACIÓN', 15, yChartTitle);

                const evolutionImgData = getEvolutionChartBase64(1600, 720);
                if (evolutionImgData) {
                    const chartH = 82;
                    doc.addImage(evolutionImgData, 'PNG', 15, yChartTitle + 2, 180, chartH);
                }

                // Footer Página 1
                doc.setDrawColor(226, 232, 240);
                doc.line(15, 285, 195, 285);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.setTextColor(140, 140, 140);
                doc.text('Página 1 de 2  |  Simulación Oficial de Retiro Deportivo SIJUBARA', 105, 289, { align: 'center' });

                // ==========================================
                // PÁGINA 2: TORTA DE COMPOSICIÓN, MODALIDADES DE COBRO Y MARCO LEGAL
                // ==========================================
                doc.addPage();

                // 1. Header Página 2
                if (logoElement) {
                    try {
                        doc.addImage(logoElement, 'PNG', 15, 9, 36, 12);
                    } catch (e) {}
                }

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(200, 16, 46);
                doc.text('SEGURO DE RETIRO', 195, 13, { align: 'right' });

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7.5);
                doc.setTextColor(100, 116, 139);
                doc.text('PROYECCIÓN GRÁFICA Y ESTRUCTURA PREVISIONAL', 195, 17.5, { align: 'right' });

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(140, 150, 165);
                doc.text('Fecha: ' + currentDateStr, 195, 22, { align: 'right' });

                doc.setFillColor(200, 16, 46);
                doc.rect(15, 24.5, 180, 1.2, 'F');

                // 2. Sección 5: Torta de Composición del Fondo
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(200, 16, 46);
                doc.text(`5. ESTRUCTURA Y COMPOSICIÓN DEL FONDO AL RETIRO (${res.params.edadRetiro} AÑOS)`, 15, 31);

                doc.setFillColor(255, 255, 255);
                doc.setDrawColor(226, 232, 240);
                doc.roundedRect(15, 33.5, 180, 66, 2, 2, 'FD');

                const doughnutImgData = getSquareDoughnutBase64(res, 800);
                if (doughnutImgData) {
                    doc.addImage(doughnutImgData, 'PNG', 20, 36.5, 60, 60);
                }

                const xLeg = 85;
                const legW = 105;

                // Aporte Jugador
                doc.setFillColor(239, 246, 255);
                doc.roundedRect(xLeg, 36.5, legW, 10.5, 1, 1, 'F');
                doc.setFillColor(37, 99, 235);
                doc.circle(xLeg + 4, 36.5 + 5.25, 2.2, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7.8);
                doc.setTextColor(30, 58, 138);
                doc.text(`Aporte Jugador: ${pctJ.toFixed(1)}%`, xLeg + 9, 36.5 + 6.8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(71, 85, 105);
                doc.text(`( ${formatCurrencyFull(res.aportes.jugador)} )`, xLeg + 46, 36.5 + 6.8);

                // Aporte Club
                doc.setFillColor(236, 253, 245);
                doc.roundedRect(xLeg, 48.5, legW, 10.5, 1, 1, 'F');
                doc.setFillColor(16, 185, 129);
                doc.circle(xLeg + 4, 48.5 + 5.25, 2.2, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7.8);
                doc.setTextColor(6, 95, 70);
                doc.text(`Aporte Club: ${pctC.toFixed(1)}%`, xLeg + 9, 48.5 + 6.8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(71, 85, 105);
                doc.text(`( ${formatCurrencyFull(res.aportes.club)} )`, xLeg + 41, 48.5 + 6.8);

                // Rendimiento Compuesto
                doc.setFillColor(254, 242, 242);
                doc.roundedRect(xLeg, 60.5, legW, 10.5, 1, 1, 'F');
                doc.setFillColor(226, 0, 57);
                doc.circle(xLeg + 4, 60.5 + 5.25, 2.2, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7.8);
                doc.setTextColor(153, 27, 27);
                doc.text(`Rendimiento Compuesto: ${pctR.toFixed(1)}%`, xLeg + 9, 60.5 + 6.8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(71, 85, 105);
                doc.text(`( ${formatCurrencyFull(res.intereses)} )`, xLeg + 62, 60.5 + 6.8);

                // Nota explicativa
                doc.setFillColor(248, 250, 252);
                doc.setDrawColor(226, 232, 240);
                doc.roundedRect(xLeg, 73, legW, 23, 1, 1, 'FD');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.setTextColor(30, 41, 59);
                doc.text('Efecto Multiplicador del Tiempo:', xLeg + 3, 77.5);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.8);
                doc.setTextColor(71, 85, 105);
                const noteText = `El interés compuesto multiplica exponencialmente el capital: más del ${Math.round(pctR)}% del fondo final proviene de la etapa de capitalización pura sin aportes adicionales.`;
                doc.text(noteText, xLeg + 3, 81.8, { maxWidth: legW - 6, lineHeightFactor: 1.3 });

                // 3. Sección 6: Modalidades de Cobro al Retiro
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(200, 16, 46);
                doc.text(`6. MODALIDADES DE COBRO AL RETIRO (A LOS ${res.params.edadRetiro} AÑOS)`, 15, 104);

                const rentaTotal20Anios = res.rentaMensualEstimada * 240;
                const rentaVitaliciaEstimada = Math.round(res.retiro.saldoTotal * 0.0055);

                doc.autoTable({
                    startY: 106.5,
                    margin: { left: 15, right: 15 },
                    theme: 'plain',
                    head: [['Modalidad de Cobro', 'Monto Estimado', 'Plazo / Cobertura', 'Características y Beneficios']],
                    headStyles: {
                        fillColor: [241, 245, 249],
                        textColor: [30, 41, 59],
                        fontStyle: 'bold',
                        fontSize: 7.2,
                        cellPadding: 2,
                        halign: 'left'
                    },
                    columnStyles: {
                        0: { fontStyle: 'bold', cellWidth: 42 },
                        1: { fontStyle: 'bold', cellWidth: 35, halign: 'right', textColor: [200, 16, 46] },
                        2: { cellWidth: 33 },
                        3: { cellWidth: 70 }
                    },
                    bodyStyles: {
                        fontSize: 7,
                        cellPadding: 2.2,
                        textColor: [30, 41, 59],
                        lineColor: [226, 232, 240],
                        lineWidth: 0.2
                    },
                    body: [
                        [
                            'Renta Cierta 20 Años\n(240 meses garantizados)',
                            `${formatCurrencyFull(res.rentaMensualEstimada)} / mes`,
                            '20 años garantizados',
                            `Cobro mensual garantizado por 240 meses (Total: ${formatCurrencyFull(rentaTotal20Anios)}). En caso de fallecimiento, el cobro continúa para herederos.`
                        ],
                        [
                            'Renta Vitalicia Estimada',
                            `${formatCurrencyFull(rentaVitaliciaEstimada)} / mes`,
                            'De por vida',
                            `Cobro mensual vitalicio para el titular a partir de los ${res.params.edadRetiro} años.`
                        ],
                        [
                            'Retiro en Pago Único\n(Liquidación Total)',
                            formatCurrencyFull(res.retiro.saldoTotal),
                            'Pago inmediato',
                            'Disponibilidad del 100% del fondo total acumulado en una sola liquidación al alcanzar la edad de retiro.'
                        ]
                    ]
                });

                // 4. Sección 7: Marco Normativo y Aclaratorio
                const yLegalTitle = doc.lastAutoTable.finalY + 4;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(200, 16, 46);
                doc.text('7. MARCO NORMATIVO Y ACLARATORIO', 15, yLegalTitle);

                const yLegalBox = yLegalTitle + 2;
                doc.setFillColor(248, 250, 252);
                doc.setDrawColor(226, 232, 240);
                doc.roundedRect(15, yLegalBox, 180, 26, 1.5, 1.5, 'FD');

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.2);
                doc.setTextColor(71, 85, 105);
                const legalText = "Documento informativo de simulación actuarial emitido bajo el convenio SIJUBARA. El presente no constituye oferta ni garantía de cumplimiento. Se trata en una proyección bajo las condiciones, y supuestos establecidos, con fines ilustrativos. Ni la empresa de seguros, ni SIJUBARA garantiza que las rentabilidades se cumplan en el futuro.";
                doc.text(legalText, 18, yLegalBox + 6, { maxWidth: 174, lineHeightFactor: 1.35 });

                // 5. Firma Representante SIJUBARA / Asesor
                const ySig = yLegalBox + 34;
                doc.setDrawColor(100, 116, 139);
                doc.setLineWidth(0.4);
                doc.line(65, ySig + 16, 145, ySig + 16);

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.2);
                doc.setTextColor(30, 41, 59);
                doc.text('Representante SIJUBARA / Asesor', 105, ySig + 21, { align: 'center' });

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.2);
                doc.setTextColor(100, 116, 139);
                doc.text('Convenio Institucional de Retiro Deportivo', 105, ySig + 25, { align: 'center' });

                // Footer Página 2
                doc.setDrawColor(226, 232, 240);
                doc.line(15, 285, 195, 285);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                doc.setTextColor(140, 140, 140);
                doc.text('Página 2 de 2  |  Documento informativo de simulación actuarial', 105, 289, { align: 'center' });

                // Guardar archivo PDF
                const fileName = `Propuesta_Retiro_SIJUBARA_${nombreJugador.replace(/\s+/g, '_')}.pdf`;
                doc.save(fileName);

                if (toast) toast.style.display = 'none';

                if (window.confetti) {
                    window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
                }
            } catch (err) {
                console.error('Error generating vector PDF:', err);
                if (toast) toast.style.display = 'none';
                alert('Ocurrió un error al generar el PDF: ' + err.message);
            }
        });
    }

    updateUI();
});

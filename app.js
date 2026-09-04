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
            aniosAporte: aniosAporte,
            edadInicio: edadInicio,
            edadRetiro: edadRetiroVal,
            tasaInteresAnual: tasaAnual / 100,
            pctJugador: pctJ / 100,
            pctClub: pctC / 100
        };
    }

    function calculateSimulation(params) {
        const {
            salarioMensual,
            mesesAporteAnio,
            aniosAporte,
            edadInicio,
            edadRetiro,
            tasaInteresAnual,
            pctJugador,
            pctClub
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

        const totalAporteJugadorPuro = aporteJugadorMes * mesesAporteAnio * aniosAporte;
        const totalAporteClubPuro = aporteClubMes * mesesAporteAnio * aniosAporte;
        const totalAportePuro = totalAporteJugadorPuro + totalAporteClubPuro;
        const interesesGenerados = Math.max(0, estadoRetiro.saldoTotal - totalAportePuro);

        const tasaTecnicaAnual = Math.min(tasaInteresAnual, 0.05);
        const tasaRentaMensual = Math.pow(1 + tasaTecnicaAnual, 1 / 12) - 1;
        const mesesRenta = 240;
        const rentaMensualEstimada = estadoRetiro.saldoTotal > 0 
            ? estadoRetiro.saldoTotal * (tasaRentaMensual / (1 - Math.pow(1 + tasaRentaMensual, -mesesRenta)))
            : 0;

        return {
            params,
            tasaMensual,
            edadFinCarrera: edadInicio + aniosAporte,
            finCarrera: {
                edad: edadInicio + aniosAporte,
                saldoJugador: estadoFinCarrera.saldoJugador,
                saldoClub: estadoFinCarrera.saldoClub,
                saldoTotal: estadoFinCarrera.saldoTotal,
                mesesJugador: salarioMensual > 0 ? estadoFinCarrera.saldoJugador / salarioMensual : 0,
                mesesClub: salarioMensual > 0 ? estadoFinCarrera.saldoClub / salarioMensual : 0,
                mesesTotal: salarioMensual > 0 ? estadoFinCarrera.saldoTotal / salarioMensual : 0
            },
            retiro: {
                edad: edadRetiro,
                saldoJugador: estadoRetiro.saldoJugador,
                saldoClub: estadoRetiro.saldoClub,
                saldoTotal: estadoRetiro.saldoTotal,
                mesesJugador: salarioMensual > 0 ? estadoRetiro.saldoJugador / salarioMensual : 0,
                mesesClub: salarioMensual > 0 ? estadoRetiro.saldoClub / salarioMensual : 0,
                mesesTotal: salarioMensual > 0 ? estadoRetiro.saldoTotal / salarioMensual : 0
            },
            aportes: {
                jugador: totalAporteJugadorPuro,
                club: totalAporteClubPuro,
                total: totalAportePuro
            },
            intereses: interesesGenerados,
            multiplicadorGanancia: totalAportePuro > 0 ? estadoRetiro.saldoTotal / totalAportePuro : 1,
            rentaMensualEstimada: rentaMensualEstimada,
            annualData,
            monthlyData
        };
    }

    const periodZonesPlugin = {
        id: 'periodZones',
        beforeDraw: (chart) => {
            const { ctx, chartArea, scales: { x } } = chart;
            if (!chartArea || !lastSimulationResult) return;

            const res = lastSimulationResult;
            const edadFin = res.edadFinCarrera;
            const labels = chart.data.labels;
            const finIndex = labels.indexOf(`Edad ${edadFin}`);
            if (finIndex === -1) return;

            const xFin = x.getPixelForValue(finIndex);
            const xStart = chartArea.left;
            const xEnd = chartArea.right;
            const height = chartArea.bottom - chartArea.top;

            ctx.save();

            // Zona 1
            ctx.fillStyle = 'rgba(45, 79, 143, 0.08)';
            ctx.fillRect(xStart, chartArea.top, xFin - xStart, height);

            ctx.font = '700 11px Sora, sans-serif';
            ctx.fillStyle = '#1e3a8a';
            ctx.textAlign = 'center';
            const midZone1 = (xStart + xFin) / 2;
            if (xFin - xStart > 90) {
                ctx.fillText('Etapa Activa de Aportes', midZone1, chartArea.top + 22);
            }

            // Zona 2
            ctx.fillStyle = 'rgba(226, 0, 57, 0.05)';
            ctx.fillRect(xFin, chartArea.top, xEnd - xFin, height);

            ctx.font = '700 11px Sora, sans-serif';
            ctx.fillStyle = '#b91f38';
            ctx.textAlign = 'center';
            const midZone2 = (xFin + xEnd) / 2;
            if (xEnd - xFin > 110) {
                ctx.fillText('Capitalización Pura (Sin Aportes)', midZone2, chartArea.top + 22);
            }

            // Línea vertical
            ctx.strokeStyle = '#2d4f8f';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(xFin, chartArea.top);
            ctx.lineTo(xFin, chartArea.bottom);
            ctx.stroke();

            // Badge
            ctx.setLineDash([]);
            const badgeText = `Fin Carrera (${edadFin} años)`;
            ctx.font = 'bold 10px Sora, sans-serif';
            const textWidth = ctx.measureText(badgeText).width;
            const badgeWidth = textWidth + 16;
            const badgeHeight = 22;
            const badgeX = Math.min(Math.max(xFin - badgeWidth / 2, chartArea.left + 4), chartArea.right - badgeWidth - 4);
            const badgeY = chartArea.top + 34;

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
                data: {
                    labels: labels,
                    datasets: datasets
                },
                plugins: [periodZonesPlugin],
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { family: 'Sora', size: 12, weight: '600' },
                                usePointStyle: true,
                                boxWidth: 8,
                                padding: 16
                            }
                        },
                        tooltip: {
                            backgroundColor: '#162447',
                            titleFont: { family: 'Sora', size: 13, weight: '700' },
                            bodyFont: { family: 'Sora', size: 12 },
                            padding: 12,
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
                            ticks: {
                                font: { family: 'Sora', size: 11 },
                                maxTicksLimit: 12
                            }
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
                            backgroundColor: [
                                '#2d4f8f',
                                '#3ac792',
                                '#e20039'
                            ],
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
                            backgroundColor: '#162447',
                            titleFont: { family: 'Sora', size: 12, weight: '700' },
                            bodyFont: { family: 'Sora', size: 11 },
                            callbacks: {
                                label: function(context) {
                                    const val = context.raw;
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

    function renderTable(annualData, filterText = '') {
        if (!projectionTableBody) return;

        let filtered = annualData;
        if (filterText) {
            const f = filterText.toLowerCase().trim();
            filtered = annualData.filter(d => 
                d.edad.toString().includes(f) ||
                d.anio.toString().includes(f) ||
                `edad ${d.edad}`.includes(f) ||
                `año ${d.anio}`.includes(f)
            );
        }

        let rowsHTML = '';
        filtered.forEach(d => {
            rowsHTML += `
                <tr>
                    <td><strong>${d.edad} años</strong></td>
                    <td>Año ${d.anio}</td>
                    <td>${formatCurrencyFull(d.aporteAnualJugador)}</td>
                    <td>${formatCurrencyFull(d.aporteAnualClub)}</td>
                    <td><strong>${formatCurrencyFull(d.saldoJugador)}</strong></td>
                    <td><strong>${formatCurrencyFull(d.saldoClub)}</strong></td>
                    <td class="text-bold text-red">${formatCurrencyFull(d.saldoTotal)}</td>
                    <td class="text-green">+${formatCurrencyFull(d.rendimientoAnual)}</td>
                </tr>
            `;
        });

        projectionTableBody.innerHTML = rowsHTML;
        if (tableRowsInfo) {
            tableRowsInfo.textContent = `Mostrando ${filtered.length} de ${annualData.length} años proyectados`;
        }
    }

    function updateGoalCalculator(res) {
        if (!inputTargetAmount || !goalRequiredSalary) return;

        const target = parseFloat(inputTargetAmount.value) || 500000;
        const totalActual = res.retiro.saldoTotal;
        const salarioActual = res.params.salarioMensual;

        if (goalTargetDisplay) goalTargetDisplay.textContent = Math.round(target).toLocaleString('es-AR');
        if (goalEdadRetiroText) goalEdadRetiroText.textContent = res.params.edadRetiro;

        if (totalActual > 0 && salarioActual > 0) {
            const factor = target / totalActual;
            const requiredSalary = salarioActual * factor;
            const reqAporteJ = requiredSalary * res.params.pctJugador;
            const reqAporteC = requiredSalary * res.params.pctClub;

            goalRequiredSalary.textContent = formatCurrencyFull(requiredSalary);
            if (goalRequiredContributions) {
                goalRequiredContributions.innerHTML = `Tu aporte mensual: <strong>${formatCurrencyFull(reqAporteJ)}</strong> | Club: <strong>${formatCurrencyFull(reqAporteC)}</strong>`;
            }
        }
    }

    function updateUI() {
        const params = getInputs();
        const res = calculateSimulation(params);
        lastSimulationResult = res;

        pillEdadInicio.textContent = `${params.edadInicio} años`;
        pillAniosAporte.textContent = `${params.aniosAporte} años aporte`;
        pillEdadFin.textContent = `${res.edadFinCarrera} años`;
        pillAniosCrecimiento.textContent = `${params.edadRetiro - res.edadFinCarrera} años capitalización`;
        pillEdadRetiro.textContent = `${params.edadRetiro} años`;

        resEdadFinCarrera.textContent = res.edadFinCarrera;
        resFondoTotalFinCarrera.textContent = formatCurrencyFull(res.finCarrera.saldoTotal);
        resMultiplicadorFinCarrera.innerHTML = `<i data-lucide="award"></i> Equivalente a <strong>${formatDecimal(res.finCarrera.mesesTotal)} meses</strong> de sueldo`;
        resFondoJugadorFinCarrera.textContent = formatCurrencyFull(res.finCarrera.saldoJugador);
        resMesesJugadorFinCarrera.textContent = `(${formatDecimal(res.finCarrera.mesesJugador)} meses)`;
        resFondoClubFinCarrera.textContent = formatCurrencyFull(res.finCarrera.saldoClub);
        resMesesClubFinCarrera.textContent = `(${formatDecimal(res.finCarrera.mesesClub)} meses)`;

        resEdadRetiro.textContent = params.edadRetiro;
        resFondoTotalRetiro.textContent = formatCurrencyFull(res.retiro.saldoTotal);
        const aniosSueldo = (res.retiro.mesesTotal / 12).toFixed(1);
        resMultiplicadorRetiro.innerHTML = `<i data-lucide="trending-up"></i> Equivalente a <strong>${formatDecimal(res.retiro.mesesTotal)} meses</strong> de sueldo (~${aniosSueldo} años)`;
        resFondoJugadorRetiro.textContent = formatCurrencyFull(res.retiro.saldoJugador);
        resMesesJugadorRetiro.textContent = `(${formatDecimal(res.retiro.mesesJugador)} meses)`;
        resFondoClubRetiro.textContent = formatCurrencyFull(res.retiro.saldoClub);
        resMesesClubRetiro.textContent = `(${formatDecimal(res.retiro.mesesClub)} meses)`;

        resTotalAportadoPuro.textContent = formatCurrencyFull(res.aportes.total);
        resSubAportes.textContent = `Jugador: ${formatCurrencyFull(res.aportes.jugador)} | Club: ${formatCurrencyFull(res.aportes.club)}`;
        resInteresesGanados.textContent = formatCurrencyFull(res.intereses);
        resMultiplicadorGanancia.innerHTML = `El fondo se multiplicó <strong>${formatDecimal(res.multiplicadorGanancia)}x</strong> veces`;
        resRentaMensualEstimada.textContent = `${formatCurrencyFull(res.rentaMensualEstimada)} / mes`;
        resRentaEdad.textContent = params.edadRetiro;

        if (calcAporteJugadorMes) {
            calcAporteJugadorMes.textContent = `Equivale a: USD $${Math.round(params.salarioMensual * params.pctJugador)} / mes`;
        }
        if (calcAporteClubMes) {
            calcAporteClubMes.textContent = `Equivale a: USD $${Math.round(params.salarioMensual * params.pctClub)} / mes`;
        }
        if (calcTasaMensual) {
            calcTasaMensual.textContent = `Tasa mensual equivalente: ${(res.tasaMensual * 100).toFixed(4)}%`;
        }

        const benefitCoFinanced = document.getElementById('benefitCoFinanced');
        if (benefitCoFinanced) {
            const pctJNum = params.pctJugador * 100;
            const pctCNum = params.pctClub * 100;
            const immediateGainPct = pctJNum > 0 ? (pctCNum / pctJNum) * 100 : 0;
            benefitCoFinanced.innerHTML = `<strong>Aporte Co-Financiado:</strong> Tu club aporta un <strong>${formatDecimal(pctCNum, 1)}%</strong> adicional que incrementa directamente tu patrimonio. Esto significa una ganancia inmediata de <strong>${formatDecimal(immediateGainPct, 1)}%</strong> sobre tu aporte personal.`;
        }

        renderEvolutionChart(res);
        renderDoughnutChart(res);
        renderTable(res.annualData, tableSearchAge ? tableSearchAge.value : '');
        updateGoalCalculator(res);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function bindInputSync(rangeEl, inputEl) {
        if (!rangeEl || !inputEl) return;
        rangeEl.addEventListener('input', () => {
            inputEl.value = rangeEl.value;
            updateUI();
        });
        inputEl.addEventListener('input', () => {
            rangeEl.value = inputEl.value;
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

    // Exportación a PDF Oficial (2 Páginas)
    if (btnExportPDF) {
        btnExportPDF.addEventListener('click', () => {
            if (!lastSimulationResult) return;
            const res = lastSimulationResult;

            const nombreJugador = inputNombreJugador.value.trim() || 'Nombre y Apellido';
            const clubJugador = inputClubJugador.value.trim() || 'Club de Basquetbol';

            // 1. Llenar datos página 1
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

            const pdfRentaMensual = document.getElementById('pdfRentaMensual');
            const pdfRentaEdad = document.getElementById('pdfRentaEdad');
            if (pdfRentaMensual) pdfRentaMensual.textContent = formatCurrencyFull(res.rentaMensualEstimada);
            if (pdfRentaEdad) pdfRentaEdad.textContent = res.params.edadRetiro;

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

            // 2. Renderizar imágenes de los gráficos
            const pdfEvolutionChartImg = document.getElementById('pdfEvolutionChartImg');
            const pdfDoughnutChartImg = document.getElementById('pdfDoughnutChartImg');

            if (evolutionChartCanvas && pdfEvolutionChartImg) {
                pdfEvolutionChartImg.src = evolutionChartCanvas.toDataURL('image/png', 1.0);
            }
            if (doughnutChartCanvas && pdfDoughnutChartImg) {
                pdfDoughnutChartImg.src = doughnutChartCanvas.toDataURL('image/png', 1.0);
            }

            // 3. Llenar leyenda de torta página 2
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

            // 4. Mostrar y capturar PDF
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

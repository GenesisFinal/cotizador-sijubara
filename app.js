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
    const btnExportExcel = document.getElementById('btnExportExcel');
    const btnResetDefaults = document.getElementById('btnResetDefaults');

    let evolutionChartInstance = null;
    let doughnutChartInstance = null;
    let currentChartView = 'stacked';
    let lastSimulationResult = null;

    const formatUSD = (val) => '$' + Math.round(val).toLocaleString('es-AR');
    const formatCurrencyFull = (val) => 'USD $' + Math.round(val).toLocaleString('es-AR');
    const formatDecimal = (val, decimals = 1) => Number(val).toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

    function calculateRetirementPlan(params) {
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
        const edadFinCarrera = edadInicio + aniosAporte;
        const aniosTotalesProyeccion = Math.max(edadRetiro - edadInicio + 1, aniosAporte + 1, 50);
        const mesesTotales = aniosTotalesProyeccion * 12;

        let saldoJugador = 0.0;
        let saldoClub = 0.0;
        let totalAporteJugadorPuro = 0.0;
        let totalAporteClubPuro = 0.0;

        const monthlyData = [];
        const annualData = [];

        for (let monthIdx = 1; monthIdx <= mesesTotales; monthIdx++) {
            const anioIdx = Math.floor((monthIdx - 1) / 12) + 1;
            const mesEnAnio = ((monthIdx - 1) % 12) + 1;
            const edadActual = edadInicio + anioIdx - 1;

            monthlyData.push({
                monthIdx,
                anioIdx,
                mesEnAnio,
                edadActual,
                saldoJugador,
                saldoClub,
                saldoTotal: saldoJugador + saldoClub
            });

            let apJ = 0.0;
            let apC = 0.0;
            if (anioIdx <= aniosAporte && mesEnAnio <= mesesAporteAnio) {
                apJ = salarioMensual * pctJugador;
                apC = salarioMensual * pctClub;
                totalAporteJugadorPuro += apJ;
                totalAporteClubPuro += apC;
            }

            saldoJugador = saldoJugador * (1 + tasaMensual) + apJ * (1 + tasaMensual / 2);
            saldoClub = saldoClub * (1 + tasaMensual) + apC * (1 + tasaMensual / 2);

            if (mesEnAnio === 12) {
                const aporteAnualJ = anioIdx <= aniosAporte ? salarioMensual * pctJugador * mesesAporteAnio : 0;
                const aporteAnualC = anioIdx <= aniosAporte ? salarioMensual * pctClub * mesesAporteAnio : 0;

                annualData.push({
                    anio: anioIdx,
                    edad: edadActual,
                    esCarreraActiva: anioIdx <= aniosAporte,
                    esAnioRetiro: edadActual === edadRetiro,
                    aporteAnualJ,
                    aporteAnualC,
                    saldoJugador: saldoJugador,
                    saldoClub: saldoClub,
                    saldoTotal: saldoJugador + saldoClub
                });
            }
        }

        const finCarreraMonthIdx = aniosAporte * 12;
        const estadoFinCarrera = monthlyData[finCarreraMonthIdx] || monthlyData[monthlyData.length - 1];

        const anioRetiroIdx = edadRetiro - edadInicio + 1;
        const retiroMonthIdx = (anioRetiroIdx - 1) * 12;
        const estadoRetiro = (retiroMonthIdx >= 0 && retiroMonthIdx < monthlyData.length)
            ? monthlyData[retiroMonthIdx]
            : monthlyData[monthlyData.length - 1];

        const totalAportadoEfectivo = (salarioMensual * pctJugador * mesesAporteAnio * aniosAporte) +
                                      (salarioMensual * pctClub * mesesAporteAnio * aniosAporte);
        const totalAportadoJugadorEfectivo = salarioMensual * pctJugador * mesesAporteAnio * aniosAporte;
        const totalAportadoClubEfectivo = salarioMensual * pctClub * mesesAporteAnio * aniosAporte;

        const interesesTotalesRetiro = Math.max(0, estadoRetiro.saldoTotal - totalAportadoEfectivo);
        const multiplicadorCapital = totalAportadoEfectivo > 0 ? (estadoRetiro.saldoTotal / totalAportadoEfectivo) : 0;

        const tasaRentaMensual = Math.pow(1 + 0.04, 1 / 12) - 1;
        const mesesRenta = 240;
        const rentaMensualEstimada = estadoRetiro.saldoTotal * (tasaRentaMensual / (1 - Math.pow(1 + tasaRentaMensual, -mesesRenta)));

        return {
            params,
            edadFinCarrera,
            tasaMensual,
            finCarrera: {
                saldoJugador: estadoFinCarrera.saldoJugador,
                saldoClub: estadoFinCarrera.saldoClub,
                saldoTotal: estadoFinCarrera.saldoTotal,
                mesesJugador: estadoFinCarrera.saldoJugador / salarioMensual,
                mesesClub: estadoFinCarrera.saldoClub / salarioMensual,
                mesesTotal: estadoFinCarrera.saldoTotal / salarioMensual
            },
            retiro: {
                edad: edadRetiro,
                saldoJugador: estadoRetiro.saldoJugador,
                saldoClub: estadoRetiro.saldoClub,
                saldoTotal: estadoRetiro.saldoTotal,
                mesesJugador: estadoRetiro.saldoJugador / salarioMensual,
                mesesClub: estadoRetiro.saldoClub / salarioMensual,
                mesesTotal: estadoRetiro.saldoTotal / salarioMensual
            },
            aportes: {
                jugador: totalAportadoJugadorEfectivo,
                club: totalAportadoClubEfectivo,
                total: totalAportadoEfectivo
            },
            intereses: interesesTotalesRetiro,
            multiplicador: multiplicadorCapital,
            rentaMensual: rentaMensualEstimada,
            annualData,
            monthlyData
        };
    }

    function getInputs() {
        let salario = parseFloat(inputContrato.value) || 4000;
        let mesesAporte = parseInt(inputMesesAporte.value, 10) || 10;
        let edadInicio = parseInt(inputEdadInicio.value, 10) || 19;
        let aniosAporte = parseInt(inputAniosAporte.value, 10) || 18;
        let edadRetiroVal = parseInt(inputEdadRetiro.value, 10) || 65;
        let pctJ = (parseFloat(inputPctJugador.value) || 5.0) / 100;
        let pctC = (parseFloat(inputPctClub.value) || 3.0) / 100;
        let tasaAnual = (parseFloat(inputTasaAnual.value) || 5.0) / 100;

        if (mesesAporte > 12) mesesAporte = 12;
        if (mesesAporte < 1) mesesAporte = 1;
        if (edadInicio < 16) edadInicio = 16;
        if (aniosAporte < 1) aniosAporte = 1;
        if (edadRetiroVal <= edadInicio + aniosAporte) {
            edadRetiroVal = edadInicio + aniosAporte + 1;
            inputEdadRetiro.value = edadRetiroVal;
            rangeEdadRetiro.value = edadRetiroVal;
        }

        return {
            salarioMensual: salario,
            mesesAporteAnio: mesesAporte,
            aniosAporte: aniosAporte,
            edadInicio: edadInicio,
            edadRetiro: edadRetiroVal,
            tasaInteresAnual: tasaAnual,
            pctJugador: pctJ,
            pctClub: pctC
        };
    }

    function updateUI() {
        const params = getInputs();
        const res = calculateRetirementPlan(params);
        lastSimulationResult = res;

        displayContrato.textContent = formatCurrencyFull(params.salarioMensual);
        displayMesesAporte.textContent = `${params.mesesAporteAnio} meses`;
        displayEdadRetiro.textContent = `${params.edadRetiro} años`;

        calcAporteJugadorMes.textContent = `Equivale a: USD $${Math.round(params.salarioMensual * params.pctJugador)} / mes`;
        calcAporteClubMes.textContent = `Equivale a: USD $${Math.round(params.salarioMensual * params.pctClub)} / mes`;
        calcTasaMensual.textContent = `Tasa mensual equivalente: ${(res.tasaMensual * 100).toFixed(4)}%`;

        pillEdadInicio.textContent = `${params.edadInicio} años`;
        pillAniosAporte.textContent = `${params.aniosAporte} años aporte`;
        pillEdadFin.textContent = `${res.edadFinCarrera} años`;
        const aniosCap = Math.max(0, params.edadRetiro - res.edadFinCarrera);
        pillAniosCrecimiento.textContent = `${aniosCap} años sin aportes`;
        pillEdadRetiro.textContent = `${params.edadRetiro} años`;

        resEdadFinCarrera.textContent = res.edadFinCarrera;
        resFondoTotalFinCarrera.textContent = formatUSD(res.finCarrera.saldoTotal);
        resMultiplicadorFinCarrera.innerHTML = `<i data-lucide="award"></i> Equivalente a <strong>${formatDecimal(res.finCarrera.mesesTotal)} meses</strong> de sueldo`;
        resFondoJugadorFinCarrera.textContent = formatCurrencyFull(res.finCarrera.saldoJugador);
        resMesesJugadorFinCarrera.textContent = `(${formatDecimal(res.finCarrera.mesesJugador)} meses)`;
        resFondoClubFinCarrera.textContent = formatCurrencyFull(res.finCarrera.saldoClub);
        resMesesClubFinCarrera.textContent = `(${formatDecimal(res.finCarrera.mesesClub)} meses)`;

        resEdadRetiro.textContent = params.edadRetiro;
        resFondoTotalRetiro.textContent = formatUSD(res.retiro.saldoTotal);
        const aniosSueldoEquiv = (res.retiro.mesesTotal / 12).toFixed(1);
        resMultiplicadorRetiro.innerHTML = `<i data-lucide="trending-up"></i> Equivalente a <strong>${formatDecimal(res.retiro.mesesTotal)} meses</strong> de sueldo (~${aniosSueldoEquiv} años)`;
        resFondoJugadorRetiro.textContent = formatCurrencyFull(res.retiro.saldoJugador);
        resMesesJugadorRetiro.textContent = `(${formatDecimal(res.retiro.mesesJugador)} meses)`;
        resFondoClubRetiro.textContent = formatCurrencyFull(res.retiro.saldoClub);
        resMesesClubRetiro.textContent = `(${formatDecimal(res.retiro.mesesClub)} meses)`;

        resTotalAportadoPuro.textContent = formatCurrencyFull(res.aportes.total);
        resSubAportes.textContent = `Jugador: $${Math.round(res.aportes.jugador).toLocaleString('es-AR')} | Club: $${Math.round(res.aportes.club).toLocaleString('es-AR')}`;
        resInteresesGanados.textContent = formatCurrencyFull(res.intereses);
        resMultiplicadorGanancia.innerHTML = `El fondo se multiplicó <strong>${formatDecimal(res.multiplicador)}x</strong> veces`;
        resRentaMensualEstimada.textContent = `${formatCurrencyFull(res.rentaMensual)} / mes`;
        resRentaEdad.textContent = params.edadRetiro;

        renderEvolutionChart(res);
        renderDoughnutChart(res);
        renderProjectionTable(res);
        updateGoalCalculator(res);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function renderEvolutionChart(res) {
        if (!evolutionChartCanvas) return;

        const labels = res.annualData.map(d => `Edad ${d.edad}`);
        const dataJugador = res.annualData.map(d => Math.round(d.saldoJugador));
        const dataClub = res.annualData.map(d => Math.round(d.saldoClub));
        const dataTotal = res.annualData.map(d => Math.round(d.saldoTotal));

        let datasets = [];

        if (currentChartView === 'stacked') {
            datasets = [
                {
                    label: 'Fondo Jugador (USD)',
                    data: dataJugador,
                    backgroundColor: 'rgba(45, 79, 143, 0.45)',
                    borderColor: '#2d4f8f',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Fondo Aporte Club (USD)',
                    data: dataClub,
                    backgroundColor: 'rgba(58, 199, 146, 0.45)',
                    borderColor: '#3ac792',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }
            ];
        } else {
            datasets = [
                {
                    label: 'Fondo Total Acumulado (USD)',
                    data: dataTotal,
                    borderColor: '#e20039',
                    backgroundColor: 'rgba(226, 0, 57, 0.08)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3
                },
                {
                    label: 'Fondo Jugador (USD)',
                    data: dataJugador,
                    borderColor: '#2d4f8f',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [4, 4],
                    tension: 0.3
                },
                {
                    label: 'Fondo Club (USD)',
                    data: dataClub,
                    borderColor: '#3ac792',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [4, 4],
                    tension: 0.3
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
                                boxWidth: 8
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

        const valJugador = Math.round(res.aportes.jugador);
        const valClub = Math.round(res.aportes.club);
        const valIntereses = Math.round(res.intereses);
        const total = valJugador + valClub + valIntereses;

        const pctInteres = total > 0 ? ((valIntereses / total) * 100).toFixed(1) : 0;
        doughnutSummaryText.innerHTML = `El <strong>${pctInteres}%</strong> de tu fondo al retiro proviene de la rentabilidad del interés compuesto.`;

        const chartData = {
            labels: ['Aportes del Jugador', 'Aportes del Club', 'Intereses y Rendimientos'],
            datasets: [{
                data: [valJugador, valClub, valIntereses],
                backgroundColor: ['#2d4f8f', '#3ac792', '#e20039'],
                hoverOffset: 6,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        if (doughnutChartInstance) {
            doughnutChartInstance.data = chartData;
            doughnutChartInstance.update();
        } else {
            const ctx = doughnutChartCanvas.getContext('2d');
            doughnutChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { family: 'Sora', size: 11, weight: '600' },
                                usePointStyle: true,
                                padding: 14
                            }
                        },
                        tooltip: {
                            backgroundColor: '#162447',
                            callbacks: {
                                label: function(context) {
                                    const val = context.raw;
                                    const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                                    return ` ${context.label}: USD $${val.toLocaleString('es-AR')} (${pct}%)`;
                                }
                            }
                        }
                    },
                    cutout: '62%'
                }
            });
        }
    }

    function renderProjectionTable(res) {
        if (!projectionTableBody) return;

        const filter = (tableSearchAge.value || '').trim().toLowerCase();
        let rowsHtml = '';
        let count = 0;

        let prevSaldo = 0;
        res.annualData.forEach((row) => {
            const matchFilter = filter === '' ||
                                String(row.edad).includes(filter) ||
                                String(row.anio).includes(filter);

            if (matchFilter) {
                count++;
                const rendAnual = Math.max(0, row.saldoTotal - prevSaldo - row.aporteAnualJ - row.aporteAnualC);
                
                let rowClass = '';
                if (row.edad === res.edadFinCarrera) rowClass = 'highlight-career';
                if (row.edad === res.retiro.edad) rowClass = 'highlight-retirement';

                rowsHtml += `
                    <tr class="${rowClass}">
                        <td><strong>${row.edad} años</strong></td>
                        <td>Año ${row.anio}</td>
                        <td>${row.aporteAnualJ > 0 ? '$' + Math.round(row.aporteAnualJ).toLocaleString('es-AR') : '-'}</td>
                        <td>${row.aporteAnualC > 0 ? '$' + Math.round(row.aporteAnualC).toLocaleString('es-AR') : '-'}</td>
                        <td>$${Math.round(row.saldoJugador).toLocaleString('es-AR')}</td>
                        <td>$${Math.round(row.saldoClub).toLocaleString('es-AR')}</td>
                        <td><strong>$${Math.round(row.saldoTotal).toLocaleString('es-AR')}</strong></td>
                        <td class="text-green">+$${Math.round(rendAnual).toLocaleString('es-AR')}</td>
                    </tr>
                `;
            }
            prevSaldo = row.saldoTotal;
        });

        projectionTableBody.innerHTML = rowsHtml;
        tableRowsInfo.textContent = `Mostrando ${count} de ${res.annualData.length} años de proyección`;
    }

    function updateGoalCalculator(res) {
        const target = parseFloat(inputTargetAmount.value) || 500000;
        goalEdadRetiroText.textContent = res.params.edadRetiro;
        goalTargetDisplay.textContent = Math.round(target).toLocaleString('es-AR');

        const currentSalary = res.params.salarioMensual;
        const currentFundAtRetirement = res.retiro.saldoTotal;

        if (currentFundAtRetirement > 0) {
            const factorUnitario = currentFundAtRetirement / currentSalary;
            const requiredSalary = target / factorUnitario;
            const requiredPlayerContrib = requiredSalary * res.params.pctJugador;
            const requiredClubContrib = requiredSalary * res.params.pctClub;

            goalRequiredSalary.textContent = formatCurrencyFull(requiredSalary);
            goalRequiredContributions.innerHTML = `Tu aporte mensual: <strong>USD $${Math.round(requiredPlayerContrib).toLocaleString('es-AR')}</strong> | Club: <strong>USD $${Math.round(requiredClubContrib).toLocaleString('es-AR')}</strong>`;
        }
    }

    function bindInputSync(rangeEl, inputEl) {
        rangeEl.addEventListener('input', () => {
            inputEl.value = rangeEl.value;
            updateUI();
        });
        inputEl.addEventListener('input', () => {
            rangeEl.value = inputEl.value;
            updateUI();
        });
    }

    bindInputSync(rangeContrato, inputContrato);
    bindInputSync(rangeMesesAporte, inputMesesAporte);
    bindInputSync(rangeEdadRetiro, inputEdadRetiro);

    [inputEdadInicio, inputAniosAporte, inputPctJugador, inputPctClub, inputTasaAnual].forEach(el => {
        el.addEventListener('input', updateUI);
    });

    inputTargetAmount.addEventListener('input', () => {
        if (lastSimulationResult) updateGoalCalculator(lastSimulationResult);
    });

    tableSearchAge.addEventListener('input', () => {
        if (lastSimulationResult) renderProjectionTable(lastSimulationResult);
    });

    if (chartViewToggle) {
        chartViewToggle.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                chartViewToggle.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentChartView = btn.getAttribute('data-view');
                if (lastSimulationResult) renderEvolutionChart(lastSimulationResult);
            });
        });
    }

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
        inputTargetAmount.value = 500000;
        tableSearchAge.value = '';
        updateUI();
    });

    btnExportExcel.addEventListener('click', () => {
        if (!lastSimulationResult) return;
        const res = lastSimulationResult;

        let csv = 'Edad;Año;Aporte Anual Jugador (USD);Aporte Anual Club (USD);Saldo Jugador (USD);Saldo Club (USD);Fondo Total (USD)\r\n';
        res.annualData.forEach(r => {
            csv += `${r.edad};${r.anio};${Math.round(r.aporteAnualJ)};${Math.round(r.aporteAnualC)};${Math.round(r.saldoJugador)};${Math.round(r.saldoClub)};${Math.round(r.saldoTotal)}\r\n`;
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Proyeccion_Retiro_SIJUBARA_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });

    btnExportPDF.addEventListener('click', () => {
        if (!lastSimulationResult) return;
        const res = lastSimulationResult;

        const nombreJugador = inputNombreJugador.value.trim() || 'Jugador Profesional de Básquet';
        const clubJugador = inputClubJugador.value.trim() || 'Club Asociado SIJUBARA';

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
        document.getElementById('pdfKpiEquivFin').textContent = `Equivalente a ${formatDecimal(res.finCarrera.mesesTotal)} meses de sueldo`;
        document.getElementById('pdfKpiJFin').textContent = formatCurrencyFull(res.finCarrera.saldoJugador);
        document.getElementById('pdfKpiCFin').textContent = formatCurrencyFull(res.finCarrera.saldoClub);

        document.getElementById('pdfKpiEdadRet').textContent = res.params.edadRetiro;
        document.getElementById('pdfKpiTotalRet').textContent = formatCurrencyFull(res.retiro.saldoTotal);
        document.getElementById('pdfKpiEquivRet').textContent = `Equivalente a ${formatDecimal(res.retiro.mesesTotal)} meses de sueldo (~${(res.retiro.mesesTotal/12).toFixed(1)} años)`;
        document.getElementById('pdfKpiJRet').textContent = formatCurrencyFull(res.retiro.saldoJugador);
        document.getElementById('pdfKpiCRet').textContent = formatCurrencyFull(res.retiro.saldoClub);

        document.getElementById('pdfSumAporteJ').textContent = formatCurrencyFull(res.aportes.jugador);
        document.getElementById('pdfSumAporteC').textContent = formatCurrencyFull(res.aportes.club);
        document.getElementById('pdfSumAporteTot').textContent = formatCurrencyFull(res.aportes.total);

        const intJ = Math.max(0, res.retiro.saldoJugador - res.aportes.jugador);
        const intC = Math.max(0, res.retiro.saldoClub - res.aportes.club);
        document.getElementById('pdfSumInteresJ').textContent = formatCurrencyFull(intJ);
        document.getElementById('pdfSumInteresC').textContent = formatCurrencyFull(intC);
        document.getElementById('pdfSumInteresTot').textContent = formatCurrencyFull(res.intereses);

        document.getElementById('pdfSumEdadFinal').textContent = res.params.edadRetiro;
        document.getElementById('pdfSumFinalJ').textContent = formatCurrencyFull(res.retiro.saldoJugador);
        document.getElementById('pdfSumFinalC').textContent = formatCurrencyFull(res.retiro.saldoClub);
        document.getElementById('pdfSumFinalTot').textContent = formatCurrencyFull(res.retiro.saldoTotal);

        const element = document.getElementById('pdfExportTemplate');
        element.style.display = 'block';

        const opt = {
            margin: 10,
            filename: `Propuesta_Retiro_SIJUBARA_${nombreJugador.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        if (window.html2pdf) {
            window.html2pdf().set(opt).from(element).save().then(() => {
                element.style.display = 'none';
                if (window.confetti) {
                    window.confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
                }
            });
        } else {
            element.style.display = 'none';
            window.print();
        }
    });

    updateUI();
});

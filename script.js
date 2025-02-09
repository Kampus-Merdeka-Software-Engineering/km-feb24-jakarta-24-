document.addEventListener('DOMContentLoaded', () => {
    let originalData = [];
    let topBottomData = [];
    let peakHoursData = [];
    let salesGrowthData = [];
    let salesGrowthDayData = [];
    let salesData = [];
    let tableData = [];
    let unsortedTableData = [];

    // Chart instances
    let lineChart, doughnutChart, barChart, pieChart, barChart1;

    // Fetching JSON files
    Promise.all([
        fetch('datafull.json').then(response => response.json()),
        fetch('topbottom.json').then(response => response.json()),
        fetch('peakhours.json').then(response => response.json()),
        fetch('salesgrowth.json').then(response => response.json()),
        fetch('salesgrowthday.json').then(response => response.json()),
        fetch('sales.json').then(response => response.json()),
        fetch('table.json').then(response => response.json())
    ])
    .then(([data, topBottom, peakHours, salesGrowth, salesGrowthDay, sales, table]) => {
        console.log('Fetched data:', data);
        console.log('Fetched topBottom data:', topBottom);
        console.log('Fetched peakHours data:', peakHours);
        console.log('Fetched salesGrowth data:', salesGrowth);
        console.log('Fetched salesGrowthDay data:', salesGrowthDay);
        console.log('Fetched sales data:', sales);
        console.log('Fetched table data:', table);

        originalData = data;
        topBottomData = topBottom;
        peakHoursData = peakHours;
        salesGrowthData = salesGrowth;
        salesGrowthDayData = salesGrowthDay;
        salesData = sales;
        tableData = table;
        unsortedTableData = table.slice().sort((a, b) => b.Quantity - a.Quantity);;

        renderCharts(originalData, topBottomData, peakHoursData, salesGrowthData);
        updateRevenueAndPizzaSold(salesData, 'All');
        populateTable(tableData);

        console.log('Initialized salesGrowthDayData:', salesGrowthDayData);
    })
    .catch(error => console.error('Error fetching data:', error));

    const filterDataButton = document.getElementById('filterDataButton');
    const filterControlPanel = document.getElementById('filterControlPanel');
    const monthSelect = document.getElementById('monthSelect');
    const filterButton = document.getElementById('filterButton');
    const closeFilterPanel = document.getElementById('closeFilterPanel');

    filterDataButton.addEventListener('click', () => {
        filterControlPanel.style.display = filterControlPanel.style.display === 'none' ? 'block' : 'none';
    });

    closeFilterPanel.addEventListener('click', () => {
        filterControlPanel.style.display = 'none';
    });
    

    filterButton.addEventListener('click', () => {
        const selectedMonth = monthSelect.value;
        const filteredData = filterDataByMonth(originalData, selectedMonth);
        const filteredTopBottomData = filterDataByMonth(topBottomData, selectedMonth, 'topbottom');
        const filteredPeakHoursData = filterDataByMonth(peakHoursData, selectedMonth, 'peakhours');
        const filteredSalesGrowthData = filterSalesGrowthDataByMonth(salesGrowthData, selectedMonth, salesGrowthDayData);
        const filteredTableData = filterDataByMonth(tableData, selectedMonth);

        console.log(`Filtered data for month ${selectedMonth}:`, filteredData);
        console.log(`Filtered top-bottom data for month ${selectedMonth}:`, filteredTopBottomData);
        console.log(`Filtered peak hours data for month ${selectedMonth}:`, filteredPeakHoursData);
        console.log(`Filtered sales growth data for month ${selectedMonth}:`, filteredSalesGrowthData);
        console.log(`Filtered sales growth data for month ${selectedMonth}:`, filteredTableData);

        updateCharts(filteredData, filteredTopBottomData, filteredPeakHoursData, filteredSalesGrowthData);
        updateRevenueAndPizzaSold(salesData, selectedMonth);
        updatePieChart(pieChart, peakHoursData);
    });

    function filterDataByMonth(data, month, type = 'general') {
        if (month === 'All') {
            return data;
        }
        const monthIndex = new Date(Date.parse(month + " 1, 2023")).getMonth() + 1;
        if (type === 'topbottom' || type === 'peakhours') {
            return data.filter(item => item[" Month"] === month);
        } else {
            return data.filter(item => {
                const itemMonth = new Date(item.date).getMonth() + 1;
                return itemMonth === monthIndex;
            });
        }
    }

    function filterSalesGrowthDataByMonth(salesGrowthData, month, salesGrowthDayData) {
        console.log('filterSalesGrowthDataByMonth called with:', { salesGrowthData, month, salesGrowthDayData });
        if (month === 'All') {
            return salesGrowthData;
        }
        if (!salesGrowthDayData) {
            console.error('salesGrowthDayData is undefined');
            return [];
        }
        return salesGrowthDayData.filter(item => {
            const itemMonth = new Date(item.Date).toLocaleString('default', { month: 'long' });
            return itemMonth === month;
        });
    }

    function renderCharts(data, topBottomData, peakHoursData, salesGrowthData) {
        lineChart = renderLineChart(salesGrowthData);
        doughnutChart = renderDoughnutChart(data);
        barChart = renderBarChart(topBottomData);
        pieChart = renderPieChart(peakHoursData);
        barChart1 = renderBarChart1(topBottomData);
    }

    function updateCharts(data, topBottomData, peakHoursData, salesGrowthData) {
        updateLineChart(lineChart, salesGrowthData);
        updateDoughnutChart(doughnutChart, data);
        updateBarChart(barChart, topBottomData);
        updatePieChart(pieChart, peakHoursData);
        updateBarChart1(barChart1, topBottomData);
    }



    function updateRevenueAndPizzaSold(data, month) {
        console.log('updateRevenueAndPizzaSold called with month:', month);
        console.log('Data received:', data);
    
        let revenue = 0;
        let pizzaSold = 0;
    
        if (month === 'All') {
            data.forEach(item => {
                console.log('Processing item:', item);
                let itemRevenue = parseFloat(item.Revenue); // Menggunakan item.Revenue
                let itemPizzaSold = parseInt(item['pizza sold']); // Menggunakan item['pizza sold']
                if (!isNaN(itemRevenue) && !isNaN(itemPizzaSold)) {
                    revenue += itemRevenue;
                    pizzaSold += itemPizzaSold;
                } else {
                    console.warn('Invalid data for item:', item);
                }
            });
        } else {
            const monthData = data.filter(item => item.Month === month); // Menggunakan item.Month
            console.log('Filtered month data:', monthData);
            monthData.forEach(item => {
                console.log('Processing item:', item);
                let itemRevenue = parseFloat(item.Revenue); // Menggunakan item.Revenue
                let itemPizzaSold = parseInt(item['pizza sold']); // Menggunakan item['pizza sold']
                if (!isNaN(itemRevenue) && !isNaN(itemPizzaSold)) {
                    revenue += itemRevenue;
                    pizzaSold += itemPizzaSold;
                } else {
                    console.warn('Invalid data for item:', item);
                }
            });
        }
    
        console.log('Calculated revenue:', revenue);
        console.log('Calculated pizzaSold:', pizzaSold);
    
        const revenueElement = document.querySelector('.card-score-revenue');
        const pizzaSoldElement = document.querySelector('.card-score-pizzasold');
    
        if (revenueElement && pizzaSoldElement) {
            revenueElement.textContent = `$ ${revenue.toFixed(2)}`;
            pizzaSoldElement.textContent = pizzaSold;
        } else {
            console.error('Elements .card-score-revenue or .card-score-pizzasold not found');
        }
    }
    
    


    //Sales Growth
    function renderLineChart(data) {
        const ctx = document.getElementById('lineChart').getContext('2d');
        const labels = [];
        const salesGrowth = [];

        data.forEach(item => {
            if (item.Date) {
                labels.push(item.Date);
            } else {
                labels.push(item.Month);
            }
            salesGrowth.push(parseFloat(item["Persentase perubahan"]));
        });

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales Growth',
                    data: salesGrowth,
                    backgroundColor: 'rgba(155, 130, 49, 1)',
                    borderColor: 'rgb(155, 130, 49)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + "%";
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + "%";
                            }
                        }
                    }
                }
            }
        });
    }

    function updateLineChart(chart, data) {
        const labels = [];
        const salesGrowth = [];

        data.forEach(item => {
            if (item.Date) {
                labels.push(item.Date);
            } else {
                labels.push(item.Month);
            }
            salesGrowth.push(parseFloat(item["Persentase perubahan"]));
        });

        chart.data.labels = labels;
        chart.data.datasets[0].data = salesGrowth;
        chart.update();
    }

    function renderDoughnutChart(data) {
        const ctx = document.getElementById('Size').getContext('2d');
        const sizesSummary = { 'L': 0, 'M': 0, 'S': 0, 'XL': 0, 'XXL': 0 };

        data.forEach(item => {
            const size = item.size;
            const quantity = parseInt(item.quantity);
            if (sizesSummary[size] !== undefined) {
                sizesSummary[size] += quantity;
            }
        });

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(sizesSummary),
                datasets: [{
                    label: 'Sales By Size',
                    data: Object.values(sizesSummary),
                    backgroundColor: [
                        'rgba(255, 131, 71, 1)',
                        'rgba(255, 131, 71, 1)',
                        'rgba(255, 131, 71, 1)',
                        'rgba(255, 131, 71, 1)',
                        'rgba(255, 131, 71, 1)',
                        'rgba(255, 131, 71, 1)'
                    ],
                    borderColor: [
                        'rgba(255, 131, 71, 1)',
                        'rgba(255, 131, 71, 1)',
                        'rgba(255, 131, 71, 1)',
                        'rgba(255, 131, 71, 1)',
                        'rgba(255, 131, 71, 1)',
                        'rgba(255, 131, 71, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    function updateDoughnutChart(chart, data) {
        const sizesSummary = { 'L': 0, 'M': 0, 'S': 0, 'XL': 0, 'XXL': 0 };

        data.forEach(item => {
            const size = item.size;
            const quantity = parseInt(item.quantity);
            if (sizesSummary[size] !== undefined) {
                sizesSummary[size] += quantity;
            }
        });

        chart.data.datasets[0].data = Object.values(sizesSummary);
        chart.update();
    }

    function renderBarChart(topBottomData) {
        const ctx = document.getElementById('BarChart').getContext('2d');
        const selectedMonth = monthSelect.value || 'All';
        let top5 = [];

        if (selectedMonth === 'All') {
            const yearlyData = {};

            topBottomData.forEach(monthData => {
                Object.entries(monthData).forEach(([key, value]) => {
                    if (key !== ' Month') {
                        if (!yearlyData[key]) {
                            yearlyData[key] = 0;
                        }
                        yearlyData[key] += parseInt(value);
                    }
                });
            });

            top5 = getTop5Pizzas(yearlyData);
        } else {
            const monthData = topBottomData.find(item => item[" Month"] === selectedMonth);
            if (monthData) {
                top5 = getTop5Pizzas(monthData);
            }
        }

        const pizzaNames = top5.map(item => item[0]);
        const quantities = top5.map(item => parseInt(item[1]));

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: pizzaNames,
                datasets: [{
                    label: 'Best-Seller',
                    data: quantities,
                    backgroundColor: [
                        'rgba(39, 209, 231, 1)',
                        'rgba(39, 209, 231, 1)',
                        'rgba(39, 209, 231, 1)',
                        'rgba(39, 209, 231, 1)',
                        'rgba(39, 209, 231, 1)',
                        'rgba(39, 209, 231, 1)'
                    ],
                    borderColor: [
                        'rgba(39, 209, 231, 1)',
                        'rgba(39, 209, 231, 1)',
                        'rgba(39, 209, 231, 1)',
                        'rgba(39, 209, 231, 1)',
                        'rgba(39, 209, 231, 1)',
                        'rgba(39, 209, 231, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateBarChart(chart, topBottomData) {
        const selectedMonth = monthSelect.value || 'All';
        let top5 = [];

        if (selectedMonth === 'All') {
            const yearlyData = {};

            topBottomData.forEach(monthData => {
                Object.entries(monthData).forEach(([key, value]) => {
                    if (key !== ' Month') {
                        if (!yearlyData[key]) {
                            yearlyData[key] = 0;
                        }
                        yearlyData[key] += parseInt(value);
                    }
                });
            });

            top5 = getTop5Pizzas(yearlyData);
        } else {
            const monthData = topBottomData.find(item => item[" Month"] === selectedMonth);
            if (monthData) {
                top5 = getTop5Pizzas(monthData);
            }
        }

        const pizzaNames = top5.map(item => item[0]);
        const quantities = top5.map(item => parseInt(item[1]));

        chart.data.labels = pizzaNames;
        chart.data.datasets[0].data = quantities;
        chart.update();
    }

    function getTop5Pizzas(data) {
        const pizzas = Object.entries(data)
            .filter(([key, value]) => key !== ' Month')
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        return pizzas;
    }

    
    
    function renderPieChart(peakHoursData) {
        try {
            if (!peakHoursData || peakHoursData.length === 0) {
                console.error('Peak hours data is empty or invalid:', peakHoursData);
                return;
            }
    
            const ctx = document.getElementById('pieChart').getContext('2d');
            const selectedMonth = monthSelect.value || 'All';
            let top5PeakHours = [];
    
            if (selectedMonth === 'All') {
                top5PeakHours = getTop5PeakHours(peakHoursData);
            } else {
                const monthData = peakHoursData.filter(item => item["Month"] === selectedMonth);
                console.log('Filtered Month Data:', monthData);
                if (monthData.length > 0) {
                    top5PeakHours = getTop5PeakHours(monthData);
                }
            }
    
            console.log('Selected Month:', selectedMonth);
            console.log('Top 5 Peak Hours:', top5PeakHours);
    
            if (top5PeakHours.length === 0) {
                console.error('No peak hours data found for the selected criteria');
                return;
            }
    
            const peakHours = top5PeakHours.map(item => item["time-hour"]);
            const quantities = top5PeakHours.map(item => parseInt(item["SUM of quantity"]));
    
            console.log('Peak Hours:', peakHours);
            console.log('Quantities:', quantities);
    
            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: peakHours,
                    datasets: [{
                        label: 'Top 5 Peak Hours',
                        data: quantities,
                        backgroundColor: [
                            'rgba(255, 227, 130, 1)',
                            'rgba(255, 227, 130, 1)',
                            'rgba(255, 227, 130, 1',
                            'rgba(255, 227, 130, 1)',
                            'rgba(255, 227, 130, 1)',
                            'rgba(255, 227, 130, 1)'
                        ],
                        borderColor: [
                            'rgba(255, 227, 130, 1)',
                            'rgba(255, 227, 130, 1)',
                            'rgba(255, 227, 130, 1)',
                            'rgba(255, 227, 130, 1)',
                            'rgba(255, 227, 130, 1)',
                            'rgba(255, 227, 130, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true
                }
            });
        } catch (error) {
            console.error('Error rendering pie chart:', error);
        }
    }
    
    function getTop5PeakHours(data) {
        const aggregatedData = {};
        data.forEach(item => {
            const hour = item["time-hour"];
            const quantity = parseInt(item["SUM of quantity"]);
            if (!aggregatedData[hour]) {
                aggregatedData[hour] = 0;
            }
            aggregatedData[hour] += quantity;
        });
    
        const sortedHours = Object.keys(aggregatedData).sort((a, b) => aggregatedData[b] - aggregatedData[a]);
        const top5Hours = sortedHours.slice(0, 5);
        return top5Hours.map(hour => ({ "time-hour": hour, "SUM of quantity": aggregatedData[hour] }));
    }
    
    function updatePieChart(chart, peakHoursData) {
        try {
            const selectedMonth = monthSelect.value || 'All';
            console.log('updatePieChart called. Selected Month:', selectedMonth);
            let top5PeakHours = [];
    
            if (selectedMonth === 'All') {
                top5PeakHours = getTop5PeakHours(peakHoursData);
            } else {
                const monthData = peakHoursData.filter(item => item["Month"] === selectedMonth);
                console.log('Filtered Month Data:', monthData);
                if (monthData.length > 0) {
                    top5PeakHours = getTop5PeakHours(monthData);
                }
            }
    
            console.log('Top 5 Peak Hours:', top5PeakHours);
    
            if (top5PeakHours.length === 0) {
                console.error('No peak hours data found for the selected criteria');
                return;
            }
    
            const peakHours = top5PeakHours.map(item => item["time-hour"]);
            const quantities = top5PeakHours.map(item => parseInt(item["SUM of quantity"]));
    
            console.log('Peak Hours:', peakHours);
            console.log('Quantities:', quantities);
    
            chart.data.labels = peakHours;
            chart.data.datasets[0].data = quantities;
            chart.update();
        } catch (error) {
            console.error('Error updating pie chart:', error);
        }
    }
    
    
    

    function renderBarChart1(topBottomData) {
        const ctx = document.getElementById('Bar-chart1').getContext('2d');
        const selectedMonth = monthSelect.value || 'All';
        let bottom5 = [];

        if (selectedMonth === 'All') {
            const yearlyData = {};

            topBottomData.forEach(monthData => {
                Object.entries(monthData).forEach(([key, value]) => {
                    if (key !== ' Month') {
                        if (!yearlyData[key]) {
                            yearlyData[key] = 0;
                        }
                        yearlyData[key] += parseInt(value);
                    }
                });
            });

            bottom5 = getBottom5Pizzas(yearlyData);
        } else {
            const monthData = topBottomData.find(item => item[" Month"] === selectedMonth);
            if (monthData) {
                bottom5 = getBottom5Pizzas(monthData);
            }
        }

        const pizzaNames = bottom5.map(item => item[0]);
        const quantities = bottom5.map(item => parseInt(item[1]));

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: pizzaNames,
                datasets: [{
                    label: 'Non Best-Seller',
                    data: quantities,
                    backgroundColor: [
                        'rgba(49, 57, 175, 1)',
                        'rgba(49, 57, 175, 1)',
                        'rgba(49, 57, 175, 1)',
                        'rgba(49, 57, 175, 1)',
                        'rgba(49, 57, 175, 1)',
                        'rgba(49, 57, 175, 1)'
                    ],
                    borderColor: [
                        'rgba(49, 57, 175, 1)',
                        'rgba(49, 57, 175, 1)',
                        'rgba(49, 57, 175, 1)',
                        'rgba(49, 57, 175, 1)',
                        'rgba(49, 57, 175, 1)',
                        'rgba(49, 57, 175, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateBarChart1(chart, topBottomData) {
        const selectedMonth = monthSelect.value || 'All';
        let bottom5 = [];

        if (selectedMonth === 'All') {
            const yearlyData = {};

            topBottomData.forEach(monthData => {
                Object.entries(monthData).forEach(([key, value]) => {
                    if (key !== ' Month') {
                        if (!yearlyData[key]) {
                            yearlyData[key] = 0;
                        }
                        yearlyData[key] += parseInt(value);
                    }
                });
            });

            bottom5 = getBottom5Pizzas(yearlyData);
        } else {
            const monthData = topBottomData.find(item => item[" Month"] === selectedMonth);
            if (monthData) {
                bottom5 = getBottom5Pizzas(monthData);
            }
        }

        const pizzaNames = bottom5.map(item => item[0]);
        const quantities = bottom5.map(item => parseInt(item[1]));

        chart.data.labels = pizzaNames;
        chart.data.datasets[0].data = quantities;
        chart.update();
    }

    function getBottom5Pizzas(data) {
        const pizzas = Object.entries(data)
            .filter(([key, value]) => key !== ' Month')
            .sort((a, b) => a[1] - b[1])
            .slice(0, 5);
        return pizzas;
    }

    //TABLE
    let sortOrder = {
        name: null,
        quantity: null
    };

    document.getElementById('sortButton').addEventListener('click', () => {
        sortTableAlphabetically();
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        resetTableSorting();
    });

    document.getElementById('categoryFilter').addEventListener('change', () => {
        filterTable();
    });

    document.getElementById('nameHeader').addEventListener('click', () => {
        toggleSort('name');
    });

    document.getElementById('quantityHeader').addEventListener('click', () => {
        toggleSort('quantity');
    });


    function toggleSort(column) {
        if (sortOrder[column] === 'asc') {
            sortOrder[column] = 'desc';
        } else {
            sortOrder[column] = 'asc';
        }
        sortTable(column, sortOrder[column]);
    }

    function sortTable(column, order) {
        let sortedData;
        if (column === 'name') {
            sortedData = tableData.sort((a, b) => {
                return order === 'asc'
                    ? a["Name of Pizza Menus"].localeCompare(b["Name of Pizza Menus"])
                    : b["Name of Pizza Menus"].localeCompare(a["Name of Pizza Menus"]);
            });
        } else if (column === 'quantity') {
            sortedData = tableData.sort((a, b) => {
                return order === 'asc' ? a.Quantity - b.Quantity : b.Quantity - a.Quantity;
            });
        }
        clearSortIcons();
        document.getElementById(`${column}Header`).classList.add(order === 'asc' ? 'sorted-asc' : 'sorted-desc');
        populateTable(sortedData);
    }

    function sortTableAlphabetically() {
        // Sort tableData by the "Name of Pizza Menus" field
        tableData.sort((a, b) => a["Name of Pizza Menus"].localeCompare(b["Name of Pizza Menus"]));
        // Repopulate the table with sorted data
        populateTable(tableData);
    }

    function resetTableSorting() {
        sortOrder = { name: null, quantity: null };
        clearSortIcons();
        populateTable(unsortedTableData);
    }    

    categoryFilter.addEventListener('change', () => {
        filterTable();
    });

    function filterTable() {
        const selectedCategory = document.getElementById('categoryFilter').value;
        let filteredTableData = unsortedTableData;
        if (selectedCategory !== 'All') {
            filteredTableData = unsortedTableData.filter(item => item.Categories === selectedCategory);
        }
        tableData = [...filteredTableData];
        populateTable(filteredTableData);
    }

    function populateTable(data) {
        const tbody = document.querySelector('#pizzaTable tbody');
        tbody.innerHTML = ''; // Clear existing table rows

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item["Name of Pizza Menus"]}</td>
                <td>${item.Quantity}</td>
                <td>${item.Categories}</td>
            `;
            tbody.appendChild(row);
        });
    }

    function clearSortIcons() {
        document.querySelectorAll('th').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
        });
    }
});

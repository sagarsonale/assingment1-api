function createChart(ctx, url, chartType, label) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            new Chart(ctx, {
                type: chartType,
                data: {
                    labels: data.map(item => item._id),
                    datasets: [{
                        label: label,
                        data: data.map(item => item.totalSales || item.growthRate || item.count || item.lifetimeValue),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
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
        })
        .catch(error => console.error('Error fetching data:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    createChart(document.getElementById('totalSalesChart').getContext('2d'), 'http://localhost:3000/api/sales-over-time', 'line', 'Total Sales Over Time');
    createChart(document.getElementById('salesGrowthRateChart').getContext('2d'), 'http://localhost:3000/api/sales-growth-rate', 'line', 'Sales Growth Rate Over Time');
    createChart(document.getElementById('newCustomersChart').getContext('2d'), 'http://localhost:3000/api/new-customers', 'bar', 'New Customers Added Over Time');
    createChart(document.getElementById('repeatCustomersChart').getContext('2d'), 'http://localhost:3000/api/repeat-customers', 'bar', 'Number of Repeat Customers');
    createChart(document.getElementById('geographicalDistributionChart').getContext('2d'), 'http://localhost:3000/api/customer-distribution', 'bar', 'Geographical Distribution of Customers');
    createChart(document.getElementById('lifetimeValueChart').getContext('2d'), 'http://localhost:3000/api/customer-lifetime-value', 'line', 'Customer Lifetime Value by Cohorts');
});

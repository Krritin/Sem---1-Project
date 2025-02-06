const portfolio = [];
const apiKey = 'TH1HSBNUPG6Q5Y0R'; // Your Alpha Vantage API key
const chartCtx = document.getElementById('stockChart').getContext('2d');
let stockChart;
let companies = []; // Will store company data from companies.json

// Function to fetch company data from JSON file
async function loadCompanies() {
  try {
    const response = await fetch('companies.json');
    companies = await response.json();
  } catch (error) {
    console.error('Error loading companies:', error);
  }
}

// Function to fetch stock data
async function fetchStockData(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Function to add stock to portfolio
function addStock(symbol) {
  fetchStockData(symbol).then(data => {
    if (data['Error Message']) return alert('Invalid stock symbol.');

    portfolio.push({ symbol, data });
    renderPortfolio();
    updateChart();
  });
}

// Function to render portfolio
function renderPortfolio() {
  const portfolioDiv = document.getElementById('portfolio');
  portfolioDiv.innerHTML = '<h2>Portfolio</h2>';

  portfolio.forEach((stock, index) => {
    const stockDiv = document.createElement('div');
    stockDiv.className = 'stock-item';
    const latestData = Object.values(stock.data['Time Series (5min)'])[0];
    stockDiv.innerHTML = `
      <strong>${stock.symbol}</strong> - $${latestData['1. open']}
      <button onclick="removeStock(${index})">Remove</button>
    `;
    portfolioDiv.appendChild(stockDiv);
  });
}

// Function to remove stock from portfolio
function removeStock(index) {
  portfolio.splice(index, 1);
  renderPortfolio();
  updateChart();
}

// Function to update the chart
function updateChart() {
  const labels = Object.keys(portfolio[0]?.data['Time Series (5min)'] || {}).reverse();
  const datasets = portfolio.map(stock => ({
    label: stock.symbol,
    data: Object.values(stock.data['Time Series (5min)']).reverse().map(entry => parseFloat(entry['1. open'])),
    borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    fill: false,
  }));

  if (stockChart) stockChart.destroy();

  stockChart = new Chart(chartCtx, {
    type: 'line',
    data: { labels, datasets },
    options: { responsive: true, scales: { y: { beginAtZero: false } } },
  });
}

// Search functionality
const searchCompany = document.getElementById('searchCompany');
const companyList = document.getElementById('companyList');

searchCompany.addEventListener('input', () => {
  const searchTerm = searchCompany.value.toLowerCase();
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm)
  );

  companyList.innerHTML = '';
  filteredCompanies.forEach(company => {
    const div = document.createElement('div');
    div.textContent = `${company.name} (${company.symbol})`;
    div.addEventListener('click', () => {
      addStock(company.symbol);
      searchCompany.value = '';
      companyList.style.display = 'none';
    });
    companyList.appendChild(div);
  });

  companyList.style.display = filteredCompanies.length ? 'block' : 'none';
});

// Hide dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-box')) {
    companyList.style.display = 'none';
  }
});

// Load companies on page load
loadCompanies();

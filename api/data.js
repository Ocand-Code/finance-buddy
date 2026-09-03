const https = require('https');

const SPREADSHEET_ID = '1UXEQAo8pTYc8t_IeYUME_B0xrfZdf07Y';
const GID = '2012372078';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCSV(text) {
  const rows = [];
  let current = [];
  let inQuotes = false;
  let cell = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') { cell += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) {
      current.push(cell.trim()); cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\n' || (char === '\r' && text[i + 1] !== '\n')) {
        current.push(cell.trim());
        if (current.length > 1 || current[0]) rows.push(current);
        current = []; cell = '';
      }
    } else { cell += char; }
  }
  if (cell || current.length > 0) { current.push(cell.trim()); rows.push(current); }
  return rows;
}

function parseNum(val) {
  if (!val || !val.trim()) return 0;
  const n = parseFloat(val.trim().replace(/,/g, '').replace(/"/g, ''));
  return isNaN(n) ? 0 : n;
}

function round(num, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

async function getData() {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID}`;
  const text = await fetch(url);
  const rows = parseCSV(text);
  
  if (rows.length < 4) return { summary: { total_so: 0, total_del: 0, total_os: 0, overall_pct: 0, row_count: 0, open_count: 0, closed_count: 0, over_del_count: 0 }, customers: [], products: [], months: [], monthly_so: {}, monthly_del: {}, all_data: [] };
  
  const dataRows = rows.slice(4);
  const allData = [];
  const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
  
  for (const row of dataRows) {
    if (row.length > 16 && row[16] && row[16].trim() && !row[16].toUpperCase().includes('TOTAL') && !row[16].toUpperCase().includes('GRAND')) {
      if (row.length > 57 && (row[56]?.trim() || row[57]?.trim())) {
        allData.push({
          so: row[16].trim(), project: row[17]?.trim() || '', product: row[18]?.trim() || '',
          cust: row[19]?.trim() || '', pn: row[20]?.trim() || '', prod_line: row[23]?.trim() || '',
          qty_so: parseNum(row[56]), qty_del: parseNum(row[57]), qty_os: parseNum(row[58]),
          pct_del: row[71]?.trim() || '0%', status: row[69]?.trim() || '', remark: row[70]?.trim() || '',
          prod_cat: row[134]?.trim() || '', line_prod: row[135]?.trim() || '', group_prod: row[136]?.trim() || ''
        });
      }
    }
  }
  
  const totalSo = allData.reduce((sum, d) => sum + d.qty_so, 0);
  const totalDel = allData.reduce((sum, d) => sum + d.qty_del, 0);
  const totalOs = allData.reduce((sum, d) => sum + d.qty_os, 0);
  const overallPct = totalSo > 0 ? round(totalDel / totalSo * 100, 2) : 0;
  
  const customers = {}; const products = {};
  const monthlySo = {}; const monthlyDel = {};
  months.forEach(m => { monthlySo[m] = 0; monthlyDel[m] = 0; });
  
  for (const d of allData) {
    if (d.cust) { if (!customers[d.cust]) customers[d.cust] = { so: 0, del: 0, count: 0 }; customers[d.cust].so += d.qty_so; customers[d.cust].del += d.qty_del; customers[d.cust].count++; }
    if (d.product) { if (!products[d.product]) products[d.product] = { so: 0, del: 0, count: 0 }; products[d.product].so += d.qty_so; products[d.product].del += d.qty_del; products[d.product].count++; }
  }
  
  const customerList = Object.keys(customers).map(name => { const c = customers[name]; return { name, so: c.so, del: c.del, count: c.count, pct: c.so > 0 ? round(c.del / c.so * 100, 2) : 0 }; }).sort((a, b) => b.so - a.so);
  const productList = Object.keys(products).map(name => { const p = products[name]; return { name, so: p.so, del: p.del, count: p.count, pct: p.so > 0 ? round(p.del / p.so * 100, 2) : 0 }; }).sort((a, b) => b.so - a.so);
  const openCount = allData.filter(d => d.status === 'OPEN').length;
  const closedCount = allData.filter(d => d.status === 'CLOSED').length;
  const overDelCount = allData.filter(d => d.status === 'Over Del').length;
  
  return { summary: { total_so: totalSo, total_del: totalDel, total_os: totalOs, overall_pct: overallPct, row_count: allData.length, open_count: openCount, closed_count: closedCount, over_del_count: overDelCount }, customers: customerList, products: productList, months, monthly_so: monthlySo, monthly_del: monthlyDel, all_data: allData };
}

module.exports = async function handler(req, res) {
  try {
    const data = await getData();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  } catch (e) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};
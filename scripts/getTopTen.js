const API_KEY = 'AIzaSyAgRJh3hMNn84hWJYnwoXhq3Pw_Ew1yyrw';
const BR_RANKING_SPREADSHEET_ID = '1ukqKAgvEGuR_QrfH29RW15g30Ich6Q2HQWRi2zRB1sw';

async function fetchTopTen(spreadsheetId, range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?alt=json&key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        const jsonData = await response.json();
        if (jsonData && jsonData.values) {
            renderTopTen(jsonData.values);
            return jsonData.values;
        } else {
            throw new Error('No data found or unexpected format.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

function renderTopTen(data) {
    const topTenList = document.getElementById('topTenList');
    topTenList.innerHTML = '';
    for (let i = 1; i < 9; i++) {
        const li = document.createElement('li');
        li.innerHTML = `<span>#${i}</span><span>${data[i][0]}</span><span>${data[i][1]}</span>`;
        topTenList.appendChild(li);
    }
}

fetchTopTen(BR_RANKING_SPREADSHEET_ID, 'ranking');
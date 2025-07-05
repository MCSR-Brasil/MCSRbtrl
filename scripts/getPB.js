

async function fetchData(spreadsheetId, range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?alt=json&key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        const jsonData = await response.json();
        if (jsonData && jsonData.values) {
            return jsonData.values;
        } else {
            throw new Error('No data found or unexpected format.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function getPB(name) {
    const data = await fetchData(BR_RANKING_SPREADSHEET_ID, 'PBs');
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === name) {
            console.log("PB of " + name + ": " + data[i][1]);
            return data[i][1];
        }
    }
    return null;
}
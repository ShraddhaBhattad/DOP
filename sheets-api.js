class SheetsAPI {
    constructor() {
        this.SPREADSHEET_ID = null;
        this.DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
        this.SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
    }

    async init() {
        return new Promise((resolve) => {
            gapi.load('client', async () => {
                await gapi.client.init({
                    discoveryDocs: this.DISCOVERY_DOCS
                });
                this.gapiInited = true;
                if (this.gisInited) resolve();
            });

            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: '173384977932-id5lei4gri62p7t6u3dt0jrnu0k9nbed.apps.googleusercontent.com', // Replace with your Google OAuth Client ID
                scope: this.SCOPES,
                callback: () => {},
            });
            this.gisInited = true;
            if (this.gapiInited) resolve();
        });
    }

    async authenticate() {
        return new Promise((resolve, reject) => {
            const token = gapi.client.getToken();
            if (token && token.access_token) return resolve(token);

            this.tokenClient.callback = (resp) => {
                if (resp && resp.error) return reject(resp);
                // CRITICAL: attach the OAuth token to gapi, otherwise Sheets calls are anonymous -> 403
                gapi.client.setToken(resp);
                resolve(resp);
            };

            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }

    async signOut() {
        const token = gapi.client.getToken();
        if (token) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
        }
    }

    setSpreadsheetId(id) {
        this.SPREADSHEET_ID = id;
    }

    async createSpreadsheet(title = 'PostOfficeAgentData') {
        const response = await gapi.client.sheets.spreadsheets.create({
            properties: { title }
        });
        this.SPREADSHEET_ID = response.result.spreadsheetId;
        
        // Create sheets
        await this.createSheets();
        return this.SPREADSHEET_ID;
    }

    async createSheets() {
        const requests = [
            { addSheet: { properties: { title: 'Customers', gridProperties: { rowCount: 1000, columnCount: 4 } } } },
            { addSheet: { properties: { title: 'PostOfficeAccounts', gridProperties: { rowCount: 1000, columnCount: 15 } } } },
            { addSheet: { properties: { title: 'LICAccounts', gridProperties: { rowCount: 1000, columnCount: 12 } } } },
            { addSheet: { properties: { title: 'Collections', gridProperties: { rowCount: 1000, columnCount: 8 } } } }
        ];

        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.SPREADSHEET_ID,
            resource: { requests }
        });

        // Add headers
        await this.addHeaders();
    }

    async addHeaders() {
        const headers = {
            Customers: [['PhoneNumber', 'Name', 'FamilyGroup', 'DateOfBirth']],
            PostOfficeAccounts: [['AccountNumber', 'CustomerPhone', 'AccountType', 'Balance', 'Status', 'OpeningDate', 'MaturityDate', 'ExpectedMaturityAmount', 'NomineeName', 'InterestAmount', 'ScheduleType', 'MaturityDestination', 'MaturityDestinationAmount', 'LinkedAccountNumbers']],
            LICAccounts: [['PolicyNumber', 'CustomerPhone', 'TableNumber', 'LICPlan', 'SumAssured', 'OpeningDate', 'MaturityDate', 'NomineeName', 'CommissionReturn', 'Mode', 'MaturityDestination', 'MaturityDestinationAmount', 'Status']],
            Collections: [['Timestamp', 'AccountNo', 'PolicyNo', 'Name', 'FamilyGroup', 'Amount', 'Mode', 'ReceivedBy']]
        };

        for (const [sheet, header] of Object.entries(headers)) {
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.SPREADSHEET_ID,
                range: `${sheet}!A1`,
                valueInputOption: 'RAW',
                resource: { values: header }
            });
        }
    }

    async read(sheetName) {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: this.SPREADSHEET_ID,
            range: `${sheetName}!A2:Z`
        });
        return response.result.values || [];
    }

    async append(sheetName, row) {
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: this.SPREADSHEET_ID,
            range: `${sheetName}!A:Z`,
            valueInputOption: 'RAW',
            resource: { values: [row] }
        });
    }

    async update(sheetName, rowIndex, row) {
        const range = `${sheetName}!A${rowIndex + 2}`;
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: this.SPREADSHEET_ID,
            range: range,
            valueInputOption: 'RAW',
            resource: { values: [row] }
        });
    }

    async delete(sheetName, rowIndex) {
        const requests = [{
            deleteDimension: {
                range: {
                    sheetId: await this.getSheetId(sheetName),
                    dimension: 'ROWS',
                    startIndex: rowIndex + 1,
                    endIndex: rowIndex + 2
                }
            }
        }];
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.SPREADSHEET_ID,
            resource: { requests }
        });
    }

    async getSheetId(sheetName) {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: this.SPREADSHEET_ID
        });
        const sheet = response.result.sheets.find(s => s.properties.title === sheetName);
        return sheet ? sheet.properties.sheetId : null;
    }

    async findRow(sheetName, columnIndex, value) {
        const data = await this.read(sheetName);
        return data.findIndex(row => row[columnIndex] === value);
    }
}

const sheetsAPI = new SheetsAPI();

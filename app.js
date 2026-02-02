/* ============================================================
   CONFIG
============================================================ */
const APP_SPREADSHEET_NAME = 'PostOfficeAppData';

/* ============================================================
   UTILITIES
============================================================ */
const byId = (id) => document.getElementById(id);

const todayISO = () => new Date().toISOString().split('T')[0];

const buildCustomerMap = (customers) =>
    new Map(customers.map(c => [c.phoneNumber, c]));

/* ============================================================
   BASE MODELS
============================================================ */
class BaseSheetModel {
    static sheetName = '';
    static keyIndex = 0;

    static ensureSheet() {
        if (!sheetsAPI.SPREADSHEET_ID) {
            throw new Error('Spreadsheet not configured');
        }
    }

    async saveRow(key, row) {
        BaseSheetModel.ensureSheet();
        const index = await sheetsAPI.findRow(
            this.constructor.sheetName,
            this.constructor.keyIndex,
            key
        );
        if (index >= 0) {
            await sheetsAPI.update(this.constructor.sheetName, index, row);
        } else {
            await sheetsAPI.append(this.constructor.sheetName, row);
        }
    }

    static async deleteByKey(key) {
        BaseSheetModel.ensureSheet();
        const index = await sheetsAPI.findRow(
            this.sheetName,
            this.keyIndex,
            key
        );
        if (index >= 0) {
            await sheetsAPI.delete(this.sheetName, index);
        }
    }

    static async readAll() {
        if (!sheetsAPI.SPREADSHEET_ID) return [];
        return sheetsAPI.read(this.sheetName);
    }
}

/* ============================================================
   CUSTOMER
============================================================ */
class Customer extends BaseSheetModel {
    static sheetName = 'Customers';
    static keyIndex = 0;

    constructor(d) {
        super();
        this.phoneNumber = d.phoneNumber || '';
        this.name = d.name || '';
        this.familyGroup = d.familyGroup || '';
        this.dateOfBirth = d.dateOfBirth || '';
    }

    async save() {
        await this.saveRow(this.phoneNumber, [
            this.phoneNumber,
            this.name,
            this.familyGroup,
            this.dateOfBirth
        ]);
    }

    async delete() {
        await Customer.deleteByKey(this.phoneNumber);
    }

    static async getAll() {
        const rows = await this.readAll();
        return rows.map(r => new Customer({
            phoneNumber: r[0],
            name: r[1],
            familyGroup: r[2],
            dateOfBirth: r[3]
        }));
    }

    static async findByPhone(phone) {
        const all = await this.getAll();
        return all.find(c => c.phoneNumber === phone);
    }
}

/* ============================================================
   POST OFFICE ACCOUNT
============================================================ */
class PostOfficeAccount extends BaseSheetModel {
    static sheetName = 'PostOfficeAccounts';
    static keyIndex = 0;

    constructor(d) {
        super();
        Object.assign(this, {
            accountNumber: d.accountNumber || '',
            customerPhone: d.customerPhone || '',
            accountType: d.accountType || '',
            balance: +d.balance || 0,
            status: d.status || 'Active',
            openingDate: d.openingDate || '',
            maturityDate: d.maturityDate || '',
            expectedMaturityAmount: +d.expectedMaturityAmount || 0,
            nomineeName: d.nomineeName || '',
            interestAmount: +d.interestAmount || 0,
            scheduleType: d.scheduleType || '',
            maturityDestination: d.maturityDestination || '',
            maturityDestinationAmount: +d.maturityDestinationAmount || 0,
            linkedAccountNumbers: d.linkedAccountNumbers || ''
        });
    }

    async save() {
        await this.saveRow(this.accountNumber, [
            this.accountNumber,
            this.customerPhone,
            this.accountType,
            this.balance,
            this.status,
            this.openingDate,
            this.maturityDate,
            this.expectedMaturityAmount,
            this.nomineeName,
            this.interestAmount,
            this.scheduleType,
            this.maturityDestination,
            this.maturityDestinationAmount,
            this.linkedAccountNumbers
        ]);
    }

    async delete() {
        await PostOfficeAccount.deleteByKey(this.accountNumber);
    }

    static async getAll() {
        const rows = await this.readAll();
        return rows.map(r => new PostOfficeAccount({
            accountNumber: r[0],
            customerPhone: r[1],
            accountType: r[2],
            balance: r[3],
            status: r[4],
            openingDate: r[5],
            maturityDate: r[6],
            expectedMaturityAmount: r[7],
            nomineeName: r[8],
            interestAmount: r[9],
            scheduleType: r[10],
            maturityDestination: r[11],
            maturityDestinationAmount: r[12],
            linkedAccountNumbers: r[13]
        }));
    }
}

/* ============================================================
   LIC ACCOUNT
============================================================ */
class LICAccount extends BaseSheetModel {
    static sheetName = 'LICAccounts';
    static keyIndex = 0;

    constructor(d) {
        super();
        Object.assign(this, {
            policyNumber: d.policyNumber || '',
            customerPhone: d.customerPhone || '',
            tableNumber: d.tableNumber || '',
            licPlan: d.licPlan || '',
            sumAssured: +d.sumAssured || 0,
            openingDate: d.openingDate || '',
            maturityDate: d.maturityDate || '',
            nomineeName: d.nomineeName || '',
            commissionReturn: +d.commissionReturn || 0,
            mode: d.mode || '',
            maturityDestination: d.maturityDestination || '',
            maturityDestinationAmount: +d.maturityDestinationAmount || 0,
            status: d.status || 'Active'
        });
    }

    async save() {
        await this.saveRow(this.policyNumber, [
            this.policyNumber,
            this.customerPhone,
            this.tableNumber,
            this.licPlan,
            this.sumAssured,
            this.openingDate,
            this.maturityDate,
            this.nomineeName,
            this.commissionReturn,
            this.mode,
            this.maturityDestination,
            this.maturityDestinationAmount,
            this.status
        ]);
    }

    async delete() {
        await LICAccount.deleteByKey(this.policyNumber);
    }

    static async getAll() {
        const rows = await this.readAll();
        return rows.map(r => new LICAccount({
            policyNumber: r[0],
            customerPhone: r[1],
            tableNumber: r[2],
            licPlan: r[3],
            sumAssured: r[4],
            openingDate: r[5],
            maturityDate: r[6],
            nomineeName: r[7],
            commissionReturn: r[8],
            mode: r[9],
            maturityDestination: r[10],
            maturityDestinationAmount: r[11],
            status: r[12]
        }));
    }
}

/* ============================================================
   COLLECTION
============================================================ */
class Collection extends BaseSheetModel {
    static sheetName = 'Collections';
    static keyIndex = 0;

    constructor(d) {
        super();
        Object.assign(this, {
            timestamp: d.timestamp || new Date().toISOString(),
            accountNo: d.accountNo || '',
            policyNo: d.policyNo || '',
            name: d.name || '',
            familyGroup: d.familyGroup || '',
            amount: +d.amount || 0,
            mode: d.mode || '',
            receivedBy: d.receivedBy || ''
        });
    }

    async save() {
        BaseSheetModel.ensureSheet();
        await sheetsAPI.append('Collections', [
            this.timestamp,
            this.accountNo,
            this.policyNo,
            this.name,
            this.familyGroup,
            this.amount,
            this.mode,
            this.receivedBy
        ]);
    }

    static async getAll() {
        const rows = await this.readAll();
        return rows.map(r => new Collection({
            timestamp: r[0],
            accountNo: r[1],
            policyNo: r[2],
            name: r[3],
            familyGroup: r[4],
            amount: r[5],
            mode: r[6],
            receivedBy: r[7]
        }));
    }
}

const normalizeAccounts = (poAccounts, licAccounts, customers) => {
    const customerMap = new Map(
        customers.map(c => [c.phoneNumber, c])
    );

    return [
        ...poAccounts.map(a => {
            const c = customerMap.get(a.customerPhone);
            return {
                id: a.accountNumber,
                type: 'PostOffice',
                status: a.status,
                scheme: a.accountType,
                customerPhone: a.customerPhone,
                customerName: c?.name || 'Unknown',
                familyGroup: c?.familyGroup || '',
                raw: a
            };
        }),

        ...licAccounts.map(a => {
            const c = customerMap.get(a.customerPhone);
            return {
                id: a.policyNumber,
                type: 'LIC',
                status: a.status,
                scheme: a.licPlan,
                customerPhone: a.customerPhone,
                customerName: c?.name || 'Unknown',
                familyGroup: c?.familyGroup || '',
                raw: a
            };
        })
    ];
};


/* ============================================================
   UI MANAGER (FILTER FIXED)
============================================================ */
class UIManager {
    constructor() {
        this.accountsCustomerPhoneFilter = '';
    }

    async loadAccounts() {
        const customers = await Customer.getAll();
        const poAccounts = await PostOfficeAccount.getAll();
        const licAccounts = await LICAccount.getAll();
    
        const allAccounts = normalizeAccounts(
            poAccounts,
            licAccounts,
            customers
        );
    
        const typeFilter = document.getElementById('accountTypeFilter')?.value || '';
        const statusFilter = document.getElementById('accountStatusFilter')?.value || '';
    
        let filtered = allAccounts;
    
        if (typeFilter) {
            filtered = filtered.filter(a => a.type === typeFilter);
        }
    
        if (statusFilter) {
            filtered = filtered.filter(a => a.status === statusFilter);
        }
    
        if (this.accountsCustomerPhoneFilter) {
            filtered = filtered.filter(
                a => a.customerPhone === this.accountsCustomerPhoneFilter
            );
        }
    
        const container = document.getElementById('accountsList');
    
        if (!filtered.length) {
            container.innerHTML = `<div class="card"><p>No accounts found</p></div>`;
            return;
        }
    
        container.innerHTML = filtered.map(a => `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        ${a.customerName} (${a.familyGroup})
                    </div>
                    <span class="badge">${a.type}</span>
                </div>
    
                <div class="card-body">
                    <div class="card-field">
                        <span class="card-label">Account / Policy</span>
                        <span class="card-value">${a.id}</span>
                    </div>
    
                    <div class="card-field">
                        <span class="card-label">Scheme</span>
                        <span class="card-value">${a.scheme}</span>
                    </div>
    
                    <div class="card-field">
                        <span class="card-label">Status</span>
                        <span class="card-value">${a.status}</span>
                    </div>
                </div>
    
                <div class="card-actions">
                    <button class="btn btn-secondary"
                        onclick="uiManager.editAccount('${a.type}', '${a.id}')">
                        Edit
                    </button>
                    <button class="btn btn-danger"
                        onclick="uiManager.deleteAccount('${a.type}', '${a.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    
}

/* ============================================================
   INIT + AUTH (CACHE SAFE)
============================================================ */
const uiManager = new UIManager();

async function initSpreadsheet() {
    await sheetsAPI.init();
    await sheetsAPI.authenticate();

    let id = localStorage.getItem('spreadsheetId');

    if (!id) {
        id = await sheetsAPI.findSpreadsheetByName(APP_SPREADSHEET_NAME);
        if (!id) {
            id = await sheetsAPI.createSpreadsheet(APP_SPREADSHEET_NAME);
        }
        localStorage.setItem('spreadsheetId', id);
    }

    sheetsAPI.setSpreadsheetId(id);
}

byId('authBtn').onclick = async () => {
    try {
        await initSpreadsheet();
        byId('authBtn').style.display = 'none';
        byId('userInfo').textContent = 'Signed in';
        byId('userInfo').style.display = 'inline';
        byId('signOutBtn').style.display = 'inline';
        await uiManager.loadAccounts();
    } catch (e) {
        alert(e.message);
    }
};

byId('signOutBtn').onclick = async () => {
    await sheetsAPI.signOut();
    localStorage.removeItem('spreadsheetId');
    location.reload();
};
/* ============================================================
   CONFIG + HELPERS
============================================================ */
const APP_SPREADSHEET_NAME = 'PostOfficeAppData';
const $ = (id) => document.getElementById(id);
const todayISO = () => new Date().toISOString().split('T')[0];

/* ============================================================
   BASE MODEL
============================================================ */
class BaseSheetModel {
    static sheetName = '';
    static keyIndex = 0;

    static ensureSheet() {
        if (!sheetsAPI.SPREADSHEET_ID) throw new Error('Spreadsheet not ready');
    }

    async saveRow(key, row) {
        BaseSheetModel.ensureSheet();
        const idx = await sheetsAPI.findRow(
            this.constructor.sheetName,
            this.constructor.keyIndex,
            key
        );
        if (idx >= 0) {
            await sheetsAPI.update(this.constructor.sheetName, idx, row);
        } else {
            await sheetsAPI.append(this.constructor.sheetName, row);
        }
    }

    static async deleteByKey(key) {
        BaseSheetModel.ensureSheet();
        const idx = await sheetsAPI.findRow(this.sheetName, this.keyIndex, key);
        if (idx >= 0) await sheetsAPI.delete(this.sheetName, idx);
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

    constructor(d = {}) {
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
}

/* ============================================================
   POST OFFICE ACCOUNT
============================================================ */
class PostOfficeAccount extends BaseSheetModel {
    static sheetName = 'PostOfficeAccounts';
    static keyIndex = 0;

    constructor(d = {}) {
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

    constructor(d = {}) {
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

    constructor(d = {}) {
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

/* ============================================================
   UI MANAGER (FULL CRUD)
============================================================ */
class UIManager {
    navigateToSection(section) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        $(section)?.classList.add('active');

        if (section === 'dashboard') this.updateDashboard();
        if (section === 'customers') this.loadCustomers();
        if (section === 'accounts') this.loadAccounts();
        if (section === 'maturity-tracker') maturityTracker.filter();
        if (section === 'collection-tracker') collectionTracker.display();
    }

    async updateDashboard() {
        const [c, p, l, col] = await Promise.all([
            Customer.getAll(),
            PostOfficeAccount.getAll(),
            LICAccount.getAll(),
            Collection.getAll()
        ]);

        $('totalCustomers').textContent = c.length;
        $('totalAccounts').textContent = p.length + l.length;
        $('pendingCollections').textContent = col.length;

        const upcoming = [...p, ...l].filter(a =>
            a.maturityDate &&
            new Date(a.maturityDate) <= new Date(Date.now() + 30 * 86400000)
        );
        $('upcomingMaturities').textContent = upcoming.length;
    }

    async loadCustomers() {
        const customers = await Customer.getAll();
        $('customersList').innerHTML = customers.map(c => `
            <div class="card">
                <b>${c.name}</b> (${c.familyGroup})<br>
                ${c.phoneNumber}
                <div class="card-actions">
                    <button class="btn btn-danger"
                        onclick="uiManager.deleteCustomer('${c.phoneNumber}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    async deleteCustomer(phone) {
        if (!confirm('Delete customer?')) return;
        const c = new Customer({ phoneNumber: phone });
        await c.delete();
        this.loadCustomers();
        this.updateDashboard();
    }

    async loadAccounts() {
        const customers = await Customer.getAll();
        const map = new Map(customers.map(c => [c.phoneNumber, c]));
        const po = await PostOfficeAccount.getAll();
        const lic = await LICAccount.getAll();

        $('accountsList').innerHTML = [
            ...po.map(a => ({ id: a.accountNumber, type: 'PostOffice', scheme: a.accountType, c: map.get(a.customerPhone) })),
            ...lic.map(a => ({ id: a.policyNumber, type: 'LIC', scheme: a.licPlan, c: map.get(a.customerPhone) }))
        ].map(a => `
            <div class="card">
                <b>${a.c?.name || 'Unknown'}</b> (${a.c?.familyGroup || ''})<br>
                ${a.type} • ${a.id} • ${a.scheme}
            </div>
        `).join('');
    }
}

/* ============================================================
   MATURITY + COLLECTION
============================================================ */
class MaturityTracker {
    async filter() {
        const customers = await Customer.getAll();
        const po = await PostOfficeAccount.getAll();
        const lic = await LICAccount.getAll();
        const map = new Map(customers.map(c => [c.phoneNumber, c]));

        const items = [];

        po.forEach(a => {
            if (a.maturityDate) {
                const c = map.get(a.customerPhone);
                if (c) items.push({
                    name: c.name,
                    family: c.familyGroup,
                    id: a.accountNumber,
                    date: a.maturityDate,
                    amount: a.expectedMaturityAmount
                });
            }
        });

        lic.forEach(a => {
            if (a.maturityDate) {
                const c = map.get(a.customerPhone);
                if (c) items.push({
                    name: c.name,
                    family: c.familyGroup,
                    id: a.policyNumber,
                    date: a.maturityDate,
                    amount: a.maturityDestinationAmount
                });
            }
        });

        items.sort((a, b) => new Date(a.date) - new Date(b.date));

        $('maturityList').innerHTML = items.length
            ? items.map(i => `
                <div class="card">
                    <b>${i.name}</b> (${i.family})<br>
                    ${i.id} • ${i.date} • ₹${i.amount}
                </div>
            `).join('')
            : '<div class="card"><p>No maturities</p></div>';
    }
}

class CollectionTracker {
    async display() {
        const collections = await Collection.getAll();
        $('collectionList').innerHTML = collections.length
            ? collections.map(c => `
                <div class="card">
                    ${c.name} (${c.familyGroup})<br>
                    ₹${c.amount} • ${c.mode}
                </div>
            `).join('')
            : '<div class="card"><p>No collections</p></div>';
    }
}

/* ============================================================
   INIT + AUTH
============================================================ */
const uiManager = new UIManager();
const maturityTracker = new MaturityTracker();
const collectionTracker = new CollectionTracker();

window.uiManager = uiManager;
window.maturityTracker = maturityTracker;
window.collectionTracker = collectionTracker;

async function initApp() {
    await sheetsAPI.init();
    await sheetsAPI.authenticate();

    let id = localStorage.getItem('spreadsheetId');
    if (!id) {
        id = await sheetsAPI.findSpreadsheetByName(APP_SPREADSHEET_NAME)
            || await sheetsAPI.createSpreadsheet(APP_SPREADSHEET_NAME);
        localStorage.setItem('spreadsheetId', id);
    }
    sheetsAPI.setSpreadsheetId(id);

    $('authBtn').style.display = 'none';
    $('userInfo').style.display = 'inline';
    $('userInfo').textContent = 'Signed in';
    $('signOutBtn').style.display = 'inline';

    uiManager.updateDashboard();
}

$('authBtn').onclick = initApp;
$('signOutBtn').onclick = async () => {
    await sheetsAPI.signOut();
    localStorage.clear();
    location.reload();
};

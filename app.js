const $ = id => document.getElementById(id);
const APP_SPREADSHEET_NAME = 'PostOfficeAppData';

/* ================= SHEET MODELS ================= */

class Customer {
    constructor(d) {
        this.phone = d.phone;
        this.name = d.name;
        this.family = d.family;
    }

    static async all() {
        const rows = await sheetsAPI.read('Customers');
        return rows.map(r => new Customer({ phone: r[0], name: r[1], family: r[2] }));
    }

    async save() {
        const idx = await sheetsAPI.findRow('Customers', 0, this.phone);
        const row = [this.phone, this.name, this.family];
        idx >= 0
            ? await sheetsAPI.update('Customers', idx, row)
            : await sheetsAPI.append('Customers', row);
    }

    static async delete(phone) {
        const idx = await sheetsAPI.findRow('Customers', 0, phone);
        if (idx >= 0) await sheetsAPI.delete('Customers', idx);
    }
}

class Account {
    constructor(d) {
        this.id = d.id;
        this.phone = d.phone;
        this.type = d.type;
    }

    static async all() {
        const rows = await sheetsAPI.read('Accounts');
        return rows.map(r => new Account({ id: r[0], phone: r[1], type: r[2] }));
    }

    async save() {
        const idx = await sheetsAPI.findRow('Accounts', 0, this.id);
        const row = [this.id, this.phone, this.type];
        idx >= 0
            ? await sheetsAPI.update('Accounts', idx, row)
            : await sheetsAPI.append('Accounts', row);
    }
}

/* ================= UI ================= */

class UI {
    navigate(id) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        $(id).classList.add('active');
        if (id === 'customers') this.loadCustomers();
        if (id === 'accounts') this.loadAccounts();
        if (id === 'dashboard') this.loadDashboard();
    }

    async loadDashboard() {
        const c = await Customer.all();
        const a = await Account.all();
        $('dc').textContent = c.length;
        $('da').textContent = a.length;
    }

    async loadCustomers() {
        const list = $('customerList');
        const customers = await Customer.all();
        list.innerHTML = customers.map(c => `
            <div>
                ${c.name} (${c.phone}) - ${c.family}
                <button onclick="ui.deleteCustomer('${c.phone}')">Delete</button>
            </div>
        `).join('');
    }

    async deleteCustomer(phone) {
        if (!confirm('Delete customer?')) return;
        await Customer.delete(phone);
        this.loadCustomers();
        this.loadDashboard();
    }

    openCustomerForm() {
        $('modalBody').innerHTML = `
            <h3>Add Customer</h3>
            <input id="cphone" placeholder="Phone"><br>
            <input id="cname" placeholder="Name"><br>
            <input id="cfamily" placeholder="Family"><br>
            <button onclick="ui.saveCustomer()">Save</button>
        `;
        $('modal').style.display = 'block';
    }

    async saveCustomer() {
        const c = new Customer({
            phone: $('cphone').value,
            name: $('cname').value,
            family: $('cfamily').value
        });
        await c.save();
        this.closeModal();
        this.loadCustomers();
        this.loadDashboard();
    }

    async loadAccounts() {
        const list = $('accountList');
        const accounts = await Account.all();
        list.innerHTML = accounts.map(a => `
            <div>
                ${a.id} (${a.type}) - ${a.phone}
            </div>
        `).join('');
    }

    openAccountForm() {
        $('modalBody').innerHTML = `
            <h3>Add Account</h3>
            <input id="aid" placeholder="Account No"><br>
            <input id="aphone" placeholder="Customer Phone"><br>
            <input id="atype" placeholder="Type"><br>
            <button onclick="ui.saveAccount()">Save</button>
        `;
        $('modal').style.display = 'block';
    }

    async saveAccount() {
        const a = new Account({
            id: $('aid').value,
            phone: $('aphone').value,
            type: $('atype').value
        });
        await a.save();
        this.closeModal();
        this.loadAccounts();
        this.loadDashboard();
    }

    closeModal() {
        $('modal').style.display = 'none';
    }
}

const ui = new UI();
window.ui = ui;

/* ================= AUTH ================= */

async function init() {
    await sheetsAPI.init();
    await sheetsAPI.authenticate();

    let id = localStorage.getItem('spreadsheetId');
    if (!id) {
        id = await sheetsAPI.createSpreadsheet(APP_SPREADSHEET_NAME);
        localStorage.setItem('spreadsheetId', id);
    }
    sheetsAPI.setSpreadsheetId(id);

    $('authBtn').style.display = 'none';
    $('userInfo').style.display = 'inline';
    $('userInfo').textContent = 'Signed in';
    $('signOutBtn').style.display = 'inline';

    ui.loadDashboard();
}

$('authBtn').onclick = init;
$('signOutBtn').onclick = async () => {
    await sheetsAPI.signOut();
    localStorage.clear();
    location.reload();
};

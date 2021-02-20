const Modal = {
  activeModalTransaction() {
    // Abrir ou fecha modal
    // Adicionar ou remove a class active ao modal
    DOM.createTransactionForm('income');
    //Accounts.updateSelect();    
    document.querySelector(".modal-overlay.transaction").classList.toggle("active");
  },

  activeModalAccount() {
    // Abrir ou fecha modal
    // Adicionar ou remove a class active ao modal
    //Accounts.updateSelect();
    document.querySelector(".modal-overlay.account").classList.toggle("active");
  },

  activeModalHistoric(accountId) {
    if(accountId > 0){
      DOM.innerHTMLHistoricTitle(accountId)
      Historic.create(accountId)
    } else {
      DOM.clearHistoric()
    }   
    document.querySelector(".modal-overlay.historic").classList.toggle("active");
  }
};

const Storage = {
  getTransactions() {
      return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] 
  },

  setTransations(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  },

  getAccount() {
    return JSON.parse(localStorage.getItem("dev.finances:accounts")) || []
  },

  setAccount(accounts) {
    localStorage.setItem("dev.finances:accounts", JSON.stringify(accounts))
  }

}

const Transaction = {
  all: Storage.getTransactions(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reloud();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reloud();
  },

  incomes() {
    let income = 0;
    Transaction.all.map(transaction => {
      if(transaction.type === 'income')
      income += transaction.amount
    })
    return income;
  },

  expenses() {
    let expense = 0;
    Transaction.all.map(transaction => {
      if(transaction.type === 'expense')
      expense += transaction.amount
    })

    return expense;    
  },

  total() {
    return this.incomes() - this.expenses()
  },
};

const Accounts = {
  all: Storage.getAccount(),
  
  /*all: [
    {
      id: 1,
      type: "Dinheiro",
      institution: "Carteira",
      balance: 0,
    },
    {
      id: 2,
      type: "Conta Corrente",
      institution: "Nubank",
      balance: 0,
    },
    {
      id: 3,
      type: "Poupança",
      institution: "Caixa Econômica",
      balance: 0,
    },
  ],*/

  add(account) {
    const { type, institution } = account
    let id = 0
    if( Accounts.all.length <= 0) {
      id = 1
    }else {
      id = Accounts.all[Accounts.all.length -1].id
      id += 1
    }

    account = {
                id,
                type,
                institution
              }

   Accounts.all.push(account);
   
   App.reloud();
   
  },

  updateSelect() {
    //const select = document.querySelector('select#accounts')
    let options = "";

    Accounts.all.map(account => {
      options += `<option value="${account.id}">${account.institution}</option>`
    })

    return options    
  },

  calc() {
    Accounts.clearBalance();
    Transaction.all.map( transaction => {
      const {type: transactionType, accountIncome, accountExpense, amount} = transaction

      if (transactionType === 'income') {
        this.update(transactionType, Number(accountIncome), amount )

      } else if (transactionType === 'expense'){
        this.update(transactionType, Number(accountExpense), amount )
      } else if (transactionType === 'transfer') {
        this.update("expense", Number(accountExpense), amount )
        this.update("income", Number(accountIncome), amount )
      }
      
    })
  },

  update(transactionType, accountId, amount) {
    Accounts.all.map((account, key) => {
      let {id, type, institution, balance} = account

      if(id === accountId) {
        if(transactionType === "income"){
          balance += Number(amount)
        } else if(transactionType === "expense") {
          balance -= Number(amount)
        }
        Accounts.all[key] = {id, type, institution, balance: balance}
      }
    })
  },

  allfind(account) {
    const {institution} = this.all.find( element => Number(element.id) === Number(account))    

    return institution;
  },

  clearBalance() {
    Accounts.all.map(account => account.balance = 0)
  }
}

const Historic = {  

  create(accountId) {
    let historic = [];      
    Transaction.all.map(transaction => {     
      const {type, description, accountIncome, accountExpense, amount, date} = transaction
      
      if ((Number(accountIncome) || Number(accountExpense)) === Number(accountId) ){
        historic.push({date, type, description, amount})
      }
    })

    historic.map(historic => {
      DOM.addHistoric(historic)
    })    
  }

  
}

const DOM = {
  transactionContainer: document.querySelector('#data-table tbody'),
  accountContainer: document.querySelector('#accounts-table tbody'),
  historicContainer: document.querySelector('#historic-table tbody'),
  historicTitle: document.getElementById('historicTitle'),
  FormTransactionContainer: document.querySelector('form .form-body'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index 
    
    DOM.transactionContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const { type, accountIncome, accountExpense, description, amount, date} = transaction;
    let typeTransaction = "";
    let cssClass = "";
    let institution = "";

    if (type === "income") {
      typeTransaction = "Entrada";
      cssClass = "income"
      institution = Accounts.allfind(accountIncome);
    } else if ( type === "expense") {
      typeTransaction = "Saída";
      cssClass = "expense"
      institution = Accounts.allfind(accountExpense);
    } else if ( type === "transfer") {
      typeTransaction = "Transferência";
      cssClass = "transfer"
      institution = `${Accounts.allfind(accountExpense)} >> ${Accounts.allfind(accountIncome)}`;
    }

    /*const cssClass = transaction.amount > 0 ? "income" : "expense";*/
    
    //const {institution} = Accounts.all.find( account => Number(account.id) === Number(transaction.account))

    const value = Utils.formatCurrency(amount)
    
    const html = `        
            <td class="type">${typeTransaction}</td>
            <td class="description">${description}</td>
            <td class="account">${institution}</td>
            <td class="${cssClass}">${value}</td>
            <td class="date">${date}</td>
            <td>
              <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
            </td>    
    `;
    return html
    
  },

  addAccount(account) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLAccount(account);
    tr.setAttribute("onclick", `Modal.activeModalHistoric(${account.id})`);
    tr.classList.add('pointer')
    
    DOM.accountContainer.appendChild(tr);
  },

  innerHTMLAccount(account) {
    const cssClass = account.balance >= 0 ? "positive" : "negative";

    const balance = Utils.formatCurrency(account.balance)
    
    const html = `        
            <td class="type">${account.type}</td>
            <td class="institution">${account.institution}</td>
            <td class="${cssClass}">${balance}</td>              
    `;
    return html
    
  },

  addHistoric(historic) {
    const tr = document.createElement('tr')

    tr.innerHTML = DOM.innerHTMLHistoric(historic)

    DOM.historicContainer.appendChild(tr)
  },

  innerHTMLHistoric(historic) {
    let cssClass = "";
    let typeTransaction = "";

    if (historic.type === "income"){
      typeTransaction = "Entrada";
      cssClass = "income"
    } else if (historic.type === "expense"){
      typeTransaction = "Saída";
      cssClass = "expense"
    } else {
      typeTransaction = "Transferência";
      cssClass = "transfer"
    }


    const amount = Utils.formatCurrency(historic.amount)
    
    const html = `
            <td class="date">${historic.date}</td>        
            <td class="typeTransaction">${typeTransaction}</td>        
            <td class="description">${historic.description}</td>
            <td class="${cssClass}">${amount}</td>    
    `;
    return html
    
  },

  innerHTMLHistoricTitle(accountId) {
    const { institution } = Accounts.all.find(account => Number(account.id) === Number(accountId))
    DOM.historicTitle.innerHTML = institution
  },

  createTransactionForm(type) {
    let select = Accounts.updateSelect();    
    let accountExpense = `<option value="">Conta</option>`;     
    let accountIncome = `<option value="">Conta</option>`;

    if (type === "transfer") {
          accountExpense = `<option value="">Conta de origem</option>`;
          accountIncome = `<option value="">Conta de destino</option>`;      
    }

    const typeTransaction = `<input type="text" id="typeTransaction" name="typeTransaction" value="${type}"  hidden/>`
    
    let account = `<div class="input-group">
                      <label class="sr-only" for="accounts">Conta</label>
                      <select id="account-expense" name="account-expense" value="0" >${accountExpense} ${select}</select>
                    </div>
                    <div class="input-group">
                    <label class="sr-only" for="accounts">Conta</label>
                    <select id="account-income" name="account-income" value="0" >${accountIncome} ${select}</select>
                  </div>`
                
    const description = `<div class="input-group">
                          <label class="sr-only" for="description">Descrição</label>
                          <input
                          type="text"
                          id="description"
                          name="description"
                          placeholder="Descrição"
                        />`
    const amount = `<div class="input-group">
                      <label class="sr-only" for="amount">Valor</label>
                      <input
                        type="number"
                        step="0.01"
                        id="amount"
                        name="amount"
                        placeholder="0,00"
                      />
                      <small class="help">
                       Use , (virgula) para casas decimais
                      </small>                           
                    </div>`                    
    const date = `<div class="input-group">
                    <label class="sr-only" for="date">Data</label>
                    <input type="date" id="date" name="date" placeholder="date" />
                  </div>`

    DOM.innerHTMLForm({ type,
                        typeTransaction,
                        account,
                        description,
                        amount,
                        date
    })              

  },

  innerHTMLForm(form){
    const {type, typeTransaction, account, description, amount, date} = form;    
    DOM.clearTabsForm();
    document.getElementById(`tab-${type}`).classList.add('active');

    DOM.FormTransactionContainer.innerHTML = typeTransaction + account + description + amount + date;

    let accountIncome = document.querySelector('#account-income');
    let accountExpense = document.querySelector('#account-expense');

    type === "income" || type === "transfer" ? accountIncome.hidden = false : accountIncome.hidden = true
    type === "expense" || type === "transfer" ? accountExpense.hidden = false : accountExpense.hidden = true
  },

  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes());
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses());
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total());
  },

  updateAccount() {
    Accounts.calc() 
  },

  clearTrasaction() {
    DOM.transactionContainer.innerHTML = ""
  },

  clearAccounts() {
    DOM.accountContainer.innerHTML = ""
  },

  clearHistoric() {
    DOM.historicContainer.innerHTML = "";
    DOM.historicTitle.innerHTML = "";
  },

  clearTabsForm() {
    document.getElementById('tab-income').classList.remove('active');
    document.getElementById('tab-expense').classList.remove('active');
    document.getElementById('tab-transfer').classList.remove('active');

  }

};

const Utils = {
  formatAmount(value){
    value = value * 100
    return Math.round(value)
  },

  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value){
    const signal = Number(value) < 0 ? "-" : ""
    value = String(value).replace(/\D/g, "")

    value = Number(value) / 100

    value = value.toLocaleString("pt-BR", {
      style: 'currency',
      currency: "BRL"
    })
    
    return signal + value
  }
}

const FormTransaction = {  

  getElements() {
    const type= document.querySelector('#typeTransaction');
    const accountIncome= document.querySelector('select#account-income');
    const accountExpense= document.querySelector('select#account-expense');
    const description= document.querySelector('input#description');
    const amount= document.querySelector('input#amount');
    const date= document.querySelector('input#date');

    return {
      type,
      accountIncome,
      accountExpense,
      description,
      amount,
      date,
    }
  },

  getValues() {
    const {type, accountIncome, accountExpense, description, amount, date} = this.getElements();
    return {
      type: type.value,
      accountIncome: accountIncome.value,
      accountExpense: accountExpense.value,
      description: description.value,
      amount: amount.value,
      date: date.value,
    }
  },

  validadeField() {
    const {type, description, accountIncome, accountExpense, amount, date} = this.getValues()
    
    if(type.trim() === "") throw new Error("Por favor, escolhar um tipo de transação")
    if(type.trim() === "income" && accountIncome.trim() === "") throw new Error("Por favor, escolhar um tipo de conta")
    if(type.trim() === "expense" && accountExpense.trim() === "") throw new Error("Por favor, escolhar um tipo de conta")
    if(description.trim() === "") throw new Error("Preencha o campo de descrição")
    if(amount.trim() === "") throw new Error("Preencha o valor")
    if(amount.trim() <= "0") throw new Error("Preencha o valor corretamente ")
    if(date.trim() === "") throw new Error("Informe a data da transação")
  },

  formatValues() {
    let {type, description, accountIncome, accountExpense, amount, date} = this.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      type,  
      accountIncome,
      accountExpense,
      description,
      amount,
      date
    }
  },  

  clearFields() {
    const {type, accountIncome, accountExpense, description, amount, date} = this.getElements();
    type.value = "";
    accountIncome.value = "";
    accountExpense.value = "";
    description.value = "";    
    amount.value = "";
    date.value = "";
  },

  submit(event) {
    event.preventDefault()    
    try {
      this.validadeField()
      const transaction = this.formatValues() 
      Transaction.add(transaction)
      this.clearFields()
      Modal.activeModalTransaction()


    } catch (error) {
      alert(error.message)
    }
  }
}

const FormAccount = {
  type: document.querySelector('select#typeAccount'), 
  institution: document.querySelector('input#institution'),

  getValues() {
    return {
      type: this.type.value,
      institution: this.institution.value,
    }
  },

  validadeField() {
    const {type, institution} = this.getValues()

    if(type.trim() === "" ||
       institution.trim() === ""){
      throw new Error("Por favor, preencha todos os campos")
    }

  },

  submit(event) {    
    event.preventDefault()
    try {
      this.validadeField();
      const account = this.getValues();           
      Accounts.add(account);
      this.clearFields();
      Modal.activeModalAccount();
    }catch(error) {
      alert(erro.message)
    }
  },

  clearFields() {
    this.type.value = "";
    this.institution.value = "";
  },
}

const App = {
  init() {
    /*Transaction.all.map((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })*/

    Transaction.all.map(DOM.addTransaction)       
    DOM.updateBalance()
    DOM.updateAccount()
    Accounts.all.map(DOM.addAccount) 

    Storage.setTransations(Transaction.all)
    Storage.setAccount(Accounts.all)
  },

  reloud() {
    DOM.clearTrasaction();
    DOM.clearAccounts();
    App.init();
  }
}

App.init()
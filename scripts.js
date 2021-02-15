const Modal = {
  activeModalTransaction() {
    // Abrir ou fecha modal
    // Adicionar ou remove a class active ao modal
    Accounts.updateSelect();
    document.querySelector(".modal-overlay.transaction").classList.toggle("active");
  },

  activeModalAccount() {
    // Abrir ou fecha modal
    // Adicionar ou remove a class active ao modal
    Accounts.updateSelect();
    document.querySelector(".modal-overlay.account").classList.toggle("active");
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
// Eu preciso somar as entradas
// depois eu preciso somar as saídas e
// remover das entradas o valor das saídas
// assim, eu terei o total

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
      if(transaction.amount > 0)
      income += transaction.amount
    })
    return income;
  },

  expenses() {
    let expense = 0;
    Transaction.all.map(transaction => {
      if(transaction.amount < 0)
      expense += transaction.amount
    })

    return expense;    
  },

  total() {
    return this.incomes() + this.expenses()
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
    const select = document.querySelector('select#accounts')
    let options = "";

    Accounts.all.map(account => {
      options += `<option value="${account.id}">${account.institution}</option>`
    })

    select.innerHTML = options    
  },

  calc() {
    Accounts.clearBalance();
    Transaction.all.map( transaction => {
      const accountId = Number(transaction.account)

      Accounts.all.map((account, key) => {
        let {id, type, institution, balance} = account
        if(id === accountId) {
          balance += Number(transaction.amount);
          Accounts.all[key] = {id, type, institution, balance: balance}
        }
      })
    })
  },

  clearBalance() {
    Accounts.all.map(account => account.balance = 0)
  }
}

const DOM = {
  transactionContainer: document.querySelector('#data-table tbody'),
  accountContainer: document.querySelector('#accounts-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index 
    
    DOM.transactionContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? "income" : "expense";
    
    const {institution} = Accounts.all.find( account => Number(account.id) === Number(transaction.account))

    const amount = Utils.formatCurrency(transaction.amount)
    
    const html = `        
            <td class="description">${transaction.description}</td>
            <td class="account">${institution}</td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
              <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
            </td>    
    `;
    return html
    
  },

  addAccount(account, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLAccount(account, index)
    tr.dataset.index = index 
    
    DOM.accountContainer.appendChild(tr)
  },

  innerHTMLAccount(account, index) {
    const cssClass = account.balance >= 0 ? "positive" : "negative";

    const balance = Utils.formatCurrency(account.balance)
    
    const html = `        
            <td class="type">${account.type}</td>
            <td class="institution">${account.institution}</td>
            <td class="${cssClass}">${balance}</td>              
    `;
    return html
    
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
  description: document.querySelector('input#description'),
  account: document.querySelector('select#accounts'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: this.description.value,
      account: this.account.value,
      amount: this.amount.value,
      date: this.date.value,
    }
  },

  formatValues() {
    let {description, account, amount, date} = this.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      account,
      amount,
      date
    }
  },
  
  validadeField() {
    const {description, account, amount, date} = this.getValues()

    if(description.trim() === "" ||
        account.trim() === "" ||
        amount.trim() === "" ||
        date.trim() === ""){
      throw new Error("Por favor, preencha todos os campos")
    }
  },

  clearFields() {
    this.description.value = "";
    this.account.value = "";
    this.amount.value = "";
    this.date.value = "";
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
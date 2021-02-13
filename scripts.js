const Modal = {
  active() {
    // Abrir ou fecha modal
    // Adicionar ou remove a class active ao modal
    document.querySelector(".modal-overlay").classList.toggle("active");
  }
};

const Storage = {
  get() {
      return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] 
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}
// Eu preciso somar as entradas
// depois eu preciso somar as saídas e
// remover das entradas o valor das saídas
// assim, eu terei o total

const Transaction = {
  all: Storage.get(),

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

const DOM = {
  transactionContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index 
    
    DOM.transactionContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount)
    
    const html = `        
            <td class="description">${transaction.description}</td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
              <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
            </td>    
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

  clearTrasaction() {
    DOM.transactionContainer.innerHTML = ""
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

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value,
    }
  },

  formatValues() {
    let {description, amount, date} = this.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },
  
  validadeField() {
    const {description, amount, date} = this.getValues()

    if(description.trim() === "" ||
        amount.trim() === "" ||
        date.trim() === ""){
      throw new Error("Por favor, preencha todos os campos")
    }
  },

  clearFields() {
    this.description.value = "";
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
      Modal.active()


    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    /*Transaction.all.map((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })*/

    Transaction.all.map(DOM.addTransaction)
    
    DOM.updateBalance()

    Storage.set(Transaction.all)
  },
  reloud() {
    DOM.clearTrasaction();
    App.init();
  }
}

App.init()
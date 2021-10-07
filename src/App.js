import { useState } from 'react'
import dayjs from 'dayjs'
import './App.css'
let MockApi = require('./Account.json');

function App() {
  const [info, setInfo] = useState({
    TotalCredits: 0,
    TotalDebits: 0,
    EndOfDaybalances:[]
  });

  let brandName = "";
  let accountNumber = ""
  let currentBalance = 0

  brandName = MockApi.brandName
  accountNumber = MockApi.accounts[0].identifiers.accountNumber
  currentBalance = MockApi.accounts[0].balances.current.amount

  const handleDate = (e) => {
    const { value } = e.target;

    const today = new Date(new Date(value).valueOf() - 1000*60*60*24)
    const parsedDate = dayjs(today).format("YYYY-MM-DD");

    MockApi.accounts.forEach((account) => {
        const transaction = account.transactions.filter((transaction) => {
        const currentDate = dayjs(parsedDate);
        const diffDate = dayjs(transaction.bookingDate).format("YYYY-MM-DD");
        return currentDate.diff(diffDate, "d") === 0;
      })
      
      setInfo(resultParser(transaction))
    });
  }

  const resultParser = (items) => {
    let resultSet = {
      TotalCredits: 0,
      TotalDebits: 0,
      EndOfDaybalances:[]
    }

    let totalCredits = 0
    let totalDebits = 0

    for (let i = 0; i < items.length; i++) {
      let parsedDate = dayjs(items[i]?.bookingDate).format("YYYY-MM-DD");
      if (parsedDate === dayjs(items[i+1]?.bookingDate).format("YYYY-MM-DD")) {
        if (items[i]?.creditDebitIndicator === "Credit") {
          totalCredits += items[i]?.amount
        }
        else{
          totalDebits += items[i]?.amount
        }
      }
      else{
        if (items[i]?.creditDebitIndicator === "Credit") {
          totalCredits += items[i]?.amount
        }
        else{
          totalDebits += items[i]?.amount
        }
        resultSet.EndOfDaybalances.push({
          date: dayjs(items[i]?.bookingDate).format("YYYY-MM-DD"),
          balance: currentBalance + (totalCredits - totalDebits)
        })
        resultSet.TotalCredits += totalCredits
        resultSet.TotalDebits += totalDebits
        totalCredits = 0
        totalDebits = 0
      }
    }
    return resultSet
  }

  return (
    <div className="App">
      <div id="header">
        <h1>Welcome to <span>{brandName}</span></h1>
      </div>
      <h3 id="subHeader">Please select a date to calculate balances for account number: <b>{accountNumber}</b></h3>
      <input type="date" onChange={handleDate}/>
      <div className="InfoSection">
        <h3>Account Balance details:</h3>
        {info.TotalCredits == 0 && info.TotalDebits == 0 ? "No data to display" : (
          <>
            <h2>Total <span style={{color: 'green'}}>Credits</span>: {info.TotalCredits} | Total <span style={{color: 'red'}}>Debits</span>: {info.TotalDebits}</h2>

            <div className="container">
              {info.EndOfDaybalances.map((item,index) => {
                return (
                  <>
                  <div className="panel">
                    <p key={index}>Date: {item.date}</p>
                    <p>Balance: {item.balance}</p>
                  </div>
                  </>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
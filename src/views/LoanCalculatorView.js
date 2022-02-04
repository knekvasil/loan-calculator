// LoanCalculatorView.js

import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import LoanTable from "../components/LoanTable";
let axios = require("axios");

function LoanCalculatorView() {
  const [HolidayList, setHolidayList] = useState([]);
  const [YearsCalled, setYearsCalled] = useState([]);
  const [EstimatedPayoffDate, setEstimatedPayoffDate] = useState("");
  const [PaymentList, setPaymentList] = useState([]);
  const [LoanState, setLoanState] = useState({
    start_date: "",
    loan_amount: "",
    installment_interval: "Daily",
    installment_amount: "",
    interest_rate: "",
  });

  useEffect(() => {
    if (loanDate.start_date !== "") {
      getPublicHolidays(loanDate.getFullYear());
    }
  }, [LoanState.start_date]);

  // init new date for incrementation
  const loanDate = new Date(LoanState.start_date);
  loanDate.setDate(loanDate.getDate() + 1);

  async function getPublicHolidays(year) {
    if (!YearsCalled.includes(year)) {
      setYearsCalled((oldArr) => [...oldArr, year]);

      axios
        .get(`https://date.nager.at/api/v3/publicholidays/${year}/US`)
        .then((res) => {
          let data = res.data;
          data.forEach((holiday) => {
            setHolidayList((oldList) => [...oldList, holiday.date]);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function calculatePayments() {
    const loanInterest = (LoanState.loan_amount * (LoanState.interest_rate * 0.01)).toFixed(2);

    let remainingLoanBalance = (parseFloat(Number(LoanState.loan_amount)) + parseFloat(Number(loanInterest))).toFixed(
      2
    );

    let loanStart = {
      date: String(loanDate).substring(0, 15),
      remainder: Number(remainingLoanBalance),
      installment: 0,
    };

    // set first payment as initial loan
    setPaymentList((prevList) => [...prevList, loanStart]);

    while (remainingLoanBalance > 0) {
      // dates need to be handled before anything else
      dateHandler(loanDate);

      if (remainingLoanBalance - Number(LoanState.installment_amount) < 0) {
        // final payment edge case
        let balanceData = {
          date: String(loanDate).substring(0, 15),
          remainder: 0,
          installment: Number(remainingLoanBalance),
        };
        setPaymentList((prevList) => [...prevList, balanceData]);
        setEstimatedPayoffDate(String(loanDate).substring(0, 15));

        remainingLoanBalance = 0;
        break;
      } else {
        // normal payment case
        remainingLoanBalance = (
          parseFloat(remainingLoanBalance) - parseFloat(Number(LoanState.installment_amount))
        ).toFixed(2);

        // each payment is an object with (date, remainder, subracted payment)
        let balanceData = {
          date: String(loanDate).substring(0, 15),
          remainder: Number(remainingLoanBalance),
          installment: Number(LoanState.installment_amount),
        };
        setPaymentList((prevList) => [...prevList, balanceData]);
      }
    }
  }

  function dateHandler() {
    // Increment date depending on interval
    if (LoanState.installment_interval === "Daily") {
      loanDate.setDate(loanDate.getDate() + 1);
    } else if (LoanState.installment_interval === "Weekly") {
      loanDate.setDate(loanDate.getDate() + 7);
    } else {
      loanDate.setDate(loanDate.getDate() + 31);
    }

    // If payments in December, load next year's holidays
    if (loanDate.getMonth() === 11) {
      getPublicHolidays(Number(loanDate.getFullYear()) + 1);
    }

    // format current date for holiday list search
    let dateMonth = String(loanDate.getMonth() + 1);
    let dateFormatter = `${loanDate.getFullYear()}-${dateMonth.padStart(2, "0")}-${String(loanDate.getDate()).padStart(
      2,
      "0"
    )}`;

    // if new day falls on weekend/holiday, increment
    if (loanDate.getDay() === 0 || loanDate.getDay() === 6 || HolidayList.includes(dateFormatter)) {
      while (loanDate.getDay() === 0 || loanDate.getDay() === 6 || HolidayList.includes(dateFormatter)) {
        loanDate.setDate(loanDate.getDate() + 1);

        // reformat incremented new date
        dateMonth = String(loanDate.getMonth() + 1);
        dateFormatter = `${loanDate.getFullYear()}-${dateMonth.padStart(2, "0")}-${String(loanDate.getDate()).padStart(
          2,
          "0"
        )}`;
      }
    }
  }

  function handleChange(event) {
    setLoanState({
      ...LoanState,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit() {
    setPaymentList([]);
    calculatePayments();
  }

  return (
    <>
      <div className="row d-flex justify-content-around flex-row">
        <div className="col-xl-3 rounded shadow-lg mb-5" style={{ maxHeight: "700px" }}>
          <Form className="d-flex flex-column flex-nowrap justify-content-start">
            <h5 className="d-flex flex-start mt-3">Start date:</h5>
            <input
              className="datePicker form-control mb-3 input-lg"
              value={LoanState.start_date}
              type="date"
              name="start_date"
              onChange={handleChange}
            />
            <h5 className="d-flex flex-start mt-3">Loan Amount:</h5>
            <div className="col-auto">
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">$</div>
                </div>
                <input
                  className="form-control mb-3 input-lg"
                  type="text"
                  value={LoanState.loan_amount}
                  onChange={handleChange}
                  name="loan_amount"
                />
              </div>
            </div>
            <h5 className="d-flex flex-start mt-3">Installment Interval:</h5>
            <select onChange={handleChange} name="installment_interval" className="form-control mb-3 input-lg">
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            <h5 className="d-flex flex-start mt-3">Installment Amount:</h5>
            <div className="col-auto">
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">$</div>
                </div>
                <input
                  className="form-control mb-3 input-lg"
                  type="text"
                  value={LoanState.installment_amount}
                  onChange={handleChange}
                  name="installment_amount"
                />
              </div>
            </div>
            <h5 className="d-flex flex-start mt-3">Interest Rate:</h5>
            <div className="col-auto">
              <div className="input-group mb-2">
                <input
                  className="form-control mb-3 input-lg"
                  type="text"
                  value={LoanState.interest_rate}
                  onChange={handleChange}
                  name="interest_rate"
                />
                <div className="input-group-prepend">
                  <div className="input-group-text">%</div>
                </div>
              </div>
            </div>
          </Form>
          <Button className="mb-3" variant="primary" type="submit" onClick={handleSubmit}>
            Submit
          </Button>

          {EstimatedPayoffDate !== "" && (
            <div>
              <h3 className="mt-3">Estimated Payoff Date:</h3>
              <h4 className="mb-4">{EstimatedPayoffDate}</h4>
            </div>
          )}
        </div>
        <div className="shadow-lg col-xl-7 rounded mb-5">
          <LoanTable payments={PaymentList} />
        </div>
      </div>
    </>
  );
}

export default LoanCalculatorView;

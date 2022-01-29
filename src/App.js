import logo from "./logo.svg";
import "./App.css";

import LoanCalculatorView from "./views/LoanCalculatorView";

function App() {
  return (
    <>
      <div className="App">
        <div className="px-4 py-5 my-5 text-center">
          <h1 className="display-5 fw-bold">Loan Repayment Calculator</h1>
          <div className="row justify-content-center">
            <div className="col-5">
              <p className="mt-3">
                The next generation of loan calculator with instant results.
                Simply enter the requested information and we'll do the rest.
              </p>
            </div>
          </div>
        </div>

        <LoanCalculatorView />
      </div>
    </>
  );
}

export default App;

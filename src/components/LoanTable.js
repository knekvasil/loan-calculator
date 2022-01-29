// LoanTable.js

import { useEffect } from "react";
import { Table } from "react-bootstrap";

function LoanTable(props) {
  useEffect(() => {}, []);

  return (
    <Table responsive="sm">
      <thead>
        <tr>
          <th>Payment Due</th>
          <th>Installment</th>
          <th>Remaining Balance</th>
        </tr>
      </thead>

      <tbody>
        {props.payments.map((payment, i) => {
          return (
            <tr key={i}>
              <td>{payment.date}</td>
              <td>- ${payment.installment}</td>
              <td>${payment.remainder}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default LoanTable;

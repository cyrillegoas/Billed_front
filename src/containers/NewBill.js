import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = e.target
      .querySelector(`input[data-testid="file"]`)
      .value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    const email = JSON.parse(localStorage.getItem("user")).email;
    const type = e.target.querySelector(
      `select[data-testid="expense-type"]`
    ).value;
    const name = e.target.querySelector(
      `input[data-testid="expense-name"]`
    ).value;
    const amount = parseInt(
      e.target.querySelector(`input[data-testid="amount"]`).value
    );
    const date = e.target.querySelector(
      `input[data-testid="datepicker"]`
    ).value;
    const vat = e.target.querySelector(`input[data-testid="vat"]`).value;
    const pct =
      parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20;
    const commentary = e.target.querySelector(
      `textarea[data-testid="commentary"]`
    ).value;
    const status = "pending";

    formData.append("file", file);
    formData.append("email", email);
    formData.append("type", type);
    formData.append("name", name);
    formData.append("amount", amount);
    formData.append("date", date);
    formData.append("vat", vat);
    formData.append("pct", pct);
    formData.append("commentary", commentary);
    formData.append("status", status);
    formData.append("fileName", fileName);

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then((key) => {
        this.billId = key;
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.onNavigate(ROUTES_PATH["Bills"]);
      });
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}

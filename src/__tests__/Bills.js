/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { formatDate } from '../app/format.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';

import router from '../app/Router.js';

jest.mock('../app/Store.js', () => mockStore);

describe('Given I am connected as an employee', () => {
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.append(root);
  router();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));

  describe('When I am on Bills Page and bills are loaded', () => {
    window.onNavigate(ROUTES_PATH.Bills);

    test('Then only the bill icon in vertical layout should be highlighted', () => {
      const windowIcon = document.querySelector('#layout-icon1');
      const mailIcon = document.querySelector('#layout-icon2');
      expect(windowIcon).toHaveClass('active-icon');
      expect(mailIcon).not.toHaveClass('active-icon');
    });
    test('Then we should have the same number of bills as in mockStore', async () => {
      const mockBillsCount = (await mockStore.bills().list()).length;
      const billCount = document.querySelector('tbody').childElementCount;
      expect(billCount).toBe(mockBillsCount);
    });
    test('Then bills should be ordered from earliest to latest', async () => {
      const tableBody = document.querySelector('tbody');
      const tableRows = tableBody.querySelectorAll('tr');
      const dates = Array.from(tableRows).map(
        (bill) => bill.children[2].textContent
      );
      const expectedDates = (await mockStore.bills().list())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((bill) => formatDate(bill.date));
      expect(dates).toEqual(expectedDates);
    });
    test('Then modal should not have a show class by default', () => {});
    test('Then clicking on the eye icon should open a modal', async () => {});
    test('Then clicking outside of the modal should close it', () => {});
    test('Then clicking clicking on "create new bill" should route to newbill UI', () => {});
  });

  describe('When I am on Bills Page and bills are loading', () => {
    test('Then only the bill icon in vertical layout should be highlighted', () => {});
    test('Then a loading message should be present', () => {});
  });

  describe('When I am on Bills Page and an error occurs', () => {
    test('Then only the bill icon in vertical layout should be highlighted', () => {});
    test('Then a error message should be present', () => {});
  });
});

/**
 * @jest-environment jsdom
 */
import { enableFetchMocks } from 'jest-fetch-mock';
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

enableFetchMocks();

describe('Given I am connected as an employee', () => {
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.append(root);
  router();
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));

  describe('When I am on Bills Page and bills are loaded', () => {
    beforeAll(() => {
      fetch.resetMocks();
      fetch.mockResponseOnce(JSON.stringify(bills));
      window.onNavigate(ROUTES_PATH.Bills);
    });

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
    test('Then modal should not have a show class by default', () => {
      const modalEl = document.querySelector('.modal');
      expect(modalEl).not.toHaveClass('show');
    });
    test('Then clicking on the eye icon should open a modal', async () => {
      const openModalEl = document.querySelector('#eye');
      const spy = jest.spyOn(global.$.fn.modal, 'show');
      const user = userEvent.setup();
      await user.click(openModalEl);
      expect(spy).toHaveBeenCalledTimes(1);
    });
    test('Then clicking on "create new bill" should route to newbill UI', async () => {
      const openNewBill = document.querySelector(
        '[data-testid="btn-new-bill"]'
      );
      const user = userEvent.setup();
      await user.click(openNewBill);
      const url = document.URL;
      expect(url.split('/').pop()).toBe('new');
    });
  });

  describe('When I am on Bills Page and a 404 error occurs', () => {
    beforeAll(() => {
      fetch.resetMocks();
      fetch.mockResponseOnce(JSON.stringify(bills), { status: 404 });
      window.onNavigate(ROUTES_PATH.Bills);
    });
    test('Then a error message should be present', () => {
      expect(screen.getByTestId('error-message')).toBeTruthy();
    });
  });

  describe('When I am on Bills Page and a 500 error occurs', () => {
    beforeAll(() => {
      fetch.resetMocks();
      fetch.mockResponseOnce(JSON.stringify(bills), { status: 500 });
      window.onNavigate(ROUTES_PATH.Bills);
    });
    test('Then a error message should be present', () => {
      expect(screen.getByTestId('error-message')).toBeTruthy();
    });
  });

  describe('When we have corrupted data', () => {
    beforeAll(() => {
      const corruptedData = [{ date: 'corrupted' }];
      fetch.resetMocks();
      fetch.mockResponseOnce(JSON.stringify(corruptedData), { status: 200 });
      window.onNavigate(ROUTES_PATH.Bills);
    });
    test('Then a error message should be present', () => {
      const tableRow = document.querySelector('tbody tr');
      const thirdChild = tableRow.children[2].textContent;
      expect(thirdChild).toBe('corrupted');
    });
  });
});

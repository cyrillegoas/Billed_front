/**
 * @jest-environment jsdom
 */
import { enableFetchMocks } from 'jest-fetch-mock';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import { ROUTES_PATH } from '../constants/routes.js';
import router from '../app/Router.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { bills } from '../fixtures/bills.js';

enableFetchMocks();

describe('Given I am connected as an employee', () => {
  beforeAll(() => {
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.innerHTML = '';
    document.body.append(root);
    router();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
  });
  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      window.onNavigate(ROUTES_PATH.NewBill);
    });
    test('Then only the mail icon in vertical layout should be highlighted', () => {
      const windowIcon = document.querySelector('#layout-icon1');
      const mailIcon = document.querySelector('#layout-icon2');
      expect(windowIcon).not.toHaveClass('active-icon');
      expect(mailIcon).toHaveClass('active-icon');
    });
    test('Then we should have a new bill form', () => {
      const content = document.querySelector('.content');
      expect(content.innerHTML).toMatchSnapshot();
    });
    test('Then when "envoyer" is clicked a new bill should be created', async () => {
      fetch.resetMocks();
      fetch.mockResponses(
        [JSON.stringify('returned key'), { status: 200 }],
        [JSON.stringify(bills), { status: 200 }]
      );

      const expectedType = 'Transports';
      const expectedName = 'fake bill';
      const expectedDatepicker = '2000-01-01';
      const expectedAmount = '100';
      const expectedVat = '11';
      const expectedPct = '22';
      const expectedCommentary = 'comment';
      const expectedFile = '';

      document.querySelector('[data-testid="expense-type"]').value =
        expectedType;
      document.querySelector('[data-testid="expense-name"]').value =
        expectedName;
      document.querySelector('[data-testid="datepicker"]').value =
        expectedDatepicker;
      document.querySelector('[data-testid="amount"]').value = expectedAmount;
      document.querySelector('[data-testid="vat"]').value = expectedVat;
      document.querySelector('[data-testid="pct"]').value = expectedPct;
      document.querySelector('[data-testid="commentary"]').value =
        expectedCommentary;
      document.querySelector('[data-testid="file"]').value = expectedFile;

      const sendBtn = document.querySelector('#btn-send-bill');
      const user = userEvent.setup();
      await user.click(sendBtn);
      await waitFor(() => document.URL.split('/').pop() === 'bills');
      expect(document.URL.split('/').pop()).toBe('bills');

      const fetchCallBody = fetch.mock.calls[0][1].body;
      expect(fetchCallBody.get('fileName')).toBe('');
      expect(fetchCallBody.get('type')).toBe(expectedType);
      expect(fetchCallBody.get('name')).toBe(expectedName);
      expect(fetchCallBody.get('amount')).toBe(expectedAmount);
      expect(fetchCallBody.get('date')).toBe(expectedDatepicker);
      expect(fetchCallBody.get('vat')).toBe(expectedVat);
      expect(fetchCallBody.get('pct')).toBe(expectedPct);
      expect(fetchCallBody.get('commentary')).toBe(expectedCommentary);
      expect(fetch.mock.calls[0][1].body.get('status')).toBe('pending');
    });
    test('Then when "envoyer" is clicked but a 404 error occurs', async () => {
      fetch.resetMocks();
      fetch.mockResponseOnce({}, { status: 404 });

      const spy = jest.spyOn(console, 'error');

      const sendBtn = document.querySelector('#btn-send-bill');
      const user = userEvent.setup();
      await user.click(sendBtn);

      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
    });
    test('Then when "envoyer" is clicked but a 500 error occurs', async () => {
      fetch.resetMocks();
      fetch.mockResponseOnce({}, { status: 500 });

      const spy = jest.spyOn(console, 'error');

      const sendBtn = document.querySelector('#btn-send-bill');
      const user = userEvent.setup();
      await user.click(sendBtn);

      expect(spy).toBeCalledTimes(1);
      spy.mockRestore();
    });
  });
});

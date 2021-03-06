/*
Copyright 2019 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import { fireEvent } from 'react-testing-library';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithIntl, rerenderWithIntl } from '../../utils/test';
import SecretsModal from '.';
import * as API from '../../api';

// Declares scrollIntoView as a function for testing purposes
window.HTMLElement.prototype.scrollIntoView = function scrollIntoViewTestStub() {};

const middleware = [thunk];
const mockStore = configureStore(middleware);

const secrets = {
  byNamespace: {},
  errorMessage: null,
  isFetching: false
};

const namespaces = {
  byName: {
    default: {
      metadata: {
        name: 'default',
        selfLink: '/api/v1/namespaces/default',
        uid: '32b35d3b-6ce1-11e9-af21-025000000001',
        resourceVersion: '4',
        creationTimestamp: '2019-05-02T13:50:08Z'
      }
    }
  },
  errorMessage: null,
  isFetching: false,
  selected: 'default'
};

const serviceAccountsByNamespace = {
  default: {
    'service-account-1': 'id-service-account-1',
    'service-account-2': 'id-service-account-2'
  },
  green: {
    'service-account-3': 'id-service-account-3'
  }
};

const serviceAccountsById = {
  'id-service-account-1': {
    metadata: {
      name: 'service-account-1',
      namespace: 'default',
      uid: 'id-service-account-1'
    }
  },
  'id-service-account-2': {
    metadata: {
      name: 'service-account-2',
      namespace: 'default',
      uid: 'id-service-account-2'
    }
  },
  'id-service-account-3': {
    metadata: {
      name: 'service-account-3',
      namespace: 'green',
      uid: 'id-service-account-3'
    }
  }
};

const store = mockStore({
  secrets,
  namespaces,
  notifications: {},
  serviceAccounts: {
    byId: serviceAccountsById,
    byNamespace: serviceAccountsByNamespace,
    isFetching: false
  }
});

it('SecretsModal renders blank', () => {
  const props = {
    open: true
  };

  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);
  jest.spyOn(API, 'getServiceAccounts').mockImplementation(() => []);

  const { queryByText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  expect(queryByText('Create Secret')).toBeTruthy();
  expect(queryByText('Close')).toBeTruthy();
  expect(queryByText('Submit')).toBeTruthy();
});

it('Test SecretsModal click events', () => {
  const handleHideModal = jest.fn();
  const handleSubmit = jest.fn();
  const props = {
    open: true,
    handleHideModal
  };

  jest.spyOn(API, 'getNamespaces').mockImplementation(() => []);
  jest.spyOn(API, 'getServiceAccounts').mockImplementation(() => []);

  const { queryByText, rerender } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.click(queryByText('Close'));
  expect(handleHideModal).toHaveBeenCalledTimes(1);

  rerenderWithIntl(
    rerender,
    <Provider store={store}>
      <SecretsModal open={false} />
    </Provider>
  );
  fireEvent.click(queryByText('Submit'));
  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

const nameValidationErrorMsgRegExp = /Must not start or end with - and be less than 253 characters, contain only lowercase alphanumeric characters or -/i;
const namespaceValidationErrorRegExp = /Namespace required./i;
const usernameValidationErrorRegExp = /Username required./i;
const passwordValidationErrorRegExp = /Password or Token required./i;
const serviceAccountValidationErrorRegExp = /Service Account required./i;
const serverurlValidationErrorRegExp = /Server URL required./i;

const props = {
  open: true
};

it('Create Secret validates all empty inputs', () => {
  const { queryByText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it('Create Secret errors when starting with a "-"', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: '-meow' }
  });
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it('Create Secret errors when ends with a "-"', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'meow-' }
  });
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it('Create Secret errors when contains "."', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'meow.meow' }
  });
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it('Create Secret errors when contains spaces', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the cat goes meow' }
  });
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it('Create Secret errors when contains capital letters', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'MEOW' }
  });
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it('Create Secret doesn\'t error when contains "-" in the middle of the secret', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-goes-meow' }
  });
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when contains 0", () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-likes-0' }
  });
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when contains 9", () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-likes-9' }
  });
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it('Create Secret errors when contains 253 characters', () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: {
      value:
        '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111121212121212121212121212121212121212111111113333333333'
    }
  });
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeTruthy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when contains 252 characters", () => {
  const { queryByText, getByPlaceholderText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: {
      value:
        '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111121212121212121212121212121212121212111111113333333333'
    }
  });
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when contains a valid namespace", () => {
  const { queryByText, getByPlaceholderText, getByText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-goes-meow' }
  });
  fireEvent.click(getByText(/select namespace/i));
  fireEvent.click(getByText(/default/i));
  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when Docker Registry is selected", () => {
  const { queryByText, getByPlaceholderText, getByText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-goes-meow' }
  });
  fireEvent.click(getByText(/select namespace/i));
  fireEvent.click(getByText(/default/i));

  fireEvent.click(getByText(/git server/i));
  fireEvent.click(getByText(/docker registry/i));

  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when a username is entered", () => {
  const { queryByText, getByPlaceholderText, getByText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-goes-meow' }
  });
  fireEvent.click(getByText(/select namespace/i));
  fireEvent.click(getByText(/default/i));

  fireEvent.change(getByPlaceholderText(/username/i), {
    target: { value: 'the-cat-goes-meow' }
  });

  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

it("Create Secret doesn't error when a password is entered", () => {
  const { queryByText, getByPlaceholderText, getByText } = renderWithIntl(
    <Provider store={store}>
      <SecretsModal {...props} />
    </Provider>
  );
  fireEvent.change(getByPlaceholderText(/secret-name/i), {
    target: { value: 'the-cat-goes-meow' }
  });
  fireEvent.click(getByText(/select namespace/i));
  fireEvent.click(getByText(/default/i));

  fireEvent.change(getByPlaceholderText(/username/i), {
    target: { value: 'the-cat-goes-meow' }
  });

  fireEvent.change(getByPlaceholderText('********'), {
    target: { value: 'password' }
  });

  fireEvent.click(queryByText('Submit'));
  expect(queryByText(nameValidationErrorMsgRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(usernameValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(passwordValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(serviceAccountValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(serverurlValidationErrorRegExp)).toBeFalsy();
});

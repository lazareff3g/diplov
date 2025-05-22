// src/__mocks__/react-router-dom.js
const reactRouterDom = {
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: () => null,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null })
};

module.exports = reactRouterDom;

import 'antd/dist/antd.css';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Layout } from 'antd';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Header from './components/header';
import LandingPage from './components/landing-page';
import * as serviceWorker from './serviceWorker';
import Appeal from './components/appeal';

import DamageInput from './components/damages';

const { Content, Footer } = Layout;

const Page = () => (
  <Router>
    <Layout className="layout">
      <Header />
      <Content style={{ padding: '0 3vw' }}>
        <div className="site-layout-content">
          <Switch>
            <Route
              path="/detroit"
              render={() => <Appeal city="detroit" />}
            />
            <Route
              path="/chicago"
              render={() => <Appeal city="chicago" />}
            />
            <Route
              path="/test"
              render={() => <DamageInput />}
            />
            <Route
              path="/"
              render={() => <LandingPage />}
            />
          </Switch>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Property Tax Appeal Project</Footer>
    </Layout>
  </Router>
);

ReactDOM.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

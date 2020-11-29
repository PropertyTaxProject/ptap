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
import Header from './general/header';
import * as serviceWorker from './serviceWorker';

import LandingPage from './landing/landing-page';
import Appeal from './appeal/appeal';
import GetStarted from './landing/get-started';
import SelectRegion from './landing/select-region';
import FinalPage from './landing/final-page';

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
              path="/cook"
              render={() => <Appeal city="chicago" />}
            />
            <Route
              path="/getstarted"
              render={() => <GetStarted />}
            />
            <Route
              path="/selectregion"
              render={() => <SelectRegion />}
            />
            <Route 
              path='/completedappeal' 
              render={() => <FinalPage />}
            />
            <Route 
              path='/illegalforeclosures' 
              component={() => { 
                window.location.href = 'https://illegalforeclosures.org/'; return null;}}
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

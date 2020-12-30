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

import DetroitLandingPage from './landing/detroit-landing-page';
import Appeal from './appeal/appeal';
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
              render={() => <DetroitLandingPage />}
            />
            <Route
              path="/detroitappeal"
              render={() => <Appeal city="detroit" />}
            />
            <Route
              path="/cook"
              render={() => <Appeal city="chicago" />}
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
              render={() => <SelectRegion />}
            />
          </Switch>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Call 313-438-8698 with any questions. Please leave a message if we don't pick up and we will return your call within 48 hours.</Footer>
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

import 'antd/dist/antd.css';
import './index.css';
import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import { Layout } from 'antd';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import ReactGA from 'react-ga';

import Header from './general/header';
import DetroitLandingPage from './landing/detroit-landing-page';
import Appeal from './appeal/appeal';
import SelectRegion from './landing/select-region';
import FinalPage from './landing/final-page';
import Lookup from './appeal/pages/overassessment-estimator';

const { Content, Footer } = Layout;

/* google analytics */
ReactGA.initialize('UA-178459008-2');
const history = createHistory();
history.listen(location => {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
});

const Page = () => {
  useEffect( () => {
    ReactGA.pageview(window.location.pathname);
  }, []);
  return(
  <Router history={history}>
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
            render={() => <DetroitLandingPage />}
          />        
          <Route
            path="/estimate"
            render={() => <Lookup />}
          />        
          <Route
            path="/internaldetroitappeal"
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
  )
};

ReactDOM.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
  document.getElementById('root'),
);

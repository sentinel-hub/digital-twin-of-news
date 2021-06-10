import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';

import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import Home from './Routes/Home';
import EventPage from './Routes/EventPage';
import Login from './auth/Login';
import EventProvider from './components/Event/EventProvider';

import EventsProvider from './components/EventsProvider/EventsProvider';

import './App.scss';

function App() {
  return (
    <div className="app">
      <EventsProvider />
      <HashRouter>
        <Switch>
          <Route path={'/login'}>
            <Login />
          </Route>
          <Route path={'/:eventId/map'}>
            <EventProvider>
              {({ event, error }) => (
                <EventPage key={event && event['id']} event={event} error={error} isFullscreenMap={true} />
              )}
            </EventProvider>
          </Route>
          <Route path={'/:eventId'}>
            <EventProvider>
              {({ event, error }) => (
                <EventPage key={event && event['id']} event={event} error={error} isFullscreenMap={false} />
              )}
            </EventProvider>
          </Route>
          <Route path={'/'}>
            <Home />
          </Route>
        </Switch>
      </HashRouter>
    </div>
  );
}

export default App;

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { useAuth } from './shared/hooks/auth-hook';

import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';

// replace imports with lazy loading...
const Users = React.lazy(() => import('./pages/Users'));
const UserPlaces = React.lazy(() => import('./pages/UserPlaces'));
const PlaceCreate = React.lazy(() => import('./pages/PlaceCreate'));
const PlaceUpdate = React.lazy(() => import('./pages/PlaceUpdate'));
const Auth = React.lazy(() => import('./pages/Auth'));

const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;

  // list more specific routes before the more general route.
  if (token) {
    routes = (
      <Switch>
        <Route path='/' exact>
          <Users />
        </Route>

        <Route path='/users' exact>
          <Users />
        </Route>
        <Route path='/users/:userId/places' exact>
          <UserPlaces />
        </Route>

        <Route path='/places/new'>
          <PlaceCreate />
        </Route>
        <Route path='/places/:placeId'>
          <PlaceUpdate />
        </Route>
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path='/' exact>
          <Users />
        </Route>

        <Route path='/users' exact>
          <Users />
        </Route>
        <Route path='/users/:userId/places' exact>
          <UserPlaces />
        </Route>

        <Route path='/auth'>
          <Auth />
        </Route>
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token, //token converted to boolean
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <MainNavigation />
        <main>
          <Suspense
            fallback={
              <div className='center'>
                <LoadingSpinner />
              </div>
            }
          >
            {routes}
          </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;

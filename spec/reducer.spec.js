import {
  ROUTE_CHANGE,
  ROUTE_ERROR,
  INITIAL_ROUTE_RESOLVED,
  PUSH,
  transformToPath
} from 'lib/actions.js';
import reducer, {
  hasRouting,
  getCurrent,
  getLast,
  getRouteError,
  getIsInitalRouteResolved
} from 'lib/reducer.js';

describe('reducer', function() {
  beforeEach(function(){
    history.pushState(null, null, '/');
  });

  it('should return initial state', function(){
    // manually pass initial state to reducer,
    // because wallaby uses their internal script(/wallaby_sandbox0.html) for testing.
    const initialState = {
      current: transformToPath(location),
      last: null
    };

    assert.deepEqual(reducer(initialState, {}), {
      current: {path: '/', query: ''},
      last: null
    });
  });

  it('should apply routeChange to state', function(){
    history.pushState(null, null, '/sample');

    assert.deepEqual(reducer({
      current: {
        path: '/',
        query: ''
      },
      last: null
    }, {
      type: ROUTE_CHANGE,
      payload: transformToPath(location)
    }), {
      current: {
        path: '/sample',
        query: ''
      },
      last: {
        path: '/',
        query: ''
      }
    });
  });

  it('should apply push to state', function(){
    history.pushState(null, null, '/sample');

    assert.deepEqual(reducer({
      current: {
        path: '/',
        query: ''
      },
      last: null
    }, {
      type: PUSH,
      payload: transformToPath(location)
    }), {
      current: {
        path: '/sample',
        query: ''
      },
      last: {
        path: '/',
        query: ''
      }
    });
  });

  it('should apply routeError to state', function(){
    assert.deepEqual(reducer({
      current: '/',
      last: null,
      routeError: false
    }, {
      type: ROUTE_ERROR,
      payload: true
    }), {
      current: '/',
      last: null,
      routeError: true
    });
  });

  it('should apply initialRouteResolved to state', function(){
    assert.deepEqual(reducer({
      current: '/',
      last: null,
      isInitialRouteResolved: false
    }, {
      type: INITIAL_ROUTE_RESOLVED
    }), {
      current: '/',
      last: null,
      isInitialRouteResolved: true
    });
  });
});


describe('hasRouting', function() {
  beforeEach(function(){
    history.pushState(null, null, '/');
  });

  it('should return null with valid state', function(){
    assert.equal(hasRouting({routing: {}}), true);
  });

  it('should return null with invalid state', function(){
    assert.equal(hasRouting({}), null);
  });
});

describe('selectors', function() {
  it('should return current from the state', function(){
    assert.equal(getCurrent({routing: {current: 'sample'}}), 'sample');
  });

  it('should return last from the state', function(){
    assert.equal(getLast({routing: {last: 'sample'}}), 'sample');
  });

  it('should return routeError from the state', function(){
    assert.equal(getRouteError({routing: {routeError: true}}), true);
  });

  it('should return isInitialRouteResolved from the state', function(){
    assert.equal(getIsInitalRouteResolved({routing: {isInitialRouteResolved: true}}), true);
  });
});

import {
  PUSH,
  REPLACE,
  GO,
  BACK,
  FORWARD
} from 'lib/actions.js';
import middlewareCreator from 'lib/middleware.js';
import {transformToPath} from 'lib/reducer.js';
import routerCreator from 'lib/router.js';

describe('middleware', function() {

  let middleware;
  let dispatch;
  let sandbox;
  let router;
  beforeEach(function(){
    sandbox = sinon.sandbox.create();
    const store = {
      getState: sandbox.spy(() => {
        return {
          routing: {
            current: transformToPath(location)
          }
        }
      }),
      dispatch: sandbox.spy(() => {})
    };

    // starts with '/'
    history.pushState(null, null, '/');

    // spy history methods
    history.pushState = sandbox.spy(history, 'pushState');
    history.replaceState = sandbox.spy(history, 'replaceState');
    history.go = sandbox.spy(history, 'go');
    history.back = sandbox.spy(history, 'back');
    history.forward = sandbox.spy(history, 'forward');

    router = routerCreator(store);
    dispatch = sandbox.spy((action) => action);
    middleware = middlewareCreator(history)(store)(dispatch);
  });

  afterEach(function(){
    sandbox.restore();
  });

  it('should accept push action', function(){
    middleware({
      type: PUSH,
      payload: '/sample'
    });

    assert.equal(dispatch.called, true);
    assert.equal(dispatch.calledWith({
      type: PUSH,
      payload: location
    }), true);
    assert.equal(history.pushState.called, true);
  });

  it('should not accept duplicated push action', function(){
    // try to change url from '/' to '/'
    middleware({
      type: PUSH,
      payload: '/'
    });

    assert.equal(dispatch.called, false);
    assert.equal(history.pushState.called, false);
  });

  it('should accept replace action', function(){
    middleware({
      type: REPLACE,
      payload: '/sample'
    });

    assert.equal(dispatch.called, true);
    assert.equal(dispatch.calledWith({
      type: REPLACE,
      payload: location
    }), true);
    assert.equal(history.replaceState.called, true);
  });

  it('should accept go action', function(){
    middleware({
      type: GO,
      payload: -1
    });

    assert.equal(dispatch.called, true);
    assert.equal(dispatch.calledWith({
      type: GO,
      payload: location
    }), true);
    assert.equal(history.go.called, true);
  });

  it('should accept back action', function(){
    middleware({
      type: BACK
    });

    assert.equal(dispatch.called, true);
    assert.equal(dispatch.calledWith({
      type: BACK,
      payload: location
    }), true);
    assert.equal(history.back.called, true);
  });

  it('should accept forward action', function(){
    middleware({
      type: FORWARD
    });

    assert.equal(dispatch.called, true);
    assert.equal(dispatch.calledWith({
      type: FORWARD,
      payload: location
    }), true);
    assert.equal(history.forward.called, true);
  });

  it('should pass-through other action', function(){
    middleware({});

    assert.equal(dispatch.calledWith({}), true);
    assert.equal(dispatch.called, true);
  });

  it('should call router\'s onEnter hook on push', function(){
    const onEnter = sinon.spy((state, cb) => {
      assert.deepEqual(state, {
        routing: {
          current: transformToPath(location)
        }
      });
      cb();
    });
    router.onEnter('/sample', onEnter);

    middleware({
      type: PUSH,
      payload: '/sample'
    });

    assert.equal(dispatch.called, true);
    assert.equal(dispatch.calledWith({
      type: PUSH,
      payload: location
    }), true);
    assert.equal(onEnter.called, true);
    assert.equal(location.pathname, '/sample');
  });

  it('should not dispatch history action if router\'s onEnter not calls callback.', function(){
    const onEnter = sinon.spy((state) => {
      assert.deepEqual(state, {
        routing: {
          current: transformToPath(location)
        }
      });
    });
    router.onEnter('/sample', onEnter);

    middleware({
      type: PUSH,
      payload: '/sample'
    });

    assert.equal(dispatch.called, false);
    assert.equal(onEnter.called, true);
    assert.equal(location.pathname, '/');
  });

  it('should call router\'s onLeave hook on push', function(){
    const onLeave = sinon.spy((state) => {
      assert.deepEqual(state, {
        routing: {
          current: transformToPath(location)
        }
      });
    });
    router.onLeave('/', onLeave);

    middleware({
      type: PUSH,
      payload: '/sample'
    });

    assert.equal(dispatch.called, true);
    assert.equal(dispatch.calledWith({
      type: PUSH,
      payload: location
    }), true);
    assert.equal(onLeave.called, true);
    assert.equal(location.pathname, '/sample');
  });
});

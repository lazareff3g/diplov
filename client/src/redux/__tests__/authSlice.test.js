import authReducer, { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout 
} from '../slices/authSlice';

describe('Auth Reducer', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  };

  test('should return the initial state', () => {
    expect(authReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle loginStart', () => {
    const action = loginStart();
    const state = authReducer(initialState, action);
    
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  test('should handle loginSuccess', () => {
    const user = { id: 1, username: 'testuser' };
    const action = loginSuccess(user);
    const state = authReducer(initialState, action);
    
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  test('should handle loginFailure', () => {
    const error = 'Invalid credentials';
    const action = loginFailure(error);
    const state = authReducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.error).toBe(error);
  });

  test('should handle logout', () => {
    const loggedInState = {
      user: { id: 1, username: 'testuser' },
      isAuthenticated: true,
      loading: false,
      error: null
    };
    
    const action = logout();
    const state = authReducer(loggedInState, action);
    
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.error).toBe(null);
  });
});

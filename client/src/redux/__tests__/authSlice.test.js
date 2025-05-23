// src/redux/__tests__/authSlice.test.js
import authReducer, { 
  loginStart, 
  loginSuccess, 
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  clearError,
  updateUserProfile,
  setCredentials
} from '../slices/authSlice';

describe('Auth Reducer', () => {
  const initialState = {
    user: null,
    token: null,           // Добавлено поле token
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
    const payload = { 
      user: { id: 1, username: 'testuser' },
      token: 'jwt-token-123'
    };
    const action = loginSuccess(payload);
    const state = authReducer(initialState, action);
    
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(payload.user);
    expect(state.token).toBe(payload.token);
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
    expect(state.token).toBe(null);
    expect(state.error).toBe(error);
  });

  test('should handle registerStart', () => {
    const action = registerStart();
    const state = authReducer(initialState, action);
    
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  test('should handle registerSuccess', () => {
    const payload = { 
      user: { id: 2, username: 'newuser' },
      token: 'jwt-token-456'
    };
    const action = registerSuccess(payload);
    const state = authReducer(initialState, action);
    
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(payload.user);
    expect(state.token).toBe(payload.token);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  test('should handle registerFailure', () => {
    const error = 'User already exists';
    const action = registerFailure(error);
    const state = authReducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.error).toBe(error);
  });

  test('should handle logout', () => {
    const loggedInState = {
      user: { id: 1, username: 'testuser' },
      token: 'jwt-token-123',
      isAuthenticated: true,
      loading: false,
      error: null
    };
    
    const action = logout();
    const state = authReducer(loggedInState, action);
    
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.error).toBe(null);
  });

  test('should handle clearError', () => {
    const errorState = {
      ...initialState,
      error: 'Some error'
    };
    
    const action = clearError();
    const state = authReducer(errorState, action);
    
    expect(state.error).toBe(null);
  });

  test('should handle updateUserProfile', () => {
    const currentState = {
      ...initialState,
      user: { id: 1, username: 'testuser', email: 'test@example.com' },
      isAuthenticated: true
    };
    
    const updates = { username: 'updateduser', profile_picture: 'avatar.jpg' };
    const action = updateUserProfile(updates);
    const state = authReducer(currentState, action);
    
    expect(state.user).toEqual({
      id: 1,
      username: 'updateduser',
      email: 'test@example.com',
      profile_picture: 'avatar.jpg'
    });
  });

  test('should handle setCredentials', () => {
    const credentials = {
      user: { id: 3, username: 'creduser' },
      token: 'cred-token-789'
    };
    
    const action = setCredentials(credentials);
    const state = authReducer(initialState, action);
    
    expect(state.user).toEqual(credentials.user);
    expect(state.token).toBe(credentials.token);
    expect(state.isAuthenticated).toBe(true);
  });

  // Тест для обратной совместимости - loginSuccess с простым user объектом
  test('should handle loginSuccess with user object only (backward compatibility)', () => {
    const user = { id: 1, username: 'testuser' };
    const action = loginSuccess(user);
    const state = authReducer(initialState, action);
    
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });
});

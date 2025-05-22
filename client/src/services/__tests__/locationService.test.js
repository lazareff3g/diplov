import locationService from '../locationService';
import api from '../api';

// Мокаем модуль api
jest.mock('../api');

describe('locationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getLocations should fetch locations with filters', async () => {
    const mockLocations = [{ id: 1, name: 'Test Location' }];
    api.get.mockResolvedValue({ data: mockLocations });
    
    const filters = { category: 1 };
    const result = await locationService.getLocations(filters);
    
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('category=1'));
    expect(result).toEqual(mockLocations);
  });

  test('getLocationById should fetch location by id', async () => {
    const mockLocation = { id: 1, name: 'Test Location' };
    api.get.mockResolvedValue({ data: mockLocation });
    
    const result = await locationService.getLocationById(1);
    
    expect(api.get).toHaveBeenCalledWith('/locations/1');
    expect(result).toEqual(mockLocation);
  });

  test('createLocation should post new location', async () => {
    const mockLocation = { name: 'New Location', description: 'Test' };
    const mockResponse = { ...mockLocation, id: 1 };
    api.post.mockResolvedValue({ data: mockResponse });
    
    const result = await locationService.createLocation(mockLocation);
    
    expect(api.post).toHaveBeenCalledWith('/locations', mockLocation);
    expect(result).toEqual(mockResponse);
  });

  test('updateLocation should update location', async () => {
    const mockLocation = { name: 'Updated Location' };
    const mockResponse = { ...mockLocation, id: 1 };
    api.put.mockResolvedValue({ data: mockResponse });
    
    const result = await locationService.updateLocation(1, mockLocation);
    
    expect(api.put).toHaveBeenCalledWith('/locations/1', mockLocation);
    expect(result).toEqual(mockResponse);
  });

  test('deleteLocation should delete location', async () => {
    const mockResponse = { success: true };
    api.delete.mockResolvedValue({ data: mockResponse });
    
    const result = await locationService.deleteLocation(1);
    
    expect(api.delete).toHaveBeenCalledWith('/locations/1');
    expect(result).toEqual(mockResponse);
  });
});

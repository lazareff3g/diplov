// Добавьте эти методы в models/locationModel.js

// Обновление локации
const updateLocation = async (id, locationData) => {
    const {
      name, description, coordinates, address, category_id,
      best_time_of_day, best_season, accessibility,
      difficulty_level, permission_required
    } = locationData;
    
    let query = 'UPDATE locations SET ';
    const values = [];
    const updateFields = [];
    
    if (name) {
      values.push(name);
      updateFields.push(`name = $${values.length}`);
    }
    
    if (description) {
      values.push(description);
      updateFields.push(`description = $${values.length}`);
    }
    
    if (coordinates) {
      values.push(coordinates[0], coordinates[1]);
      updateFields.push(`coordinates = point($${values.length-1}, $${values.length})`);
    }
    
    if (address) {
      values.push(address);
      updateFields.push(`address = $${values.length}`);
    }
    
    if (category_id) {
      values.push(category_id);
      updateFields.push(`category_id = $${values.length}`);
    }
    
    if (best_time_of_day) {
      values.push(best_time_of_day);
      updateFields.push(`best_time_of_day = $${values.length}`);
    }
    
    if (best_season) {
      values.push(best_season);
      updateFields.push(`best_season = $${values.length}`);
    }
    
    if (accessibility) {
      values.push(accessibility);
      updateFields.push(`accessibility = $${values.length}`);
    }
    
    if (difficulty_level) {
      values.push(difficulty_level);
      updateFields.push(`difficulty_level = $${values.length}`);
    }
    
    if (permission_required !== undefined) {
      values.push(permission_required);
      updateFields.push(`permission_required = $${values.length}`);
    }
    
    if (updateFields.length === 0) {
      return await getLocationById(id);
    }
    
    query += updateFields.join(', ') + ' WHERE id = $' + (values.length + 1) + ' RETURNING *';
    values.push(id);
    
    const result = await pool.query(query, values);
    return result.rows[0];
  };
  
  // Удаление локации
  const deleteLocation = async (id) => {
    const query = 'DELETE FROM locations WHERE id = $1';
    await pool.query(query, [id]);
    return { success: true };
  };
  
  // Не забудьте добавить эти методы в экспорт
  module.exports = {
    createLocation,
    getLocations,
    getLocationById,
    updateLocation,
    deleteLocation
  };
  
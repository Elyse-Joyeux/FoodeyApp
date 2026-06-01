import { MemoryRouter } from 'react-router-dom';
import { FoodeyApp } from "./foodey-app.js";
    
export const FoodeyAppBasic = () => {
  return (
    <MemoryRouter>
      <FoodeyApp />
    </MemoryRouter>
  );
}
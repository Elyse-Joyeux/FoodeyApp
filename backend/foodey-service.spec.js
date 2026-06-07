import { FoodeyService } from './foodey-service.js';

describe('foodey service', () => {
  it('should say hello', async () => {
    const foodeyService = FoodeyService.from();
    const greeting = await foodeyService.getHello();
    expect(greeting).toEqual('Hello World!');
  });
});

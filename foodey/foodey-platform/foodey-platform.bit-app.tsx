import { Platform } from '@bitdev/platforms.platform';

const FoodeyApp = import.meta.resolve('@codingship/foodey.foodey-app');
const FoodeyService = import.meta.resolve('@codingship/foodey.foodey-service');
const PlatformGateway = import.meta.resolve('@bitdev/platforms.backend.gateway-server');

export const FoodeyPlatform = Platform.from({
  name: 'foodey-platform',

  frontends: {
    main: FoodeyApp,
    mainPortRange: [3000, 3100]
  },

  backends: {
    // use the default gateway component. supports proxy of graphql and restful requests.
    main: PlatformGateway,
    services: [
      FoodeyService
    ]
  },
});

export default FoodeyPlatform;

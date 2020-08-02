const ELEVATOR_MAX_USER_COUNT = 4;
const ELEVATOR_MAX_USER_COUNT = 4;

import Floor from './floor';
import Elevator from './elevator';

export default class World {
  elevators = []; // 电梯
  users = []; // 人
  floors = []; // 楼层

  constructor(floorCount, elevatorCount) {
    for (let i = 0; i < floorCount; i++) {
      this.floors.push(new Floor(i));
    }
    for (let i = 0; i < elevatorCount; i++) {
      this.elevators.push(new Elevator(floorCount, ELEVATOR_MAX_USER_COUNT));
    }
  }
};

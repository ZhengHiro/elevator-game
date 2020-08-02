const bar = Symbol('bar');
const snaf = Symbol('snaf');

export default class User {
  startFloorLevel = 0; // 起始楼层
  destinationFloorLevel = 0; // 目标楼层
  startTime = 0; // 出现时间
  endTime = 0; // 结束时间
  done = false; // 完成旅程

  constructor(currentFloor, destinationFloorLevel) {
    this.startFloorLevel = currentFloor.getFloorLevel();
    this.destinationFloorLevel = destinationFloorLevel;
    if (this.startFloorLevel < destinationFloorLevel) {
      currentFloor.pressUpButton();
    } else {
      currentFloor.pressDownButton();
    }
  }

  // 是否抵达终点
  isTheEnd(floorNum) {
    if (this.destinationFloorLevel === floorNum) {
      this.done = true;
      return true;
    } else {
      return false;
    }
  }

  // 该电梯是否适合
  elevatorAvailable(elevator) {

  }
};

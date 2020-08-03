export default class User {
  startFloorLevel = 0; // 起始楼层
  destinationFloorLevel = 0; // 目标楼层
  startTime = 0; // 出现时间
  waitingTime = 0; // 等待时间
  endTime = 0; // 结束时间
  done = false; // 完成旅程
  parentElevator; // 所在电梯

  constructor(currentFloor, destinationFloorLevel, startTime) {
    this.startFloorLevel = currentFloor.getFloorLevel();
    this.destinationFloorLevel = destinationFloorLevel;
    this.startTime = startTime;
    currentFloor.userEntering(this);
  }

  update(dt) {
    if (!this.done) {
      this.waitingTime += dt;
    }
  }

  // 是否抵达终点
  isTheEnd(floorNum) {
    if (this.destinationFloorLevel === floorNum) {
      this.parentElevator.userLeave(this);
      this.done = true;
      return true;
    } else {
      return false;
    }
  }

  // 该电梯是否适合
  elevatorAvailable(elevator) {
    if (elevator.parentElevator || elevator.done) { // 已完成 或 在电梯里了
      return false;
    }
    // 楼层是否合适
    if (!elevator.isSuitableForTravel(this.startFloorLevel, this.destinationFloorLevel)) {
      return false;
    }
    if (elevator.userEntering(this)) {
      this.parentElevator = elevator;
      return true;
    }
    return false;
  }
};

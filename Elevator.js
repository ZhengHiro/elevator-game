export default class Elevator {
  floorCount; // 楼层数量
  maxUserCount; // 最多人数
  goingUpIndicator = false; // 向上按钮
  goingDownIndicator = false; // 向下按钮
  currentFloor = 0; // 当前楼层
  users = new Set(); // 电梯内的人
  buttonStates = []; // 电梯按钮状态

  constructor(floorCount, maxUserCount) {
    this.floorCount = floorCount;
    this.maxUserCount = maxUserCount;
    this.buttonStates = new Array(floorCount).fill(false);
  }

  // 有人进电梯
  userEntering(user) {
    if (this.users.size < this.maxUserCount && !this.users.has(user)) {
      this.users.add(user);
      return true;
    } else {
      return false;
    }
  }

  // 按楼层按钮
  pressFloorButton(floorNumber) {
    if (floorNumber < 0 || floorNumber > this.floorCount - 1) {
      return console.error('电梯层数错误');
    }
    if (!this.buttonStates[floorNumber]) {
      this.buttonStates[floorNumber] = true;
      // todo: trigger floor_button_pressed
    }
  }

  // 获取被按了的电梯按钮
  getPressedFloors() {
    const arr = [];
    this.buttonStates.forEach((value, index) => {
      if (value) {
        arr.push(index);
      }
    });
    return arr;
  }

  // 是否适合乘坐
  isSuitableForTravel(fromFloorNum, toFloorNum) {
    if (fromFloorNum > toFloorNum) { return this.goingDownIndicator; }
    if (fromFloorNum < toFloorNum) { return this.goingUpIndicator; }
    return true;
  }
};

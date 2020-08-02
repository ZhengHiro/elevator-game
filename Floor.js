const level = Symbol('level');
const buttonStates = Symbol('buttonStates');

export default class Floor {
  [level]; // 楼层
  [buttonStates] = { up: false, down: false };

  constructor(level) {
    this[level] = level;
  }

  // 按向上按钮
  pressUpButton() {
    if (!this[buttonStates].up) {
      this[buttonStates].up = true;
      // todo: trigger up_button_pressed
    }
  }

  // 按向下按钮
  pressDownButton() {
    if (!this[buttonStates].down) {
      this[buttonStates].down = true;
      // todo: trigger down_button_pressed
    }
  }

  // 电梯停靠
  elevatorAvailable(elevator) {
    if (elevator.goingUpIndicator && this[buttonStates].up) {
      this[buttonStates].up = false;
    }
    if (elevator.goingDownIndicator && this[buttonStates].down) {
      this[buttonStates].down = false;
    }
  }

  // 获取电梯层级
  getFloorLevel() {
    return this[level];
  }
};

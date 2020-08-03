import observable from "./libs/riot.js";

const buttonStates = Symbol('buttonStates');
const users = Symbol('users');
const elevators = Symbol('elevators');

export default class Floor {
  level = 0; // 楼层
  [buttonStates] = { up: false, down: false };
  [users] = new Set(); // 用户
  [elevators] = new Set(); // 停靠的电梯

  $floor = null;

  constructor(level, maxLevel) {
    observable(this);

    this.level = level;
    this.render(level, maxLevel);
  }

  // 按向上按钮
  pressUpButton() {
    if (!this[buttonStates].up) {
      this[buttonStates].up = true;
      this.trigger('up_button_pressed');
    }
    this.updateRender();
  }

  // 按向下按钮
  pressDownButton() {
    if (!this[buttonStates].down) {
      this[buttonStates].down = true;
      this.trigger('down_button_pressed');
    }
    this.updateRender();
  }

  getButtonStates() {
    return Object.assign({}, this[buttonStates]);
  }

  // 电梯停靠
  elevatorAvailable(elevator) {
    this[elevators].add(elevator);
    this[users].forEach(user => {
      if (user.elevatorAvailable(elevator)) {
        this[users].delete(user); // 用户上电梯了
      }
    });
    if (elevator.goingIndicator >= 0 && this[buttonStates].up) {
      this[buttonStates].up = false;
    }
    if (elevator.goingIndicator <= 0 && this[buttonStates].down) {
      this[buttonStates].down = false;
    }
    this.updateRender();
  }

  // 电梯离开
  elevatorLeave(elevator) {
    this[elevators].delete(elevator);
    this[users].forEach(user => {
      if (this.level < user.destinationFloorLevel) {
        this.pressUpButton();
      } else {
        this.pressDownButton();
      }
    });
    this.updateRender();
  }

  // 获取电梯层级
  getFloorLevel() {
    return this.level;
  }

  // 用户在这层
  userEntering(user) {
    for (let elevator of this[elevators]) {
      if (user.elevatorAvailable(elevator)) { // 有合适的电梯，就直接走了
        return true;
      }
    }
    this[users].add(user);
    if (this.level < user.destinationFloorLevel) {
      this.pressUpButton();
    } else {
      this.pressDownButton();
    }
    this.updateRender();
  }

  updateRender() {
    // 人数渲染
    let $userNum = this.$floor.find('.user-num');
    $userNum.text(this[users].size + '人');
    if (this[users].size) {
      $userNum.addClass('activated');
    } else {
      $userNum.removeClass('activated');
    }

    // 按钮渲染
    if (this[buttonStates].up) {
      this.$floor.find('.up').addClass('activated');
    } else {
      this.$floor.find('.up').removeClass('activated');
    }
    if (this[buttonStates].down) {
      this.$floor.find('.down').addClass('activated');
    } else {
      this.$floor.find('.down').removeClass('activated');
    }
  }

  render(level, maxLevel) {
    let buttons = '';
    if (level !== maxLevel - 1) {
      buttons += '<span class="up">上</span>';
    }
    if (level !== 0) {
      buttons += '<span class="down">下</span>';
    }

    this.$floor = $(`<div class="floor" style="top: ${(maxLevel-level-1)*50}px;">
      <span class="floor-num">${level}</span>
      <span class="user-num">0人</span>
      <span class="buttonindicator">
        ${buttons}
      </span>
    </div>`);

    $('#container').append(this.$floor);
  }
};

import observable from './libs/riot.js';

const FLOOR_HEIGHT = 3; // 每层楼的高度
const FLOOR_TIME_CONSUME = 0.5; // 经过每层所需时间
const ELEVATOR_SPEED = FLOOR_HEIGHT / FLOOR_TIME_CONSUME; // 电梯速度
const FLOOR_STAY_TIME = 0.5; // 每层停留的时间

export default class Elevator {
  elevatorIndex; // 电梯序号
  floorCount; // 楼层数量
  maxUserCount; // 最多人数
  // goingDownIndicator = false; // 向下按钮
  users = new Set(); // 电梯内的人
  buttonStates = []; // 电梯按钮状态

  floorQueue = [];

  currentFloor = 0; // 当前楼层
  destinationFloor = -1; // 目标楼层
  destinationFloorHeight = -1; // 目标楼层高度
  goingIndicator = 0; // -1 向下 0 不动 1 向上 (预期方向)
  movingDirect = 0; // 电梯运行状态,-1向下 0不动 1向上
  currentY = 0; // 当前所在位置

  isStaying = false; // 电梯正在楼层等候
  stayingTime = 0; // 等候时间

  $elevator = null;

  constructor(floorCount, maxUserCount, elevatorIndex) {
    observable(this);

    this.elevatorIndex = elevatorIndex;
    this.floorCount = floorCount;
    this.maxUserCount = maxUserCount;
    this.buttonStates = new Array(floorCount).fill(false);

    this.initRender(floorCount, elevatorIndex);
  }

  // 有人进电梯
  userEntering(user) {
    if (this.users.size < this.maxUserCount && !this.users.has(user)) {
      this.users.add(user);
      this.pressFloorButton(user.destinationFloorLevel);
      this.trigger('user_change', 'enter');
      return true;
    } else {
      return false;
    }
  }

  // 离开电梯
  userLeave(user) {
    this.users.delete(user);
    this.trigger('user_change', 'leave');
  }

  // 按楼层按钮
  pressFloorButton(floorNumber) {
    if (floorNumber < 0 || floorNumber > this.floorCount - 1) {
      return console.error('电梯层数错误');
    }
    if (!this.buttonStates[floorNumber]) {
      this.buttonStates[floorNumber] = true;
      this.trigger('floor_button_pressed', floorNumber);
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
    if (!this.goingIndicator) return true; // 电梯没有方向，直接上
    if (fromFloorNum > toFloorNum) { return this.goingIndicator < 0; }
    if (fromFloorNum < toFloorNum) { return this.goingIndicator > 0; }
    return true;
  }

  // 前往某一层
  goToFloor(floor) {
    this.destinationFloor = floor;
    this.destinationFloorHeight = floor*FLOOR_HEIGHT;

    if (this.currentY < this.destinationFloorHeight) {
      this.goingIndicator = this.movingDirect = 1;
    } else if (this.currentY > this.destinationFloorHeight) {
      this.goingIndicator = this.movingDirect = -1;
    } else {
      this.goingIndicator = this.movingDirect = 0;
    }

    // 由静转动，通知楼层电梯离开了
    if (!this.isMoving && this.movingDirect) {
      this.trigger('leave_floor', this, this.currentFloor);
    }

    this.isMoving = true;
  };

  // 电梯更新
  update(dt) {
    if (this.isStaying) { // 正在等候
      this.stayingTime += dt;
      if (this.stayingTime > FLOOR_STAY_TIME) {
        this.isStaying = false;
        this.checkDestinationQueue();
      }
    } else if (!this.isMoving) { // 没有在移动
      this.checkDestinationQueue();
      if (this.isMoving) { // 动起来了
        this.updateElevatorMovement(dt);
      }
    } else {
      this.updateElevatorMovement(dt);
    }
    this.render();
  }

  // 检查目标队列
  checkDestinationQueue() {
    if (this.isStaying) return false; // 正在楼层等待
    while (!this.isMoving && this.floorQueue[0] === this.currentY/FLOOR_HEIGHT) { // 电梯没在动，并且目标楼层在目标位置，直接推掉
      this.floorQueue.shift();
    }
    if (this.floorQueue.length && this.floorQueue[0] !== this.destinationFloor) {
      this.goToFloor(this.floorQueue[0]);
    } else if (!this.floorQueue.length) {
      this.isMoving = false; // 停住了
      this.destinationFloor = -1;
      this.destinationFloorHeight = -1;

      this.trigger('idle', this);
    }
  }

  // 推入队列
  pushFloorQueue(type, floor) {
    if (isNaN(floor) || floor < 0 || floor >= this.floorCount) {
      console.error('楼层错误');
      return false;
    }
    let oldFirstFloor = this.floorQueue[0];
    // 没在停留时间 且 没有移动 且 队列是空的，直接移动
    // if (!this.isStaying && !this.isMoving && !this.floorQueue.length) {
    //   return this.goToFloor(floor);
    // }
    if (type === 'first') {
      if (!this.isMoving) { // 电梯正在楼层停留，直接推入队列头
        if (!this.floorQueue.length || this.floorQueue[0] !== floor) {
          this.floorQueue.unshift(floor);
        } else {
          return console.error('重复楼层');
        }
      } else {
        if (!this.floorQueue.length || this.floorQueue[0] !== this.destinationFloor) {
          this.floorQueue.unshift(this.destinationFloor); // 将上一个目标推回队头
        } else {
          return console.error('重复楼层');
        }
      }
      this.checkDestinationQueue();
    } else if (type === 'last') {
      if (!this.floorQueue.length || this.floorQueue[this.floorQueue.length-1] !== floor) {
        this.floorQueue.push(floor); // 推至队尾
      } else {
        return console.error('重复楼层');
      }
    }
    // 未来楼层改变 & 停靠在楼层
    if (oldFirstFloor !== this.floorQueue[0] && !this.isMoving && this.currentY%FLOOR_HEIGHT === 0) {
      let newIndicator = 0;
      if (this.floorQueue.length) {
        newIndicator = this.floorQueue[0] < this.currentFloor ? -1 : 1;
      }
      if (newIndicator !== this.goingIndicator) {
        this.goingIndicator = newIndicator;
        this.trigger('elevator_available', this, this.currentFloor);
        this.render();
      }
    }
  }

  // 更新电梯位置
  updateElevatorMovement(dt) {
    let distance = dt * ELEVATOR_SPEED * this.movingDirect; // 移动距离
    this.currentY += distance;
    // 向下且超过 或 向上且超过
    if (
      (this.movingDirect < 0 && this.currentY < this.destinationFloorHeight) ||
      (this.movingDirect > 0 && this.currentY > this.destinationFloorHeight)
    ) {
      this.currentY = this.destinationFloorHeight;
      this.isMoving = false;
      this.movingDirect = 0;
      this.changeCurrentFloor(this.destinationFloor);
      this.handleDestinationArrival();
    } else {
      this.changeCurrentFloor(Math.round(this.currentY / FLOOR_HEIGHT));
    }
  }

  // 改变电梯层数
  changeCurrentFloor(floor) {
    if (this.currentFloor !== floor) {
      this.currentFloor = floor;
      this.trigger('current_floor_change', floor, this.movingDirect);
    }
  }

  // 电梯到达某一层
  handleDestinationArrival() {
    if (this.currentFloor === this.floorQueue[0]) {
      this.floorQueue.shift();
    }

    this.users.forEach(user => {
      user.isTheEnd(this.currentFloor);
    });

    if (this.floorQueue.length) {
      this.goingIndicator = this.floorQueue[0] < this.currentFloor ? -1 : 1;
    } else {
      this.goingIndicator = 0;
    }
    this.buttonStates[this.currentFloor] = false;
    this.isStaying = true;
    this.stayingTime = 0;

    this.trigger('elevator_available', this, this.currentFloor);
    this.trigger('arrive_floor', this, this.currentFloor);
  }

  initRender(floorCount) {
    let i = 0;
    let buttons = '';
    while (i < floorCount) {
      buttons += `<span class="buttonpress">${i}</span> `;
      i++;
    }

    this.$elevator = $(`<div class="elevator">
      <span class="directionindicator directionindicatorup">上</span>
      <span class="directionindicator directionindicatordown">下</span>
      <span class="buttonindicator">
        ${buttons}
      </span>
      <span class="user-num">0/${this.maxUserCount}人</span>
    </div>`);

    let width = this.floorCount < 7 ? this.floorCount*15 : this.floorCount*12;
    this.$elevator.css('width', `${width}px`);
    this.$elevator.css('transform', `translateX(${this.elevatorIndex*(50+width) + 200}px) translateY(${(floorCount-1)*50}px) translateZ(0px)`);
    $('#container').append(this.$elevator);
  }

  render() {
    let width = this.floorCount < 7 ? this.floorCount*15 : this.floorCount*12;
    let actualHeight = (this.floorCount - 1) * 50 - this.currentY / 3 * 50;
    this.$elevator.css('transform', `translateX(${this.elevatorIndex*(50+width) + 200}px) translateY(${actualHeight}px) translateZ(0px)`);

    // 更新指示器
    if (this.goingIndicator === 1) {
      this.$elevator.find('.directionindicatorup').addClass('activated');
      this.$elevator.find('.directionindicatordown').removeClass('activated');
    } else if (this.goingIndicator === -1) {
      this.$elevator.find('.directionindicatorup').removeClass('activated');
      this.$elevator.find('.directionindicatordown').addClass('activated');
    } else {
      this.$elevator.find('.directionindicatorup').removeClass('activated');
      this.$elevator.find('.directionindicatordown').removeClass('activated');
    }

    // 更新人数
    if (this.users.size) {
      this.$elevator.find('.user-num').text(`${this.users.size}/${this.maxUserCount}人`).addClass('activated');
    } else {
      this.$elevator.find('.user-num').text(`0/${this.maxUserCount}人`).removeClass('activated');
    }

    this.buttonStates.forEach((state, index) => {
      if (state) {
        this.$elevator.find('.buttonpress').eq(index).addClass('activated');
      } else {
        this.$elevator.find('.buttonpress').eq(index).removeClass('activated');
      }
    })
  }
};

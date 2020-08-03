import observable from "./libs/riot.js";

const elevator = Symbol('elevator');

// 电梯用户代理
export default class ElevatorAgent {
  [elevator];

  constructor(_elevator) {
    observable(this);

    this[elevator] = _elevator;

    // 空闲中
    _elevator.on('idle', () => {
      try {
        this.trigger('idle', this);
      } catch (e) {
        alert('idle 代码有错误');
      }
    });

    // 按了按钮
    _elevator.on('floor_button_pressed', (floorNum) => {
      try {
        this.trigger('floor_button_pressed', floorNum);
      } catch (e) {
        console.error(e);
        alert('floor_button_pressed 代码有错误');
      }
    });

    // 在某一楼层停靠
    _elevator.on('arrive_floor', (elevator, floorNum) => {
      try {
        this.trigger('stopped_at_floor', floorNum);
      } catch (e) {
        console.error(e);
        alert('stopped_at_floor 代码有错误');
      }
    });

    // 电梯人数变化，type==='enter' 有人进电梯  type==='leave' 有人离开电梯
    _elevator.on('user_change', (type) => {
      try {
        this.trigger('user_change', type);
      } catch (e) {
        console.error(e);
        alert('user_change 代码有错误');
      }
    });

    // 电梯所在层数变化
    // floor 楼层数 direct 1为向上 -1为向下 0为静止
    // 注意，该层数是根据电梯所在位置四舍五入出来的，即当层数变化时，电梯并未实际到达该楼层，而是移动过了中间位置
    _elevator.on('current_floor_change', (floor, direct) => {
      try {
        this.trigger('current_floor_change', floor, direct);
      } catch (e) {
        console.error(e);
        alert('current_floor_change 代码有错误');
      }
    });
  }

  // 前往某个楼层
  // 注意，这个方法只是往电梯的目标队列里添加一个指令
  // 如果第二个参数传false或不传，则会在队列的末尾插入指令
  // 如果第二个参数传了true，则会优先前往该楼层，即使电梯正在移动中。
  goToFloor(floorNum, forceNow) {
    this[elevator].pushFloorQueue(forceNow ? 'first' : 'last', floorNum);
  }

  // 获取电梯当前所在楼层，注意，该楼层是四舍五入的，即电梯在两个楼层的中间时，会获取到最接近的那个楼层
  getCurrentFloor() {
    return this[elevator].currentFloor;
  }

  // 获取电梯方向指示器
  // 1为向上 -1为向下 0为不上不下
  getGoingIndicator() {
    return this[elevator].goingIndicator;
  }

  // 获取电梯最多搭载人数
  getMaxPassengerCount() {
    return this[elevator].maxUserCount;
  }

  // 获取电梯当前搭载人数
  getCurrentPassengerCount() {
    return this[elevator].users.size;
  }

  // 获取目标楼梯队列，不要直接修改返回的队列，没得作用的
  getDestinationQueue() {
    return [].concat(this[elevator].floorQueue);
  }

  // 设置楼层指令数组
  // 该方法将会清空所有旧的指令，以新的指令移动
  // 注意，如果传的是一个空数组，将可能导致电梯停在楼层中间
  setDestinationQueue(floors) {
    if (!Array.isArray(floors)) {
      return console.error('floors 必须为数组');
    }
    this[elevator].floorQueue = [];
    floors.forEach(floor => this[elevator].pushFloorQueue('last', parseInt(floor)));
    this[elevator].checkDestinationQueue();
  }

  // 获取电梯内所按按钮
  getPressedFloors() {
    return this[elevator].getPressedFloors();
  }
}

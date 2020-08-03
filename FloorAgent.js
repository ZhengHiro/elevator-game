import observable from "./libs/riot.js";

const floor = Symbol('elevator');

export default class FloorAgent {
  [floor];

  constructor(_floor) {
    observable(this);

    this[floor] = _floor;

    // 按了向上按钮
    _floor.on('up_button_pressed', () => {
      try {
        this.trigger('up_button_pressed', this);
      } catch (e) {
        console.error(e);
        alert('up_button_pressed 代码有错误');
      }
    });

    // 按了向下按钮
    _floor.on('down_button_pressed', () => {
      try {
        this.trigger('down_button_pressed', this);
      } catch (e) {
        console.error(e);
        alert('down_button_pressed 代码有错误');
      }
    });
  }

  // 获取当前楼层
  getFloorLevel() {
    return this[floor].getFloorLevel();
  }

  // 获取按钮状态
  getButtonStates() {
    return this[floor].getButtonStates();
  }
};

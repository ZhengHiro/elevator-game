const MAX_DT = 1.0 / 60.0 * 1;

import Floor from './Floor.js';
import FloorAegnt from './FloorAgent.js';
import Elevator from './Elevator.js';
import ElevatorAgent from './ElevatorAgent.js';
import User from './User.js';

export default class World {
  $statsContainer;

  endingFlag = false; // 挑战
  elapsedTime = 0; // 总的经历过的时间
  lastT = 0; // 上次一拍的时间
  totalWaitingTime = 0; // 总的等待时间
  challengeEndTime = 0; // 结束时间

  remainUserNum = 0; // 剩余用户人数
  completeUserNum = 0; // 已完成用户人数
  challengeUsers = []; // 挑战人列表
  users = []; // 用户对象
  elevators = []; // 电梯
  elevatorAgents = []; // 电梯代理
  floors = []; // 楼层
  floorAgents = []; // 楼层代理

  constructor(floorCount, elevatorCount, users, elevatorCapacity) {
    this.endingFlag = false;
    this.render(floorCount);
    for (let i = 0; i < floorCount; i++) {
      const floor = new Floor(i, floorCount);

      this.floors.push(floor);
      this.floorAgents.push(new FloorAegnt(floor));
    }
    for (let i = 0; i < elevatorCount; i++) {
      const elevator = new Elevator(floorCount, elevatorCapacity, i);
      this.floors[0].elevatorAvailable(elevator);
      elevator.on('elevator_available', (elevator, floor) => {
        this.floors[floor].elevatorAvailable(elevator);
      });
      elevator.on('leave_floor', (elevator, floor) => {
        this.floors[floor].elevatorLeave(elevator);
      });

      this.elevators.push(elevator);
      this.elevatorAgents.push(new ElevatorAgent(elevator));
    }

    let tmpUsers = JSON.parse(JSON.stringify(users));
    this.remainUserNum = tmpUsers.length;
    this.challengeUsers = tmpUsers;
    this.challengeEndTime = tmpUsers[tmpUsers.length - 1].time + 30; // 最后一个人加30s
  }

  // 开始
  start() {
    this.elapsedTime = 0;
    this.lastT = 0;
    window.requestAnimationFrame(this.update.bind(this));
  }

  destroy() {
    this.endingFlag = true;
  }

  update(timestamp) {
    if (this.endingFlag) return true;
    const dt = timestamp - this.lastT;
    const thisDt = Math.min(dt, MAX_DT);
    this.elapsedTime += thisDt;

    this.elevators.forEach(elevator => {
      elevator.update(thisDt);
    });
    let userPointer = this.challengeUsers[0];
    while (userPointer && userPointer.time < this.elapsedTime) {
      this.challengeUsers.shift();
      this.users.push(new User(this.floors[userPointer.startFloorLevel], userPointer.destinationFloorLevel, this.elapsedTime));
      userPointer = this.challengeUsers[0];
    }

    let totalWaitingTime = 0;
    let remainUserNum = this.challengeUsers.length;
    let completeUserNum = 0;
    this.users.forEach(user => {
      user.update(thisDt);
      this.totalWaitingTime = totalWaitingTime += user.waitingTime;
      if (!user.done) {
        remainUserNum++;
      } else {
        completeUserNum++;
      }
    });

    this.remainUserNum = remainUserNum;
    this.completeUserNum = completeUserNum;

    if (!remainUserNum && !this.challengeUsers.length) {
      this.endingFlag = true;
      alert(`结束，顺利完成，总等待时间:${totalWaitingTime}`);
    } else if (this.elapsedTime > this.challengeEndTime) {
      this.endingFlag = true;
      alert(`结束，没有顺利完成，总等待时间:${totalWaitingTime}`);
    }

    this.lastT = timestamp;
    this.updateRender();

    window.requestAnimationFrame(this.update.bind(this));
  }

  render(floorCount) {
    this.$statsContainer = $(`<div class="statscontainer">
        <div style="top: 20px"><span class="key">经历总时间</span><span class="value elapsedtime">0s</span></div>
        <div style="top: 40px"><span class="key">总等待时间</span><span class="value totalwaittime">0s</span></div>
        <div style="top: 60px"><span class="key">剩余人数</span><span class="value remainusernum">0人</span></div>
        <div style="top: 80px"><span class="key">已完成人数</span><span class="value complteusernum">0人</span></div>
    </div>`);
    $('#container').empty().height(floorCount*50).append(this.$statsContainer);
  }

  updateRender() {
    this.$statsContainer.find('.elapsedtime').text(`${this.elapsedTime.toFixed(2)}s`);
    this.$statsContainer.find('.totalwaittime').text(`${this.totalWaitingTime.toFixed(2)}s`);
    this.$statsContainer.find('.remainusernum').text(`${this.remainUserNum}人`);
    this.$statsContainer.find('.complteusernum').text(`${this.completeUserNum}人`);
  }
};

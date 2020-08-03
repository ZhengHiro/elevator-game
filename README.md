## 用户代码格式
```javascript
{
      init: function(elevators, floors, users) {
        if (users) {
          // 有些关卡会把人出现的信息传进来
        }
        // 用户代码，其中elevators为电梯列表，floors为楼层列表
      }
}
```

## Elevator方法
### goToFloor
前往某个楼层\
注意，这个方法只是往电梯的目标队列里添加一个指令\
如果第二个参数传false或不传，则会在队列的末尾插入指令\
如果第二个参数传了true，则会优先前往该楼层，即使电梯正在移动中。

```javascript
elevator.goToFloor(1);
elevator.goToFloor(2,true);
```

### getCurrentFloor
获取电梯当前所在楼层，注意，该楼层是四舍五入的，即电梯在两个楼层的中间时，会获取到最接近的那个楼层

```javascript
let floorNum = elevator.getCurrentFloor();
```

### getGoingIndicator
获取电梯方向指示器\
1为向上 -1为向下 0为不上不下

```javascript
let goingIndicator = elevator.getGoingIndicator();
```

### getMaxPassengerCount
获取电梯最多搭载人数

```javascript
let maxCount = elevator.getMaxPassengerCount();
```

### getCurrentPassengerCount
获取电梯当前搭载人数

```javascript
let count = elevator.getCurrentPassengerCount();
```

### getDestinationQueue
获取目标楼梯队列，不要直接修改返回的队列，没得作用的

```javascript
let floors = elevator.getDestinationQueue();
for (let floorNum of floors) {
   // floorNum 楼层
}
```

### setDesinationQueue
设置楼层指令数组\
该方法将会清空所有旧的指令，以新的指令移动\
注意，如果传的是一个空数组，将可能导致电梯停在楼层中间

```javascript
elevator.setDestinationQueue([1,3,5]);
```

### getPressedFloors
获取电梯内所按按钮

```javascript
let floors = elevator.getPressedFloors();
for (let floorNum of floors) {
   // floorNum 楼层
}
```

## Elevator事件

### idle
电梯处于空闲，没有目标楼层了

```javascript
elevator.on('idle', () => {
	// 下指令吧
});
```

### floor_button_pressed
电梯内按钮被按了

```javascript
elevator.on('floor_button_pressed', (floorNum) => {
	// floorNum 楼层
});
```

### stopped_at_floor
电梯停靠楼层

```javascript
elevator.on('stopped_at_floor', (floorNum) => {
	// floorNum 楼层
});
```

### current_floor_change
电梯所在层数变化\
floor 楼层数 direct 1为向上 -1为向下 0为静止\
注意，该层数是根据电梯所在位置四舍五入出来的，即当层数变化时，电梯并未实际到达该楼层，而是移动过了中间位置

```javascript
elevator.on('current_floor_change', (floor, direct) => {
});
```

### user_change
有人进出

```javascript
elevator.on('user_change', (type) => {
	// type==='enter' 有人进电梯  type==='leave' 有人离开电梯
});
```

## Floor方法
### getFloorLevel
获取楼层数

```javascript
let floorNum = floor.getFloorLevel();
```

### getButtonStates
获取按钮状态

```javascript
let buttonSates = floor.getButtonStates();
if (buttonSates.up) {
  // 向上按钮亮着
}
if (buttonSates.down) {
  // 向下按钮亮着
}
```

## Floor事件
### up_button_pressed
楼层按了向上按钮

```javascript
floor.on(‘up_button_pressed', (floor) => {
	// floor是Floor对象
});
```

### down_button_pressed
楼层按了向下按钮

```javascript
floor.on(‘down_button_pressed', (floor) => {
	// floor是Floor对象
});
```


## 关卡文件格式
```JSON
{
  "title": "关卡标题",
  "floorNum": 3, // 楼层数量
  "elevatorNum": 1, // 电梯数量
  "elevatorCapacity": 4, // 电梯容量
  "transparent": false, // init方法是否传递人的出现信息
  "users": [ {time:1, startFloorLevel:1, destinationFloorLevel: 2} ] // 人数安排，时间、从哪出现、到哪离开
}
```

